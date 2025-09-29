import React from 'react';
import { Search, Filter, Clock, MessageCircle, AlertCircle, User, Users as UsersIcon, ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
      case 'aguardando': return 'bg-red-50 text-red-700 border-red-200';
      case 'em_atendimento': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'finalizado': return 'bg-green-50 text-green-700 border-green-200';
      case 'aguardando_retorno': return 'bg-blue-50 text-blue-700 border-blue-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'aguardando': return <Clock className="w-3 h-3" />;
      case 'em_atendimento': return <MessageCircle className="w-3 h-3" />;
      case 'finalizado': return <div className="w-3 h-3 bg-green-500 rounded-full" />;
      case 'aguardando_retorno': return <AlertCircle className="w-3 h-3" />;
      default: return <Clock className="w-3 h-3" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgente': return 'text-red-600';
      case 'alta': return 'text-orange-600';
      case 'media': return 'text-yellow-600';
      case 'baixa': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const formatLastMessageTime = (dateString: string) => {
    const now = new Date();
    const messageDate = new Date(dateString);
    const diffInHours = (now.getTime() - messageDate.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return messageDate.toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
    
    return formatDistanceToNow(messageDate, {
      addSuffix: true,
      locale: ptBR
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const truncateMessage = (message: string, maxLength: number = 60) => {
    if (message.length <= maxLength) return message;
    return message.slice(0, maxLength) + '...';
  };

  return (
    <div className="flex flex-col h-full bg-card">
      {/* Header com filtros */}
      <div className="p-4 border-b border-border bg-muted/30">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Conversas</h2>
          <Badge variant="outline" className="text-xs">
            {conversations.length} total
          </Badge>
        </div>
        
        {/* Busca */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Buscar por nome ou mensagem..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 bg-background"
          />
        </div>

        {/* Filtro de Status */}
        <Select value={statusFilter} onValueChange={onStatusFilterChange}>
          <SelectTrigger className="w-full bg-background">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <SelectValue placeholder="Filtrar por status" />
            </div>
            <ChevronDown className="w-4 h-4" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os status</SelectItem>
            <SelectItem value="aguardando">Aguardando</SelectItem>
            <SelectItem value="em_atendimento">Em atendimento</SelectItem>
            <SelectItem value="aguardando_retorno">Aguardando retorno</SelectItem>
            <SelectItem value="finalizado">Finalizado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Lista de Conversas */}
      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground p-8">
            <div className="text-center">
              <MessageCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="font-medium mb-2">Nenhuma conversa encontrada</h3>
              <p className="text-sm">Tente ajustar os filtros ou aguarde novas mensagens</p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {conversations.map((conversation) => (
              <div
                key={conversation.contact.id_contact}
                onClick={() => onSelectConversation(conversation.contact.id_contact)}
                className={`p-4 cursor-pointer transition-all duration-200 hover:bg-muted/50 ${
                  activeConversation === conversation.contact.id_contact
                    ? 'bg-primary/10 border-r-4 border-r-primary shadow-sm'
                    : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <Avatar className="w-12 h-12 shrink-0">
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-primary/10 text-primary font-medium">
                      {conversation.contact.is_group ? (
                        <UsersIcon className="w-6 h-6" />
                      ) : (
                        getInitials(conversation.contact.nome || conversation.contact.id_contact)
                      )}
                    </AvatarFallback>
                  </Avatar>

                  {/* Conteúdo da conversa */}
                  <div className="flex-1 min-w-0">
                    {/* Header da conversa */}
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2 min-w-0">
                        <h3 className="font-medium text-sm truncate">
                          {conversation.contact.nome || conversation.contact.id_contact}
                        </h3>
                        {conversation.contact.is_group && (
                          <Badge variant="outline" className="text-xs">
                            Grupo
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-1 shrink-0">
                        <span className="text-xs text-muted-foreground">
                          {formatLastMessageTime(conversation.lastMessage.created_at)}
                        </span>
                      </div>
                    </div>
                    
                    {/* Última mensagem */}
                    <p className="text-sm text-muted-foreground mb-2 leading-relaxed">
                      {conversation.lastMessage.fromme && (
                        <span className="text-primary font-medium">Você: </span>
                      )}
                      {truncateMessage(conversation.lastMessage.conteudo_mensagem || 'Mídia')}
                    </p>
                    
                    {/* Footer com status e badges */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant="outline" 
                          className={`text-xs border px-2 py-0.5 ${getStatusColor(conversation.status)}`}
                        >
                          <div className="flex items-center gap-1">
                            {getStatusIcon(conversation.status)}
                            <span>{conversation.status.replace('_', ' ')}</span>
                          </div>
                        </Badge>
                        
                        {conversation.priority !== 'media' && (
                          <div className={`w-2 h-2 rounded-full ${getPriorityColor(conversation.priority)}`} 
                               title={`Prioridade: ${conversation.priority}`}
                          />
                        )}
                      </div>
                      
                      <div className="flex items-center gap-1">
                        {conversation.unreadCount > 0 && (
                          <Badge variant="default" className="h-5 px-2 text-xs bg-primary">
                            {conversation.unreadCount}
                          </Badge>
                        )}
                        
                        {conversation.tags.length > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            +{conversation.tags.length}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};