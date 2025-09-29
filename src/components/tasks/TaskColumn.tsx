import { Task } from '@/hooks/useInternalTasks';
import { TaskCard } from './TaskCard';
import { Card } from '@/components/ui/card';
import { useMemo } from 'react';

interface TaskColumnProps {
  title: string;
  status: Task['status'];
  tasks: Task[];
  onDelete: (id: string) => void;
  onDrop: (taskId: string, newStatus: Task['status']) => void;
}

export const TaskColumn = ({ title, status, tasks, onDelete, onDrop }: TaskColumnProps) => {
  const columnTasks = useMemo(
    () => tasks.filter(task => task.status === status),
    [tasks, status]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    if (taskId) {
      onDrop(taskId, status);
    }
  };

  return (
    <div 
      className="flex-1 min-w-[280px]"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <Card className="h-full">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">{title}</h3>
            <span className="text-sm text-muted-foreground">
              {columnTasks.length}
            </span>
          </div>
        </div>

        <div className="p-4 space-y-3 min-h-[400px]">
          {columnTasks.map(task => (
            <div
              key={task.id}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData('taskId', task.id);
              }}
            >
              <TaskCard task={task} onDelete={onDelete} />
            </div>
          ))}

          {columnTasks.length === 0 && (
            <div className="text-center text-muted-foreground text-sm py-8">
              Nenhuma tarefa
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
