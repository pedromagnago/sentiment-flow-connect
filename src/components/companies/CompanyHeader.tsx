
import { Plus, RefreshCw, Database } from 'lucide-react';

interface CompanyHeaderProps {
  onRefresh: () => void;
  onAddNew: () => void;
  onToggleBulkOperations: () => void;
  refreshing: boolean;
  showBulkOperations: boolean;
}

export const CompanyHeader = ({ 
  onRefresh, 
  onAddNew, 
  onToggleBulkOperations,
  refreshing,
  showBulkOperations 
}: CompanyHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Gestão de Empresas</h1>
        <p className="text-gray-600 mt-1">Gerencie suas empresas clientes e suas integrações</p>
      </div>
      <div className="flex items-center space-x-2">
        <button 
          onClick={onToggleBulkOperations}
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
          onClick={onRefresh}
          disabled={refreshing}
          className="flex items-center space-x-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
          title="Atualizar lista"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          <span>Atualizar</span>
        </button>
        
        <button 
          onClick={onAddNew}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Empresa</span>
        </button>
      </div>
    </div>
  );
};
