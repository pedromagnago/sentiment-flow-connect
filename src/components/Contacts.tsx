
import { Users, Search, Plus, Phone, MoreVertical, Edit, Trash2, Database, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { useContacts } from '@/hooks/useContacts';
import { ContactModal } from './ContactModal';
import { useToast } from '@/hooks/use-toast';
import { ContactBulkOperations } from './contacts/ContactBulkOperations';
import { useContactBulkOperations } from '@/hooks/useContactBulkOperations';

export const Contacts = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('Todos');
  const [filterType, setFilterType] = useState('Todos');
  const [filterFeedback, setFilterFeedback] = useState('Todos');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showBulkOperations, setShowBulkOperations] = useState(false);
  const { contacts, loading, error, createContact, updateContact, deleteContact, refetch } = useContacts();
  const { toast } = useToast();
  const bulkOps = useContactBulkOperations();

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = contact.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contact.id_contact?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'Todos' || 
                         (filterStatus === 'Ativo' && contact.status) ||
                         (filterStatus === 'Inativo' && !contact.status);
    const matchesType = filterType === 'Todos' ||
                       (filterType === 'Grupo' && contact.is_group) ||
                       (filterType === 'Individual' && !contact.is_group);
    const matchesFeedback = filterFeedback === 'Todos' ||
                           (filterFeedback === 'Ativo' && contact.feedback) ||
                           (filterFeedback === 'Inativo' && !contact.feedback);
    return matchesSearch && matchesStatus && matchesType && matchesFeedback;
  });

  const handleCreateContact = async (contactData) => {
    try {
      await createContact(contactData);
      setIsModalOpen(false);
      toast({
        title: "Contato criado",
        description: "O contato foi criado com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleEditContact = async (contactData) => {
    try {
      await updateContact(editingContact.id_contact, contactData);
      setIsModalOpen(false);
      setEditingContact(null);
      toast({
        title: "Contato atualizado",
        description: "O contato foi atualizado com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteContact = async (contact) => {
    if (window.confirm(`Tem certeza que deseja excluir o contato "${contact.nome}"? Esta ação não pode ser desfeita.`)) {
      try {
        await deleteContact(contact.id_contact);
        toast({
          title: "Contato excluído",
          description: "O contato foi excluído com sucesso.",
        });
      } catch (error) {
        toast({
          title: "Erro",
          description: error.message,
          variant: "destructive",
        });
      }
    }
  };

  const handleBulkCreate = async (contactsData) => {
    try {
      // Criar contatos um por um para melhor controle de erros
      const results = [];
      const errors = [];
      
      for (let i = 0; i < contactsData.length; i++) {
        try {
          const result = await createContact(contactsData[i]);
          results.push(result);
        } catch (error) {
          errors.push({ index: i + 1, error: error.message });
        }
      }

      if (errors.length > 0) {
        console.warn('Erros na importação:', errors);
        toast({
          title: "Importação parcial",
          description: `${results.length} contatos criados. ${errors.length} com erro.`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Importação concluída",
          description: `${results.length} contatos foram criados com sucesso.`,
        });
      }
    } catch (error) {
      throw error;
    }
  };

  const handleBulkDelete = async (contactIds) => {
    try {
      // Excluir contatos um por um
      for (const id of contactIds) {
        await deleteContact(id);
      }
      bulkOps.clearSelection();
    } catch (error) {
      throw error;
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
      toast({
        title: "Dados atualizados",
        description: "A lista de contatos foi atualizada com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar a lista de contatos.",
        variant: "destructive",
      });
    } finally {
      setRefreshing(false);
    }
  };

  const getStatusColor = (status: boolean) => {
    return status ? 'text-green-600 bg-green-100' : 'text-gray-600 bg-gray-100';
  };

  const getSentimentColor = (feedback: boolean) => {
    return feedback ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100';
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-500">Carregando contatos...</div>
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
          <h1 className="text-3xl font-bold text-gray-900">Contatos</h1>
          <p className="text-gray-600 mt-1">Gerencie seus contatos e acompanhe interações</p>
        </div>
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => setShowBulkOperations(!showBulkOperations)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              showBulkOperations 
                ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            title="Operações em massa"
          >
            <Database className="w-4 h-4" />
            <span>Operações em Massa</span>
          </button>
          
          <button 
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center space-x-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
            title="Atualizar lista"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Atualizar</span>
          </button>
          
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Contato</span>
          </button>
        </div>
      </div>

      {/* Filtros e Busca */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar contatos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="Todos">Todos Status</option>
            <option value="Ativo">Ativos</option>
            <option value="Inativo">Inativos</option>
          </select>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="Todos">Todos Tipos</option>
            <option value="Individual">Individual</option>
            <option value="Grupo">Grupo</option>
          </select>
          <select
            value={filterFeedback}
            onChange={(e) => setFilterFeedback(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="Todos">Todos Feedbacks</option>
            <option value="Ativo">Ativo</option>
            <option value="Inativo">Inativo</option>
          </select>
        </div>
      </div>

      {/* Operações em Massa */}
      {showBulkOperations && (
        <ContactBulkOperations
          contacts={filteredContacts}
          onBulkCreate={handleBulkCreate}
          onBulkDelete={handleBulkDelete}
        />
      )}

      {/* Lista de Contatos */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Lista de Contatos ({filteredContacts.length})
          </h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contato
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Feedback
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data Criação
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredContacts.map((contact) => (
                <tr key={contact.id_contact} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {contact.nome || 'Nome não informado'}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center">
                        <Phone className="w-3 h-3 mr-1" />
                        {contact.id_contact}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(contact.status)}`}>
                      {contact.status ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSentimentColor(contact.feedback)}`}>
                      {contact.feedback ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {contact.is_group ? 'Grupo' : 'Individual'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {contact.data_criacao ? new Date(contact.data_criacao).toLocaleDateString('pt-BR') : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setEditingContact(contact);
                          setIsModalOpen(true);
                        }}
                        className="text-blue-600 hover:text-blue-800"
                        title="Editar contato"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteContact(contact)}
                        className="text-red-600 hover:text-red-800"
                        title="Excluir contato"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredContacts.length === 0 && (
          <div className="p-6 text-center text-gray-500">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p>Nenhum contato encontrado.</p>
            <p className="text-sm text-gray-400 mt-1">
              {searchTerm ? 'Tente ajustar os filtros de busca.' : 'Comece criando seu primeiro contato.'}
            </p>
          </div>
        )}
      </div>

      <ContactModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingContact(null);
        }}
        onSave={editingContact ? handleEditContact : handleCreateContact}
        contact={editingContact}
      />
    </div>
  );
};
