import { useCompanyContext } from '@/contexts/CompanyContext';

export interface CompanyFilterCondition {
  column: string;
  operator: 'eq' | 'in';
  value: string | string[];
}

export const useCompanyFilter = () => {
  const { selectedCompanyIds, selectionMode, isAdmin } = useCompanyContext();
  
  // Retorna condições para queries do Supabase
  const getCompanyFilter = (): CompanyFilterCondition | null => {
    // Se modo 'all' (admin vendo tudo), não aplica filtro
    if (selectionMode === 'all') {
      return null;
    }
    
    // Se só 1 empresa selecionada, usa eq para performance
    if (selectedCompanyIds.length === 1) {
      return { 
        column: 'company_id', 
        operator: 'eq', 
        value: selectedCompanyIds[0] 
      };
    }
    
    // Se múltiplas empresas, usa in
    if (selectedCompanyIds.length > 1) {
      return { 
        column: 'company_id', 
        operator: 'in', 
        value: selectedCompanyIds 
      };
    }
    
    return null;
  };

  const hasCompanyFilter = selectionMode !== 'all' && selectedCompanyIds.length > 0;
  const isMultiCompany = selectedCompanyIds.length > 1;
  const isSingleCompany = selectedCompanyIds.length === 1;
  
  return { 
    getCompanyFilter, 
    selectedCompanyIds, 
    selectionMode,
    hasCompanyFilter,
    isMultiCompany,
    isSingleCompany,
    isAdmin
  };
};
