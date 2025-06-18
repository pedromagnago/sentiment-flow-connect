
import React from 'react';
import { Building2 } from 'lucide-react';

interface CompanyEmptyStateProps {
  hasSearch: boolean;
}

export const CompanyEmptyState = ({ hasSearch }: CompanyEmptyStateProps) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
      <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
      <p className="text-gray-500">Nenhuma empresa encontrada.</p>
      <p className="text-sm text-gray-400 mt-1">
        {hasSearch ? 'Tente ajustar os filtros de busca.' : 'Comece criando sua primeira empresa.'}
      </p>
    </div>
  );
};
