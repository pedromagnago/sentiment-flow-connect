import { useState, useMemo } from 'react';
import { Contact } from './useContacts';

export interface UnclassifiedFilters {
  search: string;
  type: 'all' | 'groups' | 'individuals';
  messageRange: 'all' | '0' | '1-5' | '6-20' | '21-50' | '50+';
  period: 'today' | '7d' | '30d' | 'all';
  sortBy: 'messages_desc' | 'messages_asc' | 'name_asc' | 'name_desc' | 'recent' | 'oldest';
}

export const useUnclassifiedFilters = (
  contacts: Contact[],
  messageCount: Record<string, number>
) => {
  const [filters, setFilters] = useState<UnclassifiedFilters>({
    search: '',
    type: 'all',
    messageRange: 'all',
    period: 'all',
    sortBy: 'messages_desc'
  });

  const updateFilter = <K extends keyof UnclassifiedFilters>(
    key: K,
    value: UnclassifiedFilters[K]
  ) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      type: 'all',
      messageRange: 'all',
      period: 'all',
      sortBy: 'messages_desc'
    });
  };

  const filteredContacts = useMemo(() => {
    let result = [...contacts];

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(
        contact =>
          contact.nome?.toLowerCase().includes(searchLower) ||
          contact.id_contact?.toLowerCase().includes(searchLower)
      );
    }

    // Type filter
    if (filters.type === 'groups') {
      result = result.filter(c => c.is_group);
    } else if (filters.type === 'individuals') {
      result = result.filter(c => !c.is_group);
    }

    // Message range filter
    if (filters.messageRange !== 'all') {
      result = result.filter(contact => {
        const count = messageCount[contact.id_contact] || 0;
        switch (filters.messageRange) {
          case '0':
            return count === 0;
          case '1-5':
            return count >= 1 && count <= 5;
          case '6-20':
            return count >= 6 && count <= 20;
          case '21-50':
            return count >= 21 && count <= 50;
          case '50+':
            return count > 50;
          default:
            return true;
        }
      });
    }

    // Period filter
    if (filters.period !== 'all') {
      const now = new Date();
      result = result.filter(contact => {
        if (!contact.created_at) return false;
        const createdAt = new Date(contact.created_at);
        const diffDays = Math.floor(
          (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24)
        );

        switch (filters.period) {
          case 'today':
            return diffDays === 0;
          case '7d':
            return diffDays <= 7;
          case '30d':
            return diffDays <= 30;
          default:
            return true;
        }
      });
    }

    // Sorting
    result.sort((a, b) => {
      const countA = messageCount[a.id_contact] || 0;
      const countB = messageCount[b.id_contact] || 0;

      switch (filters.sortBy) {
        case 'messages_desc':
          return countB - countA;
        case 'messages_asc':
          return countA - countB;
        case 'name_asc':
          return (a.nome || '').localeCompare(b.nome || '');
        case 'name_desc':
          return (b.nome || '').localeCompare(a.nome || '');
        case 'recent':
          return (
            new Date(b.created_at || 0).getTime() -
            new Date(a.created_at || 0).getTime()
          );
        case 'oldest':
          return (
            new Date(a.created_at || 0).getTime() -
            new Date(b.created_at || 0).getTime()
          );
        default:
          return 0;
      }
    });

    return result;
  }, [contacts, messageCount, filters]);

  return {
    filters,
    updateFilter,
    resetFilters,
    filteredContacts,
    activeFiltersCount: Object.values(filters).filter(
      (v, i) => i > 0 && v !== 'all' && v !== 'messages_desc'
    ).length
  };
};
