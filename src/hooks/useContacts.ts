import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useCompanyFilter } from './useCompanyFilter';

export interface Contact {
  id_contact: string;
  nome: string;
  status: boolean;
  feedback: boolean;
  is_group: boolean;
  data_criacao: string;
  created_at: string;
  updated_at: string;
  company_id: string;
}

export const useContacts = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { getCompanyFilter, hasCompanyFilter, isAdmin, selectedCompanyIds } = useCompanyFilter();

  const fetchContacts = async () => {
    try {
      setLoading(true);
      console.log('Fetching contacts - selectedCompanyIds:', selectedCompanyIds);
      
      let query = supabase
        .from('contacts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(500); // Increased limit for multi-company

      // Apply company filter
      const filter = getCompanyFilter();
      if (filter?.operator === 'eq') {
        query = query.eq('company_id', filter.value as string);
        console.log('Filtering by company:', filter.value);
      } else if (filter?.operator === 'in') {
        query = query.in('company_id', filter.value as string[]);
        console.log('Filtering by companies:', filter.value);
      } else if (!hasCompanyFilter && !isAdmin) {
        // Non-admin without company selected sees nothing
        console.log('No company selected - showing no contacts');
        setContacts([]);
        setLoading(false);
        return;
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching contacts:', error);
        throw error;
      }
      console.log('Contacts fetched:', data?.length);
      setContacts(data || []);
    } catch (err) {
      console.error('Fetch contacts error:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar contatos');
    } finally {
      setLoading(false);
    }
  };

  const createContact = async (contactData: Omit<Contact, 'data_criacao' | 'created_at' | 'updated_at'>) => {
    try {
      console.log('Creating contact:', contactData);
      
      // Garantir que id_contact está presente
      if (!contactData.id_contact) {
        throw new Error('ID do contato é obrigatório');
      }

      // Tratar company_id vazio
      const processedData = {
        ...contactData,
        company_id: contactData.company_id && contactData.company_id.trim() !== '' ? contactData.company_id : null
      };

      const { data, error } = await supabase
        .from('contacts')
        .insert([processedData])
        .select()
        .single();

      if (error) {
        console.error('Error creating contact:', error);
        throw error;
      }
      
      console.log('Contact created:', data);
      await fetchContacts();
      return data;
    } catch (err) {
      console.error('Create contact error:', err);
      throw new Error(err instanceof Error ? err.message : 'Erro ao criar contato');
    }
  };

  const updateContact = async (id: string, contactData: Partial<Contact>) => {
    try {
      console.log('Updating contact:', id, contactData);
      
      // Tratar company_id vazio e remover campos automáticos
      const { updated_at, created_at, ...dataToUpdate } = contactData;
      const processedData = {
        ...dataToUpdate,
        company_id: contactData.company_id && contactData.company_id.trim() !== '' ? contactData.company_id : null
      };

      const { data, error } = await supabase
        .from('contacts')
        .update(processedData)
        .eq('id_contact', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating contact:', error);
        throw error;
      }
      
      console.log('Contact updated:', data);
      await fetchContacts();
      return data;
    } catch (err) {
      console.error('Update contact error:', err);
      throw new Error(err instanceof Error ? err.message : 'Erro ao atualizar contato');
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
    if (selectedCompanyIds.length === 0 && !isAdmin) return;
    fetchContacts();

    const channelId = `contacts-changes-${crypto.randomUUID()}`;
    const channel = supabase
      .channel(channelId)
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
  }, [selectedCompanyIds, isAdmin]);

  return { 
    contacts, 
    loading, 
    error, 
    refetch: fetchContacts,
    createContact,
    updateContact,
    deleteContact
  };
};
