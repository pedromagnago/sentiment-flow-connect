
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
  n8n_integration_active: boolean | null;
  data_cadastro: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  task_id: string | null;
  task_name: string | null;
  assignee: string | null;
  due_date: string | null;
  priority: string | null;
  task_status: string | null;
  date_created: string | null;
  start_date: string | null;
  date_closed: string | null;
  linked_docs: string | null;
  valor_mensalidade: number | null;
  prazo_desconto: number | null;
  endereco: string | null;
  desconto_percentual: number | null;
  aceitar_politica_privacidade: boolean | null;
  feedback_ativo: boolean | null;
  nome_contato: string | null;
  fonte_lead: string | null;
  cpf_representante: string | null;
  email_representante: string | null;
  email_testemunha: string | null;
  envelope_id: string | null;
  nome_representante: string | null;
  nome_testemunha: string | null;
  tipo_contrato: string | null;
  cargo: string | null;
  whatsapp_contato: string | null;
  email_contato: string | null;
  client_id: string | null;
  companies_id: string | null;
  atividade: string | null;
  // Additional address fields
  numero?: string | null;
  complemento?: string | null;
  bairro?: string | null;
  cidade?: string | null;
  estado?: string | null;
  cep?: string | null;
  telefone?: string | null;
  email?: string | null;
  responsavel?: string | null;
  cargo_responsavel?: string | null;
}

export const useCompanies = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('useCompanies - Starting to fetch companies...');
      
      // Primeiro, vamos tentar fazer uma consulta simples para verificar se há dados
      console.log('useCompanies - Testing basic query...');
      const { count, error: countError } = await supabase
        .from('companies')
        .select('*', { count: 'exact', head: true });
      
      console.log('useCompanies - Count query result:', { count, countError });
      
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .order('created_at', { ascending: false });

      console.log('useCompanies - Supabase query result:', { data, error });
      console.log('useCompanies - Data type:', typeof data);
      console.log('useCompanies - Data is array:', Array.isArray(data));

      if (error) {
        console.error('useCompanies - Error fetching companies:', error);
        throw error;
      }
      
      console.log('useCompanies - Companies fetched successfully:', data?.length, 'records');
      console.log('useCompanies - First company:', data?.[0]);
      setCompanies(data || []);
    } catch (err) {
      console.error('useCompanies - Fetch companies error:', err);
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
      console.log('🔄 useCompanies - updateCompany called');
      console.log('🏢 useCompanies - Company ID:', id);
      console.log('📋 useCompanies - Company data to update:', companyData);
      console.log('🔧 useCompanies - N8N integration active in data:', companyData.n8n_integration_active);
      
      // Se a integração n8n está sendo desativada, limpar dados relacionados
      if (companyData.n8n_integration_active === false) {
        console.log('🧹 useCompanies - N8N being disabled, cleaning up data...');
        await cleanupN8nData(id);
      }
      
      // Remove updated_at from the data being sent since trigger will handle it
      const { updated_at, ...dataToUpdate } = companyData;
      console.log('📤 useCompanies - Data being sent to Supabase:', dataToUpdate);
      
      const { data, error } = await supabase
        .from('companies')
        .update(dataToUpdate)
        .eq('id', id)
        .select()
        .single();

      console.log('📡 useCompanies - Supabase response:', { data, error });

      if (error) {
        console.error('❌ useCompanies - Error updating company:', error);
        console.error('❌ useCompanies - Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw error;
      }
      
      console.log('✅ useCompanies - Company updated successfully:', data);
      console.log('🔧 useCompanies - Updated N8N status:', data.n8n_integration_active);
      await fetchCompanies(); // Refresh the list
      return data;
    } catch (err) {
      console.error('💥 useCompanies - Update company error:', err);
      throw new Error(err instanceof Error ? err.message : 'Erro ao atualizar empresa');
    }
  };

  const cleanupN8nData = async (companyId: string) => {
    try {
      console.log('Cleaning up n8n data for company:', companyId);
      
      // Buscar contatos da empresa
      const { data: contacts } = await supabase
        .from('contacts')
        .select('id_contact')
        .eq('company_id', companyId);

      if (contacts && contacts.length > 0) {
        const contactIds = contacts.map(c => c.id_contact);
        
        // Remover dados da tabela grupos_avaliacao_ia
        const { error: gruposError } = await supabase
          .from('grupos_avaliacao_ia')
          .delete()
          .in('Id do Grupo Original', contactIds);

        if (gruposError) {
          console.error('Error cleaning grupos_avaliacao_ia:', gruposError);
        }

        // Remover dados da tabela analise_sentimento_diario
        const { error: sentimentoError } = await supabase
          .from('analise_sentimento_diario')
          .delete()
          .in('id_contact', contactIds);

        if (sentimentoError) {
          console.error('Error cleaning analise_sentimento_diario:', sentimentoError);
        }

        // Remover dados da tabela analise_sentimento_semanal
        const { error: semanalError } = await supabase
          .from('analise_sentimento_semanal')
          .delete()
          .in('id_contact', contactIds);

        if (semanalError) {
          console.error('Error cleaning analise_sentimento_semanal:', semanalError);
        }

        console.log('N8n data cleanup completed for company:', companyId);
      }
    } catch (error) {
      console.error('Error during n8n data cleanup:', error);
      throw new Error('Erro ao limpar dados da integração n8n');
    }
  };

  const deleteCompany = async (id: string) => {
    try {
      console.log('Attempting to delete company:', id);
      
      // First, try to check if the company still exists
      const { data: existingCompany, error: checkError } = await supabase
        .from('companies')
        .select('id')
        .eq('id', id)
        .single();

      if (checkError || !existingCompany) {
        console.log('Company does not exist in database, removing from local state');
        // Remove from local state if it doesn't exist in database
        setCompanies(prev => prev.filter(company => company.id !== id));
        return;
      }

      // Try to delete related contacts first to avoid foreign key constraint
      console.log('Checking for related contacts...');
      const { error: contactsError } = await supabase
        .from('contacts')
        .delete()
        .eq('company_id', id);

      if (contactsError) {
        console.log('Warning: Could not delete related contacts:', contactsError);
      }

      // Now delete the company
      const { error } = await supabase
        .from('companies')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting company:', error);
        
        // If it's a foreign key constraint error, provide more specific message
        if (error.code === '23503') {
          throw new Error('Não é possível excluir esta empresa pois ela possui dados relacionados no sistema. Entre em contato com o administrador.');
        }
        
        throw error;
      }
      
      console.log('Company deleted successfully');
      await fetchCompanies(); // Refresh the list
    } catch (err) {
      console.error('Delete company error:', err);
      throw new Error(err instanceof Error ? err.message : 'Erro ao excluir empresa');
    }
  };

  // Setup realtime subscription to automatically refresh when data changes
  useEffect(() => {
    console.log('useCompanies - Setting up effect and fetching companies');
    fetchCompanies();

    // Subscribe to realtime changes
    const channelId = `companies-changes-${crypto.randomUUID()}`;
    const channel = supabase
      .channel(channelId)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'companies'
        },
        (payload) => {
          console.log('useCompanies - Companies table changed:', payload);
          fetchCompanies(); // Refresh data when changes occur
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
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
