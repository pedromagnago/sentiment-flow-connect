import React from 'react';
import { useNavigate } from 'react-router-dom';
import { QueueView } from '@/components/whatsapp/views/QueueView';
import { useWhatsApp } from '@/contexts/WhatsAppContext';
import { useCompanyFilter } from '@/hooks/useCompanyFilter';

export const QueuePage = () => {
  const navigate = useNavigate();
  const { conversations, loading } = useWhatsApp();
  const { hasCompanyFilter } = useCompanyFilter();

  const handleSelectConversation = (contactId: string | null) => {
    if (contactId) {
      navigate(`/whatsapp/chats?contact=${contactId}`);
    }
  };

  // Show message if no company is selected
  if (!loading && !hasCompanyFilter) {
    return (
      <div className="flex items-center justify-center h-full bg-muted/30">
        <div className="text-center space-y-4 p-8">
          <div className="text-6xl mb-4">🏢</div>
          <h2 className="text-2xl font-semibold text-foreground">Selecione uma empresa</h2>
          <p className="text-muted-foreground max-w-md">
            Para visualizar a fila de atendimento, você precisa primeiro selecionar uma empresa no menu superior.
          </p>
        </div>
      </div>
    );
  }

  return (
    <QueueView
      conversations={conversations}
      onSelectConversation={handleSelectConversation}
    />
  );
};
