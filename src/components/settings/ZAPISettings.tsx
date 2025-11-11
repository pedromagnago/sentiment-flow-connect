import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, MessageSquare, CheckCircle2, XCircle, AlertCircle, Send } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export const ZAPISettings = () => {
  const { toast } = useToast();
  const [instanceId, setInstanceId] = useState('');
  const [token, setToken] = useState('');
  const [clientToken, setClientToken] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'unknown' | 'connected' | 'disconnected'>('unknown');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      
      const { data: settings, error } = await supabase
        .from('settings')
        .select('nome, valor')
        .in('nome', ['zapi_instance_id', 'zapi_token', 'zapi_client_token']);

      if (error) throw error;

      if (settings) {
        settings.forEach((setting) => {
          if (setting.nome === 'zapi_instance_id') setInstanceId(setting.valor || '');
          if (setting.nome === 'zapi_token') setToken(setting.valor || '');
          if (setting.nome === 'zapi_client_token') setClientToken(setting.valor || '');
        });
      }
    } catch (error: any) {
      console.error('Error loading ZAPI settings:', error);
      toast({
        title: 'Erro ao carregar configurações',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setIsSaving(true);

      const settings = [
        { nome: 'zapi_instance_id', valor: instanceId },
        { nome: 'zapi_token', valor: token },
        { nome: 'zapi_client_token', valor: clientToken },
      ];

      for (const setting of settings) {
        const { error } = await supabase
          .from('settings')
          .upsert(setting, { onConflict: 'nome' });

        if (error) throw error;
      }

      toast({
        title: '✅ Configurações salvas',
        description: 'As configurações ZAPI foram atualizadas com sucesso',
      });
    } catch (error: any) {
      console.error('Error saving ZAPI settings:', error);
      toast({
        title: 'Erro ao salvar configurações',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const testConnection = async () => {
    if (!instanceId || !token) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Preencha Instance ID e Token para testar a conexão',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsTesting(true);
      setConnectionStatus('unknown');
      console.log('🔍 Testing ZAPI connection via edge function...');

      // Call edge function to test connection (avoids CORS issues)
      const { data, error } = await supabase.functions.invoke('test-zapi-connection', {
        body: { instanceId, token, clientToken }
      });

      console.log('📥 Edge function response:', { data, error });

      if (error) {
        console.error('❌ Edge function error:', error);
        setConnectionStatus('disconnected');
        toast({
          title: '❌ Erro na conexão',
          description: error.message || 'Erro ao testar conexão',
          variant: 'destructive',
        });
        return;
      }

      if (data?.error) {
        console.error('❌ ZAPI error:', data);
        setConnectionStatus('disconnected');
        toast({
          title: '❌ Erro na conexão',
          description: data.error,
          variant: 'destructive',
        });
        return;
      }

      // Success
      setConnectionStatus('connected');
      const details = [
        data.connected ? '✅ Conectado' : '❌ Desconectado',
        data.battery ? `🔋 ${data.battery}%` : null,
        data.phone ? `📱 ${data.phone}` : null,
        data.waName ? `👤 ${data.waName}` : null
      ].filter(Boolean).join(' | ');

      toast({
        title: '✅ Conexão estabelecida',
        description: details || 'Conexão com ZAPI verificada com sucesso',
      });

    } catch (error: any) {
      console.error('💥 Unexpected error testing ZAPI connection:', error);
      setConnectionStatus('disconnected');
      toast({
        title: 'Erro ao testar conexão',
        description: error.message || 'Erro inesperado ao testar conexão',
        variant: 'destructive',
      });
    } finally {
      setIsTesting(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            Configurações ZAPI
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          Configurações ZAPI (WhatsApp)
        </CardTitle>
        <CardDescription>
          Configure a integração com ZAPI para recebimento e envio de mensagens do WhatsApp
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Connection Status */}
        {connectionStatus !== 'unknown' && (
          <Alert variant={connectionStatus === 'connected' ? 'default' : 'destructive'}>
            {connectionStatus === 'connected' ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              <XCircle className="h-4 w-4" />
            )}
            <AlertDescription>
              {connectionStatus === 'connected'
                ? 'Conexão com ZAPI estabelecida com sucesso'
                : 'Não foi possível conectar ao ZAPI. Verifique suas credenciais.'}
            </AlertDescription>
          </Alert>
        )}

        {/* Instance ID */}
        <div className="space-y-2">
          <Label htmlFor="instance-id">Instance ID *</Label>
          <Input
            id="instance-id"
            type="text"
            placeholder="ex: 3C12A34B5C"
            value={instanceId}
            onChange={(e) => setInstanceId(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            ID da sua instância ZAPI (encontrado no painel ZAPI)
          </p>
        </div>

        {/* Token */}
        <div className="space-y-2">
          <Label htmlFor="token">Token *</Label>
          <Input
            id="token"
            type="password"
            placeholder="Token de autenticação"
            value={token}
            onChange={(e) => setToken(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Token de autenticação da sua instância ZAPI
          </p>
        </div>

        {/* Client Token */}
        <div className="space-y-2">
          <Label htmlFor="client-token">Client Token</Label>
          <Input
            id="client-token"
            type="password"
            placeholder="Token do cliente (opcional)"
            value={clientToken}
            onChange={(e) => setClientToken(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Token adicional para validação de webhooks (opcional)
          </p>
        </div>

        {/* Webhook URL */}
        <div className="space-y-2">
          <Label>URL do Webhook</Label>
          <div className="flex gap-2">
            <Input
              type="text"
              readOnly
              value={`https://insncccrxgsvaxxkzjws.supabase.co/functions/v1/zapi-webhook`}
              className="font-mono text-xs"
            />
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                navigator.clipboard.writeText(
                  'https://insncccrxgsvaxxkzjws.supabase.co/functions/v1/zapi-webhook'
                );
                toast({
                  title: '📋 URL copiada',
                  description: 'URL do webhook copiada para a área de transferência',
                });
              }}
            >
              Copiar
            </Button>
          </div>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-xs">
              Configure esta URL no painel ZAPI em <strong>Webhooks → Message Received</strong>
            </AlertDescription>
          </Alert>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button onClick={testConnection} disabled={isTesting} variant="outline" className="flex-1">
            {isTesting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Testando...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Testar Conexão
              </>
            )}
          </Button>
          <Button onClick={saveSettings} disabled={isSaving} className="flex-1">
            {isSaving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Salvar Configurações
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
