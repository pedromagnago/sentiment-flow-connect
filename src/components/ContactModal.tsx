
import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Contact } from '@/hooks/useContacts';
import { useCompanies } from '@/hooks/useCompanies';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (contactData: Partial<Contact>) => void;
  contact?: Contact | null;
}

export const ContactModal = ({ isOpen, onClose, onSave, contact }: ContactModalProps) => {
  const { companies } = useCompanies();
  const [formData, setFormData] = useState({
    nome: '',
    id_contact: '',
    status: true,
    feedback: true,
    is_group: false,
    empresa_id: ''
  });

  // Atualizar formData quando o contact prop mudar
  useEffect(() => {
    if (contact) {
      setFormData({
        nome: contact.nome || '',
        id_contact: contact.id_contact || '',
        status: contact.status ?? true,
        feedback: contact.feedback ?? true,
        is_group: contact.is_group ?? false,
        empresa_id: contact.empresa_id || ''
      });
    } else {
      // Reset form para novo contato
      setFormData({
        nome: '',
        id_contact: '',
        status: true,
        feedback: true,
        is_group: false,
        empresa_id: ''
      });
    }
  }, [contact, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            {contact ? 'Editar Contato' : 'Novo Contato'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome *
            </label>
            <input
              type="text"
              value={formData.nome}
              onChange={(e) => handleChange('nome', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Telefone/ID Contato *
            </label>
            <input
              type="text"
              value={formData.id_contact}
              onChange={(e) => handleChange('id_contact', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ex: 5511999999999"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Empresa
            </label>
            <select
              value={formData.empresa_id}
              onChange={(e) => handleChange('empresa_id', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Selecione uma empresa</option>
              {companies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.nome}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="status"
              checked={formData.status}
              onChange={(e) => handleChange('status', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="status" className="text-sm font-medium text-gray-700">
              Contato ativo
            </label>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="feedback"
              checked={formData.feedback}
              onChange={(e) => handleChange('feedback', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="feedback" className="text-sm font-medium text-gray-700">
              Feedback positivo
            </label>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="is_group"
              checked={formData.is_group}
              onChange={(e) => handleChange('is_group', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="is_group" className="text-sm font-medium text-gray-700">
              É um grupo
            </label>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {contact ? 'Atualizar' : 'Criar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
