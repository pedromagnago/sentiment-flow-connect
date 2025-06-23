import React, { useState, useEffect } from 'react';
import { Company } from '@/hooks/useCompanies';
import { X } from 'lucide-react';

interface CompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (companyData: Partial<Company>) => Promise<void>;
  company?: Company | null;
}

export const CompanyModal = ({ isOpen, onClose, onSave, company }: CompanyModalProps) => {
  const [formData, setFormData] = useState({
    nome: '',
    cnpj: '',
    segmento: '',
    status: 'Ativo',
    endereco: '',
    whatsapp_contato: '',
    email_contato: '',
    clickup_integration_status: 'Inativo',
    omie_integration_status: 'Inativo',
    n8n_integration_active: false,
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
    valor_mensalidade: 0,
    prazo_desconto: 0,
    desconto_percentual: 0,
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
        endereco: company.endereco || '',
        whatsapp_contato: company.whatsapp_contato || '',
        email_contato: company.email_contato || '',
        clickup_integration_status: company.clickup_integration_status || 'Inativo',
        omie_integration_status: company.omie_integration_status || 'Inativo',
        n8n_integration_active: company.n8n_integration_active || false,
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
        valor_mensalidade: company.valor_mensalidade || 0,
        prazo_desconto: company.prazo_desconto || 0,
        desconto_percentual: company.desconto_percentual || 0,
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
        endereco: '',
        whatsapp_contato: '',
        email_contato: '',
        clickup_integration_status: 'Inativo',
        omie_integration_status: 'Inativo',
        n8n_integration_active: false,
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
        valor_mensalidade: 0,
        prazo_desconto: 0,
        desconto_percentual: 0,
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
        client_id: '',
        companies_id: '',
        atividade: ''
      });
    }
  }, [company]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prepare data for submission, converting empty date strings to null
    const dataToSubmit = {
      ...formData,
      // Convert empty date strings to null
      due_date: formData.due_date === '' ? null : formData.due_date,
      date_created: formData.date_created === '' ? null : formData.date_created,
      start_date: formData.start_date === '' ? null : formData.start_date,
      date_closed: formData.date_closed === '' ? null : formData.date_closed,
      // Convert empty strings to null for optional text fields
      task_id: formData.task_id === '' ? null : formData.task_id,
      task_name: formData.task_name === '' ? null : formData.task_name,
      assignee: formData.assignee === '' ? null : formData.assignee,
      priority: formData.priority === '' ? null : formData.priority,
      task_status: formData.task_status === '' ? null : formData.task_status,
      linked_docs: formData.linked_docs === '' ? null : formData.linked_docs,
      envelope_id: formData.envelope_id === '' ? null : formData.envelope_id,
      client_id: formData.client_id === '' ? null : formData.client_id,
      companies_id: formData.companies_id === '' ? null : formData.companies_id
    };
    
    onSave(dataToSubmit);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement;
      setFormData(prev => ({
        ...prev,
        [name]: checkbox.checked
      }));
    } else if (type === 'number') {
      setFormData(prev => ({
        ...prev,
        [name]: value === '' ? 0 : Number(value)
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {company ? 'Editar Empresa' : 'Nova Empresa'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-xl font-bold"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
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
                    onChange={handleInputChange}
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
                    onChange={handleInputChange}
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
                    onChange={handleInputChange}
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
                    onChange={handleInputChange}
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
                    onChange={handleInputChange}
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
                    onChange={handleInputChange}
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
                    onChange={handleInputChange}
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
                    onChange={handleInputChange}
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
                    onChange={handleInputChange}
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
                    onChange={handleInputChange}
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
                    onChange={handleInputChange}
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
                    onChange={handleInputChange}
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
                    onChange={handleInputChange}
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
                    onChange={handleInputChange}
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
                    onChange={handleInputChange}
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
                    onChange={handleInputChange}
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
                    onChange={handleInputChange}
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
                    onChange={handleInputChange}
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
                    onChange={handleInputChange}
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
                    onChange={handleInputChange}
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
                    onChange={handleInputChange}
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
                    onChange={handleInputChange}
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
                    onChange={handleInputChange}
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
                    onChange={handleInputChange}
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
                    onChange={handleInputChange}
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
                    onChange={handleInputChange}
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
                    onChange={handleInputChange}
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
                    onChange={handleInputChange}
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
                    onChange={handleInputChange}
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
                    onChange={handleInputChange}
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
                    onChange={handleInputChange}
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
                    onChange={handleInputChange}
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
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Seção de Integrações */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Integrações</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ClickUp Status
                  </label>
                  <select
                    name="clickup_integration_status"
                    value={formData.clickup_integration_status}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Ativo">Ativo</option>
                    <option value="Inativo">Inativo</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Omie Status
                  </label>
                  <select
                    name="omie_integration_status"
                    value={formData.omie_integration_status}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Ativo">Ativo</option>
                    <option value="Inativo">Inativo</option>
                  </select>
                </div>

                <div>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="n8n_integration_active"
                      checked={formData.n8n_integration_active}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Integração N8N Ativa
                    </span>
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    Ativa o fluxo de avaliação por IA no N8N
                  </p>
                  {!formData.n8n_integration_active && (
                    <p className="text-xs text-amber-600 mt-1">
                      ⚠️ Desativar removerá dados de análise existentes
                    </p>
                  )}
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
                  onChange={handleInputChange}
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
    </div>
  );
};
