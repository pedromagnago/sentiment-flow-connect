import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Contact } from './useContacts';

export const useUnclassifiedContacts = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [messageCount, setMessageCount] = useState<Record<string, number>>({});

  const fetchUnclassifiedContacts = async () => {
    try {
      setLoading(true);
      
      // LOG 1: Verificar sessão
      const { data: session } = await supabase.auth.getSession();
      console.log('🔐 Sessão atual:', session?.session?.user?.id);
      
      // LOG 2: Query com detalhes
      console.log('🔍 Buscando contatos com company_id NULL...');
      
      // Buscar contatos sem company_id
      const { data, error: fetchError } = await supabase
        .from('contacts')
        .select('*')
        .is('company_id', null)
        .order('created_at', { ascending: false });

      // LOG 3: Resultado
      console.log('✅ Contatos encontrados:', data?.length);
      console.log('📋 Primeiros 5:', data?.slice(0, 5));

      if (fetchError) {
        console.error('❌ Erro RLS ou permissão:', fetchError);
        throw fetchError;
      }

      console.log('Unclassified contacts:', data?.length);
      setContacts(data || []);

      // Buscar contagem de mensagens para cada contato
      if (data && data.length > 0) {
        const contactIds = data.map(c => c.id_contact);
        const { data: messageCounts, error: countError } = await supabase
          .from('messages')
          .select('contact_id')
          .in('contact_id', contactIds);

        if (!countError && messageCounts) {
          const counts: Record<string, number> = {};
          messageCounts.forEach(msg => {
            counts[msg.contact_id] = (counts[msg.contact_id] || 0) + 1;
          });
          setMessageCount(counts);
        }
      }
    } catch (err) {
      console.error('Fetch unclassified contacts error:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar contatos');
    } finally {
      setLoading(false);
    }
  };

  const classifyContact = async (contactId: string, companyId: string, newName?: string) => {
    try {
      const updateData: any = { company_id: companyId };
      if (newName) {
        updateData.nome = newName;
      }

      const { error } = await supabase
        .from('contacts')
        .update(updateData)
        .eq('id_contact', contactId);

      if (error) {
        console.error('Error classifying contact:', error);
        throw error;
      }

      console.log('Contact classified successfully:', contactId);
      await fetchUnclassifiedContacts();
    } catch (err) {
      console.error('Classify contact error:', err);
      throw new Error(err instanceof Error ? err.message : 'Erro ao classificar contato');
    }
  };

  const bulkClassify = async (contactIds: string[], companyId: string) => {
    try {
      const { error } = await supabase
        .from('contacts')
        .update({ company_id: companyId })
        .in('id_contact', contactIds);

      if (error) {
        console.error('Error bulk classifying contacts:', error);
        throw error;
      }

      console.log('Contacts classified successfully:', contactIds.length);
      await fetchUnclassifiedContacts();
    } catch (err) {
      console.error('Bulk classify error:', err);
      throw new Error(err instanceof Error ? err.message : 'Erro ao classificar contatos');
    }
  };

  useEffect(() => {
    fetchUnclassifiedContacts();

    const channelId = `unclassified-contacts-${crypto.randomUUID()}`;
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
          console.log('Contacts changed:', payload);
          fetchUnclassifiedContacts();
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
    messageCount,
    refetch: fetchUnclassifiedContacts,
    classifyContact,
    bulkClassify
  };
};
