
import { Edit, Trash2, CheckCircle, XCircle, Settings } from 'lucide-react';
import { Company } from '@/hooks/useCompanies';

interface CompanyCardProps {
  company: Company;
  onEdit: (company: Company) => void;
  onDelete: (company: Company) => void;
}

export const CompanyCard = ({ company, onEdit, onDelete }: CompanyCardProps) => {
  const getStatusIcon = (status: string | null) => {
    if (status === 'Ativo') return <CheckCircle className="w-4 h-4 text-green-500" />;
    if (status === 'Inativo') return <XCircle className="w-4 h-4 text-red-500" />;
    return <div className="w-4 h-4 bg-gray-300 rounded-full" />;
  };

  const getIntegrationStatus = (clickupStatus: string | null, omieStatus: string | null) => {
    const integrations = [];
    if (clickupStatus === 'Ativo') integrations.push('ClickUp');
    if (omieStatus === 'Ativo') integrations.push('Omie');
    return integrations.length > 0 ? integrations.join(', ') : 'Nenhuma';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
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
            onClick={() => onEdit(company)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Editar empresa"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(company)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Excluir empresa"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
