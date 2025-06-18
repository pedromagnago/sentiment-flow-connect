
import { Check, X, Edit, Clock, MessageSquare, User, Calendar } from 'lucide-react';
import { useState } from 'react';
import { useTaskRevisions } from '@/hooks/useTaskRevisions';
import { useToast } from '@/hooks/use-toast';

export const TaskApprovals = () => {
  const [filterStatus, setFilterStatus] = useState('Todas');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectFeedback, setRejectFeedback] = useState('');
  
  const { 
    revisions, 
    loading, 
    error, 
    approveRevision, 
    rejectRevision, 
    modifyRevision 
  } = useTaskRevisions();
  const { toast } = useToast();

  const filteredRevisions = revisions.filter(revision => {
    if (filterStatus === 'Todas') return true;
    return revision.status === filterStatus;
  });

  const handleApprove = async (id: string) => {
    try {
      await approveRevision(id);
      toast({
        title: "Tarefa aprovada",
        description: "A tarefa foi aprovada com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleReject = async () => {
    if (!rejectingId || !rejectFeedback.trim()) return;
    
    try {
      await rejectRevision(rejectingId, rejectFeedback);
      setRejectingId(null);
      setRejectFeedback('');
      toast({
        title: "Tarefa rejeitada",
        description: "A tarefa foi rejeitada com feedback.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleModify = async () => {
    if (!editingId || !editText.trim()) return;
    
    try {
      await modifyRevision(editingId, editText);
      setEditingId(null);
      setEditText('');
      toast({
        title: "Tarefa modificada",
        description: "A tarefa foi modificada com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'Pendente': { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      'Aprovado': { color: 'bg-green-100 text-green-800', icon: Check },
      'Rejeitado': { color: 'bg-red-100 text-red-800', icon: X },
      'Modificado': { color: 'bg-blue-100 text-blue-800', icon: Edit },
    };
    
    const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800', icon: Clock };
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {status || 'Pendente'}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-500">Carregando revisões de tarefas...</div>
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

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Aprovação de Tarefas</h1>
          <p className="text-gray-600 mt-1">Gerencie as demandas identificadas pela IA</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="Todas">Todas</option>
            <option value="Pendente">Pendentes</option>
            <option value="Aprovado">Aprovadas</option>
            <option value="Rejeitado">Rejeitadas</option>
            <option value="Modificado">Modificadas</option>
          </select>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-yellow-500 to-orange-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm font-medium">Pendentes</p>
              <p className="text-3xl font-bold mt-2">
                {revisions.filter(r => !r.status || r.status === 'Pendente').length}
              </p>
            </div>
            <Clock className="w-8 h-8 text-yellow-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Aprovadas</p>
              <p className="text-3xl font-bold mt-2">
                {revisions.filter(r => r.status === 'Aprovado').length}
              </p>
            </div>
            <Check className="w-8 h-8 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-red-500 to-pink-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm font-medium">Rejeitadas</p>
              <p className="text-3xl font-bold mt-2">
                {revisions.filter(r => r.status === 'Rejeitado').length}
              </p>
            </div>
            <X className="w-8 h-8 text-red-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Modificadas</p>
              <p className="text-3xl font-bold mt-2">
                {revisions.filter(r => r.status === 'Modificado').length}
              </p>
            </div>
            <Edit className="w-8 h-8 text-blue-200" />
          </div>
        </div>
      </div>

      {/* Lista de Revisões */}
      <div className="space-y-4">
        {filteredRevisions.map((revision) => (
          <div key={revision.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Tarefa #{revision.id.slice(0, 8)}
                  </h3>
                  {getStatusBadge(revision.status)}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4" />
                    <span>Contato: {revision.contact_id || 'N/A'}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MessageSquare className="w-4 h-4" />
                    <span>Workflow: {revision['workflow.name'] || 'N/A'}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {revision.created_at 
                        ? new Date(revision.created_at).toLocaleDateString('pt-BR')
                        : 'N/A'
                      }
                    </span>
                  </div>
                </div>

                {/* Texto da Tarefa */}
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <h4 className="font-medium text-gray-900 mb-2">Tarefa Identificada:</h4>
                  {editingId === revision.id ? (
                    <div className="space-y-3">
                      <textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows={4}
                      />
                      <div className="flex space-x-2">
                        <button
                          onClick={handleModify}
                          className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                        >
                          Salvar
                        </button>
                        <button
                          onClick={() => {
                            setEditingId(null);
                            setEditText('');
                          }}
                          className="px-3 py-1 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 text-sm"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-700">
                      {revision.texto_tarefa_formatado || 'Texto não disponível'}
                    </p>
                  )}
                </div>

                {/* Feedback do Cliente */}
                {revision.feedback_cliente && (
                  <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
                    <h4 className="font-medium text-red-900 mb-1">Feedback de Rejeição:</h4>
                    <p className="text-red-800">{revision.feedback_cliente}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Ações */}
            {(!revision.status || revision.status === 'Pendente') && (
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => handleApprove(revision.id)}
                  className="flex items-center space-x-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Check className="w-4 h-4" />
                  <span>Aprovar</span>
                </button>
                
                <button
                  onClick={() => {
                    setEditingId(revision.id);
                    setEditText(revision.texto_tarefa_formatado || '');
                  }}
                  className="flex items-center space-x-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  <span>Modificar</span>
                </button>
                
                <button
                  onClick={() => setRejectingId(revision.id)}
                  className="flex items-center space-x-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <X className="w-4 h-4" />
                  <span>Rejeitar</span>
                </button>
              </div>
            )}
          </div>
        ))}
        
        {filteredRevisions.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
            <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">Nenhuma revisão de tarefa encontrada.</p>
            <p className="text-sm text-gray-400 mt-1">
              {filterStatus !== 'Todas' 
                ? `Não há revisões com status "${filterStatus}".`
                : 'Aguardando identificação de demandas pela IA.'
              }
            </p>
          </div>
        )}
      </div>

      {/* Modal de Rejeição */}
      {rejectingId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Rejeitar Tarefa
              </h3>
              <p className="text-gray-600 mb-4">
                Por favor, forneça um feedback explicando o motivo da rejeição:
              </p>
              <textarea
                value={rejectFeedback}
                onChange={(e) => setRejectFeedback(e.target.value)}
                placeholder="Explique por que esta tarefa está sendo rejeitada..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                rows={4}
              />
              <div className="flex items-center justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setRejectingId(null);
                    setRejectFeedback('');
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleReject}
                  disabled={!rejectFeedback.trim()}
                  className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Rejeitar Tarefa
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
