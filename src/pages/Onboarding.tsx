import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Building2, Upload, CheckCircle } from "lucide-react";

const Onboarding: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [companyName, setCompanyName] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [files, setFiles] = useState<FileList | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = "Onboarding • FullBPO";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute("content", "Onboarding de cliente: dados iniciais e upload de documentos na plataforma FullBPO.");
  }, []);

  const userId = user?.id ?? "";

  const uploadFiles = async (companyId: string) => {
    if (!files || !userId) return [] as string[];
    const paths: string[] = [];
    for (const file of Array.from(files)) {
      const path = `${userId}/${Date.now()}_${file.name}`;
      const { error } = await supabase.storage.from("onboarding").upload(path, file, { upsert: false });
      if (error) {
        toast({ title: `Falha ao enviar ${file.name}`, description: error.message, variant: "destructive" });
        continue;
      }
      // Insert into documentos
      const sb: any = supabase;
      const { error: docErr } = await sb.from("documentos").insert({
        company_id: companyId,
        user_id: userId,
        file_path: path,
        file_name: file.name,
        mime_type: file.type,
        size: file.size,
      });
      if (docErr) {
        toast({ title: `Falha ao registrar ${file.name}`, description: docErr.message, variant: "destructive" });
      } else {
        paths.push(path);
      }
    }
    return paths;
  };

  const ensureProfile = async (companyId: string) => {
    if (!userId) return;
    const sb: any = supabase;
    const { data: profile } = await sb.from("profiles").select("id").eq("id", userId).maybeSingle();
    if (!profile) {
      await sb.from("profiles").insert({ id: userId, display_name: user?.email ?? null });
    }
  };

  const createOwnerRole = async (companyId: string) => {
    if (!userId) return;
    
    // Verificar se já existe role para esta empresa
    const { data: existingRole } = await supabase
      .from('user_roles')
      .select('id')
      .eq('user_id', userId)
      .eq('company_id', companyId)
      .maybeSingle();

    if (existingRole) {
      console.log('Usuário já tem role para esta empresa');
      return;
    }

    // Criar role de owner para o usuário que criou a empresa
    const { error } = await supabase
      .from('user_roles')
      .insert({
        user_id: userId,
        company_id: companyId,
        role: 'owner',
        granted_by: userId,
        is_active: true,
      });

    if (error) {
      console.error('Erro ao criar user_role:', error);
      toast({ 
        title: 'Aviso', 
        description: 'Empresa criada, mas houve um erro ao configurar permissões. Entre em contato com o suporte.',
        variant: 'destructive'
      });
    }
  };

  const handleSubmit = async () => {
    if (!userId) {
      toast({ title: "Sessão inválida", description: "Faça login novamente.", variant: "destructive" });
      return;
    }
    if (!companyName.trim()) {
      toast({ title: "Informe o nome da empresa", variant: "destructive" });
      return;
    }

    try {
      setLoading(true);
      
      // Create company
      const sb: any = supabase;
      const { data: company, error: compErr } = await sb.from("companies").insert({ 
        nome: companyName,
        cnpj: cnpj || null,
      }).select("id").maybeSingle();
      
      if (compErr || !company) throw new Error(compErr?.message || "Não foi possível criar a empresa");

      // Garantir profile existe
      await ensureProfile(company.id);

      // CRÍTICO: Criar user_role com role 'owner' para o usuário
      await createOwnerRole(company.id);

      // Create onboarding form record
      const { error: formErr } = await sb.from("formularios_onboarding").insert({
        company_id: company.id,
        user_id: userId,
        status: "submitted",
        answers: { company_name: companyName, cnpj: cnpj },
      });
      if (formErr) throw new Error(formErr.message);

      // Upload files
      await uploadFiles(company.id);

      toast({ title: "Onboarding concluído!", description: "Sua empresa foi criada com sucesso. Redirecionando..." });
      
      // Redirecionar para a página principal após sucesso
      setTimeout(() => {
        navigate('/');
      }, 1500);
      
    } catch (e: any) {
      toast({ title: "Erro no onboarding", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6 flex items-center justify-center">
      <div className="w-full max-w-2xl">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Building2 className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Bem-vindo ao FullBPO!</CardTitle>
            <CardDescription>
              Configure sua empresa para começar a usar a plataforma
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="company">Nome da empresa *</Label>
              <Input 
                id="company" 
                value={companyName} 
                onChange={(e) => setCompanyName(e.target.value)} 
                placeholder="Ex.: FullBPO LTDA" 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="cnpj">CNPJ (opcional)</Label>
              <Input 
                id="cnpj" 
                value={cnpj} 
                onChange={(e) => setCnpj(e.target.value)} 
                placeholder="00.000.000/0000-00" 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="files">
                <Upload className="inline h-4 w-4 mr-1" />
                Documentos (PDF, imagens, planilhas)
              </Label>
              <Input id="files" type="file" multiple onChange={(e) => setFiles(e.target.files)} />
              <p className="text-sm text-muted-foreground">
                Os arquivos são enviados de forma segura para a sua pasta privada.
              </p>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium">O que acontece após o cadastro:</p>
                  <ul className="mt-2 space-y-1 list-disc list-inside text-blue-700">
                    <li>Sua empresa será criada no sistema</li>
                    <li>Você será configurado como administrador (owner)</li>
                    <li>Poderá convidar membros da equipe</li>
                    <li>Terá acesso a todas as funcionalidades</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <Button 
              onClick={handleSubmit} 
              disabled={loading || !companyName.trim()} 
              className="w-full"
              size="lg"
            >
              {loading ? "Criando empresa..." : "Concluir Cadastro"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Onboarding;