import { useRecentMessages } from '@/hooks/useRecentMessages';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { MessageSquare, Clock, File } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ContactPreviewProps {
  contactId: string;
}

export const ContactPreview = ({ contactId }: ContactPreviewProps) => {
  const { messages, loading } = useRecentMessages(contactId, 3);

  if (loading) {
    return (
      <Card className="bg-muted/30">
        <CardContent className="p-4">
          <LoadingSpinner />
        </CardContent>
      </Card>
    );
  }

  if (messages.length === 0) {
    return (
      <Card className="bg-muted/30">
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground text-center">
            Nenhuma mensagem encontrada
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-muted/30">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <MessageSquare className="w-4 h-4" />
          <span>Últimas {messages.length} mensagens</span>
        </div>

        {messages.map((message) => (
          <div
            key={message.id}
            className={`p-3 rounded-lg border ${
              message.fromme
                ? 'bg-primary/5 border-primary/20 ml-4'
                : 'bg-background border-border/40 mr-4'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <Badge variant={message.fromme ? 'default' : 'secondary'} className="text-xs">
                {message.fromme ? 'Você' : 'Contato'}
              </Badge>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                {format(new Date(message.data_hora), 'dd/MM HH:mm', { locale: ptBR })}
              </div>
            </div>

            {message.tipo_mensagem === 'chat' ? (
              <p className="text-sm text-foreground line-clamp-2">
                {message.conteudo_mensagem || 'Mensagem sem conteúdo'}
              </p>
            ) : (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <File className="w-4 h-4" />
                <span className="capitalize">{message.tipo_mensagem || 'Arquivo'}</span>
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
