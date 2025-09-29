import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Invoice {
  id: string;
  company_id: string;
  user_id: string;
  suggested_action_id?: string;
  valor: number;
  descricao: string;
  destinatario: string;
  numero_nota?: string;
  data_emissao: string;
  data_vencimento?: string;
  tipo_nota?: string;
  cfop?: string;
  natureza_operacao?: string;
  status: 'pendente' | 'emitida' | 'enviada' | 'paga' | 'cancelada';
  emitida_em?: string;
  xml_url?: string;
  pdf_url?: string;
  contact_id?: string;
  message_id?: string;
  observacoes?: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
}

export const useInvoices = (filters?: {
  status?: string;
  contact_id?: string;
  date_from?: string;
  date_to?: string;
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch invoices
  const { data: invoices, isLoading, error } = useQuery({
    queryKey: ['invoices', filters],
    queryFn: async () => {
      let query = supabase
        .from('faturas')
        .select('*')
        .order('data_emissao', { ascending: false });

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.contact_id) {
        query = query.eq('contact_id', filters.contact_id);
      }

      if (filters?.date_from) {
        query = query.gte('data_emissao', filters.date_from);
      }

      if (filters?.date_to) {
        query = query.lte('data_emissao', filters.date_to);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Invoice[];
    },
  });

  // Update invoice
  const updateInvoice = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Invoice> }) => {
      const { error } = await supabase
        .from('faturas')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast({
        title: 'Fatura atualizada',
        description: 'A fatura foi atualizada com sucesso',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao atualizar fatura',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Mark as issued
  const markAsIssued = useMutation({
    mutationFn: async ({ id, numero_nota }: { id: string; numero_nota?: string }) => {
      const { error } = await supabase
        .from('faturas')
        .update({
          status: 'emitida',
          emitida_em: new Date().toISOString(),
          numero_nota: numero_nota || null,
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast({
        title: 'Nota emitida',
        description: 'A nota fiscal foi marcada como emitida',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao emitir nota',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Delete invoice
  const deleteInvoice = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('faturas')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast({
        title: 'Fatura excluída',
        description: 'A fatura foi excluída',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao excluir fatura',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    invoices: invoices || [],
    isLoading,
    error,
    updateInvoice: updateInvoice.mutate,
    markAsIssued: markAsIssued.mutate,
    deleteInvoice: deleteInvoice.mutate,
  };
};
