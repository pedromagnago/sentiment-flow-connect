import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface DashboardMetrics {
  totalMessages: number;
  messagesLast7Days: number;
  messagesLast30Days: number;
  avgSentiment7Days: number;
  avgSentiment30Days: number;
  totalSuggestedActions: number;
  completedActions: number;
  pendingActions: number;
  completionRate: number;
  avgResponseTime: number; // em horas
  messagesPerDay: { date: string; count: number }[];
  actionsByType: { type: string; count: number }[];
  sentimentTrend: { date: string; sentiment: number }[];
}

export const useDashboardMetrics = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalMessages: 0,
    messagesLast7Days: 0,
    messagesLast30Days: 0,
    avgSentiment7Days: 0,
    avgSentiment30Days: 0,
    totalSuggestedActions: 0,
    completedActions: 0,
    pendingActions: 0,
    completionRate: 0,
    avgResponseTime: 0,
    messagesPerDay: [],
    actionsByType: [],
    sentimentTrend: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      setError(null);

      const now = new Date();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      // Buscar mensagens
      const { data: allMessages, error: messagesError } = await supabase
        .from('messages')
        .select('created_at, data_hora');

      if (messagesError) throw messagesError;

      const messagesLast7Days = allMessages?.filter(
        (m) => new Date(m.created_at) >= sevenDaysAgo
      ).length || 0;

      const messagesLast30Days = allMessages?.filter(
        (m) => new Date(m.created_at) >= thirtyDaysAgo
      ).length || 0;

      // Mensagens por dia (últimos 30 dias)
      const messagesPerDay = calculateMessagesPerDay(allMessages || [], 30);

      // Buscar análises de sentimento
      const { data: sentimentData, error: sentimentError } = await supabase
        .from('analise_sentimento_diario')
        .select('data, feedback')
        .gte('data', thirtyDaysAgo.toISOString().split('T')[0])
        .order('data', { ascending: true });

      if (sentimentError) throw sentimentError;

      const avgSentiment7Days = calculateAvgSentiment(
        sentimentData?.filter(
          (s) => new Date(s.data) >= sevenDaysAgo
        ) || []
      );

      const avgSentiment30Days = calculateAvgSentiment(sentimentData || []);

      const sentimentTrend = (sentimentData || []).map((s) => ({
        date: s.data,
        sentiment: extractSentimentScore(s.feedback),
      }));

      // Buscar ações sugeridas
      const { data: actions, error: actionsError } = await supabase
        .from('suggested_actions')
        .select('action_type, status, created_at, executed_at');

      if (actionsError) throw actionsError;

      const totalSuggestedActions = actions?.length || 0;
      const completedActions = actions?.filter(
        (a) => a.status === 'completed'
      ).length || 0;
      const pendingActions = actions?.filter(
        (a) => a.status === 'pending'
      ).length || 0;

      const completionRate = totalSuggestedActions > 0
        ? Math.round((completedActions / totalSuggestedActions) * 100)
        : 0;

      // Calcular tempo médio de resposta
      const avgResponseTime = calculateAvgResponseTime(actions || []);

      // Ações por tipo
      const actionsByType = calculateActionsByType(actions || []);

      setMetrics({
        totalMessages: allMessages?.length || 0,
        messagesLast7Days,
        messagesLast30Days,
        avgSentiment7Days,
        avgSentiment30Days,
        totalSuggestedActions,
        completedActions,
        pendingActions,
        completionRate,
        avgResponseTime,
        messagesPerDay,
        actionsByType,
        sentimentTrend,
      });
    } catch (err) {
      console.error('Error fetching dashboard metrics:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar métricas');
    } finally {
      setLoading(false);
    }
  };

  return { metrics, loading, error, refetch: fetchMetrics };
};

// Helper functions
function calculateMessagesPerDay(messages: any[], days: number): { date: string; count: number }[] {
  const result: { date: string; count: number }[] = [];
  const now = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dateStr = date.toISOString().split('T')[0];
    
    const count = messages.filter((m) => {
      const msgDate = new Date(m.created_at).toISOString().split('T')[0];
      return msgDate === dateStr;
    }).length;

    result.push({ date: dateStr, count });
  }

  return result;
}

function calculateAvgSentiment(sentimentData: any[]): number {
  if (!sentimentData.length) return 0;

  const total = sentimentData.reduce((acc, s) => {
    return acc + extractSentimentScore(s.feedback);
  }, 0);

  return Math.round(total / sentimentData.length);
}

function extractSentimentScore(feedback: string): number {
  // Extrai score de sentimento do feedback (0-100)
  if (!feedback) return 50;

  const lower = feedback.toLowerCase();
  
  if (lower.includes('muito positiv') || lower.includes('excelente') || lower.includes('ótim')) {
    return 90;
  }
  if (lower.includes('positiv') || lower.includes('satisfeit') || lower.includes('bom')) {
    return 75;
  }
  if (lower.includes('neutro') || lower.includes('normal') || lower.includes('razoável')) {
    return 50;
  }
  if (lower.includes('negativ') || lower.includes('insatisfeit') || lower.includes('ruim')) {
    return 25;
  }
  if (lower.includes('muito negativ') || lower.includes('péssim') || lower.includes('horrível')) {
    return 10;
  }

  return 50; // default neutro
}

function calculateAvgResponseTime(actions: any[]): number {
  const completedWithTime = actions.filter(
    (a) => a.status === 'completed' && a.created_at && a.executed_at
  );

  if (!completedWithTime.length) return 0;

  const totalHours = completedWithTime.reduce((acc, action) => {
    const created = new Date(action.created_at).getTime();
    const executed = new Date(action.executed_at).getTime();
    const hours = (executed - created) / (1000 * 60 * 60);
    return acc + hours;
  }, 0);

  return Math.round(totalHours / completedWithTime.length);
}

function calculateActionsByType(actions: any[]): { type: string; count: number }[] {
  const typeCounts: { [key: string]: number } = {};

  actions.forEach((action) => {
    const type = action.action_type || 'unknown';
    typeCounts[type] = (typeCounts[type] || 0) + 1;
  });

  return Object.entries(typeCounts).map(([type, count]) => ({
    type: formatActionType(type),
    count,
  }));
}

function formatActionType(type: string): string {
  const labels: { [key: string]: string } = {
    payment: 'Pagamentos',
    invoice: 'Faturas',
    task: 'Tarefas',
    question: 'Perguntas',
    document_analysis: 'Análise de Documentos',
  };
  return labels[type] || type;
}
