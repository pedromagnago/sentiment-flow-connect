import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, CheckCircle2, XCircle, TrendingUp, Sparkles } from 'lucide-react';
import { SuggestedAction } from '@/hooks/useSuggestedActions';

interface SuggestedActionsStatsProps {
  actions: SuggestedAction[];
}

export const SuggestedActionsStats = ({ actions }: SuggestedActionsStatsProps) => {
  const pendingCount = actions.filter(a => a.status === 'pending').length;
  const completedCount = actions.filter(a => a.status === 'completed').length;
  const ignoredCount = actions.filter(a => a.status === 'ignored').length;
  const totalProcessed = completedCount + ignoredCount;
  const approvalRate = totalProcessed > 0 ? Math.round((completedCount / totalProcessed) * 100) : 0;

  // Estatísticas por tipo de ação
  const actionsByType = actions.reduce((acc, action) => {
    acc[action.action_type] = (acc[action.action_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Confiança média das ações pendentes
  const pendingActions = actions.filter(a => a.status === 'pending');
  const avgConfidence = pendingActions.length > 0
    ? Math.round(pendingActions.reduce((sum, a) => sum + a.ai_confidence, 0) / pendingActions.length)
    : 0;

  // Ações de alta prioridade pendentes
  const highPriorityPending = actions.filter(
    a => a.status === 'pending' && (a.priority === 'high' || a.priority === 'urgent')
  ).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Pendentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold">{pendingCount}</span>
            {highPriorityPending > 0 && (
              <span className="text-xs text-red-600 font-medium">
                ({highPriorityPending} alta prioridade)
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            Aprovadas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <span className="text-3xl font-bold text-green-600">{completedCount}</span>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <XCircle className="w-4 h-4" />
            Ignoradas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <span className="text-3xl font-bold text-gray-400">{ignoredCount}</span>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Taxa de Aprovação
          </CardTitle>
        </CardHeader>
        <CardContent>
          <span className="text-3xl font-bold">
            {totalProcessed > 0 ? `${approvalRate}%` : '-%'}
          </span>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Confiança Média
          </CardTitle>
        </CardHeader>
        <CardContent>
          <span className={`text-3xl font-bold ${
            avgConfidence >= 80 ? 'text-green-600' :
            avgConfidence >= 60 ? 'text-yellow-600' :
            'text-red-600'
          }`}>
            {pendingActions.length > 0 ? `${avgConfidence}%` : '-%'}
          </span>
        </CardContent>
      </Card>
    </div>
  );
};