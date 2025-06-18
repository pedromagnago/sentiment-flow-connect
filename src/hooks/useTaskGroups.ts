
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface TaskGroup {
  id: string;
  nome_grupo: string;
  status_clickup: string;
  created_at: string;
  execution_id: string;
  workflow_name: string;
}

export const useTaskGroups = () => {
  const [taskGroups, setTaskGroups] = useState<TaskGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTaskGroups = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('taskgroups')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTaskGroups(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar grupos de tarefas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTaskGroups();
  }, []);

  return { taskGroups, loading, error, refetch: fetchTaskGroups };
};
