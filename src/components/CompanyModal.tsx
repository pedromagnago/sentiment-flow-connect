
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
    informacoes_contato: {},
    // Novos campos
    task_id: '',
    task_name: '',
    assignee: '',
    due_date: '',
    priority: '',
    task_status: '',
    date_created: '',
    start_date: '',
    date_closed: '',
    linked_docs: '',
    valor_mensalidade: '',
    prazo_desconto: '',
    endereco: '',
    desconto_percentual: '',
    aceitar_politica_privacidade: false,
    nome_contato: '',
    fonte_lead: '',
    cpf_representante: '',
    email_representante: '',
    email_testemunha: '',
    envelope_id: '',
    nome_representante: '',
    nome_testemunha: '',
    tipo_contrato: '',
    cargo: '',
    whatsapp_contato: '',
    email_contato: '',
    client_id: '',
    companies_id: '',
    atividade: ''
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
        informacoes_contato: company.informacoes_contato || {},
        // Novos campos
        task_id: company.task_id || '',
        task_name: company.task_name || '',
        assignee: company.assignee || '',
        due_date: company.due_date || '',
        priority: company.priority || '',
        task_status: company.task_status || '',
        date_created: company.date_created || '',
        start_date: company.start_date || '',
        date_closed: company.date_closed || '',
        linked_docs: company.linked_docs || '',
        valor_mensalidade: company.valor_mensalidade || '',
        prazo_desconto: company.prazo_desconto || '',
        endereco: company.endereco || '',
        desconto_percentual: company.desconto_percentual || '',
        aceitar_politica_privacidade: company.aceitar_politica_privacidade || false,
        nome_contato: company.nome_contato || '',
        fonte_lead: company.fonte_lead || '',
        cpf_representante: company.cpf_representante || '',
        email_representante: company.email_representante || '',
        email_testemunha: company.email_testemunha || '',
        envelope_id: company.envelope_id || '',
        nome_representante: company.nome_representante || '',
        nome_testemunha: company.nome_testemunha || '',
        tipo_contrato: company.tipo_contrato || '',
        cargo: company.cargo || '',
        whatsapp_contato: company.whatsapp_contato || '',
        email_contato: company.email_contato || '',
        client_id: company.client_id || '',
        companies_id: company.companies_id || '',
        atividade: company.atividade || ''
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement;
      setFormData(prev => ({
        ...prev,
        [name]: checkbox.checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  if (!isOpen) return null;

  const priorityOptions = ['Baixa', 'Média', 'Alta', 'Urgente'];
  const statusTaskOptions = ['Pendente', 'Em Andamento', 'Concluída', 'Cancelada'];
  const fonteLeadOptions = ['Site', 'Indicação', 'Google Ads', 'Facebook', 'Instagram', 'LinkedIn', 'Outros'];
  const tipoContratoOptions = ['Mensal', 'Anual', 'Por Projeto', 'Outros'];
  const segmentoOptions = ['Tecnologia', 'Saúde', 'Educação', 'Varejo', 'Serviços', 'Indústria', 'Outros'];
  const atividadeOptions = ['Consultoria', 'Desenvolvimento', 'Suporte', 'Treinamento', 'Outros'];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-6xl mx-4 max-h-[90vh] overflow-y-auto">
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

        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {/* Informações Básicas da Empresa */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Informações Básicas da Empresa</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  🏭 Nome da Empresa *
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
                <select
                  name="segmento"
                  value={formData.segmento}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Selecione um segmento</option>
                  {segmentoOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Atividade
                </label>
                <select
                  name="atividade"
                  value={formData.atividade}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Selecione uma atividade</option>
                  {atividadeOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Endereço
                </label>
                <input
                  type="text"
                  name="endereco"
                  value={formData.endereco}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Informações de Contato */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Informações de Contato</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  👤 Nome do Contato
                </label>
                <input
                  type="text"
                  name="nome_contato"
                  value={formData.nome_contato}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  📱 WhatsApp do Contato
                </label>
                <input
                  type="tel"
                  name="whatsapp_contato"
                  value={formData.whatsapp_contato}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ✉️ E-mail do Contato
                </label>
                <input
                  type="email"
                  name="email_contato"
                  value={formData.email_contato}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  💼 Cargo
                </label>
                <input
                  type="text"
                  name="cargo"
                  value={formData.cargo}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fonte do Lead
                </label>
                <select
                  name="fonte_lead"
                  value={formData.fonte_lead}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Selecione uma fonte</option>
                  {fonteLeadOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Informações do Representante */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Informações do Representante</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome do Representante
                </label>
                <input
                  type="text"
                  name="nome_representante"
                  value={formData.nome_representante}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CPF do Representante
                </label>
                <input
                  type="text"
                  name="cpf_representante"
                  value={formData.cpf_representante}
                  onChange={handleChange}
                  placeholder="000.000.000-00"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  E-mail do Representante
                </label>
                <input
                  type="email"
                  name="email_representante"
                  value={formData.email_representante}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome da Testemunha
                </label>
                <input
                  type="text"
                  name="nome_testemunha"
                  value={formData.nome_testemunha}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  E-mail da Testemunha
                </label>
                <input
                  type="email"
                  name="email_testemunha"
                  value={formData.email_testemunha}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Informações do Contrato */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Informações do Contrato</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Contrato
                </label>
                <select
                  name="tipo_contrato"
                  value={formData.tipo_contrato}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Selecione um tipo</option>
                  {tipoContratoOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valor da Mensalidade (R$)
                </label>
                <input
                  type="number"
                  name="valor_mensalidade"
                  value={formData.valor_mensalidade}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Desconto %
                </label>
                <input
                  type="number"
                  name="desconto_percentual"
                  value={formData.desconto_percentual}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  max="100"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prazo do Desconto (dias)
                </label>
                <input
                  type="number"
                  name="prazo_desconto"
                  value={formData.prazo_desconto}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Envelope ID
                </label>
                <input
                  type="text"
                  name="envelope_id"
                  value={formData.envelope_id}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Informações de Task */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Informações de Task</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Task ID
                </label>
                <input
                  type="text"
                  name="task_id"
                  value={formData.task_id}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Task Name
                </label>
                <input
                  type="text"
                  name="task_name"
                  value={formData.task_name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assignee
                </label>
                <input
                  type="text"
                  name="assignee"
                  value={formData.assignee}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Selecione uma prioridade</option>
                  {priorityOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status da Task
                </label>
                <select
                  name="task_status"
                  value={formData.task_status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Selecione um status</option>
                  {statusTaskOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  name="due_date"
                  value={formData.due_date}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date Created
                </label>
                <input
                  type="date"
                  name="date_created"
                  value={formData.date_created}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date Closed
                </label>
                <input
                  type="date"
                  name="date_closed"
                  value={formData.date_closed}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Linked Docs
                </label>
                <textarea
                  name="linked_docs"
                  value={formData.linked_docs}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="URLs ou referências de documentos relacionados"
                />
              </div>
            </div>
          </div>

          {/* IDs do Sistema */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">IDs do Sistema</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Client ID
                </label>
                <input
                  type="text"
                  name="client_id"
                  value={formData.client_id}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Companies ID
                </label>
                <input
                  type="text"
                  name="companies_id"
                  value={formData.companies_id}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Integração ClickUp */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Integração ClickUp</h3>
            
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
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Integração Omie</h3>
            
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

          {/* Política de Privacidade */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Conformidade</h3>
            
            <div className="flex items-start space-x-3">
              <input
                type="checkbox"
                id="aceitar_politica_privacidade"
                name="aceitar_politica_privacidade"
                checked={formData.aceitar_politica_privacidade}
                onChange={handleChange}
                className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="aceitar_politica_privacidade" className="text-sm text-gray-700">
                Aceitar a Política de Privacidade e Segurança da FullBPO:{' '}
                <a 
                  href="https://fullbpo.com/politica-de-privacidade-e-seguranca/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  https://fullbpo.com/politica-de-privacidade-e-seguranca/
                </a>
              </label>
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
