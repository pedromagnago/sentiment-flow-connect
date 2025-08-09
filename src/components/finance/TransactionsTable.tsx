import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { usePagination } from "@/hooks/usePagination";
import { PaginationControls } from "@/components/common/Pagination";

interface TxnRow {
  id: string;
  date: string;
  description: string | null;
  memo: string | null;
  category: string | null;
  type: string | null;
  amount: number;
  fitid: string | null;
}

interface Summary {
  credit: number;
  debit: number; // absolute value of negatives
  net: number;
}

export const TransactionsTable: React.FC<{ onSummaryChange?: (s: Summary) => void }> = ({ onSummaryChange }) => {
  const { toast } = useToast();
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [rows, setRows] = useState<TxnRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");

  const dateFilter = useMemo(() => ({ from, to }), [from, to]);

  useEffect(() => {
    // Resolve company once
    supabase
      .from("profiles")
      .select("company_id")
      .maybeSingle()
      .then(({ data, error }) => {
        if (error) {
          setError(error.message);
          toast({ title: "Erro ao carregar perfil", description: error.message, variant: "destructive" });
        } else if (data?.company_id) {
          setCompanyId(String(data.company_id));
        }
      });
  }, [toast]);

  const computeSummary = (data: TxnRow[]) => {
    const credit = data.filter((r) => Number(r.amount) > 0).reduce((s, r) => s + Number(r.amount), 0);
    const debitAbs = data.filter((r) => Number(r.amount) < 0).reduce((s, r) => s + Math.abs(Number(r.amount)), 0);
    const net = data.reduce((s, r) => s + Number(r.amount), 0);
    return { credit, debit: debitAbs, net };
  };

  const load = async () => {
    if (!companyId) return;
    setLoading(true);
    setError(null);
    let query = supabase
      .from("bank_transactions")
      .select("id,date,description,memo,category,type,amount,fitid")
      .eq("company_id", companyId)
      .order("date", { ascending: false })
      .limit(500);

    if (dateFilter.from) query = query.gte("date", dateFilter.from);
    if (dateFilter.to) query = query.lte("date", dateFilter.to);

    const { data, error } = await query;
    if (error) {
      setError(error.message);
      toast({ title: "Erro ao carregar transações", description: error.message, variant: "destructive" });
    } else {
      const list = (data as any[]) as TxnRow[];
      setRows(list);
      onSummaryChange?.(computeSummary(list));
      resetPagination();
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyId]);

  const currency = (n: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n ?? 0);

  const exportCsv = () => {
    const header = ["Data", "Descrição", "Tipo", "Valor", "FITID"].join(",");
    const lines = rows.map((r) => [
      new Date(r.date).toISOString().slice(0, 10),
      (r.description || r.memo || "").replace(/"/g, '""'),
      r.type || "",
      String(r.amount).replace(".", ","),
      r.fitid || "",
    ].map((v) => `"${v}"`).join(","));
    const csv = [header, ...lines].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `transacoes-ofx-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };
  const {
    currentPage,
    totalPages,
    paginatedData,
    goToPage,
    hasNext,
    hasPrevious,
    startIndex,
    endIndex,
    totalItems,
    resetPagination,
  } = usePagination({ data: rows, itemsPerPage: 20 });

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label className="text-sm text-muted-foreground">De</label>
          <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        </div>
        <div>
          <label className="text-sm text-muted-foreground">Até</label>
          <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        </div>
        <Button onClick={load} disabled={loading || !companyId}>{loading ? "Filtrando..." : "Aplicar filtros"}</Button>
        <Button variant="outline" onClick={exportCsv} disabled={rows.length === 0}>Exportar CSV</Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableCaption>Últimas transações importadas</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead className="text-right">Valor</TableHead>
              <TableHead>FITID</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length === 0 && !loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  Nenhuma transação encontrada.
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>{new Date(r.date).toLocaleDateString("pt-BR")}</TableCell>
                  <TableCell>{r.description || r.memo || "—"}</TableCell>
                  <TableCell>{r.category || "—"}</TableCell>
                  <TableCell>{r.type || "—"}</TableCell>
                  <TableCell className="text-right font-medium">{currency(Number(r.amount))}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{r.fitid || "—"}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={goToPage}
        hasNext={hasNext}
        hasPrevious={hasPrevious}
        startIndex={startIndex}
        endIndex={endIndex}
        totalItems={totalItems}
      />
    </div>
  );
};

export default TransactionsTable;
