import { useContacts } from '@/hooks/useContacts';
import { useSentimentAnalysis } from '@/hooks/useSentimentAnalysis';
import { useMessages } from '@/hooks/useMessages';
import { useTaskGroups } from '@/hooks/useTaskGroups';
import { useCompanies } from '@/hooks/useCompanies';
import { useCompanyFilter } from '@/hooks/useCompanyFilter';
import { SentimentChart } from './SentimentChart';
import { RecentContacts } from './RecentContacts';
import { DashboardWidgets } from './dashboard/DashboardWidgets';
import { AIMetricsCards } from './dashboard/AIMetricsCards';
import { AIActionsChart } from './dashboard/AIActionsChart';
import { EnhancedMetricsCards } from './dashboard/EnhancedMetricsCards';
import { ConsolidatedMetrics } from './dashboard/ConsolidatedMetrics';

export const Dashboard = () => {
  const { hasCompanyFilter, isMultiCompany } = useCompanyFilter();
  const { contacts, loading: contactsLoading } = useContacts();
  const { companies, loading: companiesLoading } = useCompanies();
  const { sentimentStats, loading: sentimentLoading } = useSentimentAnalysis();
  const { messages, loading: messagesLoading } = useMessages();
  const { taskGroups, loading: tasksLoading } = useTaskGroups();

  const isLoading = contactsLoading || sentimentLoading || messagesLoading || tasksLoading || companiesLoading;

  // Show message if no company is selected
  if (!isLoading && !hasCompanyFilter) {
    return (
      <div className="flex items-center justify-center h-full bg-muted/30">
        <div className="text-center space-y-4 p-8">
          <div className="text-6xl mb-4">🏢</div>
          <h2 className="text-2xl font-semibold text-foreground">Selecione uma empresa</h2>
          <p className="text-muted-foreground max-w-md">
            Para visualizar o dashboard, você precisa primeiro selecionar uma empresa no menu superior.
          </p>
        </div>
      </div>
    );
  }

  // If multiple companies selected, show consolidated view
  if (isMultiCompany) {
    return (
      <div className="space-y-6 animate-fade-in p-6">
        <ConsolidatedMetrics />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Visão geral dos seus dados e métricas em tempo real</p>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-lg">
          <span className="text-sm font-medium">Sistema Online</span>
        </div>
      </div>

      {/* Enhanced Metrics Cards */}
      <EnhancedMetricsCards />

      {/* Widgets do Dashboard */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-gray-200 animate-pulse rounded-xl h-32"></div>
          ))}
        </div>
      ) : (
        <DashboardWidgets
          contacts={contacts}
          companies={companies}
          sentimentStats={sentimentStats}
          messages={messages}
          taskGroups={taskGroups}
        />
      )}

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="lg:col-span-2">
          <AIActionsChart />
        </div>
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
