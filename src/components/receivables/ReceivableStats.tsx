import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, DollarSign, AlertCircle, CheckCircle } from 'lucide-react';

interface ReceivableStatsProps {
  totalPending: number;
  totalReceived: number;
  totalOverdue: number;
  totalCount: number;
}

export const ReceivableStats: React.FC<ReceivableStatsProps> = ({
  totalPending,
  totalReceived,
  totalOverdue,
  totalCount,
}) => {
  const currency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  const stats = [
    {
      title: 'Total a Receber',
      value: currency(totalPending),
      icon: DollarSign,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Total Recebido',
      value: currency(totalReceived),
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Vencidos',
      value: currency(totalOverdue),
      icon: AlertCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    },
    {
      title: 'Total de Contas',
      value: totalCount.toString(),
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
