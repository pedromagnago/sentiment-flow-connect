import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Message {
  id: string;
  conteudo_mensagem: string;
  data_hora: string;
  fromme: boolean;
  tipo_mensagem: string;
  link_arquivo?: string;
}

export const useRecentMessages = (contactId: string | null, limit: number = 3) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!contactId) {
      setMessages([]);
      return;
    }

    const fetchMessages = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('messages')
          .select('id, conteudo_mensagem, data_hora, fromme, tipo_mensagem, link_arquivo')
          .eq('contact_id', contactId)
          .order('data_hora', { ascending: false })
          .limit(limit);

        if (error) throw error;
        setMessages(data || []);
      } catch (error) {
        console.error('Error fetching recent messages:', error);
        setMessages([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [contactId, limit]);

  return { messages, loading };
};
