import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ChatsView } from '@/components/whatsapp/views/ChatsView';
import { useWhatsApp } from '@/contexts/WhatsAppContext';

export const ChatsPage = () => {
  const [searchParams] = useSearchParams();
  const { conversations, activeConversation, setActiveConversation } = useWhatsApp();
  
  useEffect(() => {
    const contactId = searchParams.get('contact');
    if (contactId && contactId !== activeConversation) {
      setActiveConversation(contactId);
    }
  }, [searchParams, activeConversation, setActiveConversation]);

  return (
    <ChatsView
      conversations={conversations}
      activeConversation={activeConversation}
      onSelectConversation={setActiveConversation}
    />
  );
};
