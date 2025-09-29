import React, { useState, useEffect } from 'react';
import { ConversationsList } from './ConversationsList';
import { ChatWindow } from './ChatWindow';
import { ContactInfo } from './ContactInfo';
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
  status: 'aguardando' | 'em_atendimento' | 'finalizado';
  priority: 'baixa' | 'media' | 'alta';
  tags: string[];
}

export const WhatsAppInterface = () => {
  const { messages, loading: messagesLoading, error: messagesError } = useMessages();
  const { contacts, loading: contactsLoading, error: contactsError } = useContacts();
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'todos' | 'aguardando' | 'em_atendimento' | 'finalizado'>('todos');

  // Processar mensagens e contatos para criar conversações
  useEffect(() => {
    if (!messages.length || !contacts.length) return;

    const conversationsMap = new Map<string, Conversation>();

    // Agrupar mensagens por contato
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

    // Calcular mensagens não lidas
    conversationsMap.forEach((conversation, contactId) => {
      const contactMessages = messages.filter(m => m.contact_id === contactId && !m.fromme);
      conversation.unreadCount = contactMessages.length;
    });

    const conversationsArray = Array.from(conversationsMap.values())
      .sort((a, b) => new Date(b.lastMessage.created_at).getTime() - new Date(a.lastMessage.created_at).getTime());

    setConversations(conversationsArray);
  }, [messages, contacts]);

  // Filtrar conversações
  const filteredConversations = conversations.filter(conv => {
    const matchesSearch = !searchTerm || 
      conv.contact.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.lastMessage.conteudo_mensagem?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'todos' || conv.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const activeConversationData = conversations.find(c => c.contact.id_contact === activeConversation);
  const activeContactMessages = messages.filter(m => m.contact_id === activeConversation);

  if (messagesLoading || contactsLoading) {
    return <LoadingSpinner />;
  }

  if (messagesError || contactsError) {
    return <ErrorState message={messagesError || contactsError || 'Erro ao carregar dados'} />;
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Lista de Conversações */}
      <div className="w-80 border-r border-border bg-card">
        <ConversationsList
          conversations={filteredConversations}
          activeConversation={activeConversation}
          onSelectConversation={setActiveConversation}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
        />
      </div>

      {/* Área Principal de Chat */}
      <div className="flex-1 flex">
        <div className="flex-1">
          {activeConversation ? (
            <ChatWindow
              conversation={activeConversationData!}
              messages={activeContactMessages}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <div className="text-center">
                <h3 className="text-lg font-medium mb-2">Selecione uma conversa</h3>
                <p>Escolha uma conversa na lista para começar a atender</p>
              </div>
            </div>
          )}
        </div>

        {/* Painel de Informações do Contato */}
        {activeConversationData && (
          <div className="w-80 border-l border-border bg-card">
            <ContactInfo
              contact={activeConversationData.contact}
              conversation={activeConversationData}
            />
          </div>
        )}
      </div>
    </div>
  );
};