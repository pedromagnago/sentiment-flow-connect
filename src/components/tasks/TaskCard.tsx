import { Task } from '@/hooks/useInternalTasks';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, User, Trash2, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface TaskCardProps {
  task: Task;
  onDelete: (id: string) => void;
}

const PRIORITY_CONFIG = {
  low: { label: 'Baixa', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' },
  normal: { label: 'Normal', color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300' },
  high: { label: 'Alta', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300' },
  urgent: { label: 'Urgente', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' },
};

export const TaskCard = ({ task, onDelete }: TaskCardProps) => {
  const priorityConfig = PRIORITY_CONFIG[task.prioridade];

  return (
    <Card className="p-4 hover:shadow-md transition-shadow cursor-move">
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <h3 className="font-semibold text-sm line-clamp-2">{task.titulo}</h3>
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(task.id);
            }}
            className="h-6 w-6 p-0"
          >
            <Trash2 className="h-3 w-3 text-destructive" />
          </Button>
        </div>

        {task.descricao && (
          <p className="text-xs text-muted-foreground line-clamp-2">
            {task.descricao}
          </p>
        )}

        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className={priorityConfig.color}>
            {priorityConfig.label}
          </Badge>

          {task.prazo && (
            <Badge variant="outline" className="text-xs">
              <Calendar className="h-3 w-3 mr-1" />
              {format(new Date(task.prazo), 'dd/MM', { locale: ptBR })}
            </Badge>
          )}
        </div>

        {task.contact_id && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <User className="h-3 w-3" />
            <span>WhatsApp</span>
          </div>
        )}

        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>{format(new Date(task.created_at), 'dd/MM/yy HH:mm', { locale: ptBR })}</span>
        </div>
      </div>
    </Card>
  );
};
