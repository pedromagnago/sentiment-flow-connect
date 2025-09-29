import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, FileSearch, Sparkles, CheckCircle2, XCircle } from 'lucide-react';

export const AISettings = () => {
  const { toast } = useToast();
  const [autoProcessEnabled, setAutoProcessEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('settings')
        .select('valor')
        .eq('nome', 'auto_process_documents')
        .maybeSingle();

      if (error) throw error;

      setAutoProcessEnabled(data?.valor === 'true');
    } catch (error: any) {
      console.error('Error loading settings:', error);
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

      // Upsert setting
      const { error } = await supabase
        .from('settings')
        .upsert({
          nome: 'auto_process_documents',
          valor: autoProcessEnabled ? 'true' : 'false',
        }, {
          onConflict: 'nome'
        });

      if (error) throw error;

      toast({
        title: '✅ Configurações salvas',
        description: 'As configurações de IA foram atualizadas com sucesso',
      });
    } catch (error: any) {
      console.error('Error saving settings:', error);
      toast({
        title: 'Erro ao salvar configurações',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Configurações de IA
          </CardTitle>
          <CardDescription>
            Configure o comportamento automático da inteligência artificial
          </CardDescription>
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
          <Sparkles className="h-5 w-5 text-primary" />
          Configurações de IA
        </CardTitle>
        <CardDescription>
          Configure o comportamento automático da inteligência artificial
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Auto-process Documents */}
        <div className="space-y-4">
          <div className="flex items-center justify-between space-x-4">
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <FileSearch className="h-4 w-4 text-muted-foreground" />
                <Label htmlFor="auto-process" className="text-base font-medium">
                  Processar Documentos Automaticamente
                </Label>
              </div>
              <p className="text-sm text-muted-foreground">
                Quando ativado, documentos, imagens e áudios anexados em mensagens serão analisados automaticamente pela IA
              </p>
            </div>
            <Switch
              id="auto-process"
              checked={autoProcessEnabled}
              onCheckedChange={setAutoProcessEnabled}
            />
          </div>

          {/* Status info */}
          <div className="rounded-lg border p-4 space-y-3">
            <div className="flex items-start gap-3">
              {autoProcessEnabled ? (
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
              ) : (
                <XCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
              )}
              <div className="space-y-1 flex-1">
                <p className="text-sm font-medium">
                  {autoProcessEnabled ? 'Processamento Automático Ativo' : 'Processamento Manual'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {autoProcessEnabled
                    ? 'Documentos anexados serão processados imediatamente e você receberá notificações quando a análise estiver completa'
                    : 'Você precisará clicar em "Processar" manualmente em cada ação sugerida para analisar documentos'}
                </p>
              </div>
            </div>

            {autoProcessEnabled && (
              <div className="pt-2 border-t">
                <p className="text-xs text-muted-foreground">
                  <strong>Tipos suportados:</strong> Imagens (JPG, PNG), Documentos (PDF, DOCX), Áudio (MP3, WAV, M4A)
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Save button */}
        <div className="flex justify-end">
          <Button onClick={saveSettings} disabled={isSaving}>
            {isSaving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Salvar Configurações
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
