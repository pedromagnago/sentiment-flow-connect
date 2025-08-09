import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const Onboarding: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [companyName, setCompanyName] = useState("");
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
      await sb.from("profiles").insert({ id: userId, company_id: companyId, display_name: user?.email ?? null });
    } else {
      await sb.from("profiles").update({ company_id: companyId }).eq("id", userId);
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
      // Create company minimal
      const sb: any = supabase;
      const { data: company, error: compErr } = await sb.from("companies").insert({ nome: companyName }).select("id").maybeSingle();
      if (compErr || !company) throw new Error(compErr?.message || "Não foi possível criar a empresa");

      await ensureProfile(company.id);

      // Create onboarding form record
      const { error: formErr } = await sb.from("formularios_onboarding").insert({
        company_id: company.id,
        user_id: userId,
        status: "submitted",
        answers: { company_name: companyName },
      });
      if (formErr) throw new Error(formErr.message);

      await uploadFiles(company.id);

      toast({ title: "Onboarding enviado com sucesso", description: "Você pode continuar usando a plataforma." });
      setCompanyName("");
      setFiles(null);
    } catch (e: any) {
      toast({ title: "Erro no onboarding", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Onboarding do Cliente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="company">Nome da empresa</Label>
              <Input id="company" value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Ex.: FullBPO LTDA" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="files">Documentos (PDF, imagens, planilhas)</Label>
              <Input id="files" type="file" multiple onChange={(e) => setFiles(e.target.files)} />
              <p className="text-sm text-muted-foreground">Os arquivos são enviados de forma segura para a sua pasta privada.</p>
            </div>
            <Button onClick={handleSubmit} disabled={loading}>{loading ? "Enviando..." : "Enviar Onboarding"}</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Onboarding;
