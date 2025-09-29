import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useMessages } from '@/hooks/useMessages';
import { useContacts } from '@/hooks/useContacts';

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

interface WhatsAppContextType {
  messages: Message[];
  contacts: Contact[];
  conversations: Conversation[];
  activeConversation: string | null;
  setActiveConversation: (contactId: string | null) => void;
  loading: boolean;
  error: string | null;
  unreadCount: number;
  queueCount: number;
}

const WhatsAppContext = createContext<WhatsAppContextType | undefined>(undefined);

export const WhatsAppProvider = ({ children }: { children: ReactNode }) => {
  const { messages, loading: messagesLoading, error: messagesError } = useMessages();
  const { contacts, loading: contactsLoading, error: contactsError } = useContacts();
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);

  useEffect(() => {
    if (!messages.length || !contacts.length) return;

    const conversationsMap = new Map<string, Conversation>();

    messages.forEach(message => {
      const contact = contacts.find(c => c.id_contact === message.contact_id);
      if (!contact) return;

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

    conversationsMap.forEach((conversation, contactId) => {
      const contactMessages = messages.filter(m => 
        m.contact_id === contactId && 
        !m.fromme &&
        new Date(m.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)
      );
      conversation.unreadCount = contactMessages.length;
    });

    const conversationsArray = Array.from(conversationsMap.values())
      .sort((a, b) => new Date(b.lastMessage.created_at).getTime() - new Date(a.lastMessage.created_at).getTime());

    setConversations(conversationsArray);
  }, [messages, contacts]);

  const unreadCount = conversations.reduce((acc, conv) => acc + conv.unreadCount, 0);
  const queueCount = conversations.filter(conv => conv.status === 'aguardando').length;

  return (
    <WhatsAppContext.Provider
      value={{
        messages,
        contacts,
        conversations,
        activeConversation,
        setActiveConversation,
        loading: messagesLoading || contactsLoading,
        error: messagesError || contactsError,
        unreadCount,
        queueCount,
      }}
    >
      {children}
    </WhatsAppContext.Provider>
  );
};

export const useWhatsApp = () => {
  const context = useContext(WhatsAppContext);
  if (!context) {
    throw new Error('useWhatsApp must be used within WhatsAppProvider');
  }
  return context;
};
