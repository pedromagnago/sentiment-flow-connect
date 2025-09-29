import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ConversationAssignment {
  id: string;
  contact_id: string;
  user_id: string | null;
  status: 'aguardando' | 'em_atendimento' | 'finalizado' | 'aguardando_retorno';
  priority: 'baixa' | 'media' | 'alta' | 'urgente';
  tags: string[];
  assigned_at: string;
  updated_at: string;
  sla_deadline: string | null;
  created_at: string;
}

export const useConversationAssignments = () => {
  const [assignments, setAssignments] = useState<ConversationAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('conversation_assignments')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setAssignments((data || []) as ConversationAssignment[]);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateAssignment = async (
    id: string, 
    updates: Partial<ConversationAssignment>
  ) => {
    try {
      const { error } = await supabase
        .from('conversation_assignments')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      await fetchAssignments();
    } catch (error: any) {
      setError(error.message);
    }
  };

  const createAssignment = async (
    assignmentData: Omit<ConversationAssignment, 'id' | 'created_at' | 'updated_at' | 'assigned_at'>
  ) => {
    try {
      const { error } = await supabase
        .from('conversation_assignments')
        .insert(assignmentData);

      if (error) throw error;
      await fetchAssignments();
    } catch (error: any) {
      setError(error.message);
    }
  };

  const deleteAssignment = async (id: string) => {
    try {
      const { error } = await supabase
        .from('conversation_assignments')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchAssignments();
    } catch (error: any) {
      setError(error.message);
    }
  };

  useEffect(() => {
    fetchAssignments();

    const channel = supabase
      .channel('conversation_assignments_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'conversation_assignments'
      }, () => {
        fetchAssignments();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    assignments,
    loading,
    error,
    refetch: fetchAssignments,
    updateAssignment,
    createAssignment,
    deleteAssignment
  };
};