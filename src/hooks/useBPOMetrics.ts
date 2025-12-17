import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUserProfile } from './useUserProfile';

export interface ClientMetrics {
  companyId: string;
  companyName: string;
  pendingPayables: number;
  pendingReceivables: number;
  pendingReconciliation: number;
  pendingSuggestedActions: number;
  lastActivity: string | null;
  status: 'ok' | 'attention' | 'critical';
}

export interface BPOSummary {
  totalClients: number;
  totalPendingPayables: number;
  totalPendingReceivables: number;
  totalPendingReconciliation: number;
  totalPendingActions: number;
  clientsNeedingAttention: number;
}

export function useBPOMetrics() {
  const [clients, setClients] = useState<ClientMetrics[]>([]);
  const [summary, setSummary] = useState<BPOSummary>({
    totalClients: 0,
    totalPendingPayables: 0,
    totalPendingReceivables: 0,
    totalPendingReconciliation: 0,
    totalPendingActions: 0,
    clientsNeedingAttention: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { roles } = useUserProfile();

  useEffect(() => {
    fetchMetrics();
  }, [roles]);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get companies the user has access to
      const companyIds = roles.map(r => r.company_id);
      
      if (companyIds.length === 0) {
        setClients([]);
        setLoading(false);
        return;
      }

      // Fetch companies
      const { data: companies, error: companiesError } = await supabase
        .from('companies')
        .select('id, nome')
        .in('id', companyIds);

      if (companiesError) throw companiesError;

      // Fetch metrics for each company
      const clientMetrics: ClientMetrics[] = [];

      for (const company of companies || []) {
        // Pending payables (status = pendente)
        const { count: pendingPayables } = await supabase
          .from('contas_pagar')
          .select('*', { count: 'exact', head: true })
          .eq('company_id', company.id)
          .eq('status', 'pendente');

        // Pending receivables (status = pendente)
        const { count: pendingReceivables } = await supabase
          .from('contas_receber')
          .select('*', { count: 'exact', head: true })
          .eq('company_id', company.id)
          .eq('status', 'pendente');

        // Pending reconciliation (reconciled = false, not ignored)
        const { count: pendingReconciliation } = await supabase
          .from('bank_transactions')
          .select('*', { count: 'exact', head: true })
          .eq('company_id', company.id)
          .eq('reconciled', false)
          .eq('ignorar_reconciliacao', false);

        // Pending suggested actions - skip if table doesn't exist
        const pendingActions = 0;

        // Last activity (most recent transaction)
        const { data: lastTransactions } = await supabase
          .from('bank_transactions')
          .select('created_at')
          .eq('company_id', company.id)
          .order('created_at', { ascending: false })
          .limit(1);
        
        const lastTransaction = lastTransactions?.[0];

        // Determine status
        let status: 'ok' | 'attention' | 'critical' = 'ok';
        const totalPending = (pendingPayables || 0) + (pendingReceivables || 0) + (pendingReconciliation || 0);
        
        if (totalPending > 50 || (pendingActions || 0) > 20) {
          status = 'critical';
        } else if (totalPending > 20 || (pendingActions || 0) > 10) {
          status = 'attention';
        }

        clientMetrics.push({
          companyId: company.id,
          companyName: company.nome || 'Empresa sem nome',
          pendingPayables: pendingPayables || 0,
          pendingReceivables: pendingReceivables || 0,
          pendingReconciliation: pendingReconciliation || 0,
          pendingSuggestedActions: pendingActions || 0,
          lastActivity: lastTransaction?.created_at || null,
          status,
        });
      }

      // Sort by status (critical first, then attention, then ok)
      clientMetrics.sort((a, b) => {
        const statusOrder = { critical: 0, attention: 1, ok: 2 };
        return statusOrder[a.status] - statusOrder[b.status];
      });

      setClients(clientMetrics);

      // Calculate summary
      const summaryData: BPOSummary = {
        totalClients: clientMetrics.length,
        totalPendingPayables: clientMetrics.reduce((sum, c) => sum + c.pendingPayables, 0),
        totalPendingReceivables: clientMetrics.reduce((sum, c) => sum + c.pendingReceivables, 0),
        totalPendingReconciliation: clientMetrics.reduce((sum, c) => sum + c.pendingReconciliation, 0),
        totalPendingActions: clientMetrics.reduce((sum, c) => sum + c.pendingSuggestedActions, 0),
        clientsNeedingAttention: clientMetrics.filter(c => c.status !== 'ok').length,
      };

      setSummary(summaryData);
    } catch (e: any) {
      setError(e?.message || 'Erro ao carregar métricas');
    } finally {
      setLoading(false);
    }
  };

  return {
    clients,
    summary,
    loading,
    error,
    refresh: fetchMetrics,
  };
}
