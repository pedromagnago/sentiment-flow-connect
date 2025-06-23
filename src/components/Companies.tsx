
import React, { useState } from 'react';
import { useCompaniesWithAudit } from '@/hooks/useCompaniesWithAudit';
import { CompanyModal } from './CompanyModal';
import { CompanyHeader } from './companies/CompanyHeader';
import { CompanyFilters } from './companies/CompanyFilters';
import { CompanyStats } from './companies/CompanyStats';
import { CompanyList } from './companies/CompanyList';
import { BulkOperations } from './companies/BulkOperations';
import { LoadingSpinner } from './common/LoadingSpinner';
import { ErrorState } from './common/ErrorState';
import { Breadcrumb } from './common/Breadcrumb';
import { PaginationControls } from './common/Pagination';
import { useBulkOperations } from '@/hooks/useBulkOperations';
import { useCompanyHandlers } from '@/hooks/handlers/useCompanyHandlers';
import { usePagination } from '@/hooks/usePagination';

export const Companies = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('Todas');
  const [showBulkOperations, setShowBulkOperations] = useState(false);
  const { companies, loading, error, createCompany, updateCompany, deleteCompany, refetch } = useCompaniesWithAudit();
  const bulkOps = useBulkOperations();

  // Debug logs
  console.log('Companies component - companies:', companies);
  console.log('Companies component - loading:', loading);
  console.log('Companies component - error:', error);

  const handlers = useCompanyHandlers({
    createCompany,
    updateCompany,
    deleteCompany,
    refetch
  });

  const filteredCompanies = companies.filter(company => {
    const matchesSearch = company.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         company.cnpj?.includes(searchTerm) ||
                         company.segmento?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'Todas' || company.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const pagination = usePagination({
    data: filteredCompanies,
    itemsPerPage: 10
  });

  // Reset pagination when filters change
  React.useEffect(() => {
    pagination.resetPagination();
  }, [searchTerm, filterStatus]);

  const handleBulkCreate = async (companiesData: any[]) => {
    try {
      const results = [];
      const errors = [];
      
      for (let i = 0; i < companiesData.length; i++) {
        try {
          const result = await createCompany(companiesData[i]);
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

  const handleBulkDelete = async (companyIds: string[]) => {
    try {
      for (const id of companyIds) {
        await deleteCompany(id);
      }
      bulkOps.clearSelection();
    } catch (error) {
      throw error;
    }
  };

  const breadcrumbItems = [
    { label: 'Gestão de Empresas', active: true }
  ];

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <LoadingSpinner message="Carregando empresas..." />
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

      <CompanyHeader 
        onRefresh={handlers.handleRefresh}
        onAddNew={handlers.openCreateModal}
        refreshing={handlers.refreshing}
        onToggleBulkOperations={() => setShowBulkOperations(!showBulkOperations)}
        showBulkOperations={showBulkOperations}
      />

      <CompanyFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        filterStatus={filterStatus}
        onStatusChange={setFilterStatus}
      />

      <CompanyStats companies={filteredCompanies} />

      {showBulkOperations && (
        <BulkOperations
          companies={filteredCompanies}
          onBulkCreate={handleBulkCreate}
          onBulkDelete={handleBulkDelete}
        />
      )}

      <CompanyList
        companies={pagination.paginatedData}
        hasSearch={!!searchTerm}
        onEdit={handlers.openEditModal}
        onDelete={handlers.handleDeleteCompany}
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

      <CompanyModal
        isOpen={handlers.isModalOpen}
        onClose={handlers.closeModal}
        onSave={handlers.editingCompany ? handlers.handleEditCompany : handlers.handleCreateCompany}
        company={handlers.editingCompany}
      />
    </div>
  );
};
