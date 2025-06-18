
import { TrendingUp, Users, MessageSquare, CheckCircle } from 'lucide-react';
import { MetricCard } from './MetricCard';
import { SentimentChart } from './SentimentChart';
import { RecentContacts } from './RecentContacts';
import { useContacts } from '@/hooks/useContacts';
import { useSentimentAnalysis } from '@/hooks/useSentimentAnalysis';
import { useMessages } from '@/hooks/useMessages';
import { useTaskGroups } from '@/hooks/useTaskGroups';

export const Dashboard = () => {
  const { contacts, loading: contactsLoading } = useContacts();
  const { sentimentStats, loading: sentimentLoading } = useSentimentAnalysis();
  const { messages, loading: messagesLoading } = useMessages();
  const { taskGroups, loading: tasksLoading } = useTaskGroups();

  const isLoading = contactsLoading || sentimentLoading || messagesLoading || tasksLoading;

  const completedTasks = taskGroups.filter(task => 
    task.status_clickup?.toLowerCase().includes('complet') || 
    task.status_clickup?.toLowerCase().includes('done')
  ).length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Visão geral dos seus dados e métricas</p>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-lg">
          <span className="text-sm font-medium">Sistema Online</span>
        </div>
      </div>

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Sentimento Positivo"
          value={isLoading ? "..." : `${sentimentStats.positive}%`}
          change="+5.2%"
          icon={TrendingUp}
          color="green"
        />
        <MetricCard
          title="Total de Contatos"
          value={isLoading ? "..." : contacts.length.toLocaleString()}
          change="+12.5%"
          icon={Users}
          color="blue"
        />
        <MetricCard
          title="Mensagens Processadas"
          value={isLoading ? "..." : messages.length.toLocaleString()}
          change="+8.1%"
          icon={MessageSquare}
          color="purple"
        />
        <MetricCard
          title="Tarefas Concluídas"
          value={isLoading ? "..." : completedTasks.toString()}
          change="+15.3%"
          icon={CheckCircle}
          color="emerald"
        />
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Análise de Sentimentos - 7 Dias</h2>
          <SentimentChart />
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Contatos Recentes</h2>
          <RecentContacts />
        </div>
      </div>
    </div>
  );
};
