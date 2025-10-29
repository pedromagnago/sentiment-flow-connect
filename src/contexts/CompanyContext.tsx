import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUserProfile, UserRole } from '@/hooks/useUserProfile';

interface Company {
  id: string;
  nome: string;
  cnpj?: string;
  status?: string;
}

type SelectionMode = 'single' | 'multiple' | 'all';

interface CompanyContextType {
  // Selection state
  selectedCompanyIds: string[];
  selectionMode: SelectionMode;
  
  // Company data
  availableCompanies: Company[];
  
  // Actions
  setSelectedCompanies: (companyIds: string[]) => void;
  toggleCompanySelection: (companyId: string) => void;
  selectAllCompanies: () => void;
  clearSelection: () => void;
  
  // Helpers
  isCompanySelected: (companyId: string) => boolean;
  getSelectedCompanies: () => Company[];
  
  // Legacy support (deprecated)
  activeCompanyId: string | null;
  setActiveCompany: (companyId: string | null) => void;
  
  // Roles
  isAdmin: boolean;
  isOwner: boolean;
  userRoles: Map<string, string>;
  
  loading: boolean;
  error: string | null;
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

const STORAGE_KEY = 'active_company_selection';

export function CompanyProvider({ children }: { children: ReactNode }) {
  const { profile, roles, loading: profileLoading, isAdmin: userIsAdmin, isOwner: userIsOwner } = useUserProfile();
  const [selectedCompanyIds, setSelectedCompanyIds] = useState<string[]>([]);
  const [selectionMode, setSelectionMode] = useState<SelectionMode>('single');
  const [availableCompanies, setAvailableCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userRolesMap, setUserRolesMap] = useState<Map<string, string>>(new Map());

  // Carregar empresas disponíveis
  useEffect(() => {
    if (profileLoading) return;
    
    const fetchCompanies = async () => {
      try {
        setLoading(true);
        setError(null);

        // Se admin/owner, buscar TODAS as empresas
        if (userIsAdmin) {
          const { data: allCompanies, error: companiesError } = await supabase
            .from('companies')
            .select('id, nome, cnpj, status')
            .order('nome');
          
          if (companiesError) throw companiesError;
          setAvailableCompanies(allCompanies || []);
        } else {
          // Buscar apenas empresas que o usuário tem acesso via user_roles
          const companyIds = [...new Set(roles.map(r => r.company_id))];
          
          if (companyIds.length > 0) {
            const { data: userCompanies, error: companiesError } = await supabase
              .from('companies')
              .select('id, nome, cnpj, status')
              .in('id', companyIds)
              .order('nome');
            
            if (companiesError) throw companiesError;
            setAvailableCompanies(userCompanies || []);
          } else {
            setAvailableCompanies([]);
          }
        }

        // Criar mapa de roles por empresa
        const rolesMap = new Map<string, string>();
        roles.forEach(role => {
          if (!rolesMap.has(role.company_id) || 
              ['owner', 'admin'].includes(role.role)) {
            rolesMap.set(role.company_id, role.role);
          }
        });
        setUserRolesMap(rolesMap);

      } catch (e: any) {
        console.error('Error fetching companies:', e);
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, [profileLoading, userIsAdmin, roles]);

  // Restaurar seleção do localStorage
  useEffect(() => {
    if (loading || availableCompanies.length === 0) return;

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      
      if (stored) {
        const selection = JSON.parse(stored);
        
        // Modo "all" (admin)
        if (selection.mode === 'all' && userIsAdmin) {
          setSelectionMode('all');
          setSelectedCompanyIds(availableCompanies.map(c => c.id));
          return;
        }
        
        // Modo múltiplo ou single
        if (selection.ids && Array.isArray(selection.ids)) {
          const validIds = selection.ids.filter((id: string) => 
            availableCompanies.some(c => c.id === id)
          );
          
          if (validIds.length > 0) {
            setSelectedCompanyIds(validIds);
            setSelectionMode(validIds.length > 1 ? 'multiple' : 'single');
            return;
          }
        }
      }
    } catch (e) {
      console.error('Error parsing stored selection:', e);
    }
    
    // Lógica padrão
    if (userIsAdmin) {
      // Admin: seleciona todas as empresas por padrão
      setSelectionMode('all');
      setSelectedCompanyIds(availableCompanies.map(c => c.id));
      saveSelection('all', availableCompanies.map(c => c.id));
    } else if (availableCompanies.length === 1) {
      // 1 empresa: seleciona automaticamente
      setSelectionMode('single');
      setSelectedCompanyIds([availableCompanies[0].id]);
      saveSelection('single', [availableCompanies[0].id]);
    } else if (availableCompanies.length > 1) {
      // Múltiplas empresas: seleciona todas por padrão
      setSelectionMode('multiple');
      setSelectedCompanyIds(availableCompanies.map(c => c.id));
      saveSelection('multiple', availableCompanies.map(c => c.id));
    }
  }, [loading, availableCompanies, userIsAdmin]);

  // Salvar seleção no localStorage
  const saveSelection = (mode: SelectionMode, ids: string[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      mode,
      type: 'manual',
      ids,
      groupId: null,
    }));
  };

  // Actions
  const setSelectedCompanies = (companyIds: string[]) => {
    setSelectedCompanyIds(companyIds);
    const mode = companyIds.length > 1 ? 'multiple' : 'single';
    setSelectionMode(mode);
    saveSelection(mode, companyIds);
  };

  const toggleCompanySelection = (companyId: string) => {
    setSelectedCompanyIds(prev => {
      const newIds = prev.includes(companyId)
        ? prev.filter(id => id !== companyId)
        : [...prev, companyId];
      
      const mode = newIds.length > 1 ? 'multiple' : 'single';
      setSelectionMode(mode);
      saveSelection(mode, newIds);
      return newIds;
    });
  };

  const selectAllCompanies = () => {
    const allIds = availableCompanies.map(c => c.id);
    setSelectedCompanyIds(allIds);
    setSelectionMode('all');
    saveSelection('all', allIds);
  };

  const clearSelection = () => {
    setSelectedCompanyIds([]);
    setSelectionMode('single');
    saveSelection('single', []);
  };

  // Helpers
  const isCompanySelected = (companyId: string) => {
    return selectionMode === 'all' || selectedCompanyIds.includes(companyId);
  };

  const getSelectedCompanies = () => {
    if (selectionMode === 'all') return availableCompanies;
    return availableCompanies.filter(c => selectedCompanyIds.includes(c.id));
  };

  // Legacy support (deprecated)
  const activeCompanyId = selectedCompanyIds.length === 1 ? selectedCompanyIds[0] : null;
  
  const setActiveCompany = (companyId: string | null) => {
    if (companyId === null && userIsAdmin) {
      selectAllCompanies();
    } else if (companyId) {
      setSelectedCompanies([companyId]);
    }
  };

  const value: CompanyContextType = {
    // Selection state
    selectedCompanyIds,
    selectionMode,
    
    // Company data
    availableCompanies,
    
    // Actions
    setSelectedCompanies,
    toggleCompanySelection,
    selectAllCompanies,
    clearSelection,
    
    // Helpers
    isCompanySelected,
    getSelectedCompanies,
    
    // Legacy support
    activeCompanyId,
    setActiveCompany,
    
    // Roles
    isAdmin: userIsAdmin,
    isOwner: userIsOwner,
    userRoles: userRolesMap,
    
    loading: profileLoading || loading,
    error,
  };

  return (
    <CompanyContext.Provider value={value}>
      {children}
    </CompanyContext.Provider>
  );
}

export function useCompanyContext(): CompanyContextType {
  const context = useContext(CompanyContext);
  if (context === undefined) {
    throw new Error('useCompanyContext must be used within a CompanyProvider');
  }
  return context;
}
