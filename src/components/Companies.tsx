
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
import { PaginationControls } from './common/Pagination';
import { useBulkOperations } from '@/hooks/useBulkOperations';
import { useCompanyHandlers } from '@/hooks/handlers/useCompanyHandlers';
import { usePagination } from '@/hooks/usePagination';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb';
import { Home } from 'lucide-react';

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
      
      console.log('🚀 Iniciando importação em lote de', companiesData.length, 'empresas');
      console.log('📋 Primeiro item de dados:', companiesData[0]);
      
      for (let i = 0; i < companiesData.length; i++) {
        try {
          console.log(`📝 Criando empresa ${i + 1}/${companiesData.length}:`, companiesData[i]?.nome || companiesData[i]?.task_name);
          const result = await createCompany(companiesData[i]);
          results.push(result);
          console.log(`✅ Empresa ${i + 1} criada com sucesso:`, result?.nome);
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : 'Erro desconhecido';
          console.error(`❌ Erro na empresa ${i + 1}:`, errorMsg);
          console.error('📋 Dados da empresa que falhou:', companiesData[i]);
          errors.push({ 
            index: i + 1, 
            company: companiesData[i]?.nome || companiesData[i]?.task_name || `Empresa ${i + 1}`,
            error: errorMsg 
          });
        }
      }

      console.log(`📊 Resultado final: ${results.length} sucessos, ${errors.length} erros`);

      if (errors.length > 0) {
        console.error('🚨 Detalhes dos erros:', errors);
        throw new Error(`Falha na importação: ${errors.length} empresas falharam. Primeiros erros: ${errors.slice(0, 3).map(e => `${e.company}: ${e.error}`).join('; ')}`);
      }
    } catch (error) {
      console.error('💥 Erro geral na importação:', error);
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
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <Home className="w-4 h-4" />
          </BreadcrumbItem>
          <BreadcrumbItem>
            <BreadcrumbPage>Gestão de Empresas</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

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
