import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, UserCheck, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Slider } from '@/components/ui/slider';

export const HITLSettings = () => {
  const { toast } = useToast();
  const [operatorPhone, setOperatorPhone] = useState('');
  const [confidenceThreshold, setConfidenceThreshold] = useState(80);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      
      const { data: settings, error } = await supabase
        .from('settings')
        .select('nome, valor')
        .in('nome', ['hitl_operator_phone', 'hitl_confidence_threshold']);

      if (error) throw error;

      if (settings) {
        settings.forEach((setting) => {
          if (setting.nome === 'hitl_operator_phone') {
            setOperatorPhone(setting.valor || '');
          }
          if (setting.nome === 'hitl_confidence_threshold') {
            setConfidenceThreshold(parseInt(setting.valor || '80'));
          }
        });
      }
    } catch (error: any) {
      console.error('Error loading HITL settings:', error);
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
        { nome: 'hitl_operator_phone', valor: operatorPhone },
        { nome: 'hitl_confidence_threshold', valor: confidenceThreshold.toString() },
      ];

      for (const setting of settings) {
        const { error } = await supabase
          .from('settings')
          .upsert(setting, { onConflict: 'nome' });

        if (error) throw error;
      }

      toast({
        title: '✅ Configurações salvas',
        description: 'As configurações de validação humana foram atualizadas',
      });
    } catch (error: any) {
      console.error('Error saving HITL settings:', error);
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
            <UserCheck className="h-5 w-5 text-primary" />
            Validação Humana (HITL)
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
          <UserCheck className="h-5 w-5 text-primary" />
          Validação Humana (HITL - Human in the Loop)
        </CardTitle>
        <CardDescription>
          Configure quando e como ações da IA devem ser validadas por um operador humano
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-sm">
            <strong>Human in the Loop (HITL)</strong> envia ações com baixa confiança para validação humana via WhatsApp antes de executá-las automaticamente.
          </AlertDescription>
        </Alert>

        {/* Operator Phone */}
        <div className="space-y-2">
          <Label htmlFor="operator-phone">Telefone do Operador *</Label>
          <Input
            id="operator-phone"
            type="tel"
            placeholder="ex: 5511999999999"
            value={operatorPhone}
            onChange={(e) => setOperatorPhone(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Número de telefone (com código do país e DDD) que receberá solicitações de validação via WhatsApp
          </p>
        </div>

        {/* Confidence Threshold */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="confidence-threshold">
              Limite de Confiança para Validação: {confidenceThreshold}%
            </Label>
            <Slider
              id="confidence-threshold"
              min={50}
              max={95}
              step={5}
              value={[confidenceThreshold]}
              onValueChange={(value) => setConfidenceThreshold(value[0])}
              className="w-full"
            />
          </div>
          <div className="rounded-lg border p-4 space-y-2">
            <p className="text-sm text-muted-foreground">
              Ações com confiança <strong>abaixo de {confidenceThreshold}%</strong> serão enviadas para validação humana antes de serem executadas.
            </p>
            <div className="grid grid-cols-3 gap-2 text-xs mt-3">
              <div className="p-2 rounded bg-green-50 border border-green-200">
                <strong className="text-green-700">≥ {confidenceThreshold}%</strong>
                <p className="text-green-600 mt-1">Execução automática</p>
              </div>
              <div className="p-2 rounded bg-amber-50 border border-amber-200">
                <strong className="text-amber-700">&lt; {confidenceThreshold}%</strong>
                <p className="text-amber-600 mt-1">Validação necessária</p>
              </div>
              <div className="p-2 rounded bg-gray-50 border border-gray-200">
                <strong className="text-gray-700">Recomendado</strong>
                <p className="text-gray-600 mt-1">75-85%</p>
              </div>
            </div>
          </div>
        </div>

        {/* How it works */}
        <div className="rounded-lg border p-4 space-y-3">
          <h4 className="text-sm font-semibold">Como funciona:</h4>
          <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
            <li>IA analisa mensagem e identifica ação com confiança {confidenceThreshold > 80 ? 'baixa' : 'moderada'}</li>
            <li>Sistema envia mensagem para o operador com detalhes da ação sugerida</li>
            <li>Operador responde: ✅ Correto | ✏️ Ajustar | ❌ Cancelar</li>
            <li>Sistema processa a resposta e executa ou descarta a ação</li>
          </ol>
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
