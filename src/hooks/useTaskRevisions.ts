
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
      console.log('Fetching task revisions...');
      const { data, error } = await supabase
        .from('taskgrouprevisions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching task revisions:', error);
        throw error;
      }
      console.log('Task revisions fetched:', data);
      setRevisions(data || []);
    } catch (err) {
      console.error('Fetch task revisions error:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar revisões de tarefas');
    } finally {
      setLoading(false);
    }
  };

  const updateRevisionStatus = async (id: string, status: string, feedback?: string) => {
    try {
      console.log('Updating revision status:', id, status);
      
      // Check if the revision still exists
      const { data: existingRevision, error: checkError } = await supabase
        .from('taskgrouprevisions')
        .select('id')
        .eq('id', id)
        .single();

      if (checkError || !existingRevision) {
        console.log('Revision does not exist in database, removing from local state');
        setRevisions(prev => prev.filter(revision => revision.id !== id));
        throw new Error('Esta revisão não existe mais no sistema.');
      }

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

      if (error) {
        console.error('Error updating revision status:', error);
        throw error;
      }
      
      console.log('Revision status updated successfully');
      await fetchRevisions();
    } catch (err) {
      console.error('Update revision status error:', err);
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
      console.log('Modifying revision:', id);
      
      // Check if the revision still exists
      const { data: existingRevision, error: checkError } = await supabase
        .from('taskgrouprevisions')
        .select('id')
        .eq('id', id)
        .single();

      if (checkError || !existingRevision) {
        console.log('Revision does not exist in database, removing from local state');
        setRevisions(prev => prev.filter(revision => revision.id !== id));
        throw new Error('Esta revisão não existe mais no sistema.');
      }

      const { error } = await supabase
        .from('taskgrouprevisions')
        .update({ 
          texto_tarefa_formatado: newText,
          status: 'Modificado',
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) {
        console.error('Error modifying revision:', error);
        throw error;
      }
      
      console.log('Revision modified successfully');
      await fetchRevisions();
    } catch (err) {
      console.error('Modify revision error:', err);
      throw new Error(err instanceof Error ? err.message : 'Erro ao modificar revisão');
    }
  };

  // Setup realtime subscription
  useEffect(() => {
    fetchRevisions();

    const channelId = `taskrevisions-changes-${crypto.randomUUID()}`;
    const channel = supabase
      .channel(channelId)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'taskgrouprevisions'
        },
        (payload) => {
          console.log('Task revisions table changed:', payload);
          fetchRevisions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
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
