
import { useContacts } from './useContacts';
import { useAuditLog } from './useAuditLog';
import { Contact } from './useContacts';

export const useContactsWithAudit = () => {
  const contactsHook = useContacts();
  const { logAction } = useAuditLog();

  const createContact = async (contactData: Omit<Contact, 'data_criacao'>) => {
    try {
      const result = await contactsHook.createContact(contactData);
      
      await logAction({
        action: 'CREATE',
        tableName: 'contacts',
        recordId: result.id_contact,
        newData: result
      });

      return result;
    } catch (error) {
      console.error('Error creating contact with audit:', error);
      throw error;
    }
  };

  const updateContact = async (id: string, updates: Partial<Contact>) => {
    try {
      // Buscar dados antigos antes da atualização
      const oldContact = contactsHook.contacts.find(c => c.id_contact === id);
      
      const result = await contactsHook.updateContact(id, updates);
      
      await logAction({
        action: 'UPDATE',
        tableName: 'contacts',
        recordId: id,
        oldData: oldContact,
        newData: result
      });

      return result;
    } catch (error) {
      console.error('Error updating contact with audit:', error);
      throw error;
    }
  };

  const deleteContact = async (id: string) => {
    try {
      // Buscar dados antes da exclusão
      const contact = contactsHook.contacts.find(c => c.id_contact === id);
      
      await contactsHook.deleteContact(id);
      
      await logAction({
        action: 'DELETE',
        tableName: 'contacts',
        recordId: id,
        oldData: contact
      });
    } catch (error) {
      console.error('Error deleting contact with audit:', error);
      throw error;
    }
  };

  return {
    ...contactsHook,
    createContact,
    updateContact,
    deleteContact
  };
};
