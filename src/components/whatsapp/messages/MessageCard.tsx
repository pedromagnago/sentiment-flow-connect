import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Users, User, ArrowDownLeft, ArrowUpRight, Image, FileText, Mic, Video, ExternalLink } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { MessageWithContact } from '@/hooks/useAllMessages';

interface MessageCardProps {
  message: MessageWithContact;
  onClick?: () => void;
}

export const MessageCard: React.FC<MessageCardProps> = ({ message, onClick }) => {
  const getMessageTypeIcon = (tipo: string | null) => {
    switch (tipo) {
      case 'image': return <Image className="w-4 h-4" />;
      case 'document': return <FileText className="w-4 h-4" />;
      case 'audio': return <Mic className="w-4 h-4" />;
      case 'video': return <Video className="w-4 h-4" />;
      default: return null;
    }
  };

  const getTypeLabel = (tipo: string | null) => {
    switch (tipo) {
      case 'image': return 'Imagem';
      case 'document': return 'Documento';
      case 'audio': return 'Áudio';
      case 'video': return 'Vídeo';
      default: return 'Texto';
    }
  };

  return (
    <div 
      className="p-4 bg-card border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-start gap-4">
        {/* Direction indicator */}
        <div className={`p-2 rounded-full shrink-0 ${message.fromme ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}`}>
          {message.fromme ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownLeft className="w-4 h-4" />}
        </div>

        <div className="flex-1 min-w-0 space-y-2">
          {/* Header */}
          <div className="flex items-center gap-2 flex-wrap">
            {message.is_group ? (
              <Users className="w-4 h-4 text-muted-foreground shrink-0" />
            ) : (
              <User className="w-4 h-4 text-muted-foreground shrink-0" />
            )}
            <span className="font-semibold truncate">{message.contact_nome}</span>
            
            {message.company_nome ? (
              <Badge variant="outline" className="shrink-0">
                {message.company_nome}
              </Badge>
            ) : (
              <Badge variant="destructive" className="shrink-0">
                Não classificado
              </Badge>
            )}

            {message.tipo_mensagem && message.tipo_mensagem !== 'text' && (
              <Badge variant="secondary" className="shrink-0 flex items-center gap-1">
                {getMessageTypeIcon(message.tipo_mensagem)}
                {getTypeLabel(message.tipo_mensagem)}
              </Badge>
            )}
          </div>

          {/* Sender name (for groups) */}
          {message.nome_membro && !message.fromme && (
            <p className="text-sm text-muted-foreground">
              <span className="font-medium">{message.nome_membro}</span>
            </p>
          )}

          {/* Message content */}
          <p className="text-sm text-foreground whitespace-pre-wrap break-words">
            {message.conteudo_mensagem || '[Sem conteúdo de texto]'}
          </p>

          {/* Attachment link */}
          {message.link_arquivo && (
            <a
              href={message.link_arquivo}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className="w-3 h-3" />
              Ver anexo
            </a>
          )}

          {/* Timestamp */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{format(new Date(message.data_hora), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</span>
            <span>•</span>
            <span>{formatDistanceToNow(new Date(message.data_hora), { addSuffix: true, locale: ptBR })}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
