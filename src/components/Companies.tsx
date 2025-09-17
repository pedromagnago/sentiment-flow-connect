
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
  const [filterN8n, setFilterN8n] = useState('Todos');
  const [filterFeedback, setFilterFeedback] = useState('Todos');
  const [showBulkOperations, setShowBulkOperations] = useState(false);
  const [bulkOperationLoading, setBulkOperationLoading] = useState(false);
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
    const matchesN8n = filterN8n === 'Todos' || 
                      (filterN8n === 'Ativo' && company.n8n_integration_active) ||
                      (filterN8n === 'Inativo' && !company.n8n_integration_active);
    const matchesFeedback = filterFeedback === 'Todos' || 
                           (filterFeedback === 'Ativo' && company.feedback_ativo) ||
                           (filterFeedback === 'Inativo' && !company.feedback_ativo);
    return matchesSearch && matchesStatus && matchesN8n && matchesFeedback;
  });

  const pagination = usePagination({
    data: filteredCompanies,
    itemsPerPage: 10
  });

  // Reset pagination when filters change
  React.useEffect(() => {
    pagination.resetPagination();
  }, [searchTerm, filterStatus, filterN8n, filterFeedback]);

  const handleBulkCreate = async (companiesData: any[]) => {
    setBulkOperationLoading(true);
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
    } finally {
      setBulkOperationLoading(false);
    }
  };

  const handleBulkDelete = async (companyIds: string[]) => {
    setBulkOperationLoading(true);
    try {
      for (const id of companyIds) {
        await deleteCompany(id);
      }
      bulkOps.clearSelection();
    } catch (error) {
      throw error;
    } finally {
      setBulkOperationLoading(false);
    }
  };

  const handleBulkUpdateStatus = async (companyIds: string[], status: string) => {
    setBulkOperationLoading(true);
    try {
      for (const id of companyIds) {
        await updateCompany(id, { status });
      }
    } catch (error) {
      throw error;
    } finally {
      setBulkOperationLoading(false);
    }
  };

  const handleBulkUpdateN8n = async (companyIds: string[], active: boolean) => {
    setBulkOperationLoading(true);
    try {
      for (const id of companyIds) {
        await updateCompany(id, { n8n_integration_active: active });
      }
    } catch (error) {
      throw error;
    } finally {
      setBulkOperationLoading(false);
    }
  };

  const handleBulkUpdateFeedback = async (companyIds: string[], feedback: boolean) => {
    setBulkOperationLoading(true);
    try {
      for (const id of companyIds) {
        await updateCompany(id, { feedback_ativo: feedback });
      }
    } catch (error) {
      throw error;
    } finally {
      setBulkOperationLoading(false);
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
        filterN8n={filterN8n}
        onN8nChange={setFilterN8n}
        filterFeedback={filterFeedback}
        onFeedbackChange={setFilterFeedback}
      />

      <CompanyStats companies={filteredCompanies} />

      {showBulkOperations && (
          <BulkOperations
            companies={filteredCompanies}
            onBulkCreate={handleBulkCreate}
            onBulkDelete={handleBulkDelete}
            onBulkUpdateStatus={handleBulkUpdateStatus}
            onBulkUpdateN8n={handleBulkUpdateN8n}
            onBulkUpdateFeedback={handleBulkUpdateFeedback}
            loading={bulkOperationLoading}
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
