import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  ChevronDown, 
  ChevronUp, 
  CheckCircle, 
  XCircle,
  DollarSign,
  FileText,
  CheckSquare,
  HelpCircle,
  Sparkles,
  Eye,
} from 'lucide-react';
import { SuggestedAction } from '@/hooks/useSuggestedActions';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ActionHistoryPanelProps {
  actions: SuggestedAction[];
  onViewDetails?: (action: SuggestedAction) => void;
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

export const ActionHistoryPanel: React.FC<ActionHistoryPanelProps> = ({ 
  actions,
  onViewDetails,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedAction, setExpandedAction] = useState<string | null>(null);

  // Filtrar apenas ações completed ou ignored
  const processedActions = actions.filter(
    action => action.status === 'completed' || action.status === 'ignored'
  );

  if (processedActions.length === 0) {
    return null;
  }

  const completedCount = processedActions.filter(a => a.status === 'completed').length;
  const ignoredCount = processedActions.filter(a => a.status === 'ignored').length;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="bg-muted/30 border-dashed">
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className="w-full justify-between p-4 hover:bg-muted/50"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="font-medium">Ações Processadas</span>
              <Badge variant="secondary" className="ml-2">
                {processedActions.length}
              </Badge>
            </div>
            {isOpen ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </Button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="px-4 pb-4">
            {/* Stats Summary */}
            <div className="flex gap-2 mb-3">
              <Badge variant="outline" className="bg-green-500/10 text-green-700 dark:text-green-400">
                <CheckCircle className="h-3 w-3 mr-1" />
                {completedCount} Processadas
              </Badge>
              {ignoredCount > 0 && (
                <Badge variant="outline" className="bg-muted text-muted-foreground">
                  <XCircle className="h-3 w-3 mr-1" />
                  {ignoredCount} Ignoradas
                </Badge>
              )}
            </div>

            {/* Actions List */}
            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-2">
                {processedActions.map((action) => {
                  const Icon = ACTION_ICONS[action.action_type];
                  const isExpanded = expandedAction === action.id;

                  return (
                    <Card 
                      key={action.id}
                      className={`p-3 transition-all ${
                        action.status === 'completed' 
                          ? 'bg-green-500/5 border-green-500/20' 
                          : 'bg-muted/50'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-2 flex-1">
                            <div className={`p-1.5 rounded ${
                              action.status === 'completed' 
                                ? 'bg-green-500/10' 
                                : 'bg-muted'
                            }`}>
                              <Icon className="h-3.5 w-3.5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm font-medium">
                                  {ACTION_LABELS[action.action_type]}
                                </span>
                                {action.status === 'completed' ? (
                                  <Badge variant="outline" className="h-5 bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20">
                                    <CheckCircle className="h-2.5 w-2.5 mr-1" />
                                    Processada
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="h-5 bg-muted text-muted-foreground">
                                    <XCircle className="h-2.5 w-2.5 mr-1" />
                                    Ignorada
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground line-clamp-2">
                                {action.ai_suggestion}
                              </p>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setExpandedAction(isExpanded ? null : action.id)}
                            className="h-7 w-7 p-0 ml-2"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                        </div>

                        {isExpanded && (
                          <div className="mt-2 pl-8 space-y-2 animate-fade-in">
                            <div className="bg-background/50 rounded p-2 space-y-1">
                              {Object.entries(action.extracted_data || {}).map(([key, value]) => (
                                <div key={key} className="flex justify-between text-xs">
                                  <span className="font-medium text-muted-foreground capitalize">
                                    {key.replace('_', ' ')}:
                                  </span>
                                  <span className="text-foreground">{String(value)}</span>
                                </div>
                              ))}
                            </div>
                            {action.executed_at && (
                              <p className="text-xs text-muted-foreground">
                                Processada em {format(new Date(action.executed_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                              </p>
                            )}
                            {action.notes && (
                              <p className="text-xs text-muted-foreground italic">
                                Nota: {action.notes}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </Card>
                  );
                })}
              </div>
            </ScrollArea>
          </div>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};
