import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useCompanyContext } from "@/contexts/CompanyContext";
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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { CategoryPicker } from "./CategoryPicker";
import { TransactionStatusBadge, TransactionStatusStats, TransactionStatus } from "./TransactionStatusBadge";
import { AttachmentUploader } from "./AttachmentUploader";
import { AlertCircle, Filter, Download, Sparkles } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface TxnRow {
  id: string;
  date: string;
  description: string | null;
  memo: string | null;
  category: string | null;
  category_id: string | null;
  type: string | null;
  amount: number;
  fitid: string | null;
  bank_account_uuid?: string | null;
  account_id?: string | null;
  bank_id?: string | null;
  branch_id?: string | null;
  acct_type?: string | null;
  raw?: any;
  transaction_status: TransactionStatus;
  attachment_url: string | null;
}

interface Summary {
  credit: number;
  debit: number;
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
  const { activeCompanyId } = useCompanyContext();
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
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Selection & inline edit
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkCategory, setBulkCategory] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  // Accounts
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string>("all");

  // Selection mode: all filtered vs per-page ids
  const [selectedAllFiltered, setSelectedAllFiltered] = useState(false);
  const [allFilteredCount, setAllFilteredCount] = useState(0);

  // AI Classification for empty items
  const [isClassifyingAI, setIsClassifyingAI] = useState(false);
  const [showClassifyDialog, setShowClassifyDialog] = useState(false);
  const [classifyContext, setClassifyContext] = useState("");

  // Load context from localStorage
  useEffect(() => {
    const savedContext = localStorage.getItem('classify_context');
    if (savedContext) {
      setClassifyContext(savedContext);
    }
  }, []);

  const dateFilter = useMemo(() => ({ from, to }), [from, to]);

  // Status counts
  const statusCounts = useMemo(() => {
    return {
      pending: rows.filter(r => r.transaction_status === 'pending' || !r.transaction_status).length,
      classified: rows.filter(r => r.transaction_status === 'classified').length,
      audited: rows.filter(r => r.transaction_status === 'audited').length,
    };
  }, [rows]);

  const computeSummary = (data: TxnRow[]) => {
    const credit = data.filter((r) => Number(r.amount) > 0).reduce((s, r) => s + Number(r.amount), 0);
    const debitAbs = data.filter((r) => Number(r.amount) < 0).reduce((s, r) => s + Math.abs(Number(r.amount)), 0);
    const net = data.reduce((s, r) => s + Number(r.amount), 0);
    return { credit, debit: debitAbs, net };
  };

  const load = async () => {
    if (!activeCompanyId) return;
    setLoading(true);
    setError(null);
    let query = supabase
      .from("bank_transactions")
      .select("id,date,description,memo,category,category_id,type,amount,fitid,bank_account_uuid,account_id,bank_id,branch_id,acct_type,raw,transaction_status,attachment_url")
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
    if (!activeCompanyId) return;
    // Fetch accounts
    supabase
      .from("bank_accounts")
      .select("id,display_name,account_id,bank_id,branch_id")
      .eq("company_id", activeCompanyId)
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
      .eq("company_id", activeCompanyId)
      .not("category", "is", null)
      .then(({ data, error }) => {
        if (!error && data) {
          const cats = Array.from(new Set((data as any[]).map((d: any) => d.category))).filter(Boolean).sort();
          setCategories(cats as string[]);
        }
      });

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCompanyId]);

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
    const header = ["Data", "Descrição", "Conta", "Categoria", "Status", "Tipo", "Valor", "Anexo"].join(",");
    const lines = rows
      .map((r) => [
        new Date(r.date).toISOString().slice(0, 10),
        (r.description || r.memo || "").replace(/"/g, '""'),
        formatAccount(r),
        r.category || "",
        r.transaction_status || "pending",
        r.type || "",
        String(r.amount).replace(".", ","),
        r.attachment_url ? "Sim" : "Não",
      ]
        .map((v) => `"${v}"`)
        .join(","));
    const csv = [header, ...lines].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `transacoes-${Date.now()}.csv`;
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
    let query = q.eq("company_id", activeCompanyId);
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
    if (statusFilter !== "all") {
      if (statusFilter === "pending") {
        query = query.or("transaction_status.eq.pending,transaction_status.is.null");
      } else {
        query = query.eq("transaction_status", statusFilter);
      }
    }
    return query;
  };

  // Select all matching current filter (across all pages)
  const selectAllMatching = async () => {
    if (!activeCompanyId) return;
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

  // Update category with hierarchy
  const updateCategory = async (id: string, categoryId: string | null, categoryName: string | null) => {
    const { error } = await supabase
      .from("bank_transactions")
      .update({ 
        category_id: categoryId,
        category: categoryName,
        transaction_status: categoryId ? 'classified' : 'pending'
      })
      .eq("id", id);
    
    if (error) {
      toast({ title: "Erro ao atualizar categoria", description: error.message, variant: "destructive" });
      return;
    }

    setRows((prev) => prev.map((r) => 
      r.id === id 
        ? { ...r, category_id: categoryId, category: categoryName, transaction_status: categoryId ? 'classified' : 'pending' } 
        : r
    ));
    toast({ title: "Categoria atualizada" });
    setEditingId(null);
  };

  // Update attachment URL locally after upload
  const handleAttachmentUploaded = (transactionId: string, url: string) => {
    setRows((prev) => prev.map((r) => 
      r.id === transactionId 
        ? { ...r, attachment_url: url }
        : r
    ));
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
        let q = supabase.from("bank_transactions").update({ 
          category: newCat,
          transaction_status: 'classified'
        });
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
          .update({ 
            category: newCat,
            transaction_status: 'classified'
          })
          .in("id", ids);
        if (error) throw error;
        setRows((prev) => prev.map((r) => 
          selectedIds.has(r.id) 
            ? { ...r, category: newCat, transaction_status: 'classified' } 
            : r
        ));
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
  const handleClassifyWithContext = async () => {
    if (!activeCompanyId) return;
    
    localStorage.setItem('classify_context', classifyContext);
    setShowClassifyDialog(false);
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
              memo: transaction.memo,
              context: classifyContext.trim()
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
                  transaction_status: 'classified',
                  raw: { 
                    ...transaction.raw, 
                    ai_classified: true 
                  }
                })
                .eq("id", transaction.id);

              if (!updateError) {
                classified++;
                setRows(prev => prev.map(r => 
                  r.id === transaction.id 
                    ? { ...r, category: categoria, transaction_status: 'classified', raw: { ...r.raw, ai_classified: true } }
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

  const emptyCount = useMemo(() => rows.filter(r => !r.category || r.category.trim() === '').length, [rows]);
  const noAttachmentCount = useMemo(() => rows.filter(r => !r.attachment_url).length, [rows]);

  return (
    <div className="space-y-4">
      {/* Status Overview */}
      <div className="flex items-center justify-between">
        <TransactionStatusStats {...statusCounts} />
        {(emptyCount > 0 || noAttachmentCount > 0) && (
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {emptyCount > 0 && (
              <span className="flex items-center gap-1">
                <AlertCircle className="h-4 w-4 text-yellow-500" />
                {emptyCount} sem categoria
              </span>
            )}
            {noAttachmentCount > 0 && (
              <span className="flex items-center gap-1">
                <AlertCircle className="h-4 w-4 text-orange-500" />
                {noAttachmentCount} sem anexo
              </span>
            )}
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label className="text-sm text-muted-foreground">De</label>
          <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="w-36" />
        </div>
        <div>
          <label className="text-sm text-muted-foreground">Até</label>
          <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="w-36" />
        </div>
        <div>
          <label className="text-sm text-muted-foreground">Conta</label>
          <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
            <SelectTrigger className="w-48">
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
            placeholder="Buscar..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-40"
          />
        </div>
        <div>
          <label className="text-sm text-muted-foreground">Categoria</label>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Todas" />
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
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="credit">Crédito</SelectItem>
              <SelectItem value="debit">Débito</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm text-muted-foreground">Status</label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="pending">Pendente</SelectItem>
              <SelectItem value="classified">Classificado</SelectItem>
              <SelectItem value="audited">Auditado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center gap-2">
        <Button onClick={load} disabled={loading || !activeCompanyId} size="sm">
          <Filter className="h-4 w-4 mr-1" />
          {loading ? "Filtrando..." : "Aplicar filtros"}
        </Button>
        <Button variant="secondary" size="sm" onClick={selectAllMatching} disabled={loading || !activeCompanyId}>
          Selecionar todos ({rows.length})
        </Button>
        <Button variant="outline" size="sm" onClick={exportCsv} disabled={rows.length === 0}>
          <Download className="h-4 w-4 mr-1" />
          Exportar CSV
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setShowClassifyDialog(true)} 
          disabled={isClassifyingAI || !activeCompanyId || emptyCount === 0}
        >
          <Sparkles className="h-4 w-4 mr-1" />
          {isClassifyingAI ? "Classificando..." : `IA (${emptyCount})`}
        </Button>
      </div>

      {/* Bulk Actions */}
      {(selectedIds.size > 0 || selectedAllFiltered) && (
        <Alert>
          <AlertDescription>
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm font-medium">
                {selectedAllFiltered ? allFilteredCount : selectedIds.size} selecionados
                {selectedAllFiltered ? " (todos do filtro)" : ""}
              </span>
              <Input
                placeholder="Nova categoria"
                value={bulkCategory}
                onChange={(e) => setBulkCategory(e.target.value)}
                className="max-w-xs h-8"
              />
              <Button size="sm" onClick={applyBulk} disabled={selectedAllFiltered ? allFilteredCount === 0 : selectedIds.size === 0}>
                Aplicar categoria
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">Excluir</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Excluir {selectedAllFiltered ? allFilteredCount : selectedIds.size} lançamentos?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta ação é irreversível.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={bulkDelete}>Excluir</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <Button variant="ghost" size="sm" onClick={clearSelection}>Limpar</Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableCaption>
            {totalItems} transações encontradas
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <Checkbox checked={allCurrentSelected} onCheckedChange={toggleSelectAllCurrent} />
              </TableHead>
              <TableHead className="w-24">Status</TableHead>
              <TableHead className="w-24">Data</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead className="w-64">Categoria</TableHead>
              <TableHead className="w-28 text-right">Valor</TableHead>
              <TableHead className="w-16 text-center">Anexo</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length === 0 && !loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                  Nenhuma transação encontrada.
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((r) => (
                <TableRow key={r.id} className={r.transaction_status === 'audited' ? 'bg-green-50/50' : ''}>
                  <TableCell>
                    <Checkbox
                      checked={selectedIds.has(r.id)}
                      onCheckedChange={(v) => toggleRow(r.id, v)}
                      disabled={r.transaction_status === 'audited'}
                    />
                  </TableCell>
                  <TableCell>
                    <TransactionStatusBadge status={r.transaction_status} />
                  </TableCell>
                  <TableCell className="text-sm">
                    {new Date(r.date).toLocaleDateString("pt-BR")}
                  </TableCell>
                  <TableCell>
                    <div className="max-w-xs truncate" title={r.description || r.memo || ""}>
                      {r.description || r.memo || "—"}
                    </div>
                    {r.raw?.ai_classified && (
                      <span className="text-xs text-blue-600 bg-blue-100 px-1 rounded ml-1">🤖</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {editingId === r.id ? (
                      <CategoryPicker
                        value={r.category_id}
                        onChange={(catId, catName) => updateCategory(r.id, catId, catName)}
                        filterType={Number(r.amount) > 0 ? 'receita' : 'despesa'}
                        className="w-full"
                      />
                    ) : (
                      <button
                        className="text-left w-full hover:underline text-sm"
                        onClick={() => setEditingId(r.id)}
                        disabled={r.transaction_status === 'audited'}
                      >
                        {r.category || (
                          <span className="text-muted-foreground italic">Sem categoria</span>
                        )}
                      </button>
                    )}
                  </TableCell>
                  <TableCell className={`text-right font-medium ${Number(r.amount) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {currency(Number(r.amount))}
                  </TableCell>
                  <TableCell className="text-center">
                    <AttachmentUploader
                      transactionId={r.id}
                      companyId={activeCompanyId || ''}
                      currentUrl={r.attachment_url}
                      onUploadComplete={(url) => handleAttachmentUploaded(r.id, url)}
                      disabled={r.transaction_status === 'audited' || !activeCompanyId}
                    />
                  </TableCell>
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

      {/* AI Classification Dialog */}
      <Dialog open={showClassifyDialog} onOpenChange={setShowClassifyDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Classificar transações com IA</DialogTitle>
            <DialogDescription>
              Forneça contexto sobre sua empresa para melhorar a precisão
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Contexto (opcional)</label>
              <Textarea
                value={classifyContext}
                onChange={(e) => setClassifyContext(e.target.value.slice(0, 500))}
                placeholder="Ex: Somos uma empresa de software B2B. AWS e Digital Ocean = 'Tecnologia - Infraestrutura'."
                className="min-h-[100px] mt-2"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {classifyContext.length}/500 caracteres
              </p>
            </div>
            
            <div className="flex items-center justify-between pt-2">
              <p className="text-sm text-muted-foreground">
                {emptyCount} transações serão classificadas
              </p>
              <div className="space-x-2">
                <Button variant="outline" onClick={() => setShowClassifyDialog(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleClassifyWithContext} disabled={emptyCount === 0}>
                  <Sparkles className="h-4 w-4 mr-1" />
                  Classificar com IA
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TransactionsTable;
