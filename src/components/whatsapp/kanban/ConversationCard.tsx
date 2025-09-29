import React from 'react';
import { Draggable } from 'react-beautiful-dnd';
import { Clock, AlertTriangle, User, MessageCircle } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Conversation } from '../WhatsAppInterface';
import type { ConversationAssignment } from '@/hooks/useConversationAssignments';

interface ConversationCardProps {
  index: number;
  conversation: Conversation;
  assignment?: ConversationAssignment;
  onSelectConversation: (contactId: string | null) => void;
  onAssumeConversation?: (contactId: string) => void;
}

export const ConversationCard: React.FC<ConversationCardProps> = ({
  index,
  conversation,
  assignment,
  onSelectConversation,
  onAssumeConversation
}) => {
  const getInitials = (name?: string) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'alta': return 'bg-red-100 text-red-700 border-red-300';
      case 'urgente': return 'bg-red-200 text-red-800 border-red-400';
      case 'media': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'baixa': return 'bg-green-100 text-green-700 border-green-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d`;
    }
  };

  const isOverdue = assignment?.sla_deadline && new Date(assignment.sla_deadline) < new Date();

  return (
    <Draggable draggableId={conversation.contact.id_contact} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`bg-card border rounded-lg p-3 shadow-sm transition-all hover:shadow-md ${
            snapshot.isDragging ? 'rotate-2 shadow-lg' : ''
          }`}
        >
          {/* Header do card */}
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <Avatar className="h-8 w-8 flex-shrink-0">
                <AvatarImage src="" />
                <AvatarFallback className="text-xs">
                  {getInitials(conversation.contact.nome)}
                </AvatarFallback>
              </Avatar>
              
              <div className="min-w-0 flex-1">
                <p className="font-medium text-sm truncate">
                  {conversation.contact.nome || 'Contato sem nome'}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {conversation.contact.id_contact}
                </p>
              </div>
            </div>

            {assignment?.priority && (
              <Badge variant="outline" className={`text-xs ${getPriorityColor(assignment.priority)}`}>
                {assignment.priority}
              </Badge>
            )}
          </div>

          {/* Última mensagem */}
          <div className="mb-3">
            <p className="text-xs text-muted-foreground line-clamp-2">
              {conversation.lastMessage.conteudo_mensagem}
            </p>
            {conversation.contact.empresa_id && (
              <p className="text-xs text-muted-foreground mt-1">
                <Badge variant="outline" className="text-xs">
                  {conversation.contact.empresa_id}
                </Badge>
              </p>
            )}
          </div>

          {/* Footer do card */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              {formatTime(conversation.lastMessage.created_at)}
            </div>

            <div className="flex items-center gap-1">
              {isOverdue && (
                <AlertTriangle className="h-3 w-3 text-red-500" />
              )}
              
              {conversation.unreadCount > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {conversation.unreadCount}
                </Badge>
              )}
              
              {onAssumeConversation && !assignment && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-6 px-2 text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAssumeConversation(conversation.contact.id_contact);
                  }}
                >
                  Assumir
                </Button>
              )}
              
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectConversation(conversation.contact.id_contact);
                }}
              >
                <MessageCircle className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {/* Tags */}
          {assignment?.tags && assignment.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {assignment.tags.slice(0, 2).map((tag, idx) => (
                <Badge key={idx} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {assignment.tags.length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{assignment.tags.length - 2}
                </Badge>
              )}
            </div>
          )}
        </div>
      )}
    </Draggable>
  );
};