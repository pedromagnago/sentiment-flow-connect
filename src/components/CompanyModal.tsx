
import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface CompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (companyData: any) => void;
  company?: any;
}

export const CompanyModal = ({ isOpen, onClose, onSave, company }: CompanyModalProps) => {
  const [formData, setFormData] = useState({
    nome: '',
    cnpj: '',
    segmento: '',
    status: 'Ativo',
    clickup_api_key: '',
    clickup_workspace_id: '',
    clickup_integration_status: 'Inativo',
    omie_api_key: '',
    omie_api_secret: '',
    omie_company_id: '',
    omie_integration_status: 'Inativo',
    informacoes_contato: {}
  });

  useEffect(() => {
    if (company) {
      setFormData({
        nome: company.nome || '',
        cnpj: company.cnpj || '',
        segmento: company.segmento || '',
        status: company.status || 'Ativo',
        clickup_api_key: company.clickup_api_key || '',
        clickup_workspace_id: company.clickup_workspace_id || '',
        clickup_integration_status: company.clickup_integration_status || 'Inativo',
        omie_api_key: company.omie_api_key || '',
        omie_api_secret: company.omie_api_secret || '',
        omie_company_id: company.omie_company_id || '',
        omie_integration_status: company.omie_integration_status || 'Inativo',
        informacoes_contato: company.informacoes_contato || {}
      });
    } else {
      setFormData({
        nome: '',
        cnpj: '',
        segmento: '',
        status: 'Ativo',
        clickup_api_key: '',
        clickup_workspace_id: '',
        clickup_integration_status: 'Inativo',
        omie_api_key: '',
        omie_api_secret: '',
        omie_company_id: '',
        omie_integration_status: 'Inativo',
        informacoes_contato: {}
      });
    }
  }, [company]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {company ? 'Editar Empresa' : 'Nova Empresa'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Informações Básicas */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Informações Básicas</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome da Empresa *
                </label>
                <input
                  type="text"
                  name="nome"
                  value={formData.nome}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CNPJ
                </label>
                <input
                  type="text"
                  name="cnpj"
                  value={formData.cnpj}
                  onChange={handleChange}
                  placeholder="00.000.000/0000-00"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Segmento
                </label>
                <input
                  type="text"
                  name="segmento"
                  value={formData.segmento}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Ativo">Ativo</option>
                  <option value="Inativo">Inativo</option>
                </select>
              </div>
            </div>
          </div>

          {/* Integração ClickUp */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Integração ClickUp</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  API Key ClickUp
                </label>
                <input
                  type="password"
                  name="clickup_api_key"
                  value={formData.clickup_api_key}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Workspace ID
                </label>
                <input
                  type="text"
                  name="clickup_workspace_id"
                  value={formData.clickup_workspace_id}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status Integração ClickUp
                </label>
                <select
                  name="clickup_integration_status"
                  value={formData.clickup_integration_status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Ativo">Ativo</option>
                  <option value="Inativo">Inativo</option>
                </select>
              </div>
            </div>
          </div>

          {/* Integração Omie */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Integração Omie</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  API Key Omie
                </label>
                <input
                  type="password"
                  name="omie_api_key"
                  value={formData.omie_api_key}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  API Secret Omie
                </label>
                <input
                  type="password"
                  name="omie_api_secret"
                  value={formData.omie_api_secret}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company ID Omie
                </label>
                <input
                  type="text"
                  name="omie_company_id"
                  value={formData.omie_company_id}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status Integração Omie
                </label>
                <select
                  name="omie_integration_status"
                  value={formData.omie_integration_status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Ativo">Ativo</option>
                  <option value="Inativo">Inativo</option>
                </select>
              </div>
            </div>
          </div>

          {/* Botões */}
          <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors"
            >
              {company ? 'Atualizar' : 'Criar'} Empresa
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
