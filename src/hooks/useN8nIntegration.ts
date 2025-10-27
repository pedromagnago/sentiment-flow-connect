
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Company } from './useCompanies';

export const useN8nIntegration = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleN8nIntegration = async (companyId: string, active: boolean) => {
    try {
      setLoading(true);
      setError(null);

      // Buscar dados atuais da empresa
      const { data: company, error: fetchError } = await supabase
        .from('companies')
        .select('*')
        .eq('id', companyId)
        .single();

      if (fetchError) {
        throw new Error('Erro ao buscar dados da empresa');
      }

      if (!company) {
        throw new Error('Empresa não encontrada');
      }

      // Atualizar status da integração
      const { error: updateError } = await supabase
        .from('companies')
        .update({ n8n_integration_active: active })
        .eq('id', companyId);

      if (updateError) {
        throw new Error('Erro ao atualizar integração N8N');
      }

      // Se está desativando, limpar dados relacionados
      if (!active) {
        await cleanupN8nData(companyId);
      }

      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
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

  const checkN8nIntegrationStatus = async (companyId: string): Promise<boolean> => {
    try {
      const { data: company, error } = await supabase
        .from('companies')
        .select('n8n_integration_active')
        .eq('id', companyId)
        .single();

      if (error) {
        console.error('Error checking N8N integration status:', error);
        return false;
      }

      return company?.n8n_integration_active || false;
    } catch (error) {
      console.error('Error checking N8N integration status:', error);
      return false;
    }
  };

  return {
    loading,
    error,
    toggleN8nIntegration,
    checkN8nIntegrationStatus,
    cleanupN8nData
  };
};
