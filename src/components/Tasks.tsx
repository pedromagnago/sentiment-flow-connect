
import { CheckSquare, Plus, Calendar, User, Clock, Filter } from 'lucide-react';
import { useState } from 'react';

const tasksData = [
  {
    id: 1,
    title: 'Implementar nova funcionalidade de relatórios',
    description: 'Desenvolver sistema de relatórios personalizados para análise de sentimentos',
    status: 'Em Progresso',
    priority: 'Alta',
    assignee: 'João Silva',
    dueDate: '2024-01-15',
    progress: 60
  },
  {
    id: 2,
    title: 'Correção de bugs na integração ClickUp',
    description: 'Resolver problemas de sincronização com a API do ClickUp',
    status: 'Pendente',
    priority: 'Média',
    assignee: 'Maria Santos',
    dueDate: '2024-01-10',
    progress: 0
  },
  {
    id: 3,
    title: 'Otimização da análise de sentimentos',
    description: 'Melhorar performance dos algoritmos de análise',
    status: 'Concluída',
    priority: 'Alta',
    assignee: 'Pedro Oliveira',
    dueDate: '2024-01-05',
    progress: 100
  }
];

export const Tasks = () => {
  const [filterStatus, setFilterStatus] = useState('Todas');

  const filteredTasks = filterStatus === 'Todas' 
    ? tasksData 
    : tasksData.filter(task => task.status === filterStatus);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Concluída':
        return 'text-green-600 bg-green-100';
      case 'Em Progresso':
        return 'text-blue-600 bg-blue-100';
      case 'Pendente':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Alta':
        return 'text-red-600 bg-red-100';
      case 'Média':
        return 'text-yellow-600 bg-yellow-100';
      case 'Baixa':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

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
            <option value="Pendente">Pendente</option>
            <option value="Em Progresso">Em Progresso</option>
            <option value="Concluída">Concluída</option>
          </select>
        </div>
      </div>

      {/* Estatísticas das Tarefas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total de Tarefas</p>
              <p className="text-3xl font-bold mt-2">{tasksData.length}</p>
            </div>
            <CheckSquare className="w-8 h-8 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-yellow-500 to-orange-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm font-medium">Em Progresso</p>
              <p className="text-3xl font-bold mt-2">
                {tasksData.filter(task => task.status === 'Em Progresso').length}
              </p>
            </div>
            <Clock className="w-8 h-8 text-yellow-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Concluídas</p>
              <p className="text-3xl font-bold mt-2">
                {tasksData.filter(task => task.status === 'Concluída').length}
              </p>
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
                  <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(task.status)}`}>
                    {task.status}
                  </span>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(task.priority)}`}>
                    {task.priority}
                  </span>
                </div>
                
                <p className="text-gray-600 mb-4">{task.description}</p>
                
                <div className="flex items-center space-x-6 text-sm text-gray-500">
                  <div className="flex items-center">
                    <User className="w-4 h-4 mr-1" />
                    {task.assignee}
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {new Date(task.dueDate).toLocaleDateString('pt-BR')}
                  </div>
                </div>
                
                {/* Barra de Progresso */}
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">Progresso</span>
                    <span className="text-sm text-gray-500">{task.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${task.progress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
