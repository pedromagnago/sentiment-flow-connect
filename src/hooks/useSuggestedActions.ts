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

      // Chamar edge function específica baseada no action_type
      if (action_type === 'payment') {
        const { data: action } = await supabase
          .from('suggested_actions')
          .select('contact_id, message_id')
          .eq('id', id)
          .single();

        const { error: functionError } = await supabase.functions.invoke('create-payment', {
          body: {
            suggested_action_id: id,
            extracted_data,
            contact_id: action?.contact_id,
            message_id: action?.message_id,
          }
        });

        if (functionError) throw functionError;
      } else if (action_type === 'invoice') {
        const { data: action } = await supabase
          .from('suggested_actions')
          .select('contact_id, message_id')
          .eq('id', id)
          .single();

        const { error: functionError } = await supabase.functions.invoke('create-invoice', {
          body: {
            suggested_action_id: id,
            extracted_data,
            contact_id: action?.contact_id,
            message_id: action?.message_id,
          }
        });

        if (functionError) throw functionError;
      } else if (action_type === 'task') {
        const { data: action } = await supabase
          .from('suggested_actions')
          .select('contact_id, message_id')
          .eq('id', id)
          .single();

        const { error: functionError } = await supabase.functions.invoke('create-task', {
          body: {
            suggested_action_id: id,
            extracted_data,
            contact_id: action?.contact_id,
            message_id: action?.message_id,
          }
        });

        if (functionError) throw functionError;
      } else if (action_type === 'document_analysis') {
        const { data: action } = await supabase
          .from('suggested_actions')
          .select('contact_id, message_id, extracted_data')
          .eq('id', id)
          .single();

        const actionData = action?.extracted_data as any;
        const file_url = extracted_data?.file_url || actionData?.file_url;
        const file_type = extracted_data?.file_type || actionData?.file_type || 'image';
        const file_name = extracted_data?.file_name || actionData?.file_name || 'document';

        const { error: functionError } = await supabase.functions.invoke('process-document', {
          body: {
            file_url,
            file_type,
            file_name,
            suggested_action_id: id,
            contact_id: action?.contact_id,
            message_id: action?.message_id,
          }
        });

        if (functionError) throw functionError;
      } else {
        // Para outros tipos, apenas marca como completed
        const { error } = await supabase
          .from('suggested_actions')
          .update({ 
            status: 'completed',
            executed_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', id);

        if (error) throw error;
      }
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
