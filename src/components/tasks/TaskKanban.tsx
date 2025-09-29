import { Task, useInternalTasks } from '@/hooks/useInternalTasks';
import { TaskColumn } from './TaskColumn';

const COLUMNS = [
  { title: 'A Fazer', status: 'todo' as const },
  { title: 'Em Progresso', status: 'in_progress' as const },
  { title: 'Em Revisão', status: 'review' as const },
  { title: 'Concluído', status: 'done' as const },
];

export const TaskKanban = () => {
  const { tasks, deleteTask, moveTask } = useInternalTasks();

  const handleDrop = (taskId: string, newStatus: Task['status']) => {
    moveTask({ id: taskId, status: newStatus });
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {COLUMNS.map(column => (
        <TaskColumn
          key={column.status}
          title={column.title}
          status={column.status}
          tasks={tasks}
          onDelete={deleteTask}
          onDrop={handleDrop}
        />
      ))}
    </div>
  );
};
