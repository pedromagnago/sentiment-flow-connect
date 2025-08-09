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

interface TxnRow {
  id: string;
  date: string;
  description: string | null;
  memo: string | null;
  type: string | null;
  amount: number;
  fitid: string | null;
}

export const TransactionsTable: React.FC = () => {
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

  const load = async () => {
    if (!companyId) return;
    setLoading(true);
    setError(null);
    let query = supabase
      .from("bank_transactions")
      .select("id,date,description,memo,type,amount,fitid")
      .eq("company_id", companyId)
      .order("date", { ascending: false })
      .limit(200);

    if (dateFilter.from) query = query.gte("date", dateFilter.from);
    if (dateFilter.to) query = query.lte("date", dateFilter.to);

    const { data, error } = await query;
    if (error) {
      setError(error.message);
      toast({ title: "Erro ao carregar transações", description: error.message, variant: "destructive" });
    } else {
      setRows((data as any[]) as TxnRow[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyId]);

  const currency = (n: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n ?? 0);

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
      </div>

      <div className="rounded-md border">
        <Table>
          <TableCaption>Últimas transações importadas</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead className="text-right">Valor</TableHead>
              <TableHead>FITID</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 && !loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  Nenhuma transação encontrada.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>{new Date(r.date).toLocaleDateString("pt-BR")}</TableCell>
                  <TableCell>{r.description || r.memo || "—"}</TableCell>
                  <TableCell>{r.type || "—"}</TableCell>
                  <TableCell className="text-right font-medium">{currency(Number(r.amount))}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{r.fitid || "—"}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default TransactionsTable;
