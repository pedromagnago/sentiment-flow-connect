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
import { Checkbox } from "@/components/ui/checkbox";
import { usePagination } from "@/hooks/usePagination";
import { PaginationControls } from "@/components/common/Pagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
interface TxnRow {
  id: string;
  date: string;
  description: string | null;
  memo: string | null;
  category: string | null;
  type: string | null;
  amount: number;
  fitid: string | null;
  bank_account_uuid?: string | null;
  account_id?: string | null;
  bank_id?: string | null;
  branch_id?: string | null;
  acct_type?: string | null;
}

interface Summary {
  credit: number;
  debit: number; // absolute value of negatives
  net: number;
}

interface Account {
  id: string;
  display_name: string | null;
  account_id: string;
  bank_id: string | null;
  branch_id: string | null;
}

export const TransactionsTable: React.FC<{ onSummaryChange?: (s: Summary) => void }> = ({ onSummaryChange }) => {
  const { toast } = useToast();
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [rows, setRows] = useState<TxnRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");

  // Selection & inline edit
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkCategory, setBulkCategory] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingCat, setEditingCat] = useState("");

  // Accounts
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string>("all");

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
      .select("id,date,description,memo,category,type,amount,fitid,bank_account_uuid,account_id,bank_id,branch_id,acct_type")
      .eq("company_id", companyId)
      .order("date", { ascending: false })
      .limit(500);

    if (selectedAccountId !== "all") query = query.eq("bank_account_uuid", selectedAccountId);

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
      setSelectedIds(new Set());
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!companyId) return;
    supabase
      .from("bank_accounts")
      .select("id,display_name,account_id,bank_id,branch_id")
      .eq("company_id", companyId)
      .order("display_name", { ascending: true })
      .then(({ data, error }) => {
        if (error) {
          console.error("Erro ao carregar contas:", error);
        } else {
          setAccounts((data as any[]) as Account[]);
        }
      });

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyId]);

  const currency = (n: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n ?? 0);

  const formatAccount = (r: TxnRow) => {
    const acct = r.account_id ? String(r.account_id) : "";
    const last4 = acct ? acct.slice(-4) : "";
    const bank = r.bank_id || "";
    const branch = r.branch_id || "";
    const label = [bank, branch, last4 ? `••${last4}` : acct].filter(Boolean).join(" / ");
    return label || "—";
  };

  const exportCsv = () => {
    const header = ["Data", "Descrição", "Conta", "Categoria", "Tipo", "Valor", "FITID"].join(",");
    const lines = rows
      .map((r) => [
        new Date(r.date).toISOString().slice(0, 10),
        (r.description || r.memo || "").replace(/"/g, '""'),
        formatAccount(r),
        r.category || "",
        r.type || "",
        String(r.amount).replace(".", ","),
        r.fitid || "",
      ]
        .map((v) => `"${v}` + `"`)
        .join(","));
    const csv = [header, ...lines].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `transacoes-ofx-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Pagination derived from full rows (client-side)
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

  // Selection helpers
  const currentPageIds = useMemo(() => new Set(paginatedData.map((r) => r.id)), [paginatedData]);
  const allCurrentSelected = useMemo(
    () => paginatedData.length > 0 && paginatedData.every((r) => selectedIds.has(r.id)),
    [paginatedData, selectedIds]
  );
  const toggleSelectAllCurrent = () => {
    const next = new Set(selectedIds);
    if (allCurrentSelected) {
      paginatedData.forEach((r) => next.delete(r.id));
    } else {
      paginatedData.forEach((r) => next.add(r.id));
    }
    setSelectedIds(next);
  };
  const toggleRow = (id: string, checked: boolean | string) => {
    const next = new Set(selectedIds);
    if (checked) next.add(id);
    else next.delete(id);
    setSelectedIds(next);
  };

  // Inline edit handlers
  const startEdit = (row: TxnRow) => {
    setEditingId(row.id);
    setEditingCat(row.category || "");
  };
  const cancelEdit = () => {
    setEditingId(null);
    setEditingCat("");
  };
  const saveEdit = async (id: string) => {
    const newCat = editingCat.trim();
    const { error } = await supabase
      .from("bank_transactions")
      .update({ category: newCat || null })
      .eq("id", id);
    if (error) {
      toast({ title: "Erro ao atualizar", description: error.message, variant: "destructive" });
      return;
    }
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, category: newCat || null } : r)));
    toast({ title: "Categoria atualizada" });
    cancelEdit();
  };

  // Bulk recategorization
  const applyBulk = async () => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    const newCat = bulkCategory.trim();
    if (!newCat) {
      toast({ title: "Informe a categoria", variant: "destructive" });
      return;
    }
    const { error } = await supabase
      .from("bank_transactions")
      .update({ category: newCat })
      .in("id", ids);
    if (error) {
      toast({ title: "Erro ao recategorizar", description: error.message, variant: "destructive" });
      return;
    }
    setRows((prev) => prev.map((r) => (selectedIds.has(r.id) ? { ...r, category: newCat } : r)));
    setSelectedIds(new Set());
    setBulkCategory("");
    toast({ title: "Recategorização aplicada" });
  };

  // Bulk delete
  const bulkDelete = async () => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    const { error } = await supabase
      .from("bank_transactions")
      .delete()
      .in("id", ids);
    if (error) {
      toast({ title: "Erro ao excluir", description: error.message, variant: "destructive" });
      return;
    }
    setRows((prev) => {
      const next = prev.filter((r) => !selectedIds.has(r.id));
      onSummaryChange?.(computeSummary(next));
      return next;
    });
    setSelectedIds(new Set());
    toast({ title: "Lançamentos excluídos" });
  };

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
        <div>
          <label className="text-sm text-muted-foreground">Conta</label>
          <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
            <SelectTrigger className="w-56">
              <SelectValue placeholder="Todas as contas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {accounts.map((a) => (
                <SelectItem key={a.id} value={a.id}>
                  {a.display_name || `${a.bank_id || ""} ${a.branch_id || ""} ${a.account_id}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={load} disabled={loading || !companyId}>{loading ? "Filtrando..." : "Aplicar filtros"}</Button>
        <Button variant="outline" onClick={exportCsv} disabled={rows.length === 0}>Exportar CSV</Button>
      </div>

      {selectedIds.size > 0 && (
        <div className="flex flex-wrap items-center gap-3">
          <div className="text-sm text-muted-foreground">Selecionados: {selectedIds.size}</div>
          <Input
            placeholder="Nova categoria"
            value={bulkCategory}
            onChange={(e) => setBulkCategory(e.target.value)}
            className="max-w-xs"
          />
          <Button onClick={applyBulk}>Aplicar categoria</Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">Excluir selecionados</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Excluir {selectedIds.size} lançamentos?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta ação é irreversível. Os lançamentos serão removidos definitivamente.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={bulkDelete}>Excluir</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}

      <div className="rounded-md border">
        <Table>
          <TableCaption>Últimas transações importadas</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <Checkbox checked={allCurrentSelected} onCheckedChange={toggleSelectAllCurrent} aria-label="Selecionar página" />
              </TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Conta</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead className="text-right">Valor</TableHead>
              <TableHead>FITID</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length === 0 && !loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  Nenhuma transação encontrada.
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedIds.has(r.id)}
                      onCheckedChange={(v) => toggleRow(r.id, v)}
                      aria-label="Selecionar transação"
                    />
                  </TableCell>
                  <TableCell>{new Date(r.date).toLocaleDateString("pt-BR")}</TableCell>
                  <TableCell>{r.description || r.memo || "—"}</TableCell>
                  <TableCell>{formatAccount(r)}</TableCell>
                  <TableCell>
                    {editingId === r.id ? (
                      <Input
                        autoFocus
                        value={editingCat}
                        onChange={(e) => setEditingCat(e.target.value)}
                        onBlur={() => saveEdit(r.id)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") saveEdit(r.id);
                          if (e.key === "Escape") cancelEdit();
                        }}
                        placeholder="Categoria"
                        className="h-8"
                      />
                    ) : (
                      <button
                        className="text-left w-full hover:underline"
                        onClick={() => startEdit(r)}
                        aria-label="Editar categoria"
                      >
                        {r.category || "—"}
                      </button>
                    )}
                  </TableCell>
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
