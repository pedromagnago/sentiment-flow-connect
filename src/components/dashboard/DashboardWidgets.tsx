
import React from 'react';
import { TrendingUp, Users, MessageSquare, CheckCircle, Building2, Calendar } from 'lucide-react';

interface WidgetProps {
  title: string;
  value: string | number;
  change?: string;
  icon: React.ElementType;
  color: 'blue' | 'green' | 'purple' | 'emerald' | 'yellow' | 'red';
  trend?: 'up' | 'down' | 'neutral';
}

const colorClasses = {
  blue: 'from-blue-500 to-cyan-600',
  green: 'from-green-500 to-emerald-600',
  purple: 'from-purple-500 to-pink-600',
  emerald: 'from-emerald-500 to-teal-600',
  yellow: 'from-yellow-500 to-orange-600',
  red: 'from-red-500 to-pink-600'
};

const iconColorClasses = {
  blue: 'text-blue-200',
  green: 'text-green-200',
  purple: 'text-purple-200',
  emerald: 'text-emerald-200',
  yellow: 'text-yellow-200',
  red: 'text-red-200'
};

export const DashboardWidget = ({ title, value, change, icon: Icon, color, trend }: WidgetProps) => {
  const getTrendIcon = () => {
    if (!trend || trend === 'neutral') return null;
    return trend === 'up' ? 
      <TrendingUp className="w-4 h-4 text-green-400" /> : 
      <TrendingUp className="w-4 h-4 text-red-400 rotate-180" />;
  };

  return (
    <div className={`bg-gradient-to-r ${colorClasses[color]} rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium opacity-90">{title}</p>
          <p className="text-3xl font-bold mt-2">{value}</p>
          {change && (
            <div className="flex items-center space-x-1 mt-2">
              {getTrendIcon()}
              <span className="text-sm opacity-90">{change}</span>
            </div>
          )}
        </div>
        <Icon className={`w-8 h-8 ${iconColorClasses[color]}`} />
      </div>
    </div>
  );
};

interface DashboardStatsProps {
  contacts: any[];
  companies: any[];
  messages: any[];
  taskGroups: any[];
  sentimentStats: any;
}

export const DashboardWidgets = ({ 
  contacts = [], 
  companies = [], 
  messages = [], 
  taskGroups = [], 
  sentimentStats = {} 
}: DashboardStatsProps) => {
  // Safe calculations with error handling
  const safeCalculateCompletedTasks = () => {
    try {
      if (!Array.isArray(taskGroups)) return 0;
      return taskGroups.filter(task => 
        task?.status_clickup?.toLowerCase().includes('complet') || 
        task?.status_clickup?.toLowerCase().includes('done')
      ).length;
    } catch (error) {
      console.error('Error calculating completed tasks:', error);
      return 0;
    }
  };

  const safeCalculateActiveCompanies = () => {
    try {
      if (!Array.isArray(companies)) return 0;
      return companies.filter(c => c?.status === 'Ativa').length;
    } catch (error) {
      console.error('Error calculating active companies:', error);
      return 0;
    }
  };

  const safeCalculateTotalRevenue = () => {
    try {
      if (!Array.isArray(companies)) return 0;
      return companies.reduce((sum, c) => {
        const value = Number(c?.valor_mensalidade) || 0;
        return sum + value;
      }, 0);
    } catch (error) {
      console.error('Error calculating total revenue:', error);
      return 0;
    }
  };

  const safeGetSentimentPositive = () => {
    try {
      return sentimentStats?.positive || 0;
    } catch (error) {
      console.error('Error getting sentiment positive:', error);
      return 0;
    }
  };

  const completedTasks = safeCalculateCompletedTasks();
  const activeCompanies = safeCalculateActiveCompanies();
  const totalRevenue = safeCalculateTotalRevenue();
  const sentimentPositive = safeGetSentimentPositive();

  const widgets = [
    {
      title: "Sentimento Positivo",
      value: `${sentimentPositive}%`,
      change: "+5.2%",
      icon: TrendingUp,
      color: "green" as const,
      trend: "up" as const
    },
    {
      title: "Total de Contatos",
      value: (contacts?.length || 0).toLocaleString(),
      change: "+12.5%",
      icon: Users,
      color: "blue" as const,
      trend: "up" as const
    },
    {
      title: "Empresas Ativas",
      value: activeCompanies.toString(),
      change: `${companies?.length || 0} total`,
      icon: Building2,
      color: "emerald" as const,
      trend: "neutral" as const
    },
    {
      title: "Mensagens Processadas",
      value: (messages?.length || 0).toLocaleString(),
      change: "+8.1%",
      icon: MessageSquare,
      color: "purple" as const,
      trend: "up" as const
    },
    {
      title: "Tarefas Concluídas",
      value: completedTasks.toString(),
      change: "+15.3%",
      icon: CheckCircle,
      color: "yellow" as const,
      trend: "up" as const
    },
    {
      title: "Receita Mensal",
      value: `R$ ${totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      change: "+7.8%",
      icon: Calendar,
      color: "red" as const,
      trend: "up" as const
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {widgets.map((widget, index) => (
        <DashboardWidget key={index} {...widget} />
      ))}
    </div>
  );
};
