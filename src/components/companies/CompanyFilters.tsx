
import { Search } from 'lucide-react';

interface CompanyFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filterStatus: string;
  onStatusChange: (status: string) => void;
  filterN8n: string;
  onN8nChange: (n8n: string) => void;
  filterFeedback: string;
  onFeedbackChange: (feedback: string) => void;
}

export const CompanyFilters = ({ 
  searchTerm, 
  onSearchChange, 
  filterStatus, 
  onStatusChange,
  filterN8n,
  onN8nChange,
  filterFeedback,
  onFeedbackChange
}: CompanyFiltersProps) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nome, CNPJ ou segmento..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={filterStatus}
            onChange={(e) => onStatusChange(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-[120px]"
          >
            <option value="Todas">Todas</option>
            <option value="Ativo">Ativas</option>
            <option value="Inativo">Inativas</option>
          </select>
          
          <select
            value={filterN8n}
            onChange={(e) => onN8nChange(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-[120px]"
          >
            <option value="Todos">N8N - Todos</option>
            <option value="Ativo">N8N - Ativo</option>
            <option value="Inativo">N8N - Inativo</option>
          </select>
          
          <select
            value={filterFeedback}
            onChange={(e) => onFeedbackChange(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-[120px]"
          >
            <option value="Todos">Feedback - Todos</option>
            <option value="Ativo">Feedback - Ativo</option>
            <option value="Inativo">Feedback - Inativo</option>
          </select>
        </div>
      </div>
    </div>
  );
};
