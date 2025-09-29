import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ContactsView } from '@/components/whatsapp/views/ContactsView';

export const ContactsPage = () => {
  const navigate = useNavigate();

  return (
    <ContactsView
      onSelectContact={(contact) => {
        navigate(`/whatsapp/chats?contact=${contact.id_contact}`);
      }}
    />
  );
};
