import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUserProfile, UserRole } from '@/hooks/useUserProfile';

interface Company {
  id: string;
  nome: string;
  cnpj?: string;
  status?: string;
}

interface CompanyContextType {
  activeCompanyId: string | null;
  availableCompanies: Company[];
  setActiveCompany: (companyId: string | null) => void;
  isAdmin: boolean;
  isOwner: boolean;
  userRoles: Map<string, string>;
  loading: boolean;
  error: string | null;
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

const STORAGE_KEY = 'active_company_id';

export function CompanyProvider({ children }: { children: ReactNode }) {
  const { profile, roles, loading: profileLoading, isAdmin: userIsAdmin, isOwner: userIsOwner } = useUserProfile();
  const [activeCompanyId, setActiveCompanyIdState] = useState<string | null>(null);
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

  // Restaurar empresa ativa do localStorage
  useEffect(() => {
    if (loading || availableCompanies.length === 0) return;

    const stored = localStorage.getItem(STORAGE_KEY);
    
    if (stored === 'all' && userIsAdmin) {
      setActiveCompanyIdState(null);
    } else if (stored && availableCompanies.some(c => c.id === stored)) {
      setActiveCompanyIdState(stored);
    } else if (availableCompanies.length === 1) {
      // Se só tem 1 empresa, seleciona automaticamente
      setActiveCompanyIdState(availableCompanies[0].id);
      localStorage.setItem(STORAGE_KEY, availableCompanies[0].id);
    }
  }, [loading, availableCompanies, userIsAdmin]);

  const setActiveCompany = (companyId: string | null) => {
    if (companyId === null) {
      // "Todas as Empresas" - só para admin
      if (userIsAdmin) {
        setActiveCompanyIdState(null);
        localStorage.setItem(STORAGE_KEY, 'all');
      }
    } else {
      setActiveCompanyIdState(companyId);
      localStorage.setItem(STORAGE_KEY, companyId);
    }
  };

  const value: CompanyContextType = {
    activeCompanyId,
    availableCompanies,
    setActiveCompany,
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
