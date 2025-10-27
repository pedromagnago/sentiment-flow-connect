import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { SuggestedAction } from '@/hooks/useSuggestedActions';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  FileText, 
  DollarSign, 
  CheckCircle2, 
  Clock, 
  User, 
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Ban,
  Edit
} from 'lucide-react';
import { useState } from 'react';

interface SuggestedActionModalProps {
  action: SuggestedAction | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onIgnore: (id: string) => void;
  onEdit: (id: string, extractedData: Record<string, any>, notes?: string) => void;
}

export const SuggestedActionModal = ({
  action,
  isOpen,
  onClose,
  onApprove,
  onReject,
  onIgnore,
  onEdit,
}: SuggestedActionModalProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<string>('');
  const [notes, setNotes] = useState('');

  if (!action) return null;

  const handleEdit = () => {
    setIsEditing(true);
    setEditedData(JSON.stringify(action.extracted_data, null, 2));
    setNotes(action.notes || '');
  };

  const handleSaveEdit = () => {
    try {
      const parsed = JSON.parse(editedData);
      onEdit(action.id, parsed, notes);
      setIsEditing(false);
      onClose();
    } catch (error) {
      alert('JSON inválido. Por favor, corrija o formato.');
    }
  };

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'payment': return <DollarSign className="w-5 h-5" />;
      case 'invoice': return <FileText className="w-5 h-5" />;
      case 'task': return <CheckCircle2 className="w-5 h-5" />;
      default: return <FileText className="w-5 h-5" />;
    }
  };

  const getStatusInfo = (status: string) => {
    const info: Record<string, { label: string; color: string }> = {
      pending: { label: 'Pendente', color: 'bg-yellow-100 text-yellow-800' },
      processing: { label: 'Processando', color: 'bg-blue-100 text-blue-800' },
      completed: { label: 'Concluída', color: 'bg-green-100 text-green-800' },
      ignored: { label: 'Ignorada', color: 'bg-gray-100 text-gray-800' },
      failed: { label: 'Falhou', color: 'bg-red-100 text-red-800' },
    };
    return info[status] || info.pending;
  };

  const statusInfo = getStatusInfo(action.status);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary">
              {getActionIcon(action.action_type)}
            </div>
            <div className="flex-1">
              <DialogTitle className="text-xl">
                Detalhes da Ação Sugerida
              </DialogTitle>
              <DialogDescription className="mt-1">
                ID: {action.id.substring(0, 8)}...
              </DialogDescription>
            </div>
            <Badge className={statusInfo.color}>
              {statusInfo.label}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Informações Básicas */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Informações Básicas
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-muted-foreground">Tipo de Ação</Label>
                <p className="font-medium capitalize">
                  {action.action_type === 'payment' && 'Pagamento'}
                  {action.action_type === 'invoice' && 'Fatura'}
                  {action.action_type === 'task' && 'Tarefa'}
                  {action.action_type === 'document_analysis' && 'Análise de Documento'}
                  {action.action_type === 'question' && 'Pergunta'}
                </p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Prioridade</Label>
                <Badge variant="outline" className="capitalize">
                  {action.priority}
                </Badge>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Confiança da IA</Label>
                <p className="font-semibold text-lg">
                  <span className={
                    action.ai_confidence >= 80 ? 'text-green-600' :
                    action.ai_confidence >= 60 ? 'text-yellow-600' :
                    'text-red-600'
                  }>
                    {action.ai_confidence}%
                  </span>
                </p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Data de Criação</Label>
                <p className="text-sm">
                  {format(new Date(action.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Sugestão da IA */}
          <div>
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Sugestão da IA
            </h3>
            <p className="text-sm p-3 bg-muted rounded-lg">
              {action.ai_suggestion}
            </p>
          </div>

          <Separator />

          {/* Dados Extraídos */}
          <div>
            <h3 className="font-semibold mb-2">Dados Extraídos</h3>
            {isEditing ? (
              <div className="space-y-3">
                <Textarea
                  value={editedData}
                  onChange={(e) => setEditedData(e.target.value)}
                  rows={10}
                  className="font-mono text-xs"
                  placeholder="JSON dos dados extraídos"
                />
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Notas adicionais (opcional)"
                />
              </div>
            ) : (
              <pre className="text-xs p-3 bg-muted rounded-lg overflow-x-auto">
                {JSON.stringify(action.extracted_data, null, 2)}
              </pre>
            )}
          </div>

          {/* Notas */}
          {action.notes && !isEditing && (
            <>
              <Separator />
              <div>
                <h3 className="font-semibold mb-2">Notas</h3>
                <p className="text-sm p-3 bg-muted rounded-lg">
                  {action.notes}
                </p>
              </div>
            </>
          )}

          {/* Informações de Execução */}
          {(action.executed_by || action.executed_at) && (
            <>
              <Separator />
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Informações de Execução
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {action.executed_by && (
                    <div>
                      <Label className="text-xs text-muted-foreground">Executado por</Label>
                      <p className="text-sm">{action.executed_by}</p>
                    </div>
                  )}
                  {action.executed_at && (
                    <div>
                      <Label className="text-xs text-muted-foreground">Executado em</Label>
                      <p className="text-sm">
                        {format(new Date(action.executed_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Dados de Resultado */}
          {action.result_data && (
            <>
              <Separator />
              <div>
                <h3 className="font-semibold mb-2">Resultado da Execução</h3>
                <pre className="text-xs p-3 bg-muted rounded-lg overflow-x-auto">
                  {JSON.stringify(action.result_data, null, 2)}
                </pre>
              </div>
            </>
          )}
        </div>

        <DialogFooter className="gap-2">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveEdit}>
                Salvar Alterações
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={onClose}>
                Fechar
              </Button>
              
              {action.status === 'pending' && (
                <>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      onIgnore(action.id);
                      onClose();
                    }}
                  >
                    <Ban className="w-4 h-4 mr-2" />
                    Ignorar
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={handleEdit}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Editar
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      onReject(action.id);
                      onClose();
                    }}
                  >
                    <ThumbsDown className="w-4 h-4 mr-2" />
                    Rejeitar
                  </Button>
                  <Button
                    onClick={() => {
                      onApprove(action.id);
                      onClose();
                    }}
                  >
                    <ThumbsUp className="w-4 h-4 mr-2" />
                    Aprovar
                  </Button>
                </>
              )}
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};