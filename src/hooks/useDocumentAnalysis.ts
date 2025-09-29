import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface DocumentAnalysis {
  id: string;
  user_id: string;
  company_id: string;
  file_name: string;
  file_url?: string;
  file_type: 'pdf' | 'image' | 'audio';
  analysis_result: Record<string, any>;
  extracted_text?: string;
  summary?: string;
  suggested_action_id?: string;
  contact_id?: string;
  message_id?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export const useDocumentAnalysis = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all document analyses
  const { data: analyses, isLoading, error } = useQuery({
    queryKey: ['document-analysis'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('document_analysis')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as DocumentAnalysis[];
    },
  });

  // Process document
  const processDocument = useMutation({
    mutationFn: async ({
      file_url,
      file_type,
      file_name,
      suggested_action_id,
      contact_id,
      message_id,
    }: {
      file_url: string;
      file_type: 'pdf' | 'image' | 'audio';
      file_name: string;
      suggested_action_id?: string;
      contact_id?: string;
      message_id?: string;
    }) => {
      const { data, error } = await supabase.functions.invoke('process-document', {
        body: {
          file_url,
          file_type,
          file_name,
          suggested_action_id,
          contact_id,
          message_id,
        },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['document-analysis'] });
      toast({
        title: 'Documento processado',
        description: 'O documento foi analisado com sucesso',
      });
    },
    onError: (error: any) => {
      console.error('Error processing document:', error);
      toast({
        title: 'Erro ao processar documento',
        description: error.message || 'Ocorreu um erro ao processar o documento',
        variant: 'destructive',
      });
    },
  });

  // Delete analysis
  const deleteAnalysis = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('document_analysis')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['document-analysis'] });
      toast({
        title: 'Análise excluída',
        description: 'A análise foi excluída com sucesso',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao excluir análise',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    analyses: analyses || [],
    isLoading,
    error,
    processDocument: processDocument.mutate,
    isProcessing: processDocument.isPending,
    deleteAnalysis: deleteAnalysis.mutate,
  };
};
