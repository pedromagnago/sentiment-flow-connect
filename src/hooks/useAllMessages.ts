import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface MessageWithContact {
  id: string;
  conteudo_mensagem: string;
  nome_membro: string;
  data_hora: string;
  created_at: string;
  contact_id: string;
  contact_nome: string;
  is_group: boolean;
  company_id: string | null;
  company_nome: string | null;
  fromme: boolean;
  tipo_mensagem: string | null;
  link_arquivo: string | null;
}

export interface MessageFilters {
  search: string;
  period: 'today' | '7d' | '30d' | 'all' | 'custom';
  customStart?: string;
  customEnd?: string;
  type: 'all' | 'text' | 'image' | 'document' | 'audio' | 'video';
  classification: 'all' | 'classified' | 'unclassified';
  companyId: string | null;
  direction: 'all' | 'received' | 'sent';
}

const DEFAULT_FILTERS: MessageFilters = {
  search: '',
  period: '7d',
  type: 'all',
  classification: 'all',
  companyId: null,
  direction: 'all'
};

export function useAllMessages(pageSize = 50) {
  const [messages, setMessages] = useState<MessageWithContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<MessageFilters>(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const fetchMessages = async (resetPage = false) => {
    try {
      setLoading(true);
      setError(null);

      const currentPage = resetPage ? 1 : page;
      if (resetPage) setPage(1);

      // Build date filter
      let dateFilter: string | null = null;
      const now = new Date();
      
      switch (filters.period) {
        case 'today':
          dateFilter = new Date(now.setHours(0, 0, 0, 0)).toISOString();
          break;
        case '7d':
          dateFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
          break;
        case '30d':
          dateFilter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
          break;
        case 'custom':
          if (filters.customStart) {
            dateFilter = new Date(filters.customStart).toISOString();
          }
          break;
      }

      // Build query
      let query = supabase
        .from('messages')
        .select(`
          id,
          conteudo_mensagem,
          nome_membro,
          data_hora,
          created_at,
          contact_id,
          fromme,
          tipo_mensagem,
          link_arquivo,
          contacts!inner(nome, is_group, company_id, companies(nome))
        `, { count: 'exact' })
        .order('created_at', { ascending: false })
        .range((currentPage - 1) * pageSize, currentPage * pageSize - 1);

      // Apply date filter
      if (dateFilter) {
        query = query.gte('created_at', dateFilter);
      }
      if (filters.period === 'custom' && filters.customEnd) {
        query = query.lte('created_at', new Date(filters.customEnd).toISOString());
      }

      // Apply search filter
      if (filters.search) {
        query = query.ilike('conteudo_mensagem', `%${filters.search}%`);
      }

      // Apply type filter
      if (filters.type !== 'all') {
        query = query.eq('tipo_mensagem', filters.type);
      }

      // Apply direction filter
      if (filters.direction === 'received') {
        query = query.eq('fromme', false);
      } else if (filters.direction === 'sent') {
        query = query.eq('fromme', true);
      }

      const { data, error: queryError, count } = await query;

      if (queryError) throw queryError;

      // Process and filter client-side for classification and company
      let processedMessages: MessageWithContact[] = (data || []).map((msg: any) => ({
        id: msg.id,
        conteudo_mensagem: msg.conteudo_mensagem || '',
        nome_membro: msg.nome_membro || 'Desconhecido',
        data_hora: msg.data_hora || msg.created_at,
        created_at: msg.created_at,
        contact_id: msg.contact_id,
        contact_nome: msg.contacts?.nome || 'Contato sem nome',
        is_group: msg.contacts?.is_group || false,
        company_id: msg.contacts?.company_id || null,
        company_nome: msg.contacts?.companies?.nome || null,
        fromme: msg.fromme || false,
        tipo_mensagem: msg.tipo_mensagem,
        link_arquivo: msg.link_arquivo
      }));

      // Apply classification filter
      if (filters.classification === 'classified') {
        processedMessages = processedMessages.filter(m => m.company_id !== null);
      } else if (filters.classification === 'unclassified') {
        processedMessages = processedMessages.filter(m => m.company_id === null);
      }

      // Apply company filter
      if (filters.companyId) {
        processedMessages = processedMessages.filter(m => m.company_id === filters.companyId);
      }

      setMessages(processedMessages);
      setTotalCount(count || 0);
      setHasMore(processedMessages.length === pageSize);
    } catch (err: any) {
      console.error('Error fetching messages:', err);
      setError(err.message || 'Erro ao carregar mensagens');
    } finally {
      setLoading(false);
    }
  };

  const updateFilter = <K extends keyof MessageFilters>(key: K, value: MessageFilters[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS);
  };

  useEffect(() => {
    fetchMessages(true);
  }, [filters]);

  useEffect(() => {
    if (page > 1) {
      fetchMessages();
    }
  }, [page]);

  const totalPages = Math.ceil(totalCount / pageSize);

  return {
    messages,
    loading,
    error,
    filters,
    updateFilter,
    resetFilters,
    page,
    setPage,
    totalPages,
    totalCount,
    hasMore,
    refetch: () => fetchMessages(true)
  };
}
