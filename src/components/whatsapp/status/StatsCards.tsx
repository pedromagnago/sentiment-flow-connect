import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { MessageCircle, Clock, Calendar, CalendarDays } from 'lucide-react';

interface StatsCardsProps {
  totalMessages: number;
  messagesLast24h: number;
  messagesLast7d: number;
  messagesLast30d: number;
}

export const StatsCards: React.FC<StatsCardsProps> = ({
  totalMessages,
  messagesLast24h,
  messagesLast7d,
  messagesLast30d
}) => {
  const stats = [
    {
      label: 'Total de Mensagens',
      value: totalMessages.toLocaleString('pt-BR'),
      icon: MessageCircle,
      color: 'bg-primary/10 text-primary'
    },
    {
      label: 'Últimas 24h',
      value: messagesLast24h.toLocaleString('pt-BR'),
      icon: Clock,
      color: 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400'
    },
    {
      label: 'Últimos 7 dias',
      value: messagesLast7d.toLocaleString('pt-BR'),
      icon: Calendar,
      color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
    },
    {
      label: 'Últimos 30 dias',
      value: messagesLast30d.toLocaleString('pt-BR'),
      icon: CalendarDays,
      color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400'
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
