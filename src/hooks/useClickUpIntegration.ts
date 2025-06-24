
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ClickUpTask {
  id: string;
  name: string;
  status: {
    status: string;
    color: string;
  };
  assignees: Array<{
    id: number;
    username: string;
    email: string;
  }>;
  priority: {
    id: string;
    priority: string;
    color: string;
  } | null;
  due_date: string | null;
  description: string;
  url: string;
  list: {
    id: string;
    name: string;
  };
  folder: {
    id: string;
    name: string;
  };
  space: {
    id: string;
    name: string;
  };
}

export interface ClickUpList {
  id: string;
  name: string;
  orderindex: number;
  status: string;
  priority: any;
  assignee: any;
  task_count: number;
}

export const useClickUpIntegration = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const syncTasksFromList = async (systemId: string, listId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Starting ClickUp task sync for system:', systemId, 'list:', listId);

      // Get system ClickUp configuration
      const { data: settings, error: settingsError } = await supabase
        .from('settings')
        .select('*')
        .in('nome', ['clickup_api_key', 'clickup_workspace_id']);

      if (settingsError) {
        throw new Error('Erro ao buscar configurações do ClickUp');
      }

      const settingsMap = settings?.reduce((acc, setting) => {
        acc[setting.nome] = setting.valor;
        return acc;
      }, {} as Record<string, string>) || {};

      const apiKey = settingsMap.clickup_api_key;
      if (!apiKey) {
        throw new Error('Token da API do ClickUp não configurado');
      }

      // Call edge function to sync tasks
      const { data, error: syncError } = await supabase.functions.invoke('clickup-sync', {
        body: {
          companyId: systemId,
          listId,
          apiKey
        }
      });

      if (syncError) {
        console.error('❌ Error syncing ClickUp tasks:', syncError);
        throw syncError;
      }

      console.log('✅ ClickUp tasks synced successfully:', data);
      
      toast({
        title: "Sincronização Concluída",
        description: `Tarefas do ClickUp sincronizadas com sucesso`,
      });

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao sincronizar tarefas do ClickUp';
      console.error('💥 ClickUp sync error:', err);
      setError(errorMessage);
      
      toast({
        title: "Erro na Sincronização",
        description: errorMessage,
        variant: "destructive",
      });
      
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getClickUpLists = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: settings, error: settingsError } = await supabase
        .from('settings')
        .select('*')
        .in('nome', ['clickup_api_key', 'clickup_workspace_id']);

      if (settingsError) {
        throw new Error('Erro ao buscar configurações do ClickUp');
      }

      const settingsMap = settings?.reduce((acc, setting) => {
        acc[setting.nome] = setting.valor;
        return acc;
      }, {} as Record<string, string>) || {};

      const apiKey = settingsMap.clickup_api_key;
      const workspaceId = settingsMap.clickup_workspace_id;

      if (!apiKey || !workspaceId) {
        throw new Error('Configuração do ClickUp incompleta');
      }

      const { data, error: listsError } = await supabase.functions.invoke('clickup-lists', {
        body: {
          apiKey,
          workspaceId
        }
      });

      if (listsError) {
        throw listsError;
      }

      return data.lists || [];
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '//Erro ao buscar listas do ClickUp';
      console.error('💥 ClickUp lists error:', err);
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const testClickUpConnection = async (apiKey: string, workspaceId: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: testError } = await supabase.functions.invoke('clickup-test', {
        body: {
          apiKey,
          workspaceId
        }
      });

      if (testError) {
        throw testError;
      }

      toast({
        title: "Conexão Testada",
        description: "Conexão com ClickUp estabelecida com sucesso!",
      });

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao testar conexão ClickUp';
      console.error('💥 ClickUp test error:', err);
      setError(errorMessage);
      
      toast({
        title: "Erro na Conexão",
        description: errorMessage,
        variant: "destructive",
      });
      
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    syncTasksFromList,
    getClickUpLists,
    testClickUpConnection
  };
};
