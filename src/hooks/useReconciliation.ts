import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useCompanyContext } from '@/contexts/CompanyContext';

export interface ReconciliationMatch {
  id: string;
  company_id: string;
  user_id: string;
  transaction_id: string;
  payable_id?: string;
  receivable_id?: string;
  match_type: 'manual' | 'exact' | 'fuzzy' | 'ai' | 'rule';
  match_score: number;
  match_details: any;
  status: 'suggested' | 'confirmed' | 'rejected';
  confirmed_at?: string;
  confirmed_by?: string;
  created_at: string;
  updated_at: string;
}

export const useReconciliation = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { activeCompanyId } = useCompanyContext();

  // Buscar matches
  const { data: matches, isLoading } = useQuery({
    queryKey: ['reconciliation_matches', activeCompanyId],
    queryFn: async () => {
      if (!activeCompanyId) return [];

      const { data, error } = await supabase
        .from('reconciliation_matches')
        .select('*')
        .eq('company_id', activeCompanyId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as ReconciliationMatch[];
    },
    enabled: !!activeCompanyId,
  });

  // Buscar transações não reconciliadas
  const { data: unmatchedTransactions } = useQuery({
    queryKey: ['unmatched_transactions', activeCompanyId],
    queryFn: async () => {
      if (!activeCompanyId) return [];

      const { data, error } = await supabase
        .from('bank_transactions')
        .select('*')
        .eq('company_id', activeCompanyId)
        .eq('reconciled', false)
        .order('date', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!activeCompanyId,
  });

  // Executar matching automático
  const runAutoMatch = useMutation({
    mutationFn: async ({ transaction_id, auto_confirm_threshold = 90 }: { 
      transaction_id?: string;
      auto_confirm_threshold?: number;
    }) => {
      const { data, error } = await supabase.functions.invoke('match-transactions', {
        body: {
          company_id: activeCompanyId,
          transaction_id,
          auto_confirm_threshold
        }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['reconciliation_matches'] });
      queryClient.invalidateQueries({ queryKey: ['unmatched_transactions'] });
      queryClient.invalidateQueries({ queryKey: ['bank_transactions'] });
      
      toast({
        title: 'Matching concluído',
        description: `${data.total_matches} matches encontrados, ${data.auto_confirmed} auto-confirmados`,
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao executar matching',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Confirmar match
  const confirmMatch = useMutation({
    mutationFn: async (matchId: string) => {
      const { data: match, error } = await supabase
        .from('reconciliation_matches')
        .select('*')
        .eq('id', matchId)
        .single();

      if (error) throw error;

      // Atualizar match
      await supabase
        .from('reconciliation_matches')
        .update({
          status: 'confirmed',
          confirmed_at: new Date().toISOString(),
          confirmed_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', matchId);

      // Marcar transação como reconciliada
      await supabase
        .from('bank_transactions')
        .update({
          reconciled: true,
          reconciled_at: new Date().toISOString(),
          reconciled_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', match.transaction_id);

      // Marcar conta como reconciliada
      const accountTable = match.payable_id ? 'contas_pagar' : 'contas_receber';
      const accountId = match.payable_id || match.receivable_id;
      
      await supabase
        .from(accountTable)
        .update({
          reconciled: true,
          reconciled_at: new Date().toISOString(),
          reconciled_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', accountId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reconciliation_matches'] });
      queryClient.invalidateQueries({ queryKey: ['unmatched_transactions'] });
      queryClient.invalidateQueries({ queryKey: ['bank_transactions'] });
      queryClient.invalidateQueries({ queryKey: ['payables'] });
      queryClient.invalidateQueries({ queryKey: ['receivables'] });
      
      toast({
        title: 'Match confirmado',
        description: 'A reconciliação foi confirmada com sucesso',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao confirmar match',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Rejeitar match
  const rejectMatch = useMutation({
    mutationFn: async (matchId: string) => {
      const { error } = await supabase
        .from('reconciliation_matches')
        .update({ status: 'rejected' })
        .eq('id', matchId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reconciliation_matches'] });
      
      toast({
        title: 'Match rejeitado',
        description: 'O match foi rejeitado',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao rejeitar match',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Criar match manual
  const createManualMatch = useMutation({
    mutationFn: async ({ 
      transaction_id, 
      account_id, 
      account_type 
    }: { 
      transaction_id: string;
      account_id: string;
      account_type: 'payable' | 'receivable';
    }) => {
      const { data: user } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('reconciliation_matches')
        .insert({
          company_id: activeCompanyId,
          user_id: user.user?.id,
          transaction_id,
          payable_id: account_type === 'payable' ? account_id : null,
          receivable_id: account_type === 'receivable' ? account_id : null,
          match_type: 'manual',
          match_score: 100,
          match_details: { type: 'manual_reconciliation' },
          status: 'confirmed',
          confirmed_at: new Date().toISOString(),
          confirmed_by: user.user?.id
        });

      if (error) throw error;

      // Marcar como reconciliado
      await supabase
        .from('bank_transactions')
        .update({
          reconciled: true,
          reconciled_at: new Date().toISOString(),
          reconciled_by: user.user?.id
        })
        .eq('id', transaction_id);

      const accountTable = account_type === 'payable' ? 'contas_pagar' : 'contas_receber';
      await supabase
        .from(accountTable)
        .update({
          reconciled: true,
          reconciled_at: new Date().toISOString(),
          reconciled_by: user.user?.id
        })
        .eq('id', account_id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reconciliation_matches'] });
      queryClient.invalidateQueries({ queryKey: ['unmatched_transactions'] });
      queryClient.invalidateQueries({ queryKey: ['bank_transactions'] });
      queryClient.invalidateQueries({ queryKey: ['payables'] });
      queryClient.invalidateQueries({ queryKey: ['receivables'] });
      
      toast({
        title: 'Reconciliação manual criada',
        description: 'A reconciliação foi criada com sucesso',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao criar reconciliação manual',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Métricas
  const suggestedMatches = matches?.filter(m => m.status === 'suggested') || [];
  const confirmedMatches = matches?.filter(m => m.status === 'confirmed') || [];
  const rejectedMatches = matches?.filter(m => m.status === 'rejected') || [];

  const stats = {
    total_matches: matches?.length || 0,
    suggested: suggestedMatches.length,
    confirmed: confirmedMatches.length,
    rejected: rejectedMatches.length,
    unmatched_transactions: unmatchedTransactions?.length || 0,
    reconciliation_rate: unmatchedTransactions?.length 
      ? ((confirmedMatches.length / (confirmedMatches.length + unmatchedTransactions.length)) * 100).toFixed(1)
      : '0'
  };

  return {
    matches,
    unmatchedTransactions,
    stats,
    isLoading,
    runAutoMatch: runAutoMatch.mutate,
    confirmMatch: confirmMatch.mutate,
    rejectMatch: rejectMatch.mutate,
    createManualMatch: createManualMatch.mutate,
  };
};
