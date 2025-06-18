
import { CheckSquare, Plus, Calendar, User, Clock, Filter } from 'lucide-react';
import { useState } from 'react';
import { useTaskGroups } from '@/hooks/useTaskGroups';

export const Tasks = () => {
  const [filterStatus, setFilterStatus] = useState('Todas');
  const { taskGroups, loading, error } = useTaskGroups();

  const filteredTasks = filterStatus === 'Todas' 
    ? taskGroups 
    : taskGroups.filter(task => task.status_clickup === filterStatus);

  const getStatusColor = (status: string) => {
    if (!status) return 'text-gray-600 bg-gray-100';
    
    const statusLower = status.toLowerCase();
    if (statusLower.includes('complet') || statusLower.includes('done')) {
      return 'text-green-600 bg-green-100';
    } else if (statusLower.includes('progress') || statusLower.includes('doing')) {
      return 'text-blue-600 bg-blue-100';
    } else if (statusLower.includes('pending') || statusLower.includes('todo')) {
      return 'text-yellow-600 bg-yellow-100';
    }
    return 'text-gray-600 bg-gray-100';
  };

  const getStatusDisplay = (status: string) => {
    if (!status) return 'Sem Status';
    return status;
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-500">Carregando tarefas...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-red-500">Erro: {error}</div>
        </div>
      </div>
    );
  }

  const completedTasks = taskGroups.filter(task => 
    task.status_clickup?.toLowerCase().includes('complet') || 
    task.status_clickup?.toLowerCase().includes('done')
  ).length;

  const inProgressTasks = taskGroups.filter(task => 
    task.status_clickup?.toLowerCase().includes('progress') || 
    task.status_clickup?.toLowerCase().includes('doing')
  ).length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tarefas ClickUp</h1>
          <p className="text-gray-600 mt-1">Gerencie suas tarefas e acompanhe o progresso</p>
        </div>
        <button className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          <Plus className="w-4 h-4" />
          <span>Nova Tarefa</span>
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-4">
          <Filter className="w-5 h-5 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Filtrar por status:</span>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="Todas">Todas</option>
            {Array.from(new Set(taskGroups.map(task => task.status_clickup).filter(Boolean))).map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Estatísticas das Tarefas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total de Tarefas</p>
              <p className="text-3xl font-bold mt-2">{taskGroups.length}</p>
            </div>
            <CheckSquare className="w-8 h-8 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-yellow-500 to-orange-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm font-medium">Em Progresso</p>
              <p className="text-3xl font-bold mt-2">{inProgressTasks}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Concluídas</p>
              <p className="text-3xl font-bold mt-2">{completedTasks}</p>
            </div>
            <CheckSquare className="w-8 h-8 text-green-200" />
          </div>
        </div>
      </div>

      {/* Lista de Tarefas */}
      <div className="space-y-4">
        {filteredTasks.map((task) => (
          <div key={task.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{task.nome_grupo || 'Grupo sem nome'}</h3>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(task.status_clickup)}`}>
                    {getStatusDisplay(task.status_clickup)}
                  </span>
                </div>
                
                <p className="text-gray-600 mb-4">ID: {task.id}</p>
                
                <div className="flex items-center space-x-6 text-sm text-gray-500">
                  <div className="flex items-center">
                    <User className="w-4 h-4 mr-1" />
                    {task["workflow.name"] || 'Workflow não definido'}
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {new Date(task.created_at).toLocaleDateString('pt-BR')}
                  </div>
                </div>
                
                {task["execution.id"] && (
                  <div className="mt-2 text-sm text-gray-500">
                    Execução: {task["execution.id"]}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {filteredTasks.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
            <p className="text-gray-500">Nenhuma tarefa encontrada.</p>
          </div>
        )}
      </div>
    </div>
  );
};
