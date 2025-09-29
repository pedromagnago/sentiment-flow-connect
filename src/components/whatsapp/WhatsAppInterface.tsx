import React, { useState, useEffect } from 'react';
import { TabNavigation } from './TabNavigation';
import { ChatsView } from './views/ChatsView';
import { QueueView } from './views/QueueView';
import { ContactsView } from './views/ContactsView';
import { useMessages } from '@/hooks/useMessages';
import { useContacts } from '@/hooks/useContacts';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorState } from '@/components/common/ErrorState';

export interface Contact {
  id_contact: string;
  nome?: string;
  status?: boolean;
  empresa_id?: string;
  feedback?: boolean;
  is_group?: boolean;
  data_criacao?: string;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  contact_id: string;
  conteudo_mensagem: string;
  nome_membro: string;
  data_hora: string;
  fromme: boolean;
  status_processamento: string;
  created_at: string;
  updated_at: string;
  tipo_mensagem?: string;
  link_arquivo?: string;
}

export interface Conversation {
  contact: Contact;
  lastMessage: Message;
  unreadCount: number;
  status: 'aguardando' | 'em_atendimento' | 'finalizado' | 'aguardando_retorno';
  priority: 'baixa' | 'media' | 'alta' | 'urgente';
  tags: string[];
}

export const WhatsAppInterface = () => {
  const { messages, loading: messagesLoading, error: messagesError } = useMessages();
  const { contacts, loading: contactsLoading, error: contactsError } = useContacts();
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeTab, setActiveTab] = useState<'chats' | 'fila' | 'contatos'>('chats');

  // Processar mensagens e contatos para criar conversações
  useEffect(() => {
    if (!messages.length || !contacts.length) {
      console.log('Waiting for data:', { messagesCount: messages.length, contactsCount: contacts.length });
      return;
    }

    console.log('Processing conversations from', messages.length, 'messages and', contacts.length, 'contacts');
    const conversationsMap = new Map<string, Conversation>();

    // Agrupar mensagens por contato (só contatos da empresa do usuário)
    let messagesWithoutContact = 0;
    messages.forEach(message => {
      const contact = contacts.find(c => c.id_contact === message.contact_id);
      if (!contact) {
        messagesWithoutContact++;
        return;
      }

      const existing = conversationsMap.get(message.contact_id);
      
      if (!existing || new Date(message.created_at) > new Date(existing.lastMessage.created_at)) {
        conversationsMap.set(message.contact_id, {
          contact,
          lastMessage: message,
          unreadCount: existing?.unreadCount || 0,
          status: existing?.status || 'aguardando',
          priority: existing?.priority || 'media',
          tags: existing?.tags || []
        });
      }
    });

    // Calcular mensagens não lidas (somente mensagens recebidas)
    conversationsMap.forEach((conversation, contactId) => {
      const contactMessages = messages.filter(m => 
        m.contact_id === contactId && 
        !m.fromme &&
        new Date(m.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000) // últimas 24h
      );
      conversation.unreadCount = contactMessages.length;
    });

    const conversationsArray = Array.from(conversationsMap.values())
      .sort((a, b) => new Date(b.lastMessage.created_at).getTime() - new Date(a.lastMessage.created_at).getTime());

    console.log('Conversations created:', conversationsArray.length);
    if (messagesWithoutContact > 0) {
      console.warn('Messages without matching contact:', messagesWithoutContact);
    }
    setConversations(conversationsArray);
  }, [messages, contacts]);


  if (messagesLoading || contactsLoading) {
    return <LoadingSpinner />;
  }

  if (messagesError || contactsError) {
    return <ErrorState message={messagesError || contactsError || 'Erro ao carregar dados'} />;
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'chats':
        return (
          <ChatsView
            conversations={conversations}
            activeConversation={activeConversation}
            onSelectConversation={setActiveConversation}
          />
        );
      case 'fila':
        return (
          <QueueView
            conversations={conversations}
            onSelectConversation={setActiveConversation}
          />
        );
      case 'contatos':
        return (
          <ContactsView
            onSelectContact={(contact) => {
              setActiveConversation(contact.id_contact);
              setActiveTab('chats');
            }}
          />
        );
      default:
        return null;
    }
  };

  const unreadCount = conversations.reduce((acc, conv) => acc + conv.unreadCount, 0);
  const queueCount = conversations.filter(conv => conv.status === 'aguardando').length;

  return (
    <div className="flex flex-col h-screen bg-background">
      <TabNavigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        unreadCount={unreadCount}
        queueCount={queueCount}
      />
      <div className="flex-1 overflow-hidden">
        {renderTabContent()}
      </div>
    </div>
  );
};