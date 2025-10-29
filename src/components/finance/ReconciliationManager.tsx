import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useReconciliation } from '@/hooks/useReconciliation';
import { MatchSuggestions } from './MatchSuggestions';
import { Loader2, Play, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

export const ReconciliationManager = () => {
  const {
    unmatchedTransactions,
    stats,
    isLoading,
    runAutoMatch,
  } = useReconciliation();

  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [isRunning, setIsRunning] = useState(false);

  const handleRunAutoMatch = async () => {
    setIsRunning(true);
    try {
      await runAutoMatch({});
    } finally {
      setIsRunning(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Transações Não Reconciliadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.unmatched_transactions}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Matches Sugeridos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.suggested}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Confirmados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.confirmed}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Taxa de Reconciliação</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.reconciliation_rate}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna 1: Transações não reconciliadas */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Transações Bancárias</CardTitle>
              <Button 
                onClick={handleRunAutoMatch}
                disabled={isRunning || !unmatchedTransactions?.length}
                size="sm"
              >
                {isRunning ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Play className="h-4 w-4 mr-2" />
                )}
                Reconciliar Auto
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              {unmatchedTransactions?.length || 0} não reconciliadas
            </p>
          </CardHeader>
          <CardContent className="space-y-2 max-h-[600px] overflow-y-auto">
            {unmatchedTransactions && unmatchedTransactions.length > 0 ? (
              unmatchedTransactions.map((transaction) => (
                <button
                  key={transaction.id}
                  onClick={() => setSelectedTransaction(transaction)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    selectedTransaction?.id === transaction.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-1">
                    <span className="font-medium text-sm truncate flex-1">
                      {transaction.description || 'Sem descrição'}
                    </span>
                    <Badge 
                      variant={transaction.amount > 0 ? 'default' : 'secondary'}
                      className="ml-2"
                    >
                      {formatCurrency(transaction.amount)}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {format(new Date(transaction.date), 'dd/MM/yyyy')}
                  </div>
                  {transaction.nome_origem && (
                    <div className="text-xs text-muted-foreground mt-1 truncate">
                      {transaction.nome_origem}
                    </div>
                  )}
                </button>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <CheckCircle2 className="h-12 w-12 text-green-500 mb-3" />
                <p className="text-sm font-medium">Todas as transações reconciliadas!</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Não há transações pendentes de reconciliação
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Coluna 2 e 3: Sugestões de match */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>
              {selectedTransaction ? 'Sugestões de Reconciliação' : 'Selecione uma Transação'}
            </CardTitle>
            {selectedTransaction && (
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline">
                  {formatCurrency(selectedTransaction.amount)}
                </Badge>
                <Badge variant="outline">
                  {format(new Date(selectedTransaction.date), 'dd/MM/yyyy')}
                </Badge>
              </div>
            )}
          </CardHeader>
          <CardContent>
            {selectedTransaction ? (
              <MatchSuggestions 
                transaction={selectedTransaction}
                onMatchComplete={() => setSelectedTransaction(null)}
              />
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <AlertCircle className="h-12 w-12 text-muted-foreground/50 mb-3" />
                <p className="text-sm text-muted-foreground">
                  Selecione uma transação à esquerda para ver sugestões de reconciliação
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
