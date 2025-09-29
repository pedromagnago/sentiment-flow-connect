import React, { useEffect, useRef } from 'react';
import { MessageBubble } from './MessageBubble';
import { MessageInput } from './MessageInput';
import { Button } from '@/components/ui/button';
import { Phone, Video, MoreVertical, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { Conversation, Message } from './WhatsAppInterface';

interface ChatWindowProps {
  conversation: Conversation;
  messages: Message[];
}

export const ChatWindow = ({ conversation, messages }: ChatWindowProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sortedMessages = [...messages].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'aguardando': return 'bg-red-100 text-red-800';
      case 'em_atendimento': return 'bg-yellow-100 text-yellow-800';
      case 'finalizado': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header do Chat */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-card">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-medium">
              {conversation.contact.nome || conversation.contact.id_contact}
            </h3>
            <div className="flex items-center gap-2">
              <Badge className={`text-xs ${getStatusColor(conversation.status)}`}>
                {conversation.status.replace('_', ' ')}
              </Badge>
              {conversation.contact.is_group && (
                <Badge variant="outline" className="text-xs">
                  Grupo
                </Badge>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm">
            <Phone className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <Video className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <MoreVertical className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Área de Mensagens */}
      <div className="flex-1 overflow-y-auto p-4 bg-muted/20">
        {sortedMessages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <p>Nenhuma mensagem ainda</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedMessages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input de Mensagem */}
      <div className="border-t border-border bg-card">
        <MessageInput
          onSendMessage={(content) => {
            // TODO: Implementar envio de mensagem
            console.log('Enviando mensagem:', content);
          }}
          contactId={conversation.contact.id_contact}
        />
      </div>
    </div>
  );
};