import React, { useState } from 'react';
import { MessageCircle } from 'lucide-react';
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
    <div className="flex h-full bg-background">
      {/* Lista de Conversações */}
      <div className="w-80 border-r border-border bg-card shadow-sm">
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
            <div className="flex items-center justify-center h-full bg-muted/10">
              <div className="text-center p-8">
                <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <MessageCircle className="w-12 h-12 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Selecione uma conversa</h3>
                <p className="text-muted-foreground mb-6 max-w-md">
                  Escolha uma conversa na lista ao lado para começar a atender seus clientes
                </p>
                <div className="text-sm text-muted-foreground">
                  <p>💡 Dica: Use os filtros para encontrar conversas específicas</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Painel de Informações do Contato */}
        {activeConversationData && (
          <div className="w-80 border-l border-border bg-card shadow-sm">
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