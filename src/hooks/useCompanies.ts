
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Company {
  id: string;
  nome: string | null;
  cnpj: string | null;
  segmento: string | null;
  status: string | null;
  informacoes_contato: any | null;
  clickup_api_key: string | null;
  clickup_workspace_id: string | null;
  clickup_integration_status: string | null;
  omie_api_key: string | null;
  omie_api_secret: string | null;
  omie_company_id: string | null;
  omie_integration_status: string | null;
  data_cadastro: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export const useCompanies = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCompanies(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar empresas');
    } finally {
      setLoading(false);
    }
  };

  const createCompany = async (companyData: Partial<Company>) => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .insert([companyData])
        .select()
        .single();

      if (error) throw error;
      
      await fetchCompanies(); // Refresh the list
      return data;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Erro ao criar empresa');
    }
  };

  const updateCompany = async (id: string, companyData: Partial<Company>) => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .update({ ...companyData, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      await fetchCompanies(); // Refresh the list
      return data;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Erro ao atualizar empresa');
    }
  };

  const deleteCompany = async (id: string) => {
    try {
      const { error } = await supabase
        .from('companies')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      
      await fetchCompanies(); // Refresh the list
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Erro ao excluir empresa');
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  return { 
    companies, 
    loading, 
    error, 
    refetch: fetchCompanies,
    createCompany,
    updateCompany,
    deleteCompany
  };
};
