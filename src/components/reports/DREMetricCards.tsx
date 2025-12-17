import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { DRESummary } from '@/hooks/useDREData';
import { TrendingUp, TrendingDown, DollarSign, Percent, BarChart3, Wallet } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DREMetricCardsProps {
  summary: DRESummary;
  className?: string;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

interface MetricCardProps {
  title: string;
  value: number;
  percentOfRevenue?: number;
  icon: React.ReactNode;
  colorClass: string;
  bgClass: string;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  percentOfRevenue,
  icon,
  colorClass,
  bgClass
}) => (
  <Card className={cn('border-l-4', bgClass)}>
    <CardContent className="p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-muted-foreground font-medium">{title}</p>
          <p className={cn('text-2xl font-bold mt-1', colorClass)}>
            {formatCurrency(value)}
          </p>
          {percentOfRevenue !== undefined && (
            <p className="text-xs text-muted-foreground mt-1">
              {percentOfRevenue.toFixed(1)}% da receita
            </p>
          )}
        </div>
        <div className={cn('p-2 rounded-lg', bgClass.replace('border-l-', 'bg-').replace('/20', '/10'))}>
          {icon}
        </div>
      </div>
    </CardContent>
  </Card>
);

export const DREMetricCards: React.FC<DREMetricCardsProps> = ({ summary, className }) => {
  const baseReceita = summary.receitaBruta || 1;

  const metrics = [
    {
      title: 'Receita Bruta',
      value: summary.receitaBruta,
      percentOfRevenue: 100,
      icon: <DollarSign className="h-5 w-5 text-green-600" />,
      colorClass: 'text-green-600',
      bgClass: 'border-l-green-500/20'
    },
    {
      title: 'Receita Líquida',
      value: summary.receitaLiquida,
      percentOfRevenue: (summary.receitaLiquida / baseReceita) * 100,
      icon: <TrendingUp className="h-5 w-5 text-blue-600" />,
      colorClass: 'text-blue-600',
      bgClass: 'border-l-blue-500/20'
    },
    {
      title: 'Margem Bruta',
      value: summary.margemBruta,
      percentOfRevenue: (summary.margemBruta / baseReceita) * 100,
      icon: <BarChart3 className="h-5 w-5 text-purple-600" />,
      colorClass: 'text-purple-600',
      bgClass: 'border-l-purple-500/20'
    },
    {
      title: 'EBITDA',
      value: summary.ebitda,
      percentOfRevenue: (summary.ebitda / baseReceita) * 100,
      icon: <Percent className="h-5 w-5 text-orange-600" />,
      colorClass: summary.ebitda >= 0 ? 'text-orange-600' : 'text-red-600',
      bgClass: summary.ebitda >= 0 ? 'border-l-orange-500/20' : 'border-l-red-500/20'
    },
    {
      title: 'Despesas Operacionais',
      value: summary.despesasOperacionais,
      percentOfRevenue: (summary.despesasOperacionais / baseReceita) * 100,
      icon: <TrendingDown className="h-5 w-5 text-red-600" />,
      colorClass: 'text-red-600',
      bgClass: 'border-l-red-500/20'
    },
    {
      title: 'Lucro Líquido',
      value: summary.lucroLiquido,
      percentOfRevenue: (summary.lucroLiquido / baseReceita) * 100,
      icon: <Wallet className="h-5 w-5 text-emerald-600" />,
      colorClass: summary.lucroLiquido >= 0 ? 'text-emerald-600' : 'text-red-600',
      bgClass: summary.lucroLiquido >= 0 ? 'border-l-emerald-500/20' : 'border-l-red-500/20'
    },
  ];

  return (
    <div className={cn('grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4', className)}>
      {metrics.map((metric) => (
        <MetricCard key={metric.title} {...metric} />
      ))}
    </div>
  );
};

export default DREMetricCards;
