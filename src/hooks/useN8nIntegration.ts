
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useN8nIntegration = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const checkN8nStatus = async (companyId: string) => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('n8n_integration_active')
        .eq('id', companyId)
        .single();

      if (error) throw error;
      return data?.n8n_integration_active || false;
    } catch (error) {
      console.error('Error checking N8N status:', error);
      return false;
    }
  };

  const toggleN8nIntegration = async (companyId: string, activate: boolean) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('companies')
        .update({ n8n_integration_active: activate })
        .eq('id', companyId);

      if (error) throw error;

      if (!activate) {
        await cleanupN8nData(companyId);
      }

      toast({
        title: activate ? "Integração N8N Ativada" : "Integração N8N Desativada",
        description: activate 
          ? "A empresa agora está ativa no fluxo de avaliação por IA."
          : "Os dados de análise foram removidos do sistema.",
      });

      return true;
    } catch (error) {
      console.error('Error toggling N8N integration:', error);
      toast({
        title: "Erro",
        description: "Erro ao alterar status da integração N8N",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const cleanupN8nData = async (companyId: string) => {
    try {
      // Buscar contatos da empresa
      const { data: contacts } = await supabase
        .from('contacts')
        .select('id_contact')
        .eq('empresa_id', companyId);

      if (contacts && contacts.length > 0) {
        const contactIds = contacts.map(c => c.id_contact);
        
        // Remover dados das tabelas de análise
        await Promise.allSettled([
          supabase.from('grupos_avaliacao_ia').delete().in('Id do Grupo Original', contactIds),
          supabase.from('analise_sentimento_diario').delete().in('id_contact', contactIds),
          supabase.from('analise_sentimento_semanal').delete().in('id_contact', contactIds),
        ]);

        console.log('N8N data cleanup completed for company:', companyId);
      }
    } catch (error) {
      console.error('Error during N8N data cleanup:', error);
      throw error;
    }
  };

  const getCompaniesWithN8nActive = async () => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('id, nome')
        .eq('n8n_integration_active', true)
        .eq('status', 'Ativo');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching N8N active companies:', error);
      return [];
    }
  };

  return {
    loading,
    checkN8nStatus,
    toggleN8nIntegration,
    getCompaniesWithN8nActive,
  };
};
