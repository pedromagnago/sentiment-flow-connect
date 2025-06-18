
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Contact {
  id_contact: string;
  nome: string;
  status: boolean;
  feedback: boolean;
  is_group: boolean;
  data_criacao: string;
  empresa_id: string;
}

export const useContacts = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      console.log('Fetching contacts...');
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .order('data_criacao', { ascending: false });

      if (error) {
        console.error('Error fetching contacts:', error);
        throw error;
      }
      console.log('Contacts fetched:', data);
      setContacts(data || []);
    } catch (err) {
      console.error('Fetch contacts error:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar contatos');
    } finally {
      setLoading(false);
    }
  };

  const deleteContact = async (id: string) => {
    try {
      console.log('Attempting to delete contact:', id);
      
      // First, check if the contact still exists
      const { data: existingContact, error: checkError } = await supabase
        .from('contacts')
        .select('id_contact')
        .eq('id_contact', id)
        .single();

      if (checkError || !existingContact) {
        console.log('Contact does not exist in database, removing from local state');
        setContacts(prev => prev.filter(contact => contact.id_contact !== id));
        return;
      }

      // Try to delete related messages first
      console.log('Checking for related messages...');
      const { error: messagesError } = await supabase
        .from('messages')
        .delete()
        .eq('contact_id', id);

      if (messagesError) {
        console.log('Warning: Could not delete related messages:', messagesError);
      }

      // Now delete the contact
      const { error } = await supabase
        .from('contacts')
        .delete()
        .eq('id_contact', id);

      if (error) {
        console.error('Error deleting contact:', error);
        
        if (error.code === '23503') {
          throw new Error('Não é possível excluir este contato pois ele possui dados relacionados no sistema.');
        }
        
        throw error;
      }
      
      console.log('Contact deleted successfully');
      await fetchContacts();
    } catch (err) {
      console.error('Delete contact error:', err);
      throw new Error(err instanceof Error ? err.message : 'Erro ao excluir contato');
    }
  };

  // Setup realtime subscription
  useEffect(() => {
    fetchContacts();

    const channel = supabase
      .channel('contacts-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'contacts'
        },
        (payload) => {
          console.log('Contacts table changed:', payload);
          fetchContacts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { 
    contacts, 
    loading, 
    error, 
    refetch: fetchContacts,
    deleteContact
  };
};
