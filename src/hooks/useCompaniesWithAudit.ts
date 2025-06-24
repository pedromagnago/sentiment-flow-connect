
import { useCompanies } from './useCompanies';
import { useAuditLog } from './useAuditLog';
import { supabase } from '@/integrations/supabase/client';
import { Company } from './useCompanies';

export const useCompaniesWithAudit = () => {
  const companiesData = useCompanies();
  const { logAction } = useAuditLog();

  // Debug logs
  console.log('useCompaniesWithAudit - companiesData:', companiesData);
  console.log('useCompaniesWithAudit - companies count:', companiesData.companies?.length);
  console.log('useCompaniesWithAudit - loading:', companiesData.loading);
  console.log('useCompaniesWithAudit - error:', companiesData.error);

  const createN8nEvaluationData = async (companyId: string) => {
    try {
      console.log('🚀 STARTING N8N EVALUATION DATA CREATION');
      console.log('🏢 Company ID:', companyId);
      
      // Buscar contatos da empresa
      console.log('📞 Searching for contacts of company:', companyId);
      const { data: contacts, error: contactsError } = await supabase
        .from('contacts')
        .select('id_contact, nome')
        .eq('empresa_id', companyId);

      console.log('📞 Contacts query result:', { contacts, contactsError });
      console.log('📞 Number of contacts found:', contacts?.length || 0);

      if (contactsError) {
        console.error('❌ Error fetching contacts:', contactsError);
        throw contactsError;
      }

      if (!contacts || contacts.length === 0) {
        console.log('⚠️ No contacts found for company:', companyId);
        return;
      }

      console.log('📋 Contacts found:', contacts);

      // Verificar se já existem dados para estes contatos
      const contactIds = contacts.map(c => c.id_contact);
      console.log('🔍 Checking existing evaluation data for contact IDs:', contactIds);
      
      const { data: existingData, error: existingError } = await supabase
        .from('grupos_avaliacao_ia')
        .select('*')
        .in('Id do Grupo Original', contactIds);

      console.log('🔍 Existing evaluation data query result:', { existingData, existingError });
      console.log('🔍 Number of existing records:', existingData?.length || 0);

      if (existingError) {
        console.error('❌ Error checking existing data:', existingError);
      }

      // Filtrar contatos que ainda não têm dados de avaliação
      const existingContactIds = existingData?.map(d => d['Id do Grupo Original']) || [];
      const newContacts = contacts.filter(contact => !existingContactIds.includes(contact.id_contact));
      
      console.log('🆕 Contacts that need new evaluation data:', newContacts);
      console.log('🆕 Number of new contacts to process:', newContacts.length);

      if (newContacts.length === 0) {
        console.log('ℹ️ All contacts already have evaluation data. No new records needed.');
        return;
      }

      // Criar dados na tabela grupos_avaliacao_ia para cada novo contato
      const evaluationData = newContacts.map(contact => ({
        'Id do Grupo Original': contact.id_contact,
        'Nome do Grupo': contact.nome || `Grupo ${contact.id_contact}`,
        'Id do Grupo de Envio': `${contact.id_contact}-eval`
      }));

      console.log('📝 Evaluation data to insert:', evaluationData);
      console.log('📝 Number of records to insert:', evaluationData.length);

      const { data: insertResult, error: insertError } = await supabase
        .from('grupos_avaliacao_ia')
        .insert(evaluationData)
        .select();

      console.log('💾 Insert result:', { insertResult, insertError });

      if (insertError) {
        console.error('❌ Error creating evaluation data:', insertError);
        console.error('❌ Insert error details:', {
          message: insertError.message,
          details: insertError.details,
          hint: insertError.hint,
          code: insertError.code
        });
        throw insertError;
      }

      console.log('✅ N8N evaluation data created successfully!');
      console.log('✅ Records inserted:', insertResult?.length || 0);
      console.log('✅ New evaluation data:', insertResult);

    } catch (error) {
      console.error('💥 FATAL ERROR in createN8nEvaluationData:', error);
      console.error('💥 Error type:', typeof error);
      console.error('💥 Error details:', error);
      throw error;
    }
  };

  // Função para testar a criação de dados N8N para uma empresa específica
  const testN8nDataCreation = async (companyId: string) => {
    console.log('🧪 TESTING N8N DATA CREATION FOR COMPANY:', companyId);
    try {
      await createN8nEvaluationData(companyId);
      console.log('🧪 Test completed successfully');
    } catch (error) {
      console.error('🧪 Test failed:', error);
    }
  };

  const createCompany = async (companyData: Partial<Company>) => {
    try {
      console.log('🏢 Creating company with data:', companyData);
      const result = await companiesData.createCompany(companyData);
      
      await logAction({
        action: 'CREATE',
        tableName: 'companies',
        recordId: result.id,
        newData: result
      });

      // Se a integração N8N estiver ativa, criar dados de avaliação
      if (companyData.n8n_integration_active) {
        console.log('🔄 N8N integration is active, creating evaluation data...');
        await createN8nEvaluationData(result.id);
      } else {
        console.log('❌ N8N integration is not active for this company');
      }

      return result;
    } catch (error) {
      console.error('Error creating company with audit:', error);
      throw error;
    }
  };

  const updateCompany = async (id: string, updates: Partial<Company>) => {
    try {
      console.log('🔄 Updating company:', id, 'with updates:', updates);
      
      // Buscar dados antigos antes da atualização
      const oldCompany = companiesData.companies.find(c => c.id === id);
      console.log('📋 Old company data:', oldCompany);
      
      const result = await companiesData.updateCompany(id, updates);
      console.log('✅ Company updated:', result);
      
      await logAction({
        action: 'UPDATE',
        tableName: 'companies',
        recordId: id,
        oldData: oldCompany,
        newData: result
      });

      // Se a integração N8N foi ativada (mudou de false para true), criar dados de avaliação
      const wasInactive = !oldCompany?.n8n_integration_active;
      const isNowActive = updates.n8n_integration_active === true;
      
      console.log('🔍 N8N integration status check:', {
        wasInactive,
        isNowActive,
        oldStatus: oldCompany?.n8n_integration_active,
        newStatus: updates.n8n_integration_active
      });

      if (wasInactive && isNowActive) {
        console.log('🔄 N8N integration was activated, creating evaluation data...');
        await createN8nEvaluationData(id);
      } else if (isNowActive) {
        console.log('🔄 N8N integration is active, ensuring evaluation data exists...');
        await createN8nEvaluationData(id);
      } else {
        console.log('❌ N8N integration not activated in this update');
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
    deleteCompany,
    testN8nDataCreation // Função de teste exposta
  };
};
