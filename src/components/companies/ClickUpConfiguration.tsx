
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useClickUpIntegration } from '@/hooks/useClickUpIntegration';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, AlertCircle, RefreshCw, ExternalLink } from 'lucide-react';

interface ClickUpConfigurationProps {
  companyId: string;
  currentConfig: {
    clickup_api_key?: string;
    clickup_workspace_id?: string;
    clickup_integration_status?: string;
  };
  onConfigUpdate: (config: any) => void;
}

export const ClickUpConfiguration = ({ 
  companyId, 
  currentConfig, 
  onConfigUpdate 
}: ClickUpConfigurationProps) => {
  const [apiKey, setApiKey] = useState(currentConfig.clickup_api_key || '');
  const [workspaceId, setWorkspaceId] = useState(currentConfig.clickup_workspace_id || '');
  const [selectedListId, setSelectedListId] = useState('');
  const [lists, setLists] = useState<any[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  
  const { 
    loading, 
    error, 
    testClickUpConnection, 
    getClickUpLists, 
    syncTasksFromList 
  } = useClickUpIntegration();
  
  const { toast } = useToast();

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
      
      // Update company config
      const newConfig = {
        clickup_api_key: apiKey,
        clickup_workspace_id: workspaceId,
        clickup_integration_status: 'connected'
      };
      
      onConfigUpdate(newConfig);
      
      // Load lists after successful connection
      await loadLists();
    } catch (err) {
      setConnectionStatus('error');
      console.error('Connection test failed:', err);
    }
  };

  const loadLists = async () => {
    if (!apiKey || !workspaceId) return;

    try {
      const listsData = await getClickUpLists();
      setLists(listsData);
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
      await syncTasksFromList(companyId, selectedListId);
    } catch (err) {
      console.error('Failed to sync tasks:', err);
    }
  };

  useEffect(() => {
    if (currentConfig.clickup_integration_status === 'connected' && apiKey && workspaceId) {
      setConnectionStatus('success');
      loadLists();
    }
  }, [currentConfig, apiKey, workspaceId]);

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
          Configure a integração com ClickUp para sincronizar tarefas automaticamente
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
            disabled={loading || !apiKey || !workspaceId}
            variant="outline"
          >
            {loading ? (
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
              <Select onValueChange={setSelectedListId}>
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
              disabled={loading || !selectedListId}
              className="w-full"
            >
              {loading ? (
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

        {error && (
          <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
            {error}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
