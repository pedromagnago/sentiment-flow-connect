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
  deleted_at: string | null;
}

export const useCompanies = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      console.log('Fetching companies...');
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching companies:', error);
        throw error;
      }
      console.log('Companies fetched:', data);
      setCompanies(data || []);
    } catch (err) {
      console.error('Fetch companies error:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar empresas');
    } finally {
      setLoading(false);
    }
  };

  const createCompany = async (companyData: Partial<Company>) => {
    try {
      console.log('Creating company:', companyData);
      const { data, error } = await supabase
        .from('companies')
        .insert([companyData])
        .select()
        .single();

      if (error) {
        console.error('Error creating company:', error);
        throw error;
      }
      
      console.log('Company created:', data);
      await fetchCompanies(); // Refresh the list
      return data;
    } catch (err) {
      console.error('Create company error:', err);
      throw new Error(err instanceof Error ? err.message : 'Erro ao criar empresa');
    }
  };

  const updateCompany = async (id: string, companyData: Partial<Company>) => {
    try {
      console.log('Updating company:', id, companyData);
      const { data, error } = await supabase
        .from('companies')
        .update({ ...companyData, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating company:', error);
        throw error;
      }
      
      console.log('Company updated:', data);
      await fetchCompanies(); // Refresh the list
      return data;
    } catch (err) {
      console.error('Update company error:', err);
      throw new Error(err instanceof Error ? err.message : 'Erro ao atualizar empresa');
    }
  };

  const deleteCompany = async (id: string) => {
    try {
      console.log('Deleting company (hard delete):', id);
      const { error } = await supabase
        .from('companies')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting company:', error);
        throw error;
      }
      
      console.log('Company permanently deleted from database');
      await fetchCompanies(); // Refresh the list
    } catch (err) {
      console.error('Delete company error:', err);
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
