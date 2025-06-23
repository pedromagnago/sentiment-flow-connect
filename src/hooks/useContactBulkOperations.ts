
import { useState } from 'react';
import { Contact } from '@/hooks/useContacts';

export const useContactBulkOperations = () => {
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);

  const selectContact = (contactId: string) => {
    setSelectedContacts(prev => 
      prev.includes(contactId) 
        ? prev.filter(id => id !== contactId)
        : [...prev, contactId]
    );
  };

  const selectAllContacts = (contactIds: string[]) => {
    if (selectedContacts.length === contactIds.length) {
      setSelectedContacts([]);
    } else {
      setSelectedContacts(contactIds);
    }
  };

  const clearSelection = () => {
    setSelectedContacts([]);
  };

  const isSelected = (contactId: string) => {
    return selectedContacts.includes(contactId);
  };

  const getSelectedCount = () => {
    return selectedContacts.length;
  };

  const bulkUpdateStatus = async (contactIds: string[], status: boolean, updateContact: (id: string, data: Partial<Contact>) => Promise<Contact>) => {
    try {
      for (const id of contactIds) {
        await updateContact(id, { status });
      }
    } catch (error) {
      throw error;
    }
  };

  const bulkUpdateFeedback = async (contactIds: string[], feedback: boolean, updateContact: (id: string, data: Partial<Contact>) => Promise<Contact>) => {
    try {
      for (const id of contactIds) {
        await updateContact(id, { feedback });
      }
    } catch (error) {
      throw error;
    }
  };

  const bulkUpdateIsGroup = async (contactIds: string[], is_group: boolean, updateContact: (id: string, data: Partial<Contact>) => Promise<Contact>) => {
    try {
      for (const id of contactIds) {
        await updateContact(id, { is_group });
      }
    } catch (error) {
      throw error;
    }
  };

  return {
    selectedContacts,
    selectContact,
    selectAllContacts,
    clearSelection,
    isSelected,
    getSelectedCount,
    bulkUpdateStatus,
    bulkUpdateFeedback,
    bulkUpdateIsGroup
  };
};
