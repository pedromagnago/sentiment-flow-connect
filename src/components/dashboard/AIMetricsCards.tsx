import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, CheckCircle2, Clock, TrendingUp } from 'lucide-react';
import { useAIMetrics } from '@/hooks/useAIMetrics';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate } from 'react-router-dom';

export const AIMetricsCards = () => {
  const { data: metrics, isLoading } = useAIMetrics();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-[100px]" />
              <Skeleton className="h-4 w-4 rounded-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-[60px] mb-2" />
              <Skeleton className="h-3 w-[120px]" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!metrics) return null;

  const cards = [
    {
      title: 'Ações Sugeridas Hoje',
      value: metrics.todayActions,
      description: 'Novas sugestões da IA',
      icon: Sparkles,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900/20',
      onClick: () => navigate('/suggested-actions'),
    },
    {
      title: 'Taxa de Aprovação',
      value: `${metrics.approvalRate.toFixed(1)}%`,
      description: 'Ações processadas vs total',
      icon: CheckCircle2,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900/20',
      onClick: () => navigate('/reports'),
    },
    {
      title: 'Tempo Economizado',
      value: `${Math.floor(metrics.timeSaved / 60)}h ${metrics.timeSaved % 60}m`,
      description: 'Estimativa dos últimos 7 dias',
      icon: Clock,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20',
      onClick: () => navigate('/reports'),
    },
    {
      title: 'Total de Ações',
      value: Object.values(metrics.actionsByType).reduce((a, b) => a + b, 0),
      description: 'Últimos 7 dias',
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100 dark:bg-orange-900/20',
      onClick: () => navigate('/reports'),
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <Card 
            key={index} 
            className="cursor-pointer hover:shadow-lg transition-all hover:scale-105"
            onClick={card.onClick}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {card.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${card.bgColor}`}>
                <Icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {card.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
