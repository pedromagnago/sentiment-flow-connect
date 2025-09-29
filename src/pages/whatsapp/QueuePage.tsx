import React from 'react';
import { useNavigate } from 'react-router-dom';
import { QueueView } from '@/components/whatsapp/views/QueueView';
import { useWhatsApp } from '@/contexts/WhatsAppContext';

export const QueuePage = () => {
  const navigate = useNavigate();
  const { conversations } = useWhatsApp();

  const handleSelectConversation = (contactId: string | null) => {
    if (contactId) {
      navigate(`/whatsapp/chats?contact=${contactId}`);
    }
  };

  return (
    <QueueView
      conversations={conversations}
      onSelectConversation={handleSelectConversation}
    />
  );
};
