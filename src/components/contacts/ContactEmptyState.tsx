
import React from 'react';
import { Users } from 'lucide-react';

interface ContactEmptyStateProps {
  hasSearch: boolean;
}

export const ContactEmptyState = ({ hasSearch }: ContactEmptyStateProps) => {
  return (
    <div className="p-6 text-center text-gray-500">
      <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
      <p>Nenhum contato encontrado.</p>
      <p className="text-sm text-gray-400 mt-1">
        {hasSearch ? 'Tente ajustar os filtros de busca.' : 'Comece criando seu primeiro contato.'}
      </p>
    </div>
  );
};
