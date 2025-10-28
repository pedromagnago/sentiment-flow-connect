import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus, MessageSquare, CheckCircle, Clock, Smile, Frown } from 'lucide-react';
import { useDashboardMetrics } from '@/hooks/useDashboardMetrics';
import { Skeleton } from '@/components/ui/skeleton';

export const EnhancedMetricsCards = () => {
  const { metrics, loading } = useDashboardMetrics();

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-3">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const sentimentColor = getSentimentColor(metrics.avgSentiment7Days);
  const sentimentIcon = getSentimentIcon(metrics.avgSentiment7Days);
  
  const messagesGrowth = metrics.messagesLast7Days - metrics.messagesLast30Days / 4.3; // média semanal dos últimos 30 dias
  const messagesGrowthPercent = Math.round((messagesGrowth / (metrics.messagesLast30Days / 4.3)) * 100);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Total de Mensagens */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Mensagens (7 dias)
          </CardTitle>
          <MessageSquare className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.messagesLast7Days}</div>
          <div className="flex items-center text-xs mt-2">
            {messagesGrowth > 0 ? (
              <>
                <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                <span className="text-green-600">+{Math.abs(messagesGrowthPercent)}%</span>
              </>
            ) : messagesGrowth < 0 ? (
              <>
                <TrendingDown className="h-3 w-3 text-red-600 mr-1" />
                <span className="text-red-600">-{Math.abs(messagesGrowthPercent)}%</span>
              </>
            ) : (
              <>
                <Minus className="h-3 w-3 text-gray-600 mr-1" />
                <span className="text-gray-600">0%</span>
              </>
            )}
            <span className="text-muted-foreground ml-1">vs. média mensal</span>
          </div>
        </CardContent>
      </Card>

      {/* Sentimento Médio */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Sentimento (7 dias)
          </CardTitle>
          {sentimentIcon}
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${sentimentColor}`}>
            {metrics.avgSentiment7Days}%
          </div>
          <div className="flex items-center text-xs mt-2">
            <span className="text-muted-foreground">
              {getSentimentLabel(metrics.avgSentiment7Days)}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Taxa de Conclusão */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Taxa de Conclusão
          </CardTitle>
          <CheckCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.completionRate}%</div>
          <div className="flex items-center text-xs mt-2">
            <span className="text-muted-foreground">
              {metrics.completedActions} de {metrics.totalSuggestedActions} ações
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Tempo Médio de Resposta */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Tempo Médio de Resposta
          </CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {metrics.avgResponseTime > 0 ? `${metrics.avgResponseTime}h` : 'N/A'}
          </div>
          <div className="flex items-center text-xs mt-2">
            <span className="text-muted-foreground">
              Tempo para executar ações
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Ações Pendentes */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Ações Pendentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-amber-600">
            {metrics.pendingActions}
          </div>
          <div className="flex items-center text-xs mt-2">
            <span className="text-muted-foreground">
              Aguardando processamento
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Ações Completadas */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Ações Completadas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {metrics.completedActions}
          </div>
          <div className="flex items-center text-xs mt-2">
            <span className="text-muted-foreground">
              Processadas com sucesso
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Mensagens Totais */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total de Mensagens
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {metrics.totalMessages}
          </div>
          <div className="flex items-center text-xs mt-2">
            <span className="text-muted-foreground">
              Desde o início
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Média Diária */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Média Diária (30d)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {Math.round(metrics.messagesLast30Days / 30)}
          </div>
          <div className="flex items-center text-xs mt-2">
            <span className="text-muted-foreground">
              Mensagens por dia
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

function getSentimentColor(sentiment: number): string {
  if (sentiment >= 75) return 'text-green-600';
  if (sentiment >= 50) return 'text-blue-600';
  if (sentiment >= 25) return 'text-amber-600';
  return 'text-red-600';
}

function getSentimentIcon(sentiment: number): JSX.Element {
  if (sentiment >= 50) {
    return <Smile className="h-4 w-4 text-green-600" />;
  }
  return <Frown className="h-4 w-4 text-red-600" />;
}

function getSentimentLabel(sentiment: number): string {
  if (sentiment >= 75) return 'Muito Positivo';
  if (sentiment >= 50) return 'Positivo';
  if (sentiment >= 25) return 'Negativo';
  return 'Muito Negativo';
}
