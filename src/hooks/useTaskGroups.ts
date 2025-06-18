
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface TaskGroup {
  id: string;
  nome_grupo: string;
  status_clickup: string;
  created_at: string;
  "execution.id": string;
  "workflow.name": string;
}

export const useTaskGroups = () => {
  const [taskGroups, setTaskGroups] = useState<TaskGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTaskGroups = async () => {
    try {
      setLoading(true);
      console.log('Fetching task groups...');
      const { data, error } = await supabase
        .from('taskgroups')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching task groups:', error);
        throw error;
      }
      console.log('Task groups fetched:', data);
      setTaskGroups(data || []);
    } catch (err) {
      console.error('Fetch task groups error:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar grupos de tarefas');
    } finally {
      setLoading(false);
    }
  };

  const deleteTaskGroup = async (id: string) => {
    try {
      console.log('Attempting to delete task group:', id);
      
      // Check if the task group still exists
      const { data: existingTask, error: checkError } = await supabase
        .from('taskgroups')
        .select('id')
        .eq('id', id)
        .single();

      if (checkError || !existingTask) {
        console.log('Task group does not exist in database, removing from local state');
        setTaskGroups(prev => prev.filter(task => task.id !== id));
        return;
      }

      const { error } = await supabase
        .from('taskgroups')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting task group:', error);
        
        if (error.code === '23503') {
          throw new Error('Não é possível excluir este grupo de tarefas pois ele possui dados relacionados no sistema.');
        }
        
        throw error;
      }
      
      console.log('Task group deleted successfully');
      await fetchTaskGroups();
    } catch (err) {
      console.error('Delete task group error:', err);
      throw new Error(err instanceof Error ? err.message : 'Erro ao excluir grupo de tarefas');
    }
  };

  // Setup realtime subscription
  useEffect(() => {
    fetchTaskGroups();

    const channel = supabase
      .channel('taskgroups-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'taskgroups'
        },
        (payload) => {
          console.log('Task groups table changed:', payload);
          fetchTaskGroups();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { 
    taskGroups, 
    loading, 
    error, 
    refetch: fetchTaskGroups,
    deleteTaskGroup
  };
};
