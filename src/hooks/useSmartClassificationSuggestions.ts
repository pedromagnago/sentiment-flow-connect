import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ClassificationSuggestion {
  pattern: string;
  suggestedCompanyId: string;
  suggestedCompanyName: string;
  matchingContacts: {
    id_contact: string;
    nome: string;
    is_group: boolean;
    messageCount: number;
  }[];
  confidence: 'high' | 'medium' | 'low';
}

interface Company {
  id: string;
  nome: string;
}

export function useSmartClassificationSuggestions() {
  const [suggestions, setSuggestions] = useState<ClassificationSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [unclassifiedContacts, setUnclassifiedContacts] = useState<any[]>([]);
  const [messageCountMap, setMessageCountMap] = useState<Record<string, number>>({});

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch companies and unclassified contacts in parallel
      const [companiesRes, contactsRes] = await Promise.all([
        supabase.from('companies').select('id, nome').not('nome', 'is', null),
        supabase.from('contacts').select('id_contact, nome, is_group').is('company_id', null)
      ]);

      if (companiesRes.error) throw companiesRes.error;
      if (contactsRes.error) throw contactsRes.error;

      const companiesList = (companiesRes.data || []).filter(c => c.nome);
      const contactsList = contactsRes.data || [];

      setCompanies(companiesList);
      setUnclassifiedContacts(contactsList);

      // Fetch message counts
      const contactIds = contactsList.map(c => c.id_contact);
      if (contactIds.length > 0) {
        const { data: messagesData } = await supabase
          .from('messages')
          .select('contact_id')
          .in('contact_id', contactIds);

        const countMap: Record<string, number> = {};
        (messagesData || []).forEach(msg => {
          countMap[msg.contact_id] = (countMap[msg.contact_id] || 0) + 1;
        });
        setMessageCountMap(countMap);
      }

    } catch (err: any) {
      console.error('Error fetching classification data:', err);
      setError(err.message || 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  // Generate suggestions based on patterns
  const generatedSuggestions = useMemo(() => {
    if (!companies.length || !unclassifiedContacts.length) return [];

    const suggestions: ClassificationSuggestion[] = [];
    const usedContacts = new Set<string>();

    // Common patterns to look for
    const patterns = [
      { regex: /FullBPO\s*\|\s*(.+)/i, extractCompany: (m: RegExpMatchArray) => m[1].trim() },
      { regex: /\[(.+?)\]/i, extractCompany: (m: RegExpMatchArray) => m[1].trim() },
      { regex: /^(.+?)\s*-\s*/i, extractCompany: (m: RegExpMatchArray) => m[1].trim() },
    ];

    // Group contacts by pattern matches
    const patternGroups = new Map<string, { contacts: any[], companyName: string }>();

    unclassifiedContacts.forEach(contact => {
      if (!contact.nome || usedContacts.has(contact.id_contact)) return;

      for (const pattern of patterns) {
        const match = contact.nome.match(pattern.regex);
        if (match) {
          const extractedName = pattern.extractCompany(match);
          const key = extractedName.toLowerCase();
          
          if (!patternGroups.has(key)) {
            patternGroups.set(key, { contacts: [], companyName: extractedName });
          }
          patternGroups.get(key)!.contacts.push(contact);
          usedContacts.add(contact.id_contact);
          break;
        }
      }
    });

    // Match patterns to companies
    patternGroups.forEach((group, key) => {
      // Find matching company
      const matchingCompany = companies.find(c => {
        const companyName = c.nome?.toLowerCase() || '';
        return companyName.includes(key) || key.includes(companyName.split(' ')[0]?.toLowerCase() || '');
      });

      if (matchingCompany) {
        suggestions.push({
          pattern: group.companyName,
          suggestedCompanyId: matchingCompany.id,
          suggestedCompanyName: matchingCompany.nome || '',
          matchingContacts: group.contacts.map(c => ({
            id_contact: c.id_contact,
            nome: c.nome || 'Sem nome',
            is_group: c.is_group || false,
            messageCount: messageCountMap[c.id_contact] || 0
          })),
          confidence: group.contacts.length >= 3 ? 'high' : group.contacts.length >= 2 ? 'medium' : 'low'
        });
      }
    });

    // Sort by number of matching contacts
    return suggestions.sort((a, b) => b.matchingContacts.length - a.matchingContacts.length);
  }, [companies, unclassifiedContacts, messageCountMap]);

  const applyClassification = async (suggestion: ClassificationSuggestion) => {
    try {
      const contactIds = suggestion.matchingContacts.map(c => c.id_contact);
      
      const { error } = await supabase
        .from('contacts')
        .update({ company_id: suggestion.suggestedCompanyId })
        .in('id_contact', contactIds);

      if (error) throw error;

      // Refresh data
      await fetchData();
      return { success: true, count: contactIds.length };
    } catch (err: any) {
      console.error('Error applying classification:', err);
      return { success: false, error: err.message };
    }
  };

  const applyAllSuggestions = async () => {
    try {
      let totalClassified = 0;
      
      for (const suggestion of generatedSuggestions) {
        const result = await applyClassification(suggestion);
        if (result.success) {
          totalClassified += result.count || 0;
        }
      }

      await fetchData();
      return { success: true, count: totalClassified };
    } catch (err: any) {
      console.error('Error applying all suggestions:', err);
      return { success: false, error: err.message };
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return {
    suggestions: generatedSuggestions,
    loading,
    error,
    refetch: fetchData,
    applyClassification,
    applyAllSuggestions,
    companies,
    unclassifiedCount: unclassifiedContacts.length
  };
}
