import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  FileText, 
  DollarSign, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ChevronUp, 
  ChevronDown,
  Eye,
  ThumbsUp,
  ThumbsDown,
  MoreVertical
} from 'lucide-react';
import { SuggestedAction } from '@/hooks/useSuggestedActions';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface SuggestedActionsTableProps {
  actions: SuggestedAction[];
  onSelectAction: (action: SuggestedAction) => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onIgnore: (id: string) => void;
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: () => void;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onSort: (field: string) => void;
}

export const SuggestedActionsTable = ({
  actions,
  onSelectAction,
  onApprove,
  onReject,
  onIgnore,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  sortBy,
  sortOrder,
  onSort,
}: SuggestedActionsTableProps) => {
  const getActionIcon = (type: string) => {
    switch (type) {
      case 'payment': return <DollarSign className="w-4 h-4" />;
      case 'invoice': return <FileText className="w-4 h-4" />;
      case 'task': return <CheckCircle2 className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; label: string; icon: any }> = {
      pending: { variant: 'secondary', label: 'Pendente', icon: Clock },
      processing: { variant: 'default', label: 'Processando', icon: Clock },
      completed: { variant: 'default', label: 'Concluída', icon: CheckCircle2 },
      ignored: { variant: 'secondary', label: 'Ignorada', icon: XCircle },
      failed: { variant: 'destructive', label: 'Falhou', icon: XCircle },
    };

    const config = variants[status] || variants.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1 w-fit">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const colors: Record<string, string> = {
      urgent: 'bg-red-100 text-red-800 border-red-300',
      high: 'bg-orange-100 text-orange-800 border-orange-300',
      normal: 'bg-blue-100 text-blue-800 border-blue-300',
      low: 'bg-gray-100 text-gray-800 border-gray-300',
    };

    return (
      <Badge variant="outline" className={colors[priority] || colors.normal}>
        {priority === 'urgent' && '🔥 '}
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </Badge>
    );
  };

  const SortButton = ({ field, label }: { field: string; label: string }) => (
    <Button
      variant="ghost"
      size="sm"
      className="h-8 -ml-3 font-semibold"
      onClick={() => onSort(field)}
    >
      {label}
      {sortBy === field && (
        sortOrder === 'asc' ? <ChevronUp className="ml-1 w-4 h-4" /> : <ChevronDown className="ml-1 w-4 h-4" />
      )}
    </Button>
  );

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd/MM/yyyy HH:mm", { locale: ptBR });
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600 font-semibold';
    if (confidence >= 60) return 'text-yellow-600 font-semibold';
    return 'text-red-600 font-semibold';
  };

  if (actions.length === 0) {
    return (
      <div className="border rounded-lg p-12 text-center">
        <p className="text-muted-foreground">Nenhuma ação sugerida encontrada</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="w-12">
              <Checkbox
                checked={selectedIds.length === actions.length}
                onCheckedChange={onToggleSelectAll}
              />
            </TableHead>
            <TableHead className="w-12">Tipo</TableHead>
            <TableHead>
              <SortButton field="action_type" label="Ação" />
            </TableHead>
            <TableHead>Sugestão da IA</TableHead>
            <TableHead>
              <SortButton field="ai_confidence" label="Confiança" />
            </TableHead>
            <TableHead>
              <SortButton field="priority" label="Prioridade" />
            </TableHead>
            <TableHead>
              <SortButton field="status" label="Status" />
            </TableHead>
            <TableHead>
              <SortButton field="created_at" label="Criado em" />
            </TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {actions.map((action) => (
            <TableRow key={action.id} className="hover:bg-muted/30">
              <TableCell>
                <Checkbox
                  checked={selectedIds.includes(action.id)}
                  onCheckedChange={() => onToggleSelect(action.id)}
                />
              </TableCell>
              <TableCell>
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary">
                  {getActionIcon(action.action_type)}
                </div>
              </TableCell>
              <TableCell className="font-medium">
                {action.action_type === 'payment' && 'Pagamento'}
                {action.action_type === 'invoice' && 'Fatura'}
                {action.action_type === 'task' && 'Tarefa'}
                {action.action_type === 'document_analysis' && 'Análise de Documento'}
                {action.action_type === 'question' && 'Pergunta'}
              </TableCell>
              <TableCell className="max-w-md">
                <p className="line-clamp-2 text-sm">{action.ai_suggestion}</p>
              </TableCell>
              <TableCell>
                <span className={getConfidenceColor(action.ai_confidence)}>
                  {action.ai_confidence}%
                </span>
              </TableCell>
              <TableCell>{getPriorityBadge(action.priority)}</TableCell>
              <TableCell>{getStatusBadge(action.status)}</TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {formatDate(action.created_at)}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onSelectAction(action)}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  
                  {action.status === 'pending' && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-green-600 hover:text-green-700 hover:bg-green-50"
                        onClick={() => onApprove(action.id)}
                      >
                        <ThumbsUp className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => onReject(action.id)}
                      >
                        <ThumbsDown className="w-4 h-4" />
                      </Button>
                    </>
                  )}

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onSelectAction(action)}>
                        Ver detalhes
                      </DropdownMenuItem>
                      {action.status === 'pending' && (
                        <>
                          <DropdownMenuItem onClick={() => onApprove(action.id)}>
                            Aprovar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onReject(action.id)}>
                            Rejeitar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onIgnore(action.id)}>
                            Ignorar
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};