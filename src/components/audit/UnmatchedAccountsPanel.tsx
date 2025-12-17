import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Link2Off, 
  ArrowDownCircle, 
  ArrowUpCircle,
  Link,
  CheckCircle2
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { UnmatchedAccount } from '@/hooks/useReconciliation';

interface UnmatchedAccountsPanelProps {
  payables: UnmatchedAccount[];
  receivables: UnmatchedAccount[];
  onLinkTransaction: (accountId: string, accountType: 'payable' | 'receivable') => void;
}

export const UnmatchedAccountsPanel: React.FC<UnmatchedAccountsPanelProps> = ({
  payables,
  receivables,
  onLinkTransaction
}) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pendente':
        return <Badge variant="outline">Pendente</Badge>;
      case 'pago':
      case 'recebido':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
          {status === 'pago' ? 'Pago' : 'Recebido'}
        </Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const renderAccountList = (accounts: UnmatchedAccount[], type: 'payable' | 'receivable') => {
    if (accounts.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full mb-3">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <p className="text-sm font-medium">Todas as contas vinculadas!</p>
          <p className="text-xs text-muted-foreground mt-1">
            Não há {type === 'payable' ? 'contas a pagar' : 'contas a receber'} sem transação
          </p>
        </div>
      );
    }

    return (
      <ScrollArea className="h-[350px]">
        <div className="space-y-1 p-2">
          {accounts.map((account) => (
            <div 
              key={account.id}
              className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium truncate">
                    {account.beneficiario_cliente}
                  </span>
                  {getStatusBadge(account.status)}
                </div>
                <p className="text-xs text-muted-foreground truncate mb-1">
                  {account.descricao}
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">
                    {formatCurrency(account.valor)}
                  </span>
                  <span>•</span>
                  <span>Venc: {format(new Date(account.vencimento), 'dd/MM/yyyy', { locale: ptBR })}</span>
                </div>
              </div>

              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onLinkTransaction(account.id, type)}
                className="shrink-0 ml-2"
              >
                <Link className="w-4 h-4 mr-1" />
                Vincular
              </Button>
            </div>
          ))}
        </div>
      </ScrollArea>
    );
  };

  const totalPayables = payables.length;
  const totalReceivables = receivables.length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Link2Off className="w-5 h-5 text-red-500" />
          Contas sem Transação Bancária
          <Badge variant="secondary" className="ml-2">{totalPayables + totalReceivables}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="payables">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="payables" className="gap-2">
              <ArrowDownCircle className="w-4 h-4" />
              A Pagar ({totalPayables})
            </TabsTrigger>
            <TabsTrigger value="receivables" className="gap-2">
              <ArrowUpCircle className="w-4 h-4" />
              A Receber ({totalReceivables})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="payables" className="mt-4">
            {renderAccountList(payables, 'payable')}
          </TabsContent>

          <TabsContent value="receivables" className="mt-4">
            {renderAccountList(receivables, 'receivable')}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
