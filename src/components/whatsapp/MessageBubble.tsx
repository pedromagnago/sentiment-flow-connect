import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Check, CheckCheck, Clock, FileText, Image, Video } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { Message } from './WhatsAppInterface';

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble = ({ message }: MessageBubbleProps) => {
  const isFromMe = message.fromme;
  const messageTime = format(new Date(message.created_at), 'HH:mm', { locale: ptBR });

  const getMessageIcon = () => {
    switch (message.tipo_mensagem) {
      case 'image':
        return <Image className="w-4 h-4" />;
      case 'video':
        return <Video className="w-4 h-4" />;
      case 'document':
        return <FileText className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getStatusIcon = () => {
    if (!isFromMe) return null;
    
    switch (message.status_processamento) {
      case 'enviado':
        return <Check className="w-3 h-3 text-muted-foreground" />;
      case 'entregue':
        return <CheckCheck className="w-3 h-3 text-muted-foreground" />;
      case 'lido':
        return <CheckCheck className="w-3 h-3 text-blue-500" />;
      default:
        return <Clock className="w-3 h-3 text-muted-foreground" />;
    }
  };

  return (
    <div className={`flex ${isFromMe ? 'justify-end' : 'justify-start'} mb-2`}>
      <div className={`max-w-[70%] ${isFromMe ? 'order-2' : 'order-1'}`}>
        {/* Nome do remetente (para mensagens recebidas) */}
        {!isFromMe && message.nome_membro && (
          <p className="text-xs text-muted-foreground mb-1 px-1">
            {message.nome_membro}
          </p>
        )}
        
        <div
          className={`rounded-lg px-3 py-2 ${
            isFromMe
              ? 'bg-primary text-primary-foreground'
              : 'bg-card border border-border'
          }`}
        >
          <div className="flex items-start gap-2">
            {getMessageIcon()}
            <div className="flex-1">
              {/* Conteúdo da mensagem */}
              {message.conteudo_mensagem && (
                <p className="text-sm break-words whitespace-pre-wrap">
                  {message.conteudo_mensagem}
                </p>
              )}
              
              {/* Link de arquivo */}
              {message.link_arquivo && (
                <div className="mt-2">
                  <a
                    href={message.link_arquivo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs underline opacity-80 hover:opacity-100"
                  >
                    Ver arquivo
                  </a>
                </div>
              )}
              
              {/* Status de processamento */}
              {message.status_processamento && message.status_processamento !== 'processado' && (
                <Badge variant="outline" className="text-xs mt-1">
                  {message.status_processamento}
                </Badge>
              )}
            </div>
          </div>
          
          {/* Horário e status de entrega */}
          <div className={`flex items-center justify-end gap-1 mt-1 ${
            isFromMe ? 'text-primary-foreground/70' : 'text-muted-foreground'
          }`}>
            <span className="text-xs">{messageTime}</span>
            {getStatusIcon()}
          </div>
        </div>
      </div>
    </div>
  );
};