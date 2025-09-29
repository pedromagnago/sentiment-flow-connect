import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { startOfDay, subDays, endOfDay } from 'date-fns';

export interface AIMetrics {
  todayActions: number;
  approvalRate: number;
  timeSaved: number; // in minutes
  actionsByType: {
    payment: number;
    invoice: number;
    task: number;
    question: number;
    document_analysis: number;
  };
  last7Days: {
    date: string;
    payment: number;
    invoice: number;
    task: number;
    question: number;
    document_analysis: number;
  }[];
}

export const useAIMetrics = () => {
  return useQuery({
    queryKey: ['ai-metrics'],
    queryFn: async (): Promise<AIMetrics> => {
      const today = startOfDay(new Date());
      const sevenDaysAgo = subDays(today, 7);

      // Fetch all actions from the last 7 days
      const { data: recentActions, error: recentError } = await supabase
        .from('suggested_actions')
        .select('*')
        .gte('created_at', sevenDaysAgo.toISOString())
        .order('created_at', { ascending: true });

      if (recentError) throw recentError;

      // Fetch today's actions
      const { data: todayActionsData, error: todayError } = await supabase
        .from('suggested_actions')
        .select('id')
        .gte('created_at', today.toISOString())
        .lte('created_at', endOfDay(new Date()).toISOString());

      if (todayError) throw todayError;

      // Calculate metrics
      const todayCount = todayActionsData?.length || 0;

      // Calculate approval rate (completed / total)
      const totalActions = recentActions?.length || 0;
      const completedActions = recentActions?.filter(a => a.status === 'completed').length || 0;
      const approvalRate = totalActions > 0 ? (completedActions / totalActions) * 100 : 0;

      // Estimate time saved (assuming each completed action saves 15 minutes)
      const timeSaved = completedActions * 15;

      // Count actions by type (all time)
      const actionsByType = {
        payment: recentActions?.filter(a => a.action_type === 'payment').length || 0,
        invoice: recentActions?.filter(a => a.action_type === 'invoice').length || 0,
        task: recentActions?.filter(a => a.action_type === 'task').length || 0,
        question: recentActions?.filter(a => a.action_type === 'question').length || 0,
        document_analysis: recentActions?.filter(a => a.action_type === 'document_analysis').length || 0,
      };

      // Group actions by day for the last 7 days
      const last7Days = [];
      for (let i = 6; i >= 0; i--) {
        const date = subDays(today, i);
        const dateStart = startOfDay(date);
        const dateEnd = endOfDay(date);

        const dayActions = recentActions?.filter(a => {
          const actionDate = new Date(a.created_at);
          return actionDate >= dateStart && actionDate <= dateEnd;
        }) || [];

        last7Days.push({
          date: date.toISOString().split('T')[0],
          payment: dayActions.filter(a => a.action_type === 'payment').length,
          invoice: dayActions.filter(a => a.action_type === 'invoice').length,
          task: dayActions.filter(a => a.action_type === 'task').length,
          question: dayActions.filter(a => a.action_type === 'question').length,
          document_analysis: dayActions.filter(a => a.action_type === 'document_analysis').length,
        });
      }

      return {
        todayActions: todayCount,
        approvalRate,
        timeSaved,
        actionsByType,
        last7Days,
      };
    },
  });
};
