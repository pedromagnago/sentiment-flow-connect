
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Company } from '@/hooks/useCompanies';

interface UseCompanyHandlersProps {
  createCompany: (data: Partial<Company>) => Promise<Company>;
  updateCompany: (id: string, data: Partial<Company>) => Promise<Company>;
  deleteCompany: (id: string) => Promise<void>;
  refetch: () => Promise<void>;
}

export const useCompanyHandlers = ({
  createCompany,
  updateCompany,
  deleteCompany,
  refetch
}: UseCompanyHandlersProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();

  const handleCreateCompany = async (companyData: Partial<Company>) => {
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
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    }
  };

  const handleEditCompany = async (companyData: Partial<Company>) => {
    if (!editingCompany) return;
    
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
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    }
  };

  const handleDeleteCompany = async (company: Company) => {
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

  const openCreateModal = () => {
    setEditingCompany(null);
    setIsModalOpen(true);
  };

  const openEditModal = (company: Company) => {
    setEditingCompany(company);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCompany(null);
  };

  return {
    isModalOpen,
    editingCompany,
    refreshing,
    handleCreateCompany,
    handleEditCompany,
    handleDeleteCompany,
    handleRefresh,
    openCreateModal,
    openEditModal,
    closeModal
  };
};
