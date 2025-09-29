import React, { useState } from 'react';
import { ConversationsList } from '../ConversationsList';
import { ChatWindow } from '../ChatWindow';
import { ContactInfo } from '../ContactInfo';
import { useMessages } from '@/hooks/useMessages';
import { useContacts } from '@/hooks/useContacts';
import type { Conversation } from '../WhatsAppInterface';

interface ChatsViewProps {
  conversations: Conversation[];
  activeConversation: string | null;
  onSelectConversation: (contactId: string | null) => void;
}

export const ChatsView: React.FC<ChatsViewProps> = ({
  conversations,
  activeConversation,
  onSelectConversation
}) => {
  const { messages } = useMessages();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'todos' | 'aguardando' | 'em_atendimento' | 'finalizado' | 'aguardando_retorno'>('todos');

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

  return (
    <div className="flex h-full">
      {/* Lista de Conversações */}
      <div className="w-80 border-r border-border bg-card">
        <ConversationsList
          conversations={filteredConversations}
          activeConversation={activeConversation}
          onSelectConversation={onSelectConversation}
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