
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface TaskRevision {
  id: string;
  message_id: string | null;
  'execution.id': string | null;
  'workflow.id': string | null;
  'workflow.name': string | null;
  texto_tarefa_formatado: string | null;
  id_groups_message: string | null;
  contact_id: string | null;
  feedback_cliente: string | null;
  zaap_id: string | null;
  status: string | null;
  created_at: string | null;
}

export const useTaskRevisions = () => {
  const [revisions, setRevisions] = useState<TaskRevision[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRevisions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('taskgrouprevisions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRevisions(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar revisões de tarefas');
    } finally {
      setLoading(false);
    }
  };

  const updateRevisionStatus = async (id: string, status: string, feedback?: string) => {
    try {
      const updateData: any = { 
        status,
        updated_at: new Date().toISOString()
      };
      
      if (feedback) {
        updateData.feedback_cliente = feedback;
      }

      const { error } = await supabase
        .from('taskgrouprevisions')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;
      
      await fetchRevisions(); // Refresh the list
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Erro ao atualizar status da revisão');
    }
  };

  const approveRevision = async (id: string) => {
    return updateRevisionStatus(id, 'Aprovado');
  };

  const rejectRevision = async (id: string, feedback: string) => {
    return updateRevisionStatus(id, 'Rejeitado', feedback);
  };

  const modifyRevision = async (id: string, newText: string) => {
    try {
      const { error } = await supabase
        .from('taskgrouprevisions')
        .update({ 
          texto_tarefa_formatado: newText,
          status: 'Modificado',
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
      
      await fetchRevisions(); // Refresh the list
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Erro ao modificar revisão');
    }
  };

  useEffect(() => {
    fetchRevisions();
  }, []);

  return { 
    revisions, 
    loading, 
    error, 
    refetch: fetchRevisions,
    approveRevision,
    rejectRevision,
    modifyRevision,
    updateRevisionStatus
  };
};
