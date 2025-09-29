import React, { useEffect, useRef, useState } from 'react';
import { MessageBubble } from './MessageBubble';
import { MessageInput } from './MessageInput';
import { Button } from '@/components/ui/button';
import { Phone, Video, MoreVertical, User, MessageCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useSendMessage } from '@/hooks/useSendMessage';
import { useSuggestedActions } from '@/hooks/useSuggestedActions';
import { SuggestedActionCard } from './SuggestedActionCard';
import { ActionHistoryPanel } from './ActionHistoryPanel';
import type { Conversation, Message } from './WhatsAppInterface';

interface ChatWindowProps {
  conversation: Conversation;
  messages: Message[];
}

export const ChatWindow = ({ conversation, messages }: ChatWindowProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { sendMessage, isSending } = useSendMessage();
  const { actions, processAction, ignoreAction, updateAction, isProcessing } = useSuggestedActions(conversation.contact.id_contact);
  const [processingActionId, setProcessingActionId] = useState<string | null>(null);

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
      case 'aguardando': return 'bg-destructive/10 text-destructive';
      case 'em_atendimento': return 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-500';
      case 'finalizado': return 'bg-green-500/10 text-green-700 dark:text-green-500';
      case 'aguardando_retorno': return 'bg-blue-500/10 text-blue-700 dark:text-blue-500';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header do Chat */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-card shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">
              {conversation.contact.nome || conversation.contact.id_contact}
            </h3>
            <div className="flex items-center gap-2">
              <Badge 
                variant="outline" 
                className={`text-xs ${getStatusColor(conversation.status)}`}
              >
                {conversation.status.replace('_', ' ')}
              </Badge>
              {conversation.contact.is_group && (
                <Badge variant="outline" className="text-xs">
                  Grupo
                </Badge>
              )}
              <span className="text-xs text-muted-foreground">
                {conversation.contact.id_contact}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
            <Phone className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
            <Video className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
            <MoreVertical className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Área de Mensagens */}
      <div className="flex-1 overflow-y-auto bg-gradient-to-b from-muted/20 to-muted/10">
        {sortedMessages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <div className="text-center p-8">
              <MessageCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="font-medium mb-2">Nenhuma mensagem ainda</h3>
              <p className="text-sm">Seja o primeiro a enviar uma mensagem nesta conversa</p>
            </div>
          </div>
        ) : (
          <div className="p-4 space-y-4">
            {/* Action History Panel */}
            <ActionHistoryPanel actions={actions} />

            {sortedMessages.map((message) => {
              // Buscar ações sugeridas para esta mensagem (pending, processing, completed, ignored)
              const messageActions = actions.filter(
                action => action.message_id === message.id
              );

              return (
                <div key={message.id} className="space-y-2">
                  <MessageBubble message={message} />
                  {messageActions.map(action => (
                    <SuggestedActionCard
                      key={action.id}
                      action={action}
                      onProcess={(id, data) => {
                        setProcessingActionId(id);
                        processAction({ id, action_type: action.action_type, extracted_data: data });
                      }}
                      onIgnore={(id) => {
                        ignoreAction(id);
                      }}
                      onUpdate={(id, data) => updateAction({ id, status: 'pending', extracted_data: data })}
                      isProcessing={processingActionId === action.id}
                    />
                  ))}
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input de Mensagem */}
      <div className="border-t border-border bg-card">
        <MessageInput
          onSendMessage={async (content) => {
            await sendMessage(conversation.contact.id_contact, content);
          }}
          contactId={conversation.contact.id_contact}
          isLoading={isSending}
        />
      </div>
    </div>
  );
};