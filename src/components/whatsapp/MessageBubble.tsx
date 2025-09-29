import React from 'react';
import { Check, CheckCheck, Clock, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Message } from './WhatsAppInterface';

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble = ({ message }: MessageBubbleProps) => {
  const isFromMe = message.fromme;
  const messageTime = new Date(message.data_hora || message.created_at);
  
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getStatusIcon = () => {
    if (!isFromMe) return null;
    
    switch (message.status_processamento) {
      case 'enviado':
        return <Check className="w-3 h-3 text-muted-foreground" />;
      case 'entregue':
        return <CheckCheck className="w-3 h-3 text-muted-foreground" />;
      case 'lido':
        return <CheckCheck className="w-3 h-3 text-primary" />;
      case 'erro':
        return <AlertCircle className="w-3 h-3 text-destructive" />;
      default:
        return <Clock className="w-3 h-3 text-muted-foreground" />;
    }
  };

  return (
    <div className={`flex ${isFromMe ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-[70%] ${isFromMe ? 'order-2' : 'order-1'}`}>
        {/* Nome do remetente (apenas para mensagens recebidas) */}
        {!isFromMe && message.nome_membro && (
          <div className="text-xs text-muted-foreground mb-1 px-3">
            {message.nome_membro}
          </div>
        )}
        
        {/* Bubble da mensagem */}
        <div
          className={`px-4 py-3 rounded-2xl shadow-sm ${
            isFromMe
              ? 'bg-primary text-primary-foreground rounded-br-md'
              : 'bg-card border border-border rounded-bl-md'
          }`}
        >
          {/* Conteúdo da mensagem */}
          <div className="text-sm leading-relaxed whitespace-pre-wrap break-words">
            {message.conteudo_mensagem}
          </div>

          {/* Anexo/arquivo */}
          {message.link_arquivo && (
            <div className="mt-2 p-2 rounded-lg bg-muted/30">
              <a 
                href={message.link_arquivo} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline"
              >
                📎 Anexo
              </a>
            </div>
          )}
          
          {/* Metadados da mensagem */}
          <div className={`flex items-center justify-end gap-1 mt-2 text-xs ${
            isFromMe ? 'text-primary-foreground/70' : 'text-muted-foreground'
          }`}>
            <span>{formatTime(messageTime)}</span>
            {getStatusIcon()}
          </div>
        </div>
      </div>
    </div>
  );
};