import { useMemo } from 'react';
import { useQueries } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCompanyFilter } from './useCompanyFilter';

interface CompanyMetrics {
  companyId: string;
  companyName: string;
  messagesCount: number;
  contactsCount: number;
  actionsCount: number;
  completedActionsCount: number;
  revenue: number;
  expenses: number;
}

interface ConsolidatedMetrics {
  totalMessages: number;
  totalContacts: number;
  totalActions: number;
  totalCompletedActions: number;
  totalRevenue: number;
  totalExpenses: number;
  margin: number;
  byCompany: CompanyMetrics[];
}

const fetchCompanyMetrics = async (companyId: string, companyName: string): Promise<CompanyMetrics> => {
  // Buscar contatos da empresa
  const { data: contacts } = await supabase
    .from('contacts')
    .select('id_contact')
    .eq('company_id', companyId);
  
  const contactIds = contacts?.map(c => c.id_contact) || [];
  
  // Buscar mensagens
  const { data: messages } = await supabase
    .from('messages')
    .select('id')
    .in('contact_id', contactIds);
  
  // Buscar ações sugeridas
  const { data: actions } = await supabase
    .from('suggested_actions')
    .select('status, id')
    .in('contact_id', contactIds);
  
  // Buscar receitas e despesas (se existirem)
  const { data: receivables } = await supabase
    .from('contas_receber')
    .select('*')
    .eq('company_id', companyId)
    .eq('status', 'recebido');
  
  const { data: payables } = await supabase
    .from('contas_pagar')
    .select('*')
    .eq('company_id', companyId)
    .eq('status', 'pago');
  
  // Calcular receitas e despesas com campos disponíveis
  const revenue = 0; // Placeholder - ajustar conforme schema
  const expenses = 0; // Placeholder - ajustar conforme schema
  
  return {
    companyId,
    companyName,
    messagesCount: messages?.length || 0,
    contactsCount: contacts?.length || 0,
    actionsCount: actions?.length || 0,
    completedActionsCount: actions?.filter(a => a.status === 'completed').length || 0,
    revenue,
    expenses,
  };
};

export const useConsolidatedData = () => {
  const { selectedCompanyIds, isMultiCompany, selectionMode } = useCompanyFilter();
  
  // Buscar informações das empresas selecionadas
  const companiesQueries = useQueries({
    queries: selectedCompanyIds.map(companyId => ({
      queryKey: ['company-info', companyId],
      queryFn: async () => {
        const { data } = await supabase
          .from('companies')
          .select('id, nome')
          .eq('id', companyId)
          .single();
        return data;
      },
      staleTime: 5 * 60 * 1000, // 5 minutos
    })),
  });

  const companies = companiesQueries.map(q => q.data).filter(Boolean);
  const companiesLoading = companiesQueries.some(q => q.isLoading);

  // Buscar métricas de cada empresa em paralelo
  const metricsQueries = useQueries({
    queries: selectedCompanyIds.map((companyId, index) => ({
      queryKey: ['company-metrics', companyId],
      queryFn: () => {
        const companyName = companies[index]?.nome || 'Empresa';
        return fetchCompanyMetrics(companyId, companyName);
      },
      staleTime: 5 * 60 * 1000, // 5 minutos
      enabled: Boolean(companies[index]),
    })),
  });

  const metricsData = metricsQueries.map(q => q.data).filter(Boolean) as CompanyMetrics[];
  const metricsLoading = metricsQueries.some(q => q.isLoading);

  // Consolidar métricas
  const consolidatedData: ConsolidatedMetrics | null = useMemo(() => {
    if (!metricsData.length) return null;
    
    const totals = metricsData.reduce((acc, metrics) => ({
      totalMessages: acc.totalMessages + metrics.messagesCount,
      totalContacts: acc.totalContacts + metrics.contactsCount,
      totalActions: acc.totalActions + metrics.actionsCount,
      totalCompletedActions: acc.totalCompletedActions + metrics.completedActionsCount,
      totalRevenue: acc.totalRevenue + metrics.revenue,
      totalExpenses: acc.totalExpenses + metrics.expenses,
    }), {
      totalMessages: 0,
      totalContacts: 0,
      totalActions: 0,
      totalCompletedActions: 0,
      totalRevenue: 0,
      totalExpenses: 0,
    });
    
    const margin = totals.totalRevenue > 0 
      ? ((totals.totalRevenue - totals.totalExpenses) / totals.totalRevenue) * 100
      : 0;
    
    return {
      ...totals,
      margin,
      byCompany: metricsData,
    };
  }, [metricsData]);
  
  return { 
    consolidatedData, 
    isLoading: metricsLoading || companiesLoading,
    isMultiCompany,
    selectedCount: selectedCompanyIds.length,
  };
};
