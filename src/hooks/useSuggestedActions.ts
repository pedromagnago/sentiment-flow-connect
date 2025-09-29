import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface SuggestedAction {
  id: string;
  message_id: string;
  contact_id: string;
  action_type: 'payment' | 'invoice' | 'task' | 'question' | 'document_analysis';
  extracted_data: Record<string, any>;
  ai_confidence: number;
  status: 'pending' | 'processing' | 'completed' | 'ignored' | 'failed';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  created_at: string;
  updated_at: string;
  executed_by?: string;
  executed_at?: string;
  result_data?: Record<string, any>;
  notes?: string;
  ai_suggestion: string;
}

export const useSuggestedActions = (contactId?: string, messageId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Buscar ações sugeridas
  const { data: actions, isLoading, error } = useQuery({
    queryKey: ['suggested-actions', contactId, messageId],
    queryFn: async () => {
      let query = supabase
        .from('suggested_actions')
        .select('*')
        .order('created_at', { ascending: false });

      if (contactId) {
        query = query.eq('contact_id', contactId);
      }

      if (messageId) {
        query = query.eq('message_id', messageId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as SuggestedAction[];
    },
    enabled: !!contactId || !!messageId,
  });

  // Atualizar status da ação
  const updateActionMutation = useMutation({
    mutationFn: async ({ 
      id, 
      status, 
      notes, 
      extracted_data 
    }: { 
      id: string; 
      status: SuggestedAction['status']; 
      notes?: string;
      extracted_data?: Record<string, any>;
    }) => {
      const { error } = await supabase
        .from('suggested_actions')
        .update({ 
          status, 
          notes,
          extracted_data,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suggested-actions'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao atualizar ação',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Ignorar ação
  const ignoreAction = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('suggested_actions')
        .update({ 
          status: 'ignored',
          executed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suggested-actions'] });
      toast({
        title: 'Ação ignorada',
        description: 'A sugestão foi marcada como ignorada',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao ignorar ação',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Processar ação
  const processAction = useMutation({
    mutationFn: async ({ 
      id, 
      action_type,
      extracted_data 
    }: { 
      id: string; 
      action_type: string;
      extracted_data: Record<string, any>;
    }) => {
      // Atualizar status para processing
      await updateActionMutation.mutateAsync({ id, status: 'processing' });

      // TODO: Chamar edge function específica baseada no action_type
      // Por enquanto, apenas marca como completed
      const { error } = await supabase
        .from('suggested_actions')
        .update({ 
          status: 'completed',
          executed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suggested-actions'] });
      toast({
        title: 'Ação processada',
        description: 'A ação foi processada com sucesso',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao processar ação',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    actions: actions || [],
    isLoading,
    error,
    updateAction: updateActionMutation.mutate,
    ignoreAction: ignoreAction.mutate,
    processAction: processAction.mutate,
  };
};
