import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  AlertTriangle, 
  CheckCircle2, 
  Link2Off, 
  FileQuestion,
  TrendingUp
} from 'lucide-react';

interface ReconciliationStatsProps {
  stats: {
    orphan_transactions: number;
    unmatched_payables: number;
    unmatched_receivables: number;
    ignored_transactions: number;
    reconciliation_rate: string;
    confirmed: number;
  };
}

export const ReconciliationStats: React.FC<ReconciliationStatsProps> = ({ stats }) => {
  const reconciliationRate = parseFloat(stats.reconciliation_rate) || 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
            </div>
            <span className="text-2xl font-bold text-orange-600">{stats.orphan_transactions}</span>
          </div>
          <p className="text-sm text-muted-foreground mt-2">Transações Órfãs</p>
          <p className="text-xs text-muted-foreground">Sem conta vinculada</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <Link2Off className="w-5 h-5 text-red-600" />
            </div>
            <span className="text-2xl font-bold text-red-600">{stats.unmatched_payables}</span>
          </div>
          <p className="text-sm text-muted-foreground mt-2">Pagar s/ Transação</p>
          <p className="text-xs text-muted-foreground">Contas não vinculadas</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
              <Link2Off className="w-5 h-5 text-amber-600" />
            </div>
            <span className="text-2xl font-bold text-amber-600">{stats.unmatched_receivables}</span>
          </div>
          <p className="text-sm text-muted-foreground mt-2">Receber s/ Transação</p>
          <p className="text-xs text-muted-foreground">Contas não vinculadas</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <FileQuestion className="w-5 h-5 text-gray-600" />
            </div>
            <span className="text-2xl font-bold text-gray-600">{stats.ignored_transactions}</span>
          </div>
          <p className="text-sm text-muted-foreground mt-2">Exceções</p>
          <p className="text-xs text-muted-foreground">Tarifas, transf., etc.</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-2xl font-bold text-green-600">{stats.reconciliation_rate}%</span>
          </div>
          <p className="text-sm text-muted-foreground mt-2">Taxa Reconciliação</p>
          <Progress value={reconciliationRate} className="h-1.5 mt-2" />
        </CardContent>
      </Card>
    </div>
  );
};
