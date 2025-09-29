import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useInternalTasks } from '@/hooks/useInternalTasks';
import { TaskKanban } from '@/components/tasks/TaskKanban';
import { Plus, CheckSquare, Clock, ListTodo } from 'lucide-react';

export default function TasksPage() {
  const { tasks, isLoading, createTask } = useInternalTasks();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    titulo: '',
    descricao: '',
    prazo: '',
    prioridade: 'normal' as const,
  });

  const handleCreateTask = () => {
    if (!newTask.titulo) return;

    createTask({
      titulo: newTask.titulo,
      descricao: newTask.descricao || undefined,
      prazo: newTask.prazo || undefined,
      prioridade: newTask.prioridade,
      status: 'todo',
    });

    setNewTask({
      titulo: '',
      descricao: '',
      prazo: '',
      prioridade: 'normal',
    });
    setIsDialogOpen(false);
  };

  const todoTasks = tasks.filter(t => t.status === 'todo').length;
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length;
  const doneTasks = tasks.filter(t => t.status === 'done').length;

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-muted-foreground">Carregando tarefas...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tarefas Internas</h1>
          <p className="text-muted-foreground">
            Gerencie tarefas criadas via WhatsApp e manualmente
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Nova Tarefa
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Nova Tarefa</DialogTitle>
              <DialogDescription>
                Adicione uma nova tarefa ao quadro Kanban
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Título *</Label>
                <Input
                  value={newTask.titulo}
                  onChange={(e) => setNewTask({ ...newTask, titulo: e.target.value })}
                  placeholder="Ex: Revisar contrato"
                />
              </div>

              <div>
                <Label>Descrição</Label>
                <Textarea
                  value={newTask.descricao}
                  onChange={(e) => setNewTask({ ...newTask, descricao: e.target.value })}
                  placeholder="Descreva a tarefa..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Prazo</Label>
                  <Input
                    type="date"
                    value={newTask.prazo}
                    onChange={(e) => setNewTask({ ...newTask, prazo: e.target.value })}
                  />
                </div>

                <div>
                  <Label>Prioridade</Label>
                  <Select
                    value={newTask.prioridade}
                    onValueChange={(value: any) => setNewTask({ ...newTask, prioridade: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Baixa</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="high">Alta</SelectItem>
                      <SelectItem value="urgent">Urgente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button onClick={handleCreateTask} className="w-full" disabled={!newTask.titulo}>
                Criar Tarefa
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-lg">
              <CheckSquare className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-2xl font-bold">{tasks.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
              <ListTodo className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">A Fazer</p>
              <p className="text-2xl font-bold">{todoTasks}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Clock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Em Progresso</p>
              <p className="text-2xl font-bold">{inProgressTasks}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
              <CheckSquare className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Concluídas</p>
              <p className="text-2xl font-bold">{doneTasks}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Kanban Board */}
      <TaskKanban />
    </div>
  );
}
