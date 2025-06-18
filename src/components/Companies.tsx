import { Building2 } from 'lucide-react';
import { useState, useRef } from 'react';
import { useCompanies } from '@/hooks/useCompanies';
import { CompanyModal } from './CompanyModal';
import { useToast } from '@/hooks/use-toast';
import { CompanyHeader } from './companies/CompanyHeader';
import { CompanyFilters } from './companies/CompanyFilters';
import { CompanyStats } from './companies/CompanyStats';
import { CompanyCard } from './companies/CompanyCard';
import { BulkOperations } from './companies/BulkOperations';
import { useBulkOperations } from '@/hooks/useBulkOperations';

export const Companies = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('Todas');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showBulkOperations, setShowBulkOperations] = useState(false);
  const { companies, loading, error, createCompany, updateCompany, deleteCompany, refetch } = useCompanies();
  const { toast } = useToast();
  const bulkOps = useBulkOperations();

  const filteredCompanies = companies
    .filter(company => {
      const matchesSearch = company.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           company.cnpj?.includes(searchTerm) ||
                           company.segmento?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'Todas' || company.status === filterStatus;
      return matchesSearch && matchesStatus;
    });

  const handleCreateCompany = async (companyData) => {
    try {
      await createCompany(companyData);
      setIsModalOpen(false);
      toast({
        title: "Empresa criada",
        description: "A empresa foi criada com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleEditCompany = async (companyData) => {
    try {
      await updateCompany(editingCompany.id, companyData);
      setIsModalOpen(false);
      setEditingCompany(null);
      toast({
        title: "Empresa atualizada",
        description: "A empresa foi atualizada com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteCompany = async (company) => {
    if (window.confirm(`Tem certeza que deseja excluir PERMANENTEMENTE a empresa "${company.nome}"? Esta ação não pode ser desfeita.`)) {
      try {
        await deleteCompany(company.id);
        toast({
          title: "Empresa excluída",
          description: "A empresa foi excluída permanentemente do sistema.",
        });
      } catch (error) {
        toast({
          title: "Erro",
          description: error.message,
          variant: "destructive",
        });
      }
    }
  };

  const handleBulkCreate = async (companiesData) => {
    try {
      // Criar empresas uma por uma para melhor controle de erros
      const results = [];
      const errors = [];
      
      for (let i = 0; i < companiesData.length; i++) {
        try {
          const result = await createCompany(companiesData[i]);
          results.push(result);
        } catch (error) {
          errors.push({ index: i + 1, error: error.message });
        }
      }

      if (errors.length > 0) {
        console.warn('Erros na importação:', errors);
        toast({
          title: "Importação parcial",
          description: `${results.length} empresas criadas. ${errors.length} com erro.`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Importação concluída",
          description: `${results.length} empresas foram criadas com sucesso.`,
        });
      }
    } catch (error) {
      throw error;
    }
  };

  const handleBulkDelete = async (companyIds) => {
    try {
      // Excluir empresas uma por uma
      for (const id of companyIds) {
        await deleteCompany(id);
      }
      bulkOps.clearSelection();
    } catch (error) {
      throw error;
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
      toast({
        title: "Dados atualizados",
        description: "A lista de empresas foi atualizada com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar a lista de empresas.",
        variant: "destructive",
      });
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-500">Carregando empresas...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-red-500">Erro: {error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <CompanyHeader 
        onRefresh={handleRefresh}
        onAddNew={() => setIsModalOpen(true)}
        refreshing={refreshing}
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

      {/* Operações em Massa */}
      {showBulkOperations && (
        <BulkOperations
          companies={filteredCompanies}
          onBulkCreate={handleBulkCreate}
          onBulkDelete={handleBulkDelete}
        />
      )}

      {/* Lista de Empresas */}
      <div className="space-y-4">
        {filteredCompanies.map((company) => (
          <CompanyCard
            key={company.id}
            company={company}
            onEdit={(company) => {
              setEditingCompany(company);
              setIsModalOpen(true);
            }}
            onDelete={handleDeleteCompany}
          />
        ))}
        
        {filteredCompanies.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
            <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">Nenhuma empresa encontrada.</p>
            <p className="text-sm text-gray-400 mt-1">
              {searchTerm ? 'Tente ajustar os filtros de busca.' : 'Comece criando sua primeira empresa.'}
            </p>
          </div>
        )}
      </div>

      <CompanyModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingCompany(null);
        }}
        onSave={editingCompany ? handleEditCompany : handleCreateCompany}
        company={editingCompany}
      />
    </div>
  );
};
