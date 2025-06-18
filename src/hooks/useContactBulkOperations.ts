
import { useState } from 'react';

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

  return {
    selectedContacts,
    selectContact,
    selectAllContacts,
    clearSelection,
    isSelected,
    getSelectedCount
  };
};
