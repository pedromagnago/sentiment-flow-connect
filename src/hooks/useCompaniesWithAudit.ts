
import { useCompanies } from './useCompanies';
import { useAuditLog } from './useAuditLog';
import { Company } from './useCompanies';

export const useCompaniesWithAudit = () => {
  const companiesHook = useCompanies();
  const { logAction } = useAuditLog();

  const createCompany = async (companyData: Partial<Company>) => {
    try {
      const result = await companiesHook.createCompany(companyData);
      
      await logAction({
        action: 'CREATE',
        tableName: 'companies',
        recordId: result.id,
        newData: result
      });

      return result;
    } catch (error) {
      console.error('Error creating company with audit:', error);
      throw error;
    }
  };

  const updateCompany = async (id: string, updates: Partial<Company>) => {
    try {
      // Buscar dados antigos antes da atualização
      const oldCompany = companiesHook.companies.find(c => c.id === id);
      
      const result = await companiesHook.updateCompany(id, updates);
      
      await logAction({
        action: 'UPDATE',
        tableName: 'companies',
        recordId: id,
        oldData: oldCompany,
        newData: result
      });

      return result;
    } catch (error) {
      console.error('Error updating company with audit:', error);
      throw error;
    }
  };

  const deleteCompany = async (id: string) => {
    try {
      // Buscar dados antes da exclusão
      const company = companiesHook.companies.find(c => c.id === id);
      
      await companiesHook.deleteCompany(id);
      
      await logAction({
        action: 'DELETE',
        tableName: 'companies',
        recordId: id,
        oldData: company
      });
    } catch (error) {
      console.error('Error deleting company with audit:', error);
      throw error;
    }
  };

  return {
    ...companiesHook,
    createCompany,
    updateCompany,
    deleteCompany
  };
};
