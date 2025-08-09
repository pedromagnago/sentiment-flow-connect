import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const Reconciliation: React.FC = () => {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [companyId, setCompanyId] = useState<string | null>(null);

  useEffect(() => {
    document.title = "Reconciliação Financeira OFX | FullBPO";
    // Fetch company_id from profile
    supabase
      .from("profiles")
      .select("company_id")
      .maybeSingle()
      .then(({ data, error }) => {
        if (error) {
          toast({ title: "Erro ao carregar perfil", description: error.message, variant: "destructive" });
        } else if (data?.company_id) {
          setCompanyId(String(data.company_id));
        }
      });
  }, [toast]);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    if (f && !f.name.toLowerCase().endsWith(".ofx")) {
      toast({ title: "Arquivo inválido", description: "Envie um arquivo .ofx", variant: "destructive" });
      return;
    }
    setFile(f);
  };

  const handleUpload = async () => {
    if (!file) {
      toast({ title: "Selecione um arquivo OFX" });
      return;
    }
    if (!companyId) {
      toast({ title: "Perfil sem empresa", description: "Associe-se a uma empresa para continuar.", variant: "destructive" });
      return;
    }

    try {
      setLoading(true);
      const ofxText = await file.text();
      const { data, error } = await supabase.functions.invoke("ingest-ofx", {
        body: { ofx: ofxText, fileName: file.name },
      });
      if (error) throw error;
      toast({ title: "OFX importado", description: `Transações: ${data?.imported ?? 0}/${data?.total ?? 0}` });
    } catch (e: any) {
      toast({ title: "Falha ao importar OFX", description: e?.message ?? String(e), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Reconciliação Financeira (OFX)</h1>
        <p className="text-muted-foreground">Envie seu extrato OFX para importar transações bancárias.</p>
      </header>
      <main>
        <section className="flex items-center gap-3">
          <input
            type="file"
            accept=".ofx"
            onChange={onFileChange}
            aria-label="Selecionar arquivo OFX"
          />
          <Button onClick={handleUpload} disabled={!file || loading}>
            {loading ? "Importando..." : "Importar OFX"}
          </Button>
        </section>
      </main>
    </div>
  );
};

export default Reconciliation;
