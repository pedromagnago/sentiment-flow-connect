import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageCircle, Users, User, ArrowDownLeft, ArrowUpRight, Image, FileText, Mic, Video } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface RecentMessage {
  id: string;
  conteudo_mensagem: string;
  nome_membro: string;
  data_hora: string;
  contact_id: string;
  contact_nome: string;
  is_group: boolean;
  company_nome: string | null;
  fromme: boolean;
  tipo_mensagem: string | null;
}

interface RecentMessagesListProps {
  messages: RecentMessage[];
  onMessageClick?: (contactId: string) => void;
}

export const RecentMessagesList: React.FC<RecentMessagesListProps> = ({
  messages,
  onMessageClick
}) => {
  const getMessageTypeIcon = (tipo: string | null) => {
    switch (tipo) {
      case 'image': return <Image className="w-3 h-3" />;
      case 'document': return <FileText className="w-3 h-3" />;
      case 'audio': return <Mic className="w-3 h-3" />;
      case 'video': return <Video className="w-3 h-3" />;
      default: return null;
    }
  };

  const truncateMessage = (text: string, maxLength = 80) => {
    if (!text) return '[Sem conteúdo]';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-primary" />
          Mensagens Recentes
          <Badge variant="secondary" className="ml-auto">{messages.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[400px]">
          <div className="divide-y divide-border">
            {messages.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                Nenhuma mensagem recente
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className="p-3 hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => onMessageClick?.(message.contact_id)}
                >
                  <div className="flex items-start gap-3">
                    {/* Direction indicator */}
                    <div className={`mt-1 p-1 rounded-full ${message.fromme ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}`}>
                      {message.fromme ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownLeft className="w-3 h-3" />}
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* Header */}
                      <div className="flex items-center gap-2 mb-1">
                        {message.is_group ? (
                          <Users className="w-3 h-3 text-muted-foreground" />
                        ) : (
                          <User className="w-3 h-3 text-muted-foreground" />
                        )}
                        <span className="font-medium text-sm truncate">
                          {message.contact_nome}
                        </span>
                        {message.company_nome ? (
                          <Badge variant="outline" className="text-xs shrink-0">
                            {message.company_nome}
                          </Badge>
                        ) : (
                          <Badge variant="destructive" className="text-xs shrink-0">
                            Não classificado
                          </Badge>
                        )}
                      </div>

                      {/* Message content */}
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        {getMessageTypeIcon(message.tipo_mensagem)}
                        <span className="truncate">
                          {message.nome_membro && !message.fromme && (
                            <span className="font-medium">{message.nome_membro}: </span>
                          )}
                          {truncateMessage(message.conteudo_mensagem)}
                        </span>
                      </div>

                      {/* Timestamp */}
                      <div className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(message.data_hora), { 
                          addSuffix: true, 
                          locale: ptBR 
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
