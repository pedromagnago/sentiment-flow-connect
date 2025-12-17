import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  MoreVertical, 
  ArrowRightLeft, 
  CreditCard, 
  TrendingUp,
  FileQuestion,
  AlertTriangle,
  Link
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { OrphanTransaction, MovimentoTipo } from '@/hooks/useReconciliation';

interface OrphanTransactionsPanelProps {
  transactions: OrphanTransaction[];
  onClassify: (transactionId: string, tipo: MovimentoTipo, ignorar: boolean, motivo?: string) => void;
  onLinkAccount: (transactionId: string) => void;
}

const TIPO_MOVIMENTO_OPTIONS: { value: MovimentoTipo; label: string; icon: React.ReactNode }[] = [
  { value: 'transferencia', label: 'Transferência', icon: <ArrowRightLeft className="w-4 h-4" /> },
  { value: 'tarifa_bancaria', label: 'Tarifa Bancária', icon: <CreditCard className="w-4 h-4" /> },
  { value: 'rendimento', label: 'Rendimento', icon: <TrendingUp className="w-4 h-4" /> },
  { value: 'outro', label: 'Outro (ignorar)', icon: <FileQuestion className="w-4 h-4" /> },
];

export const OrphanTransactionsPanel: React.FC<OrphanTransactionsPanelProps> = ({
  transactions,
  onClassify,
  onLinkAccount
}) => {
  const [showIgnoreDialog, setShowIgnoreDialog] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<OrphanTransaction | null>(null);
  const [selectedTipo, setSelectedTipo] = useState<MovimentoTipo>('outro');
  const [motivo, setMotivo] = useState('');

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const handleClassifyClick = (transaction: OrphanTransaction, tipo: MovimentoTipo) => {
    if (tipo !== 'operacional') {
      setSelectedTransaction(transaction);
      setSelectedTipo(tipo);
      setShowIgnoreDialog(true);
    }
  };

  const handleConfirmIgnore = () => {
    if (selectedTransaction) {
      onClassify(selectedTransaction.id, selectedTipo, true, motivo || undefined);
      setShowIgnoreDialog(false);
      setSelectedTransaction(null);
      setMotivo('');
    }
  };

  if (transactions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            Transações Órfãs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full mb-3">
              <AlertTriangle className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-sm font-medium">Nenhuma transação órfã!</p>
            <p className="text-xs text-muted-foreground mt-1">
              Todas as transações operacionais estão vinculadas
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            Transações Órfãs
            <Badge variant="secondary" className="ml-2">{transactions.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[400px]">
            <div className="space-y-1 p-4">
              {transactions.map((transaction) => (
                <div 
                  key={transaction.id}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium truncate">
                        {transaction.description || 'Sem descrição'}
                      </span>
                      <Badge 
                        variant={transaction.amount > 0 ? 'default' : 'secondary'}
                        className="shrink-0"
                      >
                        {formatCurrency(transaction.amount)}
                      </Badge>
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
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => onLinkAccount(transaction.id)}
                    >
                      <Link className="w-4 h-4 mr-1" />
                      Vincular
                    </Button>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {TIPO_MOVIMENTO_OPTIONS.map((option) => (
                          <DropdownMenuItem 
                            key={option.value}
                            onClick={() => handleClassifyClick(transaction, option.value)}
                          >
                            {option.icon}
                            <span className="ml-2">Marcar como {option.label}</span>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <Dialog open={showIgnoreDialog} onOpenChange={setShowIgnoreDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Classificar Transação</DialogTitle>
            <DialogDescription>
              Esta transação será marcada como exceção e não aparecerá mais na lista de órfãos.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm font-medium">{selectedTransaction?.description}</p>
              <p className="text-sm text-muted-foreground">
                {selectedTransaction && formatCurrency(selectedTransaction.amount)}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="motivo">Justificativa (opcional)</Label>
              <Input
                id="motivo"
                placeholder="Ex: Transferência entre contas próprias"
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowIgnoreDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleConfirmIgnore}>
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
