import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useCompanyId } from "@/hooks/useCompanyId";
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
  raw?: any;
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
  const { companyId } = useCompanyId();
  const [rows, setRows] = useState<TxnRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");

  // Extra filters
  const [searchText, setSearchText] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [categories, setCategories] = useState<string[]>([]);
  const [typeFilter, setTypeFilter] = useState<string>("all");

  // Selection & inline edit
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkCategory, setBulkCategory] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingCat, setEditingCat] = useState("");

  // Accounts
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string>("all");

  // Selection mode: all filtered vs per-page ids
  const [selectedAllFiltered, setSelectedAllFiltered] = useState(false);
  const [allFilteredCount, setAllFilteredCount] = useState(0);

  // AI Classification for empty items
  const [isClassifyingAI, setIsClassifyingAI] = useState(false);

  const dateFilter = useMemo(() => ({ from, to }), [from, to]);


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
      .order("date", { ascending: false })
      .limit(500);

    query = applyQueryFilters(query);

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
    // Fetch accounts
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

    // Fetch categories (distinct)
    supabase
      .from("bank_transactions")
      .select("category")
      .eq("company_id", companyId)
      .not("category", "is", null)
      .then(({ data, error }) => {
        if (!error && data) {
          const cats = Array.from(new Set((data as any[]).map((d: any) => d.category))).filter(Boolean).sort();
          setCategories(cats as string[]);
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

  // Helper to apply current filters to a query
  const applyQueryFilters = (q: any) => {
    let query = q.eq("company_id", companyId);
    if (selectedAccountId !== "all") query = query.eq("bank_account_uuid", selectedAccountId);
    if (dateFilter.from) query = query.gte("date", dateFilter.from);
    if (dateFilter.to) query = query.lte("date", dateFilter.to);
    if (searchText.trim()) {
      const like = `%${searchText.trim().replace(/%/g, "")}%`;
      query = query.or(`description.ilike.${like},memo.ilike.${like}`);
    }
    if (selectedCategory !== "all") query = query.eq("category", selectedCategory);
    if (typeFilter === "credit") query = query.gt("amount", 0);
    if (typeFilter === "debit") query = query.lt("amount", 0);
    return query;
  };

  // Select all matching current filter (across all pages)
  const selectAllMatching = async () => {
    if (!companyId) return;
    setLoading(true);
    try {
      let q = supabase.from("bank_transactions").select("id", { count: "exact", head: true });
      q = applyQueryFilters(q);
      const { count, error } = await q as any;
      if (error) throw error;
      setSelectedAllFiltered(true);
      setAllFilteredCount(count || 0);
      setSelectedIds(new Set());
    } catch (e: any) {
      toast({ title: "Erro ao selecionar", description: e?.message || String(e), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const clearSelection = () => {
    setSelectedAllFiltered(false);
    setAllFilteredCount(0);
    setSelectedIds(new Set());
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
    const newCat = bulkCategory.trim();
    if (!newCat) {
      toast({ title: "Informe a categoria", variant: "destructive" });
      return;
    }

    try {
      if (selectedAllFiltered) {
        let q = supabase.from("bank_transactions").update({ category: newCat });
        q = applyQueryFilters(q);
        const { error } = await q as any;
        if (error) throw error;
        await load();
        clearSelection();
        setBulkCategory("");
        toast({ title: "Recategorização aplicada a todos do filtro" });
      } else {
        const ids = Array.from(selectedIds);
        if (ids.length === 0) return;
        const { error } = await supabase
          .from("bank_transactions")
          .update({ category: newCat })
          .in("id", ids);
        if (error) throw error;
        setRows((prev) => prev.map((r) => (selectedIds.has(r.id) ? { ...r, category: newCat } : r)));
        setSelectedIds(new Set());
        setBulkCategory("");
        toast({ title: "Recategorização aplicada" });
      }
    } catch (e: any) {
      toast({ title: "Erro ao recategorizar", description: e?.message || String(e), variant: "destructive" });
    }
  };

  // Bulk delete
  const bulkDelete = async () => {
    try {
      if (selectedAllFiltered) {
        let q = supabase.from("bank_transactions").delete();
        q = applyQueryFilters(q);
        const { error } = await q as any;
        if (error) throw error;
        await load();
        clearSelection();
        toast({ title: "Lançamentos excluídos (todos do filtro)" });
      } else {
        const ids = Array.from(selectedIds);
        if (ids.length === 0) return;
        const { error } = await supabase
          .from("bank_transactions")
          .delete()
          .in("id", ids);
        if (error) throw error;
        setRows((prev) => {
          const next = prev.filter((r) => !selectedIds.has(r.id));
          onSummaryChange?.(computeSummary(next));
          return next;
        });
        setSelectedIds(new Set());
        toast({ title: "Lançamentos excluídos" });
      }
    } catch (e: any) {
      toast({ title: "Erro ao excluir", description: e?.message || String(e), variant: "destructive" });
    }
  };

  // AI Classification for empty items
  const classifyEmptyWithAI = async () => {
    if (!companyId) return;
    setIsClassifyingAI(true);
    try {
      const emptyTransactions = rows.filter(r => !r.category || r.category.trim() === '');
      if (emptyTransactions.length === 0) {
        toast({ title: "Nenhuma transação sem categoria encontrada", variant: "default" });
        return;
      }

      let classified = 0;
      for (const transaction of emptyTransactions) {
        try {
          const { data, error } = await supabase.functions.invoke('classify-transaction', {
            body: {
              description: transaction.description,
              amount: transaction.amount,
              memo: transaction.memo
            }
          });

          if (error) throw error;

          if (data?.success && data?.classification) {
            const { categoria } = data.classification;
            if (categoria) {
              const { error: updateError } = await supabase
                .from("bank_transactions")
                .update({ 
                  category: categoria,
                  raw: { 
                    ...transaction.raw, 
                    ai_classified: true 
                  }
                })
                .eq("id", transaction.id);

              if (!updateError) {
                classified++;
                // Update local state
                setRows(prev => prev.map(r => 
                  r.id === transaction.id 
                    ? { ...r, category: categoria, raw: { ...r.raw, ai_classified: true } }
                    : r
                ));
              }
            }
          }
        } catch (e) {
          console.error('Error classifying transaction:', e);
        }
      }

      toast({ 
        title: `${classified} transações classificadas pela IA`,
        description: `De ${emptyTransactions.length} transações sem categoria`
      });
    } catch (e: any) {
      toast({ title: "Erro na classificação por IA", description: e?.message || String(e), variant: "destructive" });
    } finally {
      setIsClassifyingAI(false);
    }
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
        <div>
          <label className="text-sm text-muted-foreground">Descrição</label>
          <Input
            placeholder="Descrição contém..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>
        <div>
          <label className="text-sm text-muted-foreground">Categoria</label>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-56">
              <SelectValue placeholder="Todas as categorias" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm text-muted-foreground">Tipo</label>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="credit">Crédito</SelectItem>
              <SelectItem value="debit">Débito</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={load} disabled={loading || !companyId}>{loading ? "Filtrando..." : "Aplicar filtros"}</Button>
        <Button variant="secondary" onClick={selectAllMatching} disabled={loading || !companyId}>
          Selecionar todos do filtro
        </Button>
        <Button variant="outline" onClick={exportCsv} disabled={rows.length === 0}>Exportar CSV</Button>
        <Button 
          variant="outline" 
          onClick={classifyEmptyWithAI} 
          disabled={isClassifyingAI || !companyId || rows.filter(r => !r.category || r.category.trim() === '').length === 0}
        >
          {isClassifyingAI ? "Classificando..." : "🤖 Classificar Vazios com IA"}
        </Button>
      </div>

      {(selectedIds.size > 0 || selectedAllFiltered) && (
        <div className="flex flex-wrap items-center gap-3">
          <div className="text-sm text-muted-foreground">
            Selecionados: {selectedAllFiltered ? allFilteredCount : selectedIds.size}
            {selectedAllFiltered ? " (todos do filtro)" : ""}
          </div>
          <Input
            placeholder="Nova categoria"
            value={bulkCategory}
            onChange={(e) => setBulkCategory(e.target.value)}
            className="max-w-xs"
          />
          <Button onClick={applyBulk} disabled={selectedAllFiltered ? allFilteredCount === 0 : selectedIds.size === 0}>
            Aplicar categoria
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">Excluir selecionados</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Excluir {selectedAllFiltered ? allFilteredCount : selectedIds.size} lançamentos?
                </AlertDialogTitle>
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
          <Button variant="outline" onClick={clearSelection}>Limpar seleção</Button>
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
                        <div className="flex items-center gap-2">
                          <span>{r.category || "—"}</span>
                          {r.raw?.ai_classified && (
                            <span className="text-xs text-blue-600 bg-blue-100 px-1 rounded">🤖 IA</span>
                          )}
                        </div>
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
