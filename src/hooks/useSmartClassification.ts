import { useMemo } from 'react';
import { Contact } from './useContacts';
import { Company } from './useCompanies';

export interface ClassificationSuggestion {
  companyId: string;
  companyName: string;
  confidence: 'high' | 'medium' | 'low';
  reason: string;
}

export const useSmartClassification = (
  contacts: Contact[],
  companies: Company[]
) => {
  const suggestions = useMemo(() => {
    const result: Record<string, ClassificationSuggestion> = {};

    contacts.forEach(contact => {
      const suggestion = suggestCompany(contact, companies);
      if (suggestion) {
        result[contact.id_contact] = suggestion;
      }
    });

    return result;
  }, [contacts, companies]);

  return { suggestions };
};

const suggestCompany = (
  contact: Contact,
  companies: Company[]
): ClassificationSuggestion | null => {
  if (!contact.nome) return null;

  // Extrair palavras do nome do contato
  const contactWords = contact.nome
    .split(/[\|\-,;\/\\()[\]{}]/)
    .map(w => w.trim().toLowerCase())
    .filter(w => w.length > 3);

  // Procurar matches nas empresas
  for (const company of companies) {
    if (!company.nome) continue;

    const companyName = company.nome.toLowerCase();
    const companyWords = company.nome
      .split(/[\s\|\-,;\/\\()[\]{}]/)
      .map(w => w.trim().toLowerCase())
      .filter(w => w.length > 3);

    // Check for exact matches in company name
    for (const word of contactWords) {
      if (companyName.includes(word)) {
        // Determine confidence based on word length and position
        let confidence: 'high' | 'medium' | 'low';
        if (word.length >= 8 || companyName.startsWith(word)) {
          confidence = 'high';
        } else if (word.length >= 5) {
          confidence = 'medium';
        } else {
          confidence = 'low';
        }

        return {
          companyId: company.id,
          companyName: company.nome,
          confidence,
          reason: `Nome contém "${word}"`
        };
      }
    }

    // Check for exact word matches
    for (const contactWord of contactWords) {
      if (companyWords.includes(contactWord)) {
        return {
          companyId: company.id,
          companyName: company.nome,
          confidence: 'medium',
          reason: `Palavra-chave: "${contactWord}"`
        };
      }
    }

    // Check CNPJ if available
    if (company.cnpj && contact.nome.includes(company.cnpj.replace(/\D/g, ''))) {
      return {
        companyId: company.id,
        companyName: company.nome,
        confidence: 'high',
        reason: 'CNPJ encontrado'
      };
    }
  }

  return null;
};
