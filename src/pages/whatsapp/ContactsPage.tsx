import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ContactsView } from '@/components/whatsapp/views/ContactsView';
import { useCompanyContext } from '@/contexts/CompanyContext';

export const ContactsPage = () => {
  const navigate = useNavigate();
  const { activeCompanyId } = useCompanyContext();

  // Show message if no company is selected
  if (!activeCompanyId) {
    return (
      <div className="flex items-center justify-center h-full bg-muted/30">
        <div className="text-center space-y-4 p-8">
          <div className="text-6xl mb-4">🏢</div>
          <h2 className="text-2xl font-semibold text-foreground">Selecione uma empresa</h2>
          <p className="text-muted-foreground max-w-md">
            Para visualizar os contatos, você precisa primeiro selecionar uma empresa no menu superior.
          </p>
        </div>
      </div>
    );
  }

  return (
    <ContactsView
      onSelectContact={(contact) => {
        navigate(`/whatsapp/chats?contact=${contact.id_contact}`);
      }}
    />
  );
};
