
import { useCompanies } from './useCompanies';
import { useAuditLog } from './useAuditLog';
import { supabase } from '@/integrations/supabase/client';
import { Company } from './useCompanies';

export const useCompaniesWithAudit = () => {
  const companiesData = useCompanies();
  const { logAction } = useAuditLog();

  const createN8nEvaluationData = async (companyId: string) => {
    try {
      console.log('Creating N8N evaluation data for company:', companyId);
      
      // Buscar contatos da empresa
      const { data: contacts, error: contactsError } = await supabase
        .from('contacts')
        .select('id_contact, nome')
        .eq('empresa_id', companyId);

      if (contactsError) {
        console.error('Error fetching contacts:', contactsError);
        return;
      }

      if (!contacts || contacts.length === 0) {
        console.log('No contacts found for company:', companyId);
        return;
      }

      // Criar dados na tabela grupos_avaliacao_ia para cada contato
      const evaluationData = contacts.map(contact => ({
        'Id do Grupo Original': contact.id_contact,
        'Nome do Grupo': contact.nome || `Grupo ${contact.id_contact}`,
        'Id do Grupo de Envio': `${contact.id_contact}-eval`
      }));

      const { error: insertError } = await supabase
        .from('grupos_avaliacao_ia')
        .insert(evaluationData);

      if (insertError) {
        console.error('Error creating evaluation data:', insertError);
        throw insertError;
      }

      console.log('N8N evaluation data created successfully for', contacts.length, 'contacts');
    } catch (error) {
      console.error('Error in createN8nEvaluationData:', error);
      throw error;
    }
  };

  const createCompany = async (companyData: Partial<Company>) => {
    try {
      const result = await companiesData.createCompany(companyData);
      
      await logAction({
        action: 'CREATE',
        tableName: 'companies',
        recordId: result.id,
        newData: result
      });

      // Se a integração N8N estiver ativa, criar dados de avaliação
      if (companyData.n8n_integration_active) {
        await createN8nEvaluationData(result.id);
      }

      return result;
    } catch (error) {
      console.error('Error creating company with audit:', error);
      throw error;
    }
  };

  const updateCompany = async (id: string, updates: Partial<Company>) => {
    try {
      // Buscar dados antigos antes da atualização
      const oldCompany = companiesData.companies.find(c => c.id === id);
      
      const result = await companiesData.updateCompany(id, updates);
      
      await logAction({
        action: 'UPDATE',
        tableName: 'companies',
        recordId: id,
        oldData: oldCompany,
        newData: result
      });

      // Se a integração N8N foi ativada (mudou de false para true), criar dados de avaliação
      if (!oldCompany?.n8n_integration_active && updates.n8n_integration_active) {
        await createN8nEvaluationData(id);
      }

      return result;
    } catch (error) {
      console.error('Error updating company with audit:', error);
      throw error;
    }
  };

  const deleteCompany = async (id: string) => {
    try {
      // Buscar dados antes da exclusão
      const company = companiesData.companies.find(c => c.id === id);
      
      await companiesData.deleteCompany(id);
      
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
    companies: companiesData.companies,
    loading: companiesData.loading,
    error: companiesData.error,
    refetch: companiesData.refetch,
    createCompany,
    updateCompany,
    deleteCompany
  };
};
