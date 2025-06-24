
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useClickUpIntegration } from '@/hooks/useClickUpIntegration';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, AlertCircle, RefreshCw, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export const ClickUpSettings = () => {
  const [apiKey, setApiKey] = useState('');
  const [workspaceId, setWorkspaceId] = useState('');
  const [selectedListId, setSelectedListId] = useState('');
  const [lists, setLists] = useState<any[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [loading, setLoading] = useState(false);
  
  const { 
    loading: hookLoading, 
    error, 
    testClickUpConnection, 
    getClickUpLists, 
    syncTasksFromList 
  } = useClickUpIntegration();
  
  const { toast } = useToast();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data: settings, error } = await supabase
        .from('settings')
        .select('*')
        .in('nome', ['clickup_api_key', 'clickup_workspace_id', 'clickup_selected_list_id']);

      if (error) throw error;

      const settingsMap = settings?.reduce((acc, setting) => {
        acc[setting.nome] = setting.valor;
        return acc;
      }, {} as Record<string, string>) || {};

      setApiKey(settingsMap.clickup_api_key || '');
      setWorkspaceId(settingsMap.clickup_workspace_id || '');
      setSelectedListId(settingsMap.clickup_selected_list_id || '');

      if (settingsMap.clickup_api_key && settingsMap.clickup_workspace_id) {
        setConnectionStatus('success');
        await loadLists();
      }
    } catch (err) {
      console.error('Error loading ClickUp settings:', err);
    }
  };

  const saveSettings = async () => {
    try {
      setLoading(true);
      
      const settings = [
        { nome: 'clickup_api_key', valor: apiKey },
        { nome: 'clickup_workspace_id', valor: workspaceId },
        { nome: 'clickup_selected_list_id', valor: selectedListId }
      ];

      for (const setting of settings) {
        const { error } = await supabase
          .from('settings')
          .upsert(setting, { onConflict: 'nome' });
        
        if (error) throw error;
      }

      toast({
        title: "Configurações Salvas",
        description: "Configurações do ClickUp foram salvas com sucesso",
      });
    } catch (err) {
      console.error('Error saving settings:', err);
      toast({
        title: "Erro ao Salvar",
        description: "Não foi possível salvar as configurações",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTestConnection = async () => {
    if (!apiKey || !workspaceId) {
      toast({
        title: "Campos Obrigatórios",
        description: "Por favor, preencha o token da API e o ID do workspace",
        variant: "destructive",
      });
      return;
    }

    try {
      setConnectionStatus('testing');
      await testClickUpConnection(apiKey, workspaceId);
      setConnectionStatus('success');
      await loadLists();
      await saveSettings();
    } catch (err) {
      setConnectionStatus('error');
      console.error('Connection test failed:', err);
    }
  };

  const loadLists = async () => {
    if (!apiKey || !workspaceId) return;

    try {
      const { data, error } = await supabase.functions.invoke('clickup-lists', {
        body: { apiKey, workspaceId }
      });

      if (error) throw error;
      setLists(data.lists || []);
    } catch (err) {
      console.error('Failed to load lists:', err);
    }
  };

  const handleSyncTasks = async () => {
    if (!selectedListId) {
      toast({
        title: "Lista Não Selecionada",
        description: "Por favor, selecione uma lista para sincronizar",
        variant: "destructive",
      });
      return;
    }

    try {
      await syncTasksFromList('system', selectedListId);
      await saveSettings();
    } catch (err) {
      console.error('Failed to sync tasks:', err);
    }
  };

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'testing':
        return <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <span>Configuração ClickUp</span>
          {getStatusIcon()}
        </CardTitle>
        <CardDescription>
          Configure a integração com ClickUp para sincronizar tarefas da FullBPO
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="clickup-api-key">Token da API ClickUp</Label>
            <Input
              id="clickup-api-key"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="pk_..."
            />
            <p className="text-xs text-gray-500">
              <a 
                href="https://app.clickup.com/settings/apps" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline inline-flex items-center"
              >
                Obter token da API <ExternalLink className="w-3 h-3 ml-1" />
              </a>
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="clickup-workspace-id">ID do Workspace</Label>
            <Input
              id="clickup-workspace-id"
              value={workspaceId}
              onChange={(e) => setWorkspaceId(e.target.value)}
              placeholder="12345678"
            />
            <p className="text-xs text-gray-500">
              Encontre o ID na URL do ClickUp: /12345678/...
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button 
            onClick={handleTestConnection}
            disabled={hookLoading || !apiKey || !workspaceId}
            variant="outline"
          >
            {hookLoading ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Testando...
              </>
            ) : (
              'Testar Conexão'
            )}
          </Button>
          
          {connectionStatus === 'success' && (
            <span className="text-sm text-green-600 flex items-center">
              <CheckCircle className="w-4 h-4 mr-1" />
              Conectado com sucesso
            </span>
          )}
        </div>

        {connectionStatus === 'success' && lists.length > 0 && (
          <div className="space-y-4 border-t pt-4">
            <div className="space-y-2">
              <Label htmlFor="clickup-list">Lista para Sincronização</Label>
              <Select value={selectedListId} onValueChange={setSelectedListId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma lista do ClickUp" />
                </SelectTrigger>
                <SelectContent>
                  {lists.map((list) => (
                    <SelectItem key={list.id} value={list.id}>
                      {list.space_name} / {list.folder_name} / {list.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={handleSyncTasks}
              disabled={hookLoading || !selectedListId}
              className="w-full"
            >
              {hookLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Sincronizando...
                </>
              ) : (
                'Sincronizar Tarefas'
              )}
            </Button>
          </div>
        )}

        <Button 
          onClick={saveSettings}
          disabled={loading}
          variant="default"
          className="w-full"
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Salvando...
            </>
          ) : (
            'Salvar Configurações'
          )}
        </Button>

        {error && (
          <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
            {error}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
