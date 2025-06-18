
import { Building2, Plus, Search, Edit, Trash2, Settings, CheckCircle, XCircle } from 'lucide-react';
import { useState } from 'react';
import { useCompanies } from '@/hooks/useCompanies';
import { CompanyModal } from './CompanyModal';
import { useToast } from '@/hooks/use-toast';

export const Companies = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('Todas');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const { companies, loading, error, createCompany, updateCompany, deleteCompany } = useCompanies();
  const { toast } = useToast();

  const filteredCompanies = companies
    .filter(company => company.deleted_at === null) // Não mostrar empresas excluídas
    .filter(company => {
      const matchesSearch = company.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           company.cnpj?.includes(searchTerm) ||
                           company.segmento?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'Todas' || company.status === filterStatus;
      return matchesSearch && matchesStatus;
    });

  const handleCreateCompany = async (companyData) => {
    try {
      await createCompany(companyData);
      setIsModalOpen(false);
      toast({
        title: "Empresa criada",
        description: "A empresa foi criada com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleEditCompany = async (companyData) => {
    try {
      await updateCompany(editingCompany.id, companyData);
      setIsModalOpen(false);
      setEditingCompany(null);
      toast({
        title: "Empresa atualizada",
        description: "A empresa foi atualizada com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteCompany = async (company) => {
    if (window.confirm(`Tem certeza que deseja excluir a empresa "${company.nome}"?`)) {
      try {
        await deleteCompany(company.id);
        toast({
          title: "Empresa excluída",
          description: "A empresa foi excluída com sucesso.",
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

  const getStatusIcon = (status) => {
    if (status === 'Ativo') return <CheckCircle className="w-4 h-4 text-green-500" />;
    if (status === 'Inativo') return <XCircle className="w-4 h-4 text-red-500" />;
    return <div className="w-4 h-4 bg-gray-300 rounded-full" />;
  };

  const getIntegrationStatus = (clickupStatus, omieStatus) => {
    const integrations = [];
    if (clickupStatus === 'Ativo') integrations.push('ClickUp');
    if (omieStatus === 'Ativo') integrations.push('Omie');
    return integrations.length > 0 ? integrations.join(', ') : 'Nenhuma';
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-500">Carregando empresas...</div>
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
          <h1 className="text-3xl font-bold text-gray-900">Gestão de Empresas</h1>
          <p className="text-gray-600 mt-1">Gerencie suas empresas clientes e suas integrações</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Empresa</span>
        </button>
      </div>

      {/* Filtros e Busca */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nome, CNPJ ou segmento..."
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
            <option value="Todas">Todas</option>
            <option value="Ativo">Ativas</option>
            <option value="Inativo">Inativas</option>
          </select>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total</p>
              <p className="text-3xl font-bold mt-2">{filteredCompanies.length}</p>
            </div>
            <Building2 className="w-8 h-8 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Ativas</p>
              <p className="text-3xl font-bold mt-2">
                {filteredCompanies.filter(c => c.status === 'Ativo').length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-yellow-500 to-orange-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm font-medium">Com ClickUp</p>
              <p className="text-3xl font-bold mt-2">
                {filteredCompanies.filter(c => c.clickup_integration_status === 'Ativo').length}
              </p>
            </div>
            <Settings className="w-8 h-8 text-yellow-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Com Omie</p>
              <p className="text-3xl font-bold mt-2">
                {filteredCompanies.filter(c => c.omie_integration_status === 'Ativo').length}
              </p>
            </div>
            <Settings className="w-8 h-8 text-purple-200" />
          </div>
        </div>
      </div>

      {/* Lista de Empresas */}
      <div className="space-y-4">
        {filteredCompanies.map((company) => (
          <div key={company.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {company.nome || 'Empresa sem nome'}
                  </h3>
                  {getStatusIcon(company.status)}
                  <span className="text-sm text-gray-500">
                    {company.status || 'Status não definido'}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-500">CNPJ</p>
                    <p className="font-medium">{company.cnpj || 'Não informado'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Segmento</p>
                    <p className="font-medium">{company.segmento || 'Não informado'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Integrações</p>
                    <p className="font-medium">
                      {getIntegrationStatus(company.clickup_integration_status, company.omie_integration_status)}
                    </p>
                  </div>
                </div>

                <div className="text-sm text-gray-500">
                  Criada em: {company.created_at ? new Date(company.created_at).toLocaleDateString('pt-BR') : 'Data não disponível'}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    setEditingCompany(company);
                    setIsModalOpen(true);
                  }}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Editar empresa"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteCompany(company)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Excluir empresa"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
        
        {filteredCompanies.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
            <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">Nenhuma empresa encontrada.</p>
            <p className="text-sm text-gray-400 mt-1">
              {searchTerm ? 'Tente ajustar os filtros de busca.' : 'Comece criando sua primeira empresa.'}
            </p>
          </div>
        )}
      </div>

      {/* Modal */}
      <CompanyModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingCompany(null);
        }}
        onSave={editingCompany ? handleEditCompany : handleCreateCompany}
        company={editingCompany}
      />
    </div>
  );
};
