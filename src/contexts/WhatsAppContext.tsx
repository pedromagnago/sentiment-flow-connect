import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { useMessages } from '@/hooks/useMessages';
import { useContacts } from '@/hooks/useContacts';
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor';

export interface Contact {
  id_contact: string;
  nome?: string;
  status?: boolean;
  company_id?: string;
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
  usePerformanceMonitor('WhatsAppContext', 1000);
  
  const { messages, loading: messagesLoading, error: messagesError } = useMessages();
  const { contacts, loading: contactsLoading, error: contactsError } = useContacts();
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);

  // Web Worker setup
  const worker = useMemo(() => {
    if (typeof Worker !== 'undefined') {
      try {
        return new Worker(new URL('../workers/conversationProcessor.worker.ts', import.meta.url), {
          type: 'module'
        });
      } catch (error) {
        console.warn('Web Worker not available, using synchronous processing:', error);
        return null;
      }
    }
    return null;
  }, []);

  // Process conversations with Web Worker or fallback
  useEffect(() => {
    if (!messages.length || !contacts.length) {
      setConversations([]);
      return;
    }

    if (worker) {
      // Use Web Worker for heavy processing
      worker.postMessage({ messages, contacts });
      worker.onmessage = (e) => {
        setConversations(e.data);
      };
    } else {
      // Fallback to synchronous processing
      const contactsMap = new Map(contacts.map(c => [c.id_contact, c]));
      const conversationsMap = new Map<string, Conversation>();
      const now = Date.now();
      const dayAgo = now - 24 * 60 * 60 * 1000;

      messages.forEach(message => {
        const contact = contactsMap.get(message.contact_id);
        if (!contact) return;

        const existing = conversationsMap.get(message.contact_id);
        const messageTime = new Date(message.created_at).getTime();
        
        if (!existing || messageTime > new Date(existing.lastMessage.created_at).getTime()) {
          conversationsMap.set(message.contact_id, {
            contact,
            lastMessage: message,
            unreadCount: existing?.unreadCount || 0,
            status: existing?.status || 'aguardando',
            priority: existing?.priority || 'media',
            tags: existing?.tags || []
          });
        }

        if (!message.fromme && messageTime > dayAgo) {
          const conv = conversationsMap.get(message.contact_id)!;
          conv.unreadCount++;
        }
      });

      const conversationsArray = Array.from(conversationsMap.values())
        .sort((a, b) => new Date(b.lastMessage.created_at).getTime() - new Date(a.lastMessage.created_at).getTime());

      setConversations(conversationsArray);
    }
  }, [messages, contacts, worker]);

  // Cleanup worker on unmount
  useEffect(() => {
    return () => {
      if (worker) {
        worker.terminate();
      }
    };
  }, [worker]);

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
