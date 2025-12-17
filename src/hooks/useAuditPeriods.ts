import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCompanyContext } from '@/contexts/CompanyContext';
import { toast } from 'sonner';

export interface AuditPeriod {
  id: string;
  company_id: string;
  period_start: string;
  period_end: string;
  status: 'open' | 'locked' | 'approved';
  locked_by: string | null;
  locked_at: string | null;
  approved_by: string | null;
  approved_at: string | null;
  notes: string | null;
  transactions_count: number;
  total_debits: number;
  total_credits: number;
  created_at: string;
  company?: {
    nome: string;
  };
}

export interface PendingStats {
  uncategorized: number;
  withoutAttachment: number;
  total: number;
  pendingCount: number;
  classifiedCount: number;
  auditedCount: number;
}

export const useAuditPeriods = () => {
  const { selectedCompanyIds } = useCompanyContext();
  const queryClient = useQueryClient();

  // Fetch audit periods
  const { data: periods = [], isLoading: periodsLoading } = useQuery({
    queryKey: ['audit-periods', selectedCompanyIds],
    queryFn: async () => {
      if (!selectedCompanyIds.length) return [];

      const { data, error } = await supabase
        .from('audit_periods')
        .select(`
          *,
          company:companies(nome)
        `)
        .in('company_id', selectedCompanyIds)
        .order('period_start', { ascending: false });

      if (error) throw error;
      return data as AuditPeriod[];
    },
    enabled: selectedCompanyIds.length > 0
  });

  // Fetch pending stats for each company
  const { data: pendingStats = {}, isLoading: statsLoading } = useQuery({
    queryKey: ['pending-stats', selectedCompanyIds],
    queryFn: async () => {
      if (!selectedCompanyIds.length) return {};

      const stats: Record<string, PendingStats> = {};

      for (const companyId of selectedCompanyIds) {
        // Count uncategorized
        const { count: uncategorized } = await supabase
          .from('bank_transactions')
          .select('*', { count: 'exact', head: true })
          .eq('company_id', companyId)
          .is('category_id', null);

        // Count without attachment
        const { count: withoutAttachment } = await supabase
          .from('bank_transactions')
          .select('*', { count: 'exact', head: true })
          .eq('company_id', companyId)
          .is('attachment_url', null);

        // Count by status
        const { count: pendingCount } = await supabase
          .from('bank_transactions')
          .select('*', { count: 'exact', head: true })
          .eq('company_id', companyId)
          .eq('transaction_status', 'pending');

        const { count: classifiedCount } = await supabase
          .from('bank_transactions')
          .select('*', { count: 'exact', head: true })
          .eq('company_id', companyId)
          .eq('transaction_status', 'classified');

        const { count: auditedCount } = await supabase
          .from('bank_transactions')
          .select('*', { count: 'exact', head: true })
          .eq('company_id', companyId)
          .eq('transaction_status', 'audited');

        // Total
        const { count: total } = await supabase
          .from('bank_transactions')
          .select('*', { count: 'exact', head: true })
          .eq('company_id', companyId);

        stats[companyId] = {
          uncategorized: uncategorized || 0,
          withoutAttachment: withoutAttachment || 0,
          total: total || 0,
          pendingCount: pendingCount || 0,
          classifiedCount: classifiedCount || 0,
          auditedCount: auditedCount || 0
        };
      }

      return stats;
    },
    enabled: selectedCompanyIds.length > 0
  });

  // Fetch audit action history
  const { data: actionHistory = [], isLoading: historyLoading } = useQuery({
    queryKey: ['audit-action-history', selectedCompanyIds],
    queryFn: async () => {
      if (!selectedCompanyIds.length) return [];

      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('table_name', 'audit_periods')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data;
    },
    enabled: selectedCompanyIds.length > 0
  });

  // Lock/Unlock/Approve period mutation
  const lockPeriodMutation = useMutation({
    mutationFn: async ({ 
      companyId, 
      periodStart, 
      periodEnd, 
      action, 
      notes 
    }: {
      companyId: string;
      periodStart: string;
      periodEnd: string;
      action: 'lock' | 'unlock' | 'approve';
      notes?: string;
    }) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Não autenticado');

      const response = await supabase.functions.invoke('lock-audit-period', {
        body: {
          company_id: companyId,
          period_start: periodStart,
          period_end: periodEnd,
          action,
          notes
        }
      });

      if (response.error) throw response.error;
      return response.data;
    },
    onSuccess: (_, variables) => {
      const actionLabels = {
        lock: 'Período bloqueado',
        unlock: 'Período desbloqueado',
        approve: 'Período aprovado'
      };
      toast.success(actionLabels[variables.action]);
      queryClient.invalidateQueries({ queryKey: ['audit-periods'] });
      queryClient.invalidateQueries({ queryKey: ['pending-stats'] });
      queryClient.invalidateQueries({ queryKey: ['audit-action-history'] });
      queryClient.invalidateQueries({ queryKey: ['bank-transactions'] });
    },
    onError: (error: any) => {
      console.error('Lock period error:', error);
      toast.error(error.message || 'Erro ao gerenciar período');
    }
  });

  // Generate weekly periods for a company
  const generateWeeklyPeriods = (startDate: Date, weeksCount: number = 4) => {
    const periods: Array<{ start: string; end: string }> = [];
    
    for (let i = 0; i < weeksCount; i++) {
      const weekStart = new Date(startDate);
      weekStart.setDate(weekStart.getDate() - (i * 7) - weekStart.getDay());
      
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      
      periods.push({
        start: weekStart.toISOString().split('T')[0],
        end: weekEnd.toISOString().split('T')[0]
      });
    }
    
    return periods.reverse();
  };

  return {
    periods,
    pendingStats,
    actionHistory,
    isLoading: periodsLoading || statsLoading || historyLoading,
    lockPeriod: lockPeriodMutation.mutate,
    isLocking: lockPeriodMutation.isPending,
    generateWeeklyPeriods
  };
};
