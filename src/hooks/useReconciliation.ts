import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useCompanyContext } from '@/contexts/CompanyContext';

export type MovimentoTipo = 'operacional' | 'transferencia' | 'tarifa_bancaria' | 'rendimento' | 'outro';

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

export interface OrphanTransaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  tipo_movimento: MovimentoTipo;
  ignorar_reconciliacao: boolean;
  motivo_ignorar?: string;
  nome_origem?: string;
  category?: string;
}

export interface UnmatchedAccount {
  id: string;
  type: 'payable' | 'receivable';
  beneficiario_cliente: string;
  descricao: string;
  valor: number;
  vencimento: string;
  status: string;
  bank_transaction_id?: string;
}

export const useReconciliation = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { activeCompanyId, selectedCompanyIds } = useCompanyContext();

  const companyIds = selectedCompanyIds.length > 0 ? selectedCompanyIds : (activeCompanyId ? [activeCompanyId] : []);

  // Buscar matches
  const { data: matches, isLoading } = useQuery({
    queryKey: ['reconciliation_matches', companyIds],
    queryFn: async () => {
      if (companyIds.length === 0) return [];

      const { data, error } = await supabase
        .from('reconciliation_matches')
        .select('*')
        .in('company_id', companyIds)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as ReconciliationMatch[];
    },
    enabled: companyIds.length > 0,
  });

  // Buscar transações órfãs (não reconciliadas E operacionais E não ignoradas)
  const { data: orphanTransactions, isLoading: isLoadingOrphans } = useQuery({
    queryKey: ['orphan_transactions', companyIds],
    queryFn: async () => {
      if (companyIds.length === 0) return [];

      const { data, error } = await supabase
        .from('bank_transactions')
        .select('id, date, description, amount, tipo_movimento, ignorar_reconciliacao, motivo_ignorar, nome_origem, category')
        .in('company_id', companyIds)
        .eq('reconciled', false)
        .eq('ignorar_reconciliacao', false)
        .order('date', { ascending: false });

      if (error) throw error;
      
      // Filtrar apenas operacionais (tipo_movimento pode ser null para dados antigos)
      return (data || []).filter(t => 
        !t.tipo_movimento || t.tipo_movimento === 'operacional'
      ) as OrphanTransaction[];
    },
    enabled: companyIds.length > 0,
  });

  // Buscar todas transações não reconciliadas (para compatibilidade)
  const { data: unmatchedTransactions } = useQuery({
    queryKey: ['unmatched_transactions', companyIds],
    queryFn: async () => {
      if (companyIds.length === 0) return [];

      const { data, error } = await supabase
        .from('bank_transactions')
        .select('*')
        .in('company_id', companyIds)
        .eq('reconciled', false)
        .order('date', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: companyIds.length > 0,
  });

  // Buscar transações ignoradas/exceções
  const { data: ignoredTransactions } = useQuery({
    queryKey: ['ignored_transactions', companyIds],
    queryFn: async () => {
      if (companyIds.length === 0) return [];

      const { data, error } = await supabase
        .from('bank_transactions')
        .select('id, date, description, amount, tipo_movimento, ignorar_reconciliacao, motivo_ignorar, nome_origem')
        .in('company_id', companyIds)
        .or('ignorar_reconciliacao.eq.true,tipo_movimento.neq.operacional')
        .order('date', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: companyIds.length > 0,
  });

  // Buscar contas a pagar sem transação vinculada
  const { data: unmatchedPayables, isLoading: isLoadingPayables } = useQuery({
    queryKey: ['unmatched_payables', companyIds],
    queryFn: async () => {
      if (companyIds.length === 0) return [];

      const { data, error } = await supabase
        .from('contas_pagar')
        .select('id, beneficiario, descricao, valor, vencimento, status, bank_transaction_id')
        .in('company_id', companyIds)
        .is('bank_transaction_id', null)
        .in('status', ['pendente', 'pago'])
        .order('vencimento', { ascending: false });

      if (error) throw error;
      return (data || []).map(p => ({
        ...p,
        type: 'payable' as const,
        beneficiario_cliente: p.beneficiario
      })) as UnmatchedAccount[];
    },
    enabled: companyIds.length > 0,
  });

  // Buscar contas a receber sem transação vinculada
  const { data: unmatchedReceivables, isLoading: isLoadingReceivables } = useQuery({
    queryKey: ['unmatched_receivables', companyIds],
    queryFn: async () => {
      if (companyIds.length === 0) return [];

      const { data, error } = await supabase
        .from('contas_receber')
        .select('id, cliente, descricao, valor_total, data_vencimento, status, bank_transaction_id')
        .in('company_id', companyIds)
        .is('bank_transaction_id', null)
        .in('status', ['pendente', 'recebido'])
        .order('data_vencimento', { ascending: false });

      if (error) throw error;
      return (data || []).map(r => ({
        id: r.id,
        type: 'receivable' as const,
        beneficiario_cliente: r.cliente,
        descricao: r.descricao,
        valor: r.valor_total,
        vencimento: r.data_vencimento,
        status: r.status,
        bank_transaction_id: r.bank_transaction_id
      })) as UnmatchedAccount[];
    },
    enabled: companyIds.length > 0,
  });

  // Classificar tipo de movimento
  const classifyTransaction = useMutation({
    mutationFn: async ({ 
      transactionId, 
      tipoMovimento, 
      ignorar = false,
      motivo 
    }: { 
      transactionId: string;
      tipoMovimento: MovimentoTipo;
      ignorar?: boolean;
      motivo?: string;
    }) => {
      const { error } = await supabase
        .from('bank_transactions')
        .update({
          tipo_movimento: tipoMovimento,
          ignorar_reconciliacao: ignorar,
          motivo_ignorar: motivo
        })
        .eq('id', transactionId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orphan_transactions'] });
      queryClient.invalidateQueries({ queryKey: ['ignored_transactions'] });
      queryClient.invalidateQueries({ queryKey: ['unmatched_transactions'] });
      
      toast({
        title: 'Transação classificada',
        description: 'O tipo de movimento foi atualizado',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao classificar',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Vincular transação a conta
  const linkTransactionToAccount = useMutation({
    mutationFn: async ({ 
      transactionId, 
      accountId, 
      accountType 
    }: { 
      transactionId: string;
      accountId: string;
      accountType: 'payable' | 'receivable';
    }) => {
      const { data: user } = await supabase.auth.getUser();
      const table = accountType === 'payable' ? 'contas_pagar' : 'contas_receber';
      
      // Atualizar conta com bank_transaction_id
      const { error: accountError } = await supabase
        .from(table)
        .update({
          bank_transaction_id: transactionId,
          reconciled: true,
          reconciled_at: new Date().toISOString(),
          reconciled_by: user.user?.id
        })
        .eq('id', accountId);

      if (accountError) throw accountError;

      // Marcar transação como reconciliada
      const { error: transactionError } = await supabase
        .from('bank_transactions')
        .update({
          reconciled: true,
          reconciled_at: new Date().toISOString(),
          reconciled_by: user.user?.id,
          reconciliado_com_id: accountId,
          reconciliado_com_tipo: accountType
        })
        .eq('id', transactionId);

      if (transactionError) throw transactionError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orphan_transactions'] });
      queryClient.invalidateQueries({ queryKey: ['unmatched_payables'] });
      queryClient.invalidateQueries({ queryKey: ['unmatched_receivables'] });
      queryClient.invalidateQueries({ queryKey: ['unmatched_transactions'] });
      queryClient.invalidateQueries({ queryKey: ['bank_transactions'] });
      queryClient.invalidateQueries({ queryKey: ['payables'] });
      queryClient.invalidateQueries({ queryKey: ['receivables'] });
      
      toast({
        title: 'Vinculação concluída',
        description: 'Transação vinculada à conta com sucesso',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao vincular',
        description: error.message,
        variant: 'destructive',
      });
    },
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
      queryClient.invalidateQueries({ queryKey: ['orphan_transactions'] });
      queryClient.invalidateQueries({ queryKey: ['bank_transactions'] });
      
      toast({
        title: 'Matching concluído',
        description: `${data?.total_matches || 0} matches encontrados, ${data?.auto_confirmed || 0} auto-confirmados`,
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

      const { data: user } = await supabase.auth.getUser();

      // Atualizar match
      await supabase
        .from('reconciliation_matches')
        .update({
          status: 'confirmed',
          confirmed_at: new Date().toISOString(),
          confirmed_by: user.user?.id
        })
        .eq('id', matchId);

      // Marcar transação como reconciliada
      await supabase
        .from('bank_transactions')
        .update({
          reconciled: true,
          reconciled_at: new Date().toISOString(),
          reconciled_by: user.user?.id
        })
        .eq('id', match.transaction_id);

      // Marcar conta como reconciliada e vincular
      const accountTable = match.payable_id ? 'contas_pagar' : 'contas_receber';
      const accountId = match.payable_id || match.receivable_id;
      
      await supabase
        .from(accountTable)
        .update({
          reconciled: true,
          reconciled_at: new Date().toISOString(),
          reconciled_by: user.user?.id,
          bank_transaction_id: match.transaction_id
        })
        .eq('id', accountId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reconciliation_matches'] });
      queryClient.invalidateQueries({ queryKey: ['unmatched_transactions'] });
      queryClient.invalidateQueries({ queryKey: ['orphan_transactions'] });
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
          reconciled_by: user.user?.id,
          reconciliado_com_id: account_id,
          reconciliado_com_tipo: account_type
        })
        .eq('id', transaction_id);

      const accountTable = account_type === 'payable' ? 'contas_pagar' : 'contas_receber';
      await supabase
        .from(accountTable)
        .update({
          reconciled: true,
          reconciled_at: new Date().toISOString(),
          reconciled_by: user.user?.id,
          bank_transaction_id: transaction_id
        })
        .eq('id', account_id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reconciliation_matches'] });
      queryClient.invalidateQueries({ queryKey: ['unmatched_transactions'] });
      queryClient.invalidateQueries({ queryKey: ['orphan_transactions'] });
      queryClient.invalidateQueries({ queryKey: ['unmatched_payables'] });
      queryClient.invalidateQueries({ queryKey: ['unmatched_receivables'] });
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

  const unmatchedAccounts = [
    ...(unmatchedPayables || []),
    ...(unmatchedReceivables || [])
  ];

  const stats = {
    total_matches: matches?.length || 0,
    suggested: suggestedMatches.length,
    confirmed: confirmedMatches.length,
    rejected: rejectedMatches.length,
    orphan_transactions: orphanTransactions?.length || 0,
    unmatched_transactions: unmatchedTransactions?.length || 0,
    ignored_transactions: ignoredTransactions?.length || 0,
    unmatched_payables: unmatchedPayables?.length || 0,
    unmatched_receivables: unmatchedReceivables?.length || 0,
    total_unmatched_accounts: unmatchedAccounts.length,
    reconciliation_rate: unmatchedTransactions?.length 
      ? ((confirmedMatches.length / (confirmedMatches.length + (orphanTransactions?.length || 0))) * 100).toFixed(1)
      : '100'
  };

  return {
    matches,
    unmatchedTransactions,
    orphanTransactions,
    ignoredTransactions,
    unmatchedPayables,
    unmatchedReceivables,
    unmatchedAccounts,
    stats,
    isLoading: isLoading || isLoadingOrphans || isLoadingPayables || isLoadingReceivables,
    runAutoMatch: runAutoMatch.mutate,
    confirmMatch: confirmMatch.mutate,
    rejectMatch: rejectMatch.mutate,
    createManualMatch: createManualMatch.mutate,
    classifyTransaction: classifyTransaction.mutate,
    linkTransactionToAccount: linkTransactionToAccount.mutate,
  };
};
