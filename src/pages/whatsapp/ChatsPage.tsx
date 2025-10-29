import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ChatsView } from '@/components/whatsapp/views/ChatsView';
import { useWhatsApp } from '@/contexts/WhatsAppContext';
import { useCompanyFilter } from '@/hooks/useCompanyFilter';

export const ChatsPage = () => {
  const [searchParams] = useSearchParams();
  const { conversations, activeConversation, setActiveConversation, loading } = useWhatsApp();
  const { hasCompanyFilter } = useCompanyFilter();
  
  useEffect(() => {
    const contactId = searchParams.get('contact');
    if (contactId && contactId !== activeConversation) {
      setActiveConversation(contactId);
    }
  }, [searchParams, activeConversation, setActiveConversation]);

  // Show message if no company is selected
  if (!loading && !hasCompanyFilter) {
    return (
      <div className="flex items-center justify-center h-full bg-muted/30">
        <div className="text-center space-y-4 p-8">
          <div className="text-6xl mb-4">🏢</div>
          <h2 className="text-2xl font-semibold text-foreground">Selecione uma empresa</h2>
          <p className="text-muted-foreground max-w-md">
            Para visualizar as conversas do WhatsApp, você precisa primeiro selecionar uma empresa no menu superior.
          </p>
        </div>
      </div>
    );
  }

  return (
    <ChatsView
      conversations={conversations}
      activeConversation={activeConversation}
      onSelectConversation={setActiveConversation}
    />
  );
};
