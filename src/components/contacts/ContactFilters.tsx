
import React from 'react';
import { Search } from 'lucide-react';

interface ContactFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filterStatus: string;
  onStatusChange: (status: string) => void;
  filterType: string;
  onTypeChange: (type: string) => void;
  filterFeedback: string;
  onFeedbackChange: (feedback: string) => void;
}

export const ContactFilters = ({
  searchTerm,
  onSearchChange,
  filterStatus,
  onStatusChange,
  filterType,
  onTypeChange,
  filterFeedback,
  onFeedbackChange
}: ContactFiltersProps) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Buscar contatos..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => onStatusChange(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="Todos">Todos Status</option>
          <option value="Ativo">Ativos</option>
          <option value="Inativo">Inativos</option>
        </select>
        <select
          value={filterType}
          onChange={(e) => onTypeChange(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="Todos">Todos Tipos</option>
          <option value="Individual">Individual</option>
          <option value="Grupo">Grupo</option>
        </select>
        <select
          value={filterFeedback}
          onChange={(e) => onFeedbackChange(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="Todos">Todos Feedbacks</option>
          <option value="Ativo">Ativo</option>
          <option value="Inativo">Inativo</option>
        </select>
      </div>
    </div>
  );
};
