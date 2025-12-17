import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Search, 
  ArrowDownCircle, 
  ArrowUpCircle,
  Banknote,
  Loader2,
  X,
  Plus
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCompanyContext } from '@/contexts/CompanyContext';

interface SelectedItem {
  id: string;
  type: 'transaction' | 'payable' | 'receivable';
  description: string;
  amount: number;
  date?: string;
}

interface MultiLinkModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialItems?: SelectedItem[];
  onConfirm: (items: SelectedItem[], observacao?: string) => void;
}

export const MultiLinkModal: React.FC<MultiLinkModalProps> = ({
  open,
  onOpenChange,
  initialItems = [],
  onConfirm
}) => {
  const { selectedCompanyIds, activeCompanyId } = useCompanyContext();
  const companyIds = selectedCompanyIds.length > 0 ? selectedCompanyIds : (activeCompanyId ? [activeCompanyId] : []);
  const [search, setSearch] = useState('');
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>(initialItems);
  const [activeTab, setActiveTab] = useState<'transactions' | 'payables' | 'receivables'>('transactions');
  const [observacao, setObservacao] = useState('');

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  // Reset when opening
  React.useEffect(() => {
    if (open) {
      setSelectedItems(initialItems);
      setObservacao('');
    }
  }, [open, initialItems]);

  // Buscar transações não reconciliadas
  const { data: transactions, isLoading: isLoadingTransactions } = useQuery({
    queryKey: ['available_transactions_multi', companyIds],
    queryFn: async () => {
      if (companyIds.length === 0) return [];

      const { data, error } = await supabase
        .from('bank_transactions')
        .select('id, date, description, amount, nome_origem')
        .in('company_id', companyIds)
        .eq('reconciled', false)
        .order('date', { ascending: false })
        .limit(200);

      if (error) throw error;
      return data || [];
    },
    enabled: open && companyIds.length > 0,
  });

  // Buscar contas a pagar
  const { data: payables, isLoading: isLoadingPayables } = useQuery({
    queryKey: ['available_payables_multi', companyIds],
    queryFn: async () => {
      if (companyIds.length === 0) return [];

      const { data, error } = await supabase
        .from('contas_pagar')
        .select('id, beneficiario, descricao, valor, vencimento, status')
        .in('company_id', companyIds)
        .is('bank_transaction_id', null)
        .order('vencimento', { ascending: false })
        .limit(200);

      if (error) throw error;
      return data || [];
    },
    enabled: open && companyIds.length > 0,
  });

  // Buscar contas a receber
  const { data: receivables, isLoading: isLoadingReceivables } = useQuery({
    queryKey: ['available_receivables_multi', companyIds],
    queryFn: async () => {
      if (companyIds.length === 0) return [];

      const { data, error } = await supabase
        .from('contas_receber')
        .select('id, cliente, descricao, valor_total, data_vencimento, status')
        .in('company_id', companyIds)
        .is('bank_transaction_id', null)
        .order('data_vencimento', { ascending: false })
        .limit(200);

      if (error) throw error;
      return data || [];
    },
    enabled: open && companyIds.length > 0,
  });

  const filteredTransactions = transactions?.filter(t => 
    t.description?.toLowerCase().includes(search.toLowerCase()) ||
    t.nome_origem?.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const filteredPayables = payables?.filter(p => 
    p.beneficiario?.toLowerCase().includes(search.toLowerCase()) ||
    p.descricao?.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const filteredReceivables = receivables?.filter(r => 
    r.cliente?.toLowerCase().includes(search.toLowerCase()) ||
    r.descricao?.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const isItemSelected = (id: string, type: 'transaction' | 'payable' | 'receivable') => {
    return selectedItems.some(item => item.id === id && item.type === type);
  };

  const toggleItem = (item: SelectedItem) => {
    if (isItemSelected(item.id, item.type)) {
      setSelectedItems(prev => prev.filter(i => !(i.id === item.id && i.type === item.type)));
    } else {
      setSelectedItems(prev => [...prev, item]);
    }
  };

  const removeItem = (id: string, type: 'transaction' | 'payable' | 'receivable') => {
    setSelectedItems(prev => prev.filter(i => !(i.id === id && i.type === type)));
  };

  const handleConfirm = () => {
    if (selectedItems.length >= 2) {
      onConfirm(selectedItems, observacao || undefined);
      onOpenChange(false);
    }
  };

  const totalTransactions = selectedItems.filter(i => i.type === 'transaction').reduce((sum, i) => sum + i.amount, 0);
  const totalAccounts = selectedItems.filter(i => i.type !== 'transaction').reduce((sum, i) => sum + Math.abs(i.amount), 0);

  const isLoading = isLoadingTransactions || isLoadingPayables || isLoadingReceivables;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Vincular Múltiplos Itens</DialogTitle>
          <DialogDescription>
            Selecione transações e contas a pagar/receber para vincular juntas
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Selection Area */}
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="transactions" className="gap-1 text-xs">
                  <Banknote className="w-3 h-3" />
                  Transações
                </TabsTrigger>
                <TabsTrigger value="payables" className="gap-1 text-xs">
                  <ArrowDownCircle className="w-3 h-3" />
                  A Pagar
                </TabsTrigger>
                <TabsTrigger value="receivables" className="gap-1 text-xs">
                  <ArrowUpCircle className="w-3 h-3" />
                  A Receber
                </TabsTrigger>
              </TabsList>

              <TabsContent value="transactions" className="mt-2">
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <ScrollArea className="h-[300px]">
                    <div className="space-y-1">
                      {filteredTransactions.map((t) => (
                        <button
                          key={t.id}
                          onClick={() => toggleItem({
                            id: t.id,
                            type: 'transaction',
                            description: t.description || 'Sem descrição',
                            amount: t.amount,
                            date: t.date
                          })}
                          className={`w-full text-left p-2 rounded-lg border transition-colors flex items-center gap-2 ${
                            isItemSelected(t.id, 'transaction')
                              ? 'border-primary bg-primary/5'
                              : 'hover:bg-accent/50'
                          }`}
                        >
                          <Checkbox checked={isItemSelected(t.id, 'transaction')} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{t.description || 'Sem descrição'}</p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(t.date), 'dd/MM/yyyy', { locale: ptBR })}
                            </p>
                          </div>
                          <Badge variant={t.amount > 0 ? 'default' : 'secondary'} className="shrink-0">
                            {formatCurrency(t.amount)}
                          </Badge>
                        </button>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </TabsContent>

              <TabsContent value="payables" className="mt-2">
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <ScrollArea className="h-[300px]">
                    <div className="space-y-1">
                      {filteredPayables.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => toggleItem({
                            id: p.id,
                            type: 'payable',
                            description: p.beneficiario,
                            amount: -p.valor,
                            date: p.vencimento
                          })}
                          className={`w-full text-left p-2 rounded-lg border transition-colors flex items-center gap-2 ${
                            isItemSelected(p.id, 'payable')
                              ? 'border-primary bg-primary/5'
                              : 'hover:bg-accent/50'
                          }`}
                        >
                          <Checkbox checked={isItemSelected(p.id, 'payable')} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{p.beneficiario}</p>
                            <p className="text-xs text-muted-foreground truncate">{p.descricao}</p>
                          </div>
                          <Badge variant="destructive" className="shrink-0">
                            {formatCurrency(p.valor)}
                          </Badge>
                        </button>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </TabsContent>

              <TabsContent value="receivables" className="mt-2">
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <ScrollArea className="h-[300px]">
                    <div className="space-y-1">
                      {filteredReceivables.map((r) => (
                        <button
                          key={r.id}
                          onClick={() => toggleItem({
                            id: r.id,
                            type: 'receivable',
                            description: r.cliente,
                            amount: r.valor_total,
                            date: r.data_vencimento
                          })}
                          className={`w-full text-left p-2 rounded-lg border transition-colors flex items-center gap-2 ${
                            isItemSelected(r.id, 'receivable')
                              ? 'border-primary bg-primary/5'
                              : 'hover:bg-accent/50'
                          }`}
                        >
                          <Checkbox checked={isItemSelected(r.id, 'receivable')} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{r.cliente}</p>
                            <p className="text-xs text-muted-foreground truncate">{r.descricao}</p>
                          </div>
                          <Badge className="shrink-0">
                            {formatCurrency(r.valor_total)}
                          </Badge>
                        </button>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Selected Items */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Itens Selecionados ({selectedItems.length})</h4>
            </div>

            <ScrollArea className="h-[250px] border rounded-lg p-2">
              {selectedItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <Plus className="w-8 h-8 text-muted-foreground/50 mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Selecione ao menos 2 itens para vincular
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  {selectedItems.map((item) => (
                    <div 
                      key={`${item.type}-${item.id}`}
                      className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        {item.type === 'transaction' && <Banknote className="w-4 h-4 text-blue-500 shrink-0" />}
                        {item.type === 'payable' && <ArrowDownCircle className="w-4 h-4 text-red-500 shrink-0" />}
                        {item.type === 'receivable' && <ArrowUpCircle className="w-4 h-4 text-green-500 shrink-0" />}
                        <span className="text-sm truncate">{item.description}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge variant={item.amount > 0 ? 'default' : 'secondary'}>
                          {formatCurrency(item.amount)}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => removeItem(item.id, item.type)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>

            {/* Summary */}
            <div className="p-3 bg-muted rounded-lg space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Transações:</span>
                <span className="font-medium">{formatCurrency(totalTransactions)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Contas:</span>
                <span className="font-medium">{formatCurrency(totalAccounts)}</span>
              </div>
              <div className="flex justify-between text-sm border-t pt-2">
                <span className="text-muted-foreground">Diferença:</span>
                <span className={`font-medium ${Math.abs(totalTransactions) - totalAccounts === 0 ? 'text-green-600' : 'text-orange-600'}`}>
                  {formatCurrency(Math.abs(totalTransactions) - totalAccounts)}
                </span>
              </div>
            </div>

            {/* Observation */}
            <Input
              placeholder="Observação (opcional)"
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm} disabled={selectedItems.length < 2}>
            Vincular {selectedItems.length} Itens
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
