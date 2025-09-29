import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Task {
  id: string;
  company_id: string;
  user_id: string;
  suggested_action_id?: string;
  titulo: string;
  descricao?: string;
  prazo?: string;
  prioridade: 'low' | 'normal' | 'high' | 'urgent';
  status: 'todo' | 'in_progress' | 'review' | 'done';
  responsavel_id?: string;
  contact_id?: string;
  message_id?: string;
  tags?: string[];
  observacoes?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export const useInternalTasks = (filters?: {
  status?: string;
  responsavel_id?: string;
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: tasks, isLoading, error } = useQuery({
    queryKey: ['internal-tasks', filters],
    queryFn: async () => {
      let query = supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.responsavel_id) {
        query = query.eq('responsavel_id', filters.responsavel_id);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Task[];
    },
  });

  const createTask = useMutation({
    mutationFn: async (newTask: Partial<Task>) => {
      const { data, error } = await supabase
        .from('tasks')
        .insert([newTask as any])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['internal-tasks'] });
      toast({
        title: 'Tarefa criada',
        description: 'A tarefa foi criada com sucesso',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao criar tarefa',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const updateTask = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Task> }) => {
      const { error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['internal-tasks'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao atualizar tarefa',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const deleteTask = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['internal-tasks'] });
      toast({
        title: 'Tarefa excluída',
        description: 'A tarefa foi excluída',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao excluir tarefa',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const moveTask = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: Task['status'] }) => {
      const updates: Partial<Task> = { status };
      
      if (status === 'done') {
        updates.completed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['internal-tasks'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao mover tarefa',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    tasks: tasks || [],
    isLoading,
    error,
    createTask: createTask.mutate,
    updateTask: updateTask.mutate,
    deleteTask: deleteTask.mutate,
    moveTask: moveTask.mutate,
  };
};
