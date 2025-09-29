import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircle, 
  XCircle, 
  Edit2, 
  Sparkles,
  Clock,
  DollarSign,
  FileText,
  CheckSquare,
  HelpCircle,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { SuggestedAction } from '@/hooks/useSuggestedActions';

interface SuggestedActionCardProps {
  action: SuggestedAction;
  onProcess: (id: string, extractedData: Record<string, any>) => void;
  onIgnore: (id: string) => void;
  onUpdate: (id: string, extractedData: Record<string, any>) => void;
  isProcessing?: boolean;
}

const ACTION_ICONS = {
  payment: DollarSign,
  invoice: FileText,
  task: CheckSquare,
  question: HelpCircle,
  document_analysis: FileText,
};

const ACTION_LABELS = {
  payment: 'Conta a Pagar',
  invoice: 'Faturamento',
  task: 'Tarefa',
  question: 'Pergunta',
  document_analysis: 'Análise de Documento',
};

const PRIORITY_COLORS = {
  low: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  normal: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
  high: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
  urgent: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
};

export const SuggestedActionCard: React.FC<SuggestedActionCardProps> = ({
  action,
  onProcess,
  onIgnore,
  onUpdate,
  isProcessing = false,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState(action.extracted_data);
  const [isCompleted, setIsCompleted] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (action.status === 'completed' && !isCompleted) {
      setIsCompleted(true);
      
      // Determinar página de destino baseada no tipo de ação
      const getDestinationPath = () => {
        switch (action.action_type) {
          case 'payment':
            return '/payables';
          case 'invoice':
            return '/invoices';
          case 'task':
            return '/tasks';
          case 'document_analysis':
            return '/analysis';
          default:
            return null;
        }
      };

      const destinationPath = getDestinationPath();

      // Toast com botão de navegação
      if (destinationPath) {
        toast({
          title: '✅ Ação processada com sucesso!',
          description: `${ACTION_LABELS[action.action_type]} criado(a) com sucesso.`,
          action: (
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigate(destinationPath)}
              className="gap-2"
            >
              <ExternalLink className="h-3 w-3" />
              Ver Resultado
            </Button>
          ),
          duration: 5000,
        });
      }
    }
  }, [action.status, action.action_type, isCompleted, navigate, toast]);

  const Icon = ACTION_ICONS[action.action_type];
  const label = ACTION_LABELS[action.action_type];

  const handleSaveEdit = () => {
    onUpdate(action.id, editedData);
    setIsEditing(false);
  };

  const handleProcess = () => {
    onProcess(action.id, editedData);
  };

  // Determinar estilo do card baseado no status
  const getCardStyle = () => {
    if (action.status === 'completed') {
      return 'p-4 bg-gradient-to-r from-green-500/20 to-green-500/5 border-l-4 border-l-green-500 animate-fade-in';
    }
    if (action.status === 'ignored') {
      return 'p-4 bg-gradient-to-r from-muted/50 to-muted/20 border-l-4 border-l-muted opacity-60 animate-fade-out';
    }
    if (isProcessing || action.status === 'processing') {
      return 'p-4 bg-gradient-to-r from-yellow-500/20 to-yellow-500/5 border-l-4 border-l-yellow-500 animate-pulse';
    }
    return 'p-4 bg-gradient-to-r from-primary/5 to-transparent border-l-4 border-l-primary';
  };

  // Não mostrar ações failed
  if (action.status === 'failed') {
    return null;
  }

  return (
    <Card className={getCardStyle()}>
      <div className="flex items-start gap-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Sparkles className="h-5 w-5 text-primary" />
        </div>

        <div className="flex-1 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon className="h-4 w-4" />
              <span className="font-semibold">{label}</span>
              <Badge variant="outline" className={PRIORITY_COLORS[action.priority]}>
                {action.priority}
              </Badge>
              {action.ai_confidence && (
                <Badge variant="secondary">
                  {Math.round(action.ai_confidence * 100)}% confiança
                </Badge>
              )}
            </div>
          </div>

          <p className="text-sm text-muted-foreground">{action.ai_suggestion}</p>

          {!isEditing && Object.keys(action.extracted_data || {}).length > 0 && (
            <div className="bg-background/50 rounded-md p-3 space-y-2">
              {Object.entries(action.extracted_data).map(([key, value]) => (
                <div key={key} className="flex justify-between text-sm">
                  <span className="font-medium capitalize">{key.replace('_', ' ')}:</span>
                  <span>{String(value)}</span>
                </div>
              ))}
            </div>
          )}

          {isEditing && (
            <div className="space-y-3 bg-background/50 rounded-md p-3">
              {action.action_type === 'payment' && (
                <>
                  <div>
                    <Label>Valor</Label>
                    <Input
                      value={editedData.valor || ''}
                      onChange={(e) => setEditedData({ ...editedData, valor: e.target.value })}
                      placeholder="R$ 0,00"
                    />
                  </div>
                  <div>
                    <Label>Vencimento</Label>
                    <Input
                      type="date"
                      value={editedData.vencimento || ''}
                      onChange={(e) => setEditedData({ ...editedData, vencimento: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Beneficiário</Label>
                    <Input
                      value={editedData.beneficiario || ''}
                      onChange={(e) => setEditedData({ ...editedData, beneficiario: e.target.value })}
                      placeholder="Nome do beneficiário"
                    />
                  </div>
                </>
              )}

              {action.action_type === 'invoice' && (
                <>
                  <div>
                    <Label>Valor</Label>
                    <Input
                      value={editedData.valor || ''}
                      onChange={(e) => setEditedData({ ...editedData, valor: e.target.value })}
                      placeholder="R$ 0,00"
                    />
                  </div>
                  <div>
                    <Label>Descrição</Label>
                    <Textarea
                      value={editedData.descricao || ''}
                      onChange={(e) => setEditedData({ ...editedData, descricao: e.target.value })}
                      placeholder="Descrição do serviço/produto"
                    />
                  </div>
                  <div>
                    <Label>Destinatário</Label>
                    <Input
                      value={editedData.destinatario || ''}
                      onChange={(e) => setEditedData({ ...editedData, destinatario: e.target.value })}
                      placeholder="Nome do cliente"
                    />
                  </div>
                </>
              )}

              {action.action_type === 'task' && (
                <>
                  <div>
                    <Label>Descrição</Label>
                    <Textarea
                      value={editedData.descricao || ''}
                      onChange={(e) => setEditedData({ ...editedData, descricao: e.target.value })}
                      placeholder="Descreva a tarefa"
                    />
                  </div>
                  <div>
                    <Label>Prazo</Label>
                    <Input
                      type="date"
                      value={editedData.prazo || ''}
                      onChange={(e) => setEditedData({ ...editedData, prazo: e.target.value })}
                    />
                  </div>
                </>
              )}

              {action.action_type === 'question' && (
                <div>
                  <Label>Resposta Sugerida</Label>
                  <Textarea
                    value={editedData.resposta || editedData.contexto || ''}
                    onChange={(e) => setEditedData({ ...editedData, resposta: e.target.value })}
                    placeholder="Digite a resposta"
                    rows={4}
                  />
                </div>
              )}
            </div>
          )}

          {action.status === 'pending' && (
            <div className="flex gap-2">
              {!isEditing ? (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsEditing(true)}
                    className="gap-2"
                    disabled={isProcessing}
                  >
                    <Edit2 className="h-4 w-4" />
                    Editar Dados
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleProcess}
                    className="gap-2"
                    disabled={isProcessing}
                  >
                    <CheckCircle className="h-4 w-4" />
                    {isProcessing ? 'Processando...' : 'Processar'}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onIgnore(action.id)}
                    className="gap-2"
                    disabled={isProcessing}
                  >
                    <XCircle className="h-4 w-4" />
                    Ignorar
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    size="sm"
                    onClick={handleSaveEdit}
                    className="gap-2"
                    disabled={isProcessing}
                  >
                    <CheckCircle className="h-4 w-4" />
                    Salvar e Processar
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setIsEditing(false);
                      setEditedData(action.extracted_data);
                    }}
                    disabled={isProcessing}
                  >
                    Cancelar
                  </Button>
                </>
              )}
            </div>
          )}

          {(action.status === 'completed' || action.status === 'ignored') && (
            <div className="flex items-center gap-2 text-sm">
              {action.status === 'completed' ? (
                <Badge variant="outline" className="bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Processada
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-muted text-muted-foreground">
                  <XCircle className="h-3 w-3 mr-1" />
                  Ignorada
                </Badge>
              )}
              {action.executed_at && (
                <span className="text-xs text-muted-foreground">
                  {new Date(action.executed_at).toLocaleString('pt-BR')}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};
