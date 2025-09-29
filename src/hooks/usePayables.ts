import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Payable {
  id: string;
  company_id: string;
  user_id: string;
  suggested_action_id?: string;
  valor: number;
  vencimento: string;
  beneficiario: string;
  descricao?: string;
  categoria?: string;
  forma_pagamento?: string;
  status: 'pendente' | 'aprovado' | 'pago' | 'cancelado';
  pago_em?: string;
  comprovante_url?: string;
  contact_id?: string;
  message_id?: string;
  observacoes?: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
}

export const usePayables = (filters?: {
  status?: string;
  contact_id?: string;
  date_from?: string;
  date_to?: string;
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch payables
  const { data: payables, isLoading, error } = useQuery({
    queryKey: ['payables', filters],
    queryFn: async () => {
      let query = supabase
        .from('contas_pagar')
        .select('*')
        .order('vencimento', { ascending: true });

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.contact_id) {
        query = query.eq('contact_id', filters.contact_id);
      }

      if (filters?.date_from) {
        query = query.gte('vencimento', filters.date_from);
      }

      if (filters?.date_to) {
        query = query.lte('vencimento', filters.date_to);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Payable[];
    },
  });

  // Update payable
  const updatePayable = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Payable> }) => {
      const { error } = await supabase
        .from('contas_pagar')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payables'] });
      toast({
        title: 'Conta atualizada',
        description: 'A conta a pagar foi atualizada com sucesso',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao atualizar conta',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Mark as paid
  const markAsPaid = useMutation({
    mutationFn: async ({ id, pago_em, comprovante_url }: { 
      id: string; 
      pago_em?: string;
      comprovante_url?: string;
    }) => {
      const { error } = await supabase
        .from('contas_pagar')
        .update({
          status: 'pago',
          pago_em: pago_em || new Date().toISOString().split('T')[0],
          comprovante_url,
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payables'] });
      toast({
        title: 'Pagamento confirmado',
        description: 'A conta foi marcada como paga',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao confirmar pagamento',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Delete payable
  const deletePayable = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('contas_pagar')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payables'] });
      toast({
        title: 'Conta excluída',
        description: 'A conta a pagar foi excluída',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao excluir conta',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    payables: payables || [],
    isLoading,
    error,
    updatePayable: updatePayable.mutate,
    markAsPaid: markAsPaid.mutate,
    deletePayable: deletePayable.mutate,
  };
};
