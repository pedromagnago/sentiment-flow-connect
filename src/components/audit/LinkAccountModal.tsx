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
import { 
  Search, 
  ArrowDownCircle, 
  ArrowUpCircle,
  Check,
  Loader2
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCompanyContext } from '@/contexts/CompanyContext';

interface LinkAccountModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transactionId: string;
  transactionAmount: number;
  transactionDate: string;
  transactionDescription: string;
  onLink: (accountId: string, accountType: 'payable' | 'receivable') => void;
}

export const LinkAccountModal: React.FC<LinkAccountModalProps> = ({
  open,
  onOpenChange,
  transactionId,
  transactionAmount,
  transactionDate,
  transactionDescription,
  onLink
}) => {
  const { selectedCompanyIds, activeCompanyId } = useCompanyContext();
  const companyIds = selectedCompanyIds.length > 0 ? selectedCompanyIds : (activeCompanyId ? [activeCompanyId] : []);
  const [search, setSearch] = useState('');
  const [selectedAccount, setSelectedAccount] = useState<{ id: string; type: 'payable' | 'receivable' } | null>(null);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  // Buscar contas a pagar disponíveis
  const { data: payables, isLoading: isLoadingPayables } = useQuery({
    queryKey: ['available_payables', companyIds, transactionAmount],
    queryFn: async () => {
      if (companyIds.length === 0) return [];

      const { data, error } = await supabase
        .from('contas_pagar')
        .select('id, beneficiario, descricao, valor, vencimento, status')
        .in('company_id', companyIds)
        .is('bank_transaction_id', null)
        .order('vencimento', { ascending: false })
        .limit(100);

      if (error) throw error;
      return data || [];
    },
    enabled: open && companyIds.length > 0,
  });

  // Buscar contas a receber disponíveis
  const { data: receivables, isLoading: isLoadingReceivables } = useQuery({
    queryKey: ['available_receivables', companyIds, transactionAmount],
    queryFn: async () => {
      if (companyIds.length === 0) return [];

      const { data, error } = await supabase
        .from('contas_receber')
        .select('id, cliente, descricao, valor_total, data_vencimento, status')
        .in('company_id', companyIds)
        .is('bank_transaction_id', null)
        .order('data_vencimento', { ascending: false })
        .limit(100);

      if (error) throw error;
      return data || [];
    },
    enabled: open && companyIds.length > 0,
  });

  const filteredPayables = payables?.filter(p => 
    p.beneficiario?.toLowerCase().includes(search.toLowerCase()) ||
    p.descricao?.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const filteredReceivables = receivables?.filter(r => 
    r.cliente?.toLowerCase().includes(search.toLowerCase()) ||
    r.descricao?.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const handleConfirm = () => {
    if (selectedAccount) {
      onLink(selectedAccount.id, selectedAccount.type);
      onOpenChange(false);
      setSelectedAccount(null);
      setSearch('');
    }
  };

  const isLoading = isLoadingPayables || isLoadingReceivables;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Vincular Transação a Conta</DialogTitle>
          <DialogDescription>
            Selecione a conta a pagar ou receber correspondente a esta transação
          </DialogDescription>
        </DialogHeader>

        {/* Transaction Info */}
        <div className="p-3 bg-muted rounded-lg mb-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium">{transactionDescription || 'Sem descrição'}</span>
            <Badge variant={transactionAmount > 0 ? 'default' : 'secondary'}>
              {formatCurrency(transactionAmount)}
            </Badge>
          </div>
          <span className="text-xs text-muted-foreground">
            {format(new Date(transactionDate), 'dd/MM/yyyy', { locale: ptBR })}
          </span>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou descrição..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Tabs for payables/receivables */}
        <Tabs defaultValue={transactionAmount < 0 ? 'payables' : 'receivables'}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="payables" className="gap-2">
              <ArrowDownCircle className="w-4 h-4" />
              A Pagar ({filteredPayables.length})
            </TabsTrigger>
            <TabsTrigger value="receivables" className="gap-2">
              <ArrowUpCircle className="w-4 h-4" />
              A Receber ({filteredReceivables.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="payables" className="mt-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <ScrollArea className="h-[300px]">
                <div className="space-y-1">
                  {filteredPayables.map((payable) => (
                    <button
                      key={payable.id}
                      onClick={() => setSelectedAccount({ id: payable.id, type: 'payable' })}
                      className={`w-full text-left p-3 rounded-lg border transition-colors ${
                        selectedAccount?.id === payable.id
                          ? 'border-primary bg-primary/5'
                          : 'hover:bg-accent/50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{payable.beneficiario}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{formatCurrency(payable.valor)}</span>
                          {selectedAccount?.id === payable.id && (
                            <Check className="w-4 h-4 text-primary" />
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{payable.descricao}</p>
                      <span className="text-xs text-muted-foreground">
                        Venc: {format(new Date(payable.vencimento), 'dd/MM/yyyy', { locale: ptBR })}
                      </span>
                    </button>
                  ))}
                  {filteredPayables.length === 0 && (
                    <p className="text-center text-sm text-muted-foreground py-4">
                      Nenhuma conta a pagar encontrada
                    </p>
                  )}
                </div>
              </ScrollArea>
            )}
          </TabsContent>

          <TabsContent value="receivables" className="mt-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <ScrollArea className="h-[300px]">
                <div className="space-y-1">
                  {filteredReceivables.map((receivable) => (
                    <button
                      key={receivable.id}
                      onClick={() => setSelectedAccount({ id: receivable.id, type: 'receivable' })}
                      className={`w-full text-left p-3 rounded-lg border transition-colors ${
                        selectedAccount?.id === receivable.id
                          ? 'border-primary bg-primary/5'
                          : 'hover:bg-accent/50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{receivable.cliente}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{formatCurrency(receivable.valor_total)}</span>
                          {selectedAccount?.id === receivable.id && (
                            <Check className="w-4 h-4 text-primary" />
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{receivable.descricao}</p>
                      <span className="text-xs text-muted-foreground">
                        Venc: {format(new Date(receivable.data_vencimento), 'dd/MM/yyyy', { locale: ptBR })}
                      </span>
                    </button>
                  ))}
                  {filteredReceivables.length === 0 && (
                    <p className="text-center text-sm text-muted-foreground py-4">
                      Nenhuma conta a receber encontrada
                    </p>
                  )}
                </div>
              </ScrollArea>
            )}
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm} disabled={!selectedAccount}>
            Vincular
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
