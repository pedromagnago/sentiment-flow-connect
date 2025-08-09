import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { TransactionsTable } from "./TransactionsTable";
import { ArrowDownCircle, ArrowUpCircle, Scale, Upload } from "lucide-react";

export const Reconciliation: React.FC = () => {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [companyId, setCompanyId] = useState<string | null>(null);

  const [credit, setCredit] = useState(0);
  const [debit, setDebit] = useState(0);
  const [net, setNet] = useState(0);
  const [importsCount, setImportsCount] = useState<number>(0);

  useEffect(() => {
    document.title = "Reconciliação Financeira OFX | FullBPO";
    // Fetch company_id from profile
    supabase
      .from("profiles")
      .select("company_id")
      .maybeSingle()
      .then(async ({ data, error }) => {
        if (error) {
          toast({ title: "Erro ao carregar perfil", description: error.message, variant: "destructive" });
        } else if (data?.company_id) {
          const cid = String(data.company_id);
          setCompanyId(cid);
          // load imports count
          const { count } = await supabase
            .from("transaction_imports")
            .select("id", { count: "exact", head: true })
            .eq("company_id", cid);
          setImportsCount(count ?? 0);
        }
      });
  }, [toast]);

  const currency = (n: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n ?? 0);

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
      // refresh imports count after successful upload
      const { count } = await supabase
        .from("transaction_imports")
        .select("id", { count: "exact", head: true })
        .eq("company_id", companyId);
      setImportsCount(count ?? importsCount);
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

      {/* Summary Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border p-4 bg-background">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Créditos</span>
            <ArrowUpCircle className="h-5 w-5 text-emerald-600" />
          </div>
          <div className="text-xl font-semibold">{currency(credit)}</div>
        </div>
        <div className="rounded-xl border p-4 bg-background">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Débitos</span>
            <ArrowDownCircle className="h-5 w-5 text-red-600" />
          </div>
          <div className="text-xl font-semibold">{currency(debit)}</div>
        </div>
        <div className="rounded-xl border p-4 bg-background">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Saldo líquido</span>
            <Scale className="h-5 w-5 text-blue-600" />
          </div>
          <div className={`text-xl font-semibold ${net >= 0 ? "text-emerald-700" : "text-red-700"}`}>{currency(net)}</div>
        </div>
        <div className="rounded-xl border p-4 bg-background">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Importações</span>
            <Upload className="h-5 w-5 text-purple-600" />
          </div>
          <div className="text-xl font-semibold">{importsCount}</div>
        </div>
      </section>

      <main className="space-y-6">
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

        <section>
          <h2 className="text-lg font-medium">Transações importadas</h2>
          <TransactionsTable onSummaryChange={({ credit, debit, net }) => { setCredit(credit); setDebit(debit); setNet(net); }} />
        </section>
      </main>
    </div>
  );
};

export default Reconciliation;
