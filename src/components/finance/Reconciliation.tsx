import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { TransactionsTable } from "./TransactionsTable";
import { RulesManager } from "./RulesManager";
import { ArrowDownCircle, ArrowUpCircle, Scale, Upload, InfoIcon } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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

  // re-load summary and imports after rules change (RulesManager reloads list only).
  // Users can click "Aplicar filtros" na tabela para recomputar o resumo.
  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    if (f) {
      const ext = f.name.toLowerCase();
      if (!ext.endsWith(".ofx") && !ext.endsWith(".xlsx") && !ext.endsWith(".xls") && !ext.endsWith(".csv")) {
        toast({ title: "Arquivo inválido", description: "Envie um arquivo .ofx, .xlsx, .xls ou .csv", variant: "destructive" });
        return;
      }
    }
    setFile(f);
  };

  const handleUpload = async () => {
    if (!file) {
      toast({ title: "Selecione um arquivo" });
      return;
    }
    if (!companyId) {
      toast({ title: "Perfil sem empresa", description: "Associe-se a uma empresa para continuar.", variant: "destructive" });
      return;
    }

    try {
      setLoading(true);
      const fileName = file.name.toLowerCase();
      
      if (fileName.endsWith(".ofx")) {
        // Process OFX file
        const ofxText = await file.text();
        const { data, error } = await supabase.functions.invoke("ingest-ofx", {
          body: { ofx: ofxText, fileName: file.name },
        });
        if (error) throw error;
        toast({ title: "OFX importado", description: `Transações: ${data?.imported ?? 0}/${data?.total ?? 0}` });
      } else {
        // Process spreadsheet (Excel/CSV)
        const reader = new FileReader();
        const fileBase64 = await new Promise<string>((resolve, reject) => {
          reader.onload = () => {
            const base64 = (reader.result as string).split(',')[1];
            resolve(base64);
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        const { data, error } = await supabase.functions.invoke("ingest-spreadsheet", {
          body: { fileBase64, fileName: file.name },
        });
        if (error) throw error;
        
        const periodText = data?.period 
          ? ` (${new Date(data.period.start).toLocaleDateString('pt-BR')} a ${new Date(data.period.end).toLocaleDateString('pt-BR')})`
          : '';
        
        toast({ 
          title: "Planilha importada", 
          description: `Formato: ${data?.format} | Transações: ${data?.imported ?? 0}/${data?.total ?? 0}${periodText}${data?.ignored > 0 ? ` | Ignoradas: ${data.ignored}` : ''}` 
        });
      }

      // refresh imports count after successful upload
      const { count } = await supabase
        .from("transaction_imports")
        .select("id", { count: "exact", head: true })
        .eq("company_id", companyId);
      setImportsCount(count ?? importsCount);
    } catch (e: any) {
      toast({ title: "Falha ao importar", description: e?.message ?? String(e), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <header>
        <div className="flex items-center gap-2 mb-2">
          <h1 className="text-2xl font-semibold">Reconciliação Financeira</h1>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <InfoIcon className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="font-semibold mb-2">Formatos suportados:</p>
                <ul className="space-y-1 text-sm">
                  <li>✅ Bradesco (extrato PDF → Excel)</li>
                  <li>✅ Itaú (extrato online)</li>
                  <li>✅ Santander (CSV/Excel)</li>
                  <li>✅ Planilhas genéricas (Data, Descrição, Valor)</li>
                  <li>✅ Arquivos OFX</li>
                </ul>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <p className="text-muted-foreground">Envie seu extrato OFX ou planilha Excel/CSV para importar transações bancárias.</p>
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
            accept=".ofx,.xlsx,.xls,.csv"
            onChange={onFileChange}
            aria-label="Selecionar arquivo OFX ou planilha"
          />
          <Button onClick={handleUpload} disabled={!file || loading}>
            {loading ? "Importando..." : "Importar arquivo"}
          </Button>
        </section>
        {loading && (
          <p className="text-sm text-muted-foreground">
            ⏳ Processando arquivo... Isso pode levar alguns segundos.
          </p>
        )}

        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-medium">Transações importadas</h2>
            <TransactionsTable onSummaryChange={({ credit, debit, net }) => { setCredit(credit); setDebit(debit); setNet(net); }} />
          </div>
          <div>
            <h2 className="text-lg font-medium">Regras de categorização</h2>
            <p className="text-sm text-muted-foreground mb-2">Crie regras simples: se a descrição contém o padrão, atribui a categoria.</p>
            <RulesManager />
          </div>
        </section>
      </main>
    </div>
  );
};

export default Reconciliation;
