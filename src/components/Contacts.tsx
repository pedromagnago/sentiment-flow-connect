
import React, { useState } from 'react';
import { useContacts } from '@/hooks/useContacts';
import { ContactModal } from './ContactModal';
import { ContactHeader } from './contacts/ContactHeader';
import { ContactFilters } from './contacts/ContactFilters';
import { ContactTable } from './contacts/ContactTable';
import { ContactEmptyState } from './contacts/ContactEmptyState';
import { ContactBulkOperations } from './contacts/ContactBulkOperations';
import { LoadingSpinner } from './common/LoadingSpinner';
import { ErrorState } from './common/ErrorState';
import { Breadcrumb } from './common/Breadcrumb';
import { PaginationControls } from './common/Pagination';
import { useContactBulkOperations } from '@/hooks/useContactBulkOperations';
import { useContactHandlers } from '@/hooks/handlers/useContactHandlers';
import { usePagination } from '@/hooks/usePagination';

export const Contacts = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('Todos');
  const [filterType, setFilterType] = useState('Todos');
  const [filterFeedback, setFilterFeedback] = useState('Todos');
  const [showBulkOperations, setShowBulkOperations] = useState(false);
  const { contacts, loading, error, createContact, updateContact, deleteContact, refetch } = useContacts();
  const bulkOps = useContactBulkOperations();

  const handlers = useContactHandlers({
    createContact,
    updateContact,
    deleteContact,
    refetch
  });

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = contact.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contact.id_contact?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'Todos' || 
                         (filterStatus === 'Ativo' && contact.status) ||
                         (filterStatus === 'Inativo' && !contact.status);
    const matchesType = filterType === 'Todos' ||
                       (filterType === 'Grupo' && contact.is_group) ||
                       (filterType === 'Individual' && !contact.is_group);
    const matchesFeedback = filterFeedback === 'Todos' ||
                           (filterFeedback === 'Ativo' && contact.feedback) ||
                           (filterFeedback === 'Inativo' && !contact.feedback);
    return matchesSearch && matchesStatus && matchesType && matchesFeedback;
  });

  const pagination = usePagination({
    data: filteredContacts,
    itemsPerPage: 15
  });

  // Reset pagination when filters change
  React.useEffect(() => {
    pagination.resetPagination();
  }, [searchTerm, filterStatus, filterType, filterFeedback]);

  const handleBulkCreate = async (contactsData: any[]) => {
    try {
      const results = [];
      const errors = [];
      
      for (let i = 0; i < contactsData.length; i++) {
        try {
          const result = await createContact(contactsData[i]);
          results.push(result);
        } catch (error) {
          errors.push({ index: i + 1, error: error instanceof Error ? error.message : 'Erro desconhecido' });
        }
      }

      if (errors.length > 0) {
        console.warn('Erros na importação:', errors);
      }
    } catch (error) {
      throw error;
    }
  };

  const handleBulkDelete = async (contactIds: string[]) => {
    try {
      for (const id of contactIds) {
        await deleteContact(id);
      }
      bulkOps.clearSelection();
    } catch (error) {
      throw error;
    }
  };

  const breadcrumbItems = [
    { label: 'Contatos', active: true }
  ];

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <LoadingSpinner message="Carregando contatos..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 animate-fade-in">
        <ErrorState message={error} onRetry={refetch} />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <Breadcrumb items={breadcrumbItems} />

      <ContactHeader 
        onRefresh={handlers.handleRefresh}
        onAddNew={handlers.openCreateModal}
        refreshing={handlers.refreshing}
        onToggleBulkOperations={() => setShowBulkOperations(!showBulkOperations)}
        showBulkOperations={showBulkOperations}
      />

      <ContactFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        filterStatus={filterStatus}
        onStatusChange={setFilterStatus}
        filterType={filterType}
        onTypeChange={setFilterType}
        filterFeedback={filterFeedback}
        onFeedbackChange={setFilterFeedback}
      />

      {showBulkOperations && (
        <ContactBulkOperations
          contacts={filteredContacts}
          onBulkCreate={handleBulkCreate}
          onBulkDelete={handleBulkDelete}
        />
      )}

      {filteredContacts.length === 0 ? (
        <ContactEmptyState hasSearch={!!searchTerm} />
      ) : (
        <>
          <ContactTable
            contacts={pagination.paginatedData}
            onEdit={handlers.openEditModal}
            onDelete={handlers.handleDeleteContact}
          />
          
          <PaginationControls
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={pagination.goToPage}
            hasNext={pagination.hasNext}
            hasPrevious={pagination.hasPrevious}
            startIndex={pagination.startIndex}
            endIndex={pagination.endIndex}
            totalItems={pagination.totalItems}
          />
        </>
      )}

      <ContactModal
        isOpen={handlers.isModalOpen}
        onClose={handlers.closeModal}
        onSave={handlers.editingContact ? handlers.handleEditContact : handlers.handleCreateContact}
        contact={handlers.editingContact}
      />
    </div>
  );
};
