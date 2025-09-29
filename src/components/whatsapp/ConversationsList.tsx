import React from 'react';
import { Search, Filter, Clock, MessageCircle, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Conversation } from './WhatsAppInterface';

interface ConversationsListProps {
  conversations: Conversation[];
  activeConversation: string | null;
  onSelectConversation: (contactId: string) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  statusFilter: string;
  onStatusFilterChange: (status: any) => void;
}

export const ConversationsList = ({
  conversations,
  activeConversation,
  onSelectConversation,
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange
}: ConversationsListProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'aguardando': return 'bg-red-100 text-red-800';
      case 'em_atendimento': return 'bg-yellow-100 text-yellow-800';
      case 'finalizado': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'alta': return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'media': return <Clock className="w-4 h-4 text-yellow-500" />;
      default: return null;
    }
  };

  const formatLastMessageTime = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), {
      addSuffix: true,
      locale: ptBR
    });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold mb-3">Conversas</h2>
        
        {/* Busca */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Buscar conversas..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Filtro de Status */}
        <Select value={statusFilter} onValueChange={onStatusFilterChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os status</SelectItem>
            <SelectItem value="aguardando">Aguardando</SelectItem>
            <SelectItem value="em_atendimento">Em atendimento</SelectItem>
            <SelectItem value="finalizado">Finalizado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Lista de Conversas */}
      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <div className="text-center">
              <MessageCircle className="w-8 h-8 mx-auto mb-2" />
              <p>Nenhuma conversa encontrada</p>
            </div>
          </div>
        ) : (
          conversations.map((conversation) => (
            <div
              key={conversation.contact.id_contact}
              onClick={() => onSelectConversation(conversation.contact.id_contact)}
              className={`p-4 border-b border-border cursor-pointer hover:bg-muted/50 transition-colors ${
                activeConversation === conversation.contact.id_contact
                  ? 'bg-primary/10 border-l-4 border-l-primary'
                  : ''
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-sm truncate max-w-[180px]">
                    {conversation.contact.nome || conversation.contact.id_contact}
                  </h3>
                  {getPriorityIcon(conversation.priority)}
                </div>
                <div className="flex items-center gap-1">
                  {conversation.unreadCount > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {conversation.unreadCount}
                    </Badge>
                  )}
                  <Badge className={`text-xs ${getStatusColor(conversation.status)}`}>
                    {conversation.status.replace('_', ' ')}
                  </Badge>
                </div>
              </div>
              
              <p className="text-xs text-muted-foreground truncate mb-2">
                {conversation.lastMessage.conteudo_mensagem || 'Mídia'}
              </p>
              
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {formatLastMessageTime(conversation.lastMessage.created_at)}
                </span>
                
                {conversation.tags.length > 0 && (
                  <div className="flex gap-1">
                    {conversation.tags.slice(0, 2).map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};