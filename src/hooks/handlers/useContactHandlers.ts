
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Contact } from '@/hooks/useContacts';

interface UseContactHandlersProps {
  createContact: (data: Omit<Contact, 'data_criacao'>) => Promise<Contact>;
  updateContact: (id: string, data: Partial<Contact>) => Promise<Contact>;
  deleteContact: (id: string) => Promise<void>;
  refetch: () => Promise<void>;
}

export const useContactHandlers = ({
  createContact,
  updateContact,
  deleteContact,
  refetch
}: UseContactHandlersProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();

  const handleCreateContact = async (contactData: Omit<Contact, 'data_criacao'>) => {
    try {
      await createContact(contactData);
      setIsModalOpen(false);
      toast({
        title: "Contato criado",
        description: "O contato foi criado com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    }
  };

  const handleEditContact = async (contactData: Partial<Contact>) => {
    if (!editingContact) return;
    
    try {
      await updateContact(editingContact.id_contact, contactData);
      setIsModalOpen(false);
      setEditingContact(null);
      toast({
        title: "Contato atualizado",
        description: "O contato foi atualizado com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    }
  };

  const handleDeleteContact = async (contact: Contact) => {
    if (window.confirm(`Tem certeza que deseja excluir o contato "${contact.nome}"? Esta ação não pode ser desfeita.`)) {
      try {
        await deleteContact(contact.id_contact);
        toast({
          title: "Contato excluído",
          description: "O contato foi excluído com sucesso.",
        });
      } catch (error) {
        toast({
          title: "Erro",
          description: error instanceof Error ? error.message : "Erro desconhecido",
          variant: "destructive",
        });
      }
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
      toast({
        title: "Dados atualizados",
        description: "A lista de contatos foi atualizada com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar a lista de contatos.",
        variant: "destructive",
      });
    } finally {
      setRefreshing(false);
    }
  };

  const openCreateModal = () => {
    setEditingContact(null);
    setIsModalOpen(true);
  };

  const openEditModal = (contact: Contact) => {
    setEditingContact(contact);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingContact(null);
  };

  return {
    isModalOpen,
    editingContact,
    refreshing,
    handleCreateContact,
    handleEditContact,
    handleDeleteContact,
    handleRefresh,
    openCreateModal,
    openEditModal,
    closeModal
  };
};
