import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface CompanyGroup {
  id: string;
  nome: string;
  descricao?: string;
  tipo: 'holding' | 'grupo_economico' | 'franquia' | 'filial';
  parent_company_id?: string;
  created_at: string;
  updated_at: string;
}

export interface CompanyGroupMember {
  id: string;
  group_id: string;
  company_id: string;
  member_type: 'matriz' | 'filial' | 'coligada';
  consolidation_weight: number;
  is_active: boolean;
  joined_at: string;
  left_at?: string;
}

export const useCompanyGroups = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Buscar grupos
  const { data: groups, isLoading: groupsLoading } = useQuery({
    queryKey: ['company_groups'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('company_groups')
        .select('*')
        .order('nome');

      if (error) throw error;
      return data as CompanyGroup[];
    },
  });

  // Buscar membros de um grupo
  const fetchGroupMembers = async (groupId: string) => {
    const { data, error } = await supabase
      .from('company_group_members')
      .select(`
        *,
        companies (
          id,
          nome,
          cnpj,
          status
        )
      `)
      .eq('group_id', groupId)
      .eq('is_active', true);

    if (error) throw error;
    return data;
  };

  // Criar grupo
  const createGroup = useMutation({
    mutationFn: async (groupData: Omit<CompanyGroup, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('company_groups')
        .insert(groupData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company_groups'] });
      toast({
        title: 'Grupo criado',
        description: 'O grupo empresarial foi criado com sucesso',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao criar grupo',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Atualizar grupo
  const updateGroup = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<CompanyGroup> }) => {
      const { error } = await supabase
        .from('company_groups')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company_groups'] });
      toast({
        title: 'Grupo atualizado',
        description: 'O grupo foi atualizado com sucesso',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao atualizar grupo',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Deletar grupo
  const deleteGroup = useMutation({
    mutationFn: async (groupId: string) => {
      const { error } = await supabase
        .from('company_groups')
        .delete()
        .eq('id', groupId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company_groups'] });
      toast({
        title: 'Grupo excluído',
        description: 'O grupo foi excluído com sucesso',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao excluir grupo',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Adicionar empresa ao grupo
  const addCompanyToGroup = useMutation({
    mutationFn: async (memberData: Omit<CompanyGroupMember, 'id' | 'joined_at'>) => {
      const { error } = await supabase
        .from('company_group_members')
        .insert(memberData);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company_groups'] });
      toast({
        title: 'Empresa adicionada',
        description: 'A empresa foi adicionada ao grupo',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao adicionar empresa',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Remover empresa do grupo
  const removeCompanyFromGroup = useMutation({
    mutationFn: async ({ groupId, companyId }: { groupId: string; companyId: string }) => {
      const { error } = await supabase
        .from('company_group_members')
        .update({ 
          is_active: false,
          left_at: new Date().toISOString()
        })
        .eq('group_id', groupId)
        .eq('company_id', companyId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company_groups'] });
      toast({
        title: 'Empresa removida',
        description: 'A empresa foi removida do grupo',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao remover empresa',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Buscar métricas consolidadas de um grupo
  const fetchGroupMetrics = async (groupId: string) => {
    const members = await fetchGroupMembers(groupId);
    const companyIds = members.map((m: any) => m.company_id);

    if (companyIds.length === 0) {
      return {
        totalRevenue: 0,
        totalExpenses: 0,
        totalInvoices: 0,
        totalPayables: 0,
        totalReceivables: 0,
        memberMetrics: []
      };
    }

    // Buscar métricas de cada empresa
    const [receivables, payables, invoices] = await Promise.all([
      supabase.from('contas_receber').select('valor_total, company_id').in('company_id', companyIds),
      supabase.from('contas_pagar').select('valor, company_id').in('company_id', companyIds),
      supabase.from('faturas').select('valor, company_id').in('company_id', companyIds)
    ]);

    // Agregar métricas
    const metrics = {
      totalRevenue: receivables.data?.reduce((sum, r) => sum + Number(r.valor_total), 0) || 0,
      totalExpenses: payables.data?.reduce((sum, p) => sum + Number(p.valor), 0) || 0,
      totalInvoices: invoices.data?.reduce((sum, i) => sum + Number(i.valor), 0) || 0,
      totalPayables: payables.data?.length || 0,
      totalReceivables: receivables.data?.length || 0,
      memberMetrics: members.map((m: any) => ({
        companyId: m.company_id,
        companyName: m.companies.nome,
        revenue: receivables.data?.filter(r => r.company_id === m.company_id).reduce((sum, r) => sum + Number(r.valor_total), 0) || 0,
        expenses: payables.data?.filter(p => p.company_id === m.company_id).reduce((sum, p) => sum + Number(p.valor), 0) || 0,
        weight: m.consolidation_weight
      }))
    };

    return metrics;
  };

  return {
    groups,
    groupsLoading,
    fetchGroupMembers,
    fetchGroupMetrics,
    createGroup: createGroup.mutate,
    updateGroup: updateGroup.mutate,
    deleteGroup: deleteGroup.mutate,
    addCompanyToGroup: addCompanyToGroup.mutate,
    removeCompanyFromGroup: removeCompanyFromGroup.mutate,
  };
};
