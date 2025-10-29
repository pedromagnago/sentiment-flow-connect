import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useCompanyFilter } from './useCompanyFilter';

export interface Message {
  id: string;
  contact_id: string;
  conteudo_mensagem: string;
  nome_membro: string;
  data_hora: string;
  fromme: boolean;
  status_processamento: string;
  created_at: string;
  updated_at: string;
}

export const useMessages = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { getCompanyFilter, hasCompanyFilter, selectedCompanyIds } = useCompanyFilter();

  const fetchMessages = async () => {
    try {
      setLoading(true);
      console.log('Fetching messages for companies:', selectedCompanyIds);
      
      if (!hasCompanyFilter) {
        setMessages([]);
        setLoading(false);
        return;
      }

      // Get contacts for selected companies
      let contactsQuery = supabase
        .from('contacts')
        .select('id_contact');
      
      const filter = getCompanyFilter();
      if (filter?.operator === 'eq') {
        contactsQuery = contactsQuery.eq('company_id', filter.value as string);
      } else if (filter?.operator === 'in') {
        contactsQuery = contactsQuery.in('company_id', filter.value as string[]);
      }
      
      const { data: companyContacts } = await contactsQuery;
      const contactIds = companyContacts?.map(c => c.id_contact) || [];
      
      if (contactIds.length === 0) {
        setMessages([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .in('contact_id', contactIds)
        .order('created_at', { ascending: false })
        .limit(500); // Increased limit for multi-company

      if (error) {
        console.error('Error fetching messages:', error);
        throw error;
      }
      console.log('Messages fetched:', data?.length, 'messages');
      setMessages(data || []);
    } catch (err) {
      console.error('Fetch messages error:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar mensagens');
    } finally {
      setLoading(false);
    }
  };

  const deleteMessage = async (id: string) => {
    try {
      console.log('Attempting to delete message:', id);
      
      // Check if the message still exists
      const { data: existingMessage, error: checkError } = await supabase
        .from('messages')
        .select('id')
        .eq('id', id)
        .single();

      if (checkError || !existingMessage) {
        console.log('Message does not exist in database, removing from local state');
        setMessages(prev => prev.filter(message => message.id !== id));
        return;
      }

      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting message:', error);
        
        if (error.code === '23503') {
          throw new Error('Não é possível excluir esta mensagem pois ela possui dados relacionados no sistema.');
        }
        
        throw error;
      }
      
      console.log('Message deleted successfully');
      await fetchMessages();
    } catch (err) {
      console.error('Delete message error:', err);
      throw new Error(err instanceof Error ? err.message : 'Erro ao excluir mensagem');
    }
  };

  // Setup realtime subscription
  useEffect(() => {
    if (!hasCompanyFilter) return;
    fetchMessages();

    const channelId = `messages-changes-${crypto.randomUUID()}`;
    const channel = supabase
      .channel(channelId)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages'
        },
        (payload) => {
          console.log('Messages table changed:', payload);
          fetchMessages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedCompanyIds, hasCompanyFilter]);

  return { 
    messages, 
    loading, 
    error, 
    refetch: fetchMessages,
    deleteMessage
  };
};
