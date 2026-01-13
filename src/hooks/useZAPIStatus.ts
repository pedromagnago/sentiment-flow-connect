import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ZAPIStats {
  totalMessages: number;
  messagesLast24h: number;
  messagesLast7d: number;
  messagesLast30d: number;
  totalContacts: number;
  classifiedContacts: number;
  unclassifiedContacts: number;
  groups: number;
  individuals: number;
  messagesByDay: { date: string; count: number }[];
  recentMessages: {
    id: string;
    conteudo_mensagem: string;
    nome_membro: string;
    data_hora: string;
    contact_id: string;
    contact_nome: string;
    is_group: boolean;
    company_nome: string | null;
    fromme: boolean;
    tipo_mensagem: string | null;
  }[];
}

export function useZAPIStatus() {
  const [stats, setStats] = useState<ZAPIStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);

      const now = new Date();
      const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
      const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const last30d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();

      // Fetch all stats in parallel
      const [
        totalMessagesRes,
        messages24hRes,
        messages7dRes,
        messages30dRes,
        contactsRes,
        messagesByDayRes,
        recentMessagesRes
      ] = await Promise.all([
        supabase.from('messages').select('id', { count: 'exact', head: true }),
        supabase.from('messages').select('id', { count: 'exact', head: true }).gte('created_at', last24h),
        supabase.from('messages').select('id', { count: 'exact', head: true }).gte('created_at', last7d),
        supabase.from('messages').select('id', { count: 'exact', head: true }).gte('created_at', last30d),
        supabase.from('contacts').select('id_contact, company_id, is_group'),
        supabase.from('messages')
          .select('created_at')
          .gte('created_at', last30d)
          .order('created_at', { ascending: true }),
        supabase.from('messages')
          .select(`
            id,
            conteudo_mensagem,
            nome_membro,
            data_hora,
            contact_id,
            fromme,
            tipo_mensagem,
            contacts!inner(nome, is_group, company_id, companies(nome))
          `)
          .order('created_at', { ascending: false })
          .limit(50)
      ]);

      if (totalMessagesRes.error) throw totalMessagesRes.error;
      if (contactsRes.error) throw contactsRes.error;
      if (messagesByDayRes.error) throw messagesByDayRes.error;
      if (recentMessagesRes.error) throw recentMessagesRes.error;

      const contacts = contactsRes.data || [];
      const classifiedContacts = contacts.filter(c => c.company_id !== null);
      const unclassifiedContacts = contacts.filter(c => c.company_id === null);
      const groups = contacts.filter(c => c.is_group === true);
      const individuals = contacts.filter(c => c.is_group !== true);

      // Process messages by day
      const messagesByDayMap = new Map<string, number>();
      (messagesByDayRes.data || []).forEach((msg) => {
        const date = new Date(msg.created_at).toISOString().split('T')[0];
        messagesByDayMap.set(date, (messagesByDayMap.get(date) || 0) + 1);
      });
      
      const messagesByDay = Array.from(messagesByDayMap.entries())
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => a.date.localeCompare(b.date));

      // Process recent messages
      const recentMessages = (recentMessagesRes.data || []).map((msg: any) => ({
        id: msg.id,
        conteudo_mensagem: msg.conteudo_mensagem || '',
        nome_membro: msg.nome_membro || 'Desconhecido',
        data_hora: msg.data_hora || msg.created_at,
        contact_id: msg.contact_id,
        contact_nome: msg.contacts?.nome || 'Contato sem nome',
        is_group: msg.contacts?.is_group || false,
        company_nome: msg.contacts?.companies?.nome || null,
        fromme: msg.fromme || false,
        tipo_mensagem: msg.tipo_mensagem
      }));

      setStats({
        totalMessages: totalMessagesRes.count || 0,
        messagesLast24h: messages24hRes.count || 0,
        messagesLast7d: messages7dRes.count || 0,
        messagesLast30d: messages30dRes.count || 0,
        totalContacts: contacts.length,
        classifiedContacts: classifiedContacts.length,
        unclassifiedContacts: unclassifiedContacts.length,
        groups: groups.length,
        individuals: individuals.length,
        messagesByDay,
        recentMessages
      });
    } catch (err: any) {
      console.error('Error fetching ZAPI stats:', err);
      setError(err.message || 'Erro ao carregar estatísticas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('zapi-status')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, () => {
        fetchStats();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { stats, loading, error, refetch: fetchStats };
}
