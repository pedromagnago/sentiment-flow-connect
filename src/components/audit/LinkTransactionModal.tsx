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
import { 
  Search, 
  Check,
  Loader2,
  ArrowDownCircle,
  ArrowUpCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCompanyContext } from '@/contexts/CompanyContext';

interface LinkTransactionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accountId: string;
  accountType: 'payable' | 'receivable';
  accountAmount: number;
  accountDescription: string;
  onLink: (transactionId: string) => void;
}

export const LinkTransactionModal: React.FC<LinkTransactionModalProps> = ({
  open,
  onOpenChange,
  accountId,
  accountType,
  accountAmount,
  accountDescription,
  onLink
}) => {
  const { selectedCompanyIds, activeCompanyId } = useCompanyContext();
  const companyIds = selectedCompanyIds.length > 0 ? selectedCompanyIds : (activeCompanyId ? [activeCompanyId] : []);
  const [search, setSearch] = useState('');
  const [selectedTransaction, setSelectedTransaction] = useState<string | null>(null);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  // Buscar transações não reconciliadas
  const { data: transactions, isLoading } = useQuery({
    queryKey: ['available_transactions', companyIds, accountAmount],
    queryFn: async () => {
      if (companyIds.length === 0) return [];

      const { data, error } = await supabase
        .from('bank_transactions')
        .select('id, date, description, amount, nome_origem, tipo_movimento')
        .in('company_id', companyIds)
        .eq('reconciled', false)
        .order('date', { ascending: false })
        .limit(100);

      if (error) throw error;
      return data || [];
    },
    enabled: open && companyIds.length > 0,
  });

  const filteredTransactions = transactions?.filter(t => 
    t.description?.toLowerCase().includes(search.toLowerCase()) ||
    t.nome_origem?.toLowerCase().includes(search.toLowerCase())
  ) || [];

  // Ordenar por proximidade de valor
  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    const diffA = Math.abs(Math.abs(a.amount) - Math.abs(accountAmount));
    const diffB = Math.abs(Math.abs(b.amount) - Math.abs(accountAmount));
    return diffA - diffB;
  });

  const handleConfirm = () => {
    if (selectedTransaction) {
      onLink(selectedTransaction);
      onOpenChange(false);
      setSelectedTransaction(null);
      setSearch('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Vincular Conta a Transação</DialogTitle>
          <DialogDescription>
            Selecione a transação bancária correspondente a esta conta
          </DialogDescription>
        </DialogHeader>

        {/* Account Info */}
        <div className="p-3 bg-muted rounded-lg mb-4">
          <div className="flex items-center gap-2 mb-1">
            {accountType === 'payable' ? (
              <ArrowDownCircle className="w-4 h-4 text-red-500" />
            ) : (
              <ArrowUpCircle className="w-4 h-4 text-green-500" />
            )}
            <span className="text-sm font-medium">
              {accountType === 'payable' ? 'Conta a Pagar' : 'Conta a Receber'}
            </span>
            <Badge variant={accountType === 'payable' ? 'destructive' : 'default'}>
              {formatCurrency(accountAmount)}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">{accountDescription}</p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por descrição..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Transactions List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <ScrollArea className="h-[350px]">
            <div className="space-y-1">
              {sortedTransactions.map((transaction) => {
                const isExactMatch = Math.abs(transaction.amount) === Math.abs(accountAmount);
                const isCloseMatch = Math.abs(Math.abs(transaction.amount) - Math.abs(accountAmount)) < 1;
                
                return (
                  <button
                    key={transaction.id}
                    onClick={() => setSelectedTransaction(transaction.id)}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      selectedTransaction === transaction.id
                        ? 'border-primary bg-primary/5'
                        : 'hover:bg-accent/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium truncate">
                          {transaction.description || 'Sem descrição'}
                        </span>
                        {isExactMatch && (
                          <Badge variant="default" className="bg-green-500">Valor exato</Badge>
                        )}
                        {isCloseMatch && !isExactMatch && (
                          <Badge variant="secondary">Valor próximo</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={transaction.amount > 0 ? 'default' : 'secondary'}>
                          {formatCurrency(transaction.amount)}
                        </Badge>
                        {selectedTransaction === transaction.id && (
                          <Check className="w-4 h-4 text-primary" />
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{format(new Date(transaction.date), 'dd/MM/yyyy', { locale: ptBR })}</span>
                      {transaction.nome_origem && (
                        <>
                          <span>•</span>
                          <span className="truncate">{transaction.nome_origem}</span>
                        </>
                      )}
                    </div>
                  </button>
                );
              })}
              {sortedTransactions.length === 0 && (
                <p className="text-center text-sm text-muted-foreground py-4">
                  Nenhuma transação disponível encontrada
                </p>
              )}
            </div>
          </ScrollArea>
        )}

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm} disabled={!selectedTransaction}>
            Vincular
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
