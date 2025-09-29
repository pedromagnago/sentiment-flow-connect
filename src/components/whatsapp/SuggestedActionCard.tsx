import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
} from 'lucide-react';
import { SuggestedAction } from '@/hooks/useSuggestedActions';

interface SuggestedActionCardProps {
  action: SuggestedAction;
  onProcess: (id: string, extractedData: Record<string, any>) => void;
  onIgnore: (id: string) => void;
  onUpdate: (id: string, extractedData: Record<string, any>) => void;
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
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState(action.extracted_data);

  const Icon = ACTION_ICONS[action.action_type];
  const label = ACTION_LABELS[action.action_type];

  const handleSaveEdit = () => {
    onUpdate(action.id, editedData);
    setIsEditing(false);
  };

  const handleProcess = () => {
    onProcess(action.id, editedData);
  };

  if (action.status !== 'pending') {
    return null;
  }

  return (
    <Card className="p-4 bg-gradient-to-r from-primary/5 to-transparent border-l-4 border-l-primary">
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

          <div className="flex gap-2">
            {!isEditing ? (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsEditing(true)}
                  className="gap-2"
                >
                  <Edit2 className="h-4 w-4" />
                  Editar Dados
                </Button>
                <Button
                  size="sm"
                  onClick={handleProcess}
                  className="gap-2"
                >
                  <CheckCircle className="h-4 w-4" />
                  Processar
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onIgnore(action.id)}
                  className="gap-2"
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
                >
                  Cancelar
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};
