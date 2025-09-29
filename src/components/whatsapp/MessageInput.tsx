import React, { useState } from 'react';
import { Send, Paperclip, Smile, Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface MessageInputProps {
  onSendMessage: (content: string) => Promise<void>;
  contactId: string;
  isLoading?: boolean;
}

export const MessageInput = ({ onSendMessage, contactId, isLoading = false }: MessageInputProps) => {
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();

  const handleSend = async () => {
    if (!message.trim() || isSending || isLoading) return;
    
    setIsSending(true);
    try {
      await onSendMessage(message.trim());
      setMessage('');
    } catch (error) {
      // Error handling is done in the hook
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileUpload = () => {
    toast({
      title: 'Em desenvolvimento',
      description: 'Upload de arquivos será implementado em breve',
    });
  };

  const handleVoiceRecord = () => {
    setIsRecording(!isRecording);
    toast({
      title: 'Em desenvolvimento',
      description: 'Gravação de voz será implementada em breve',
    });
  };

  return (
    <div className="p-4 bg-card">
      <div className="flex items-end gap-3">
        {/* Botões de ação */}
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleFileUpload}
            className="text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            disabled={isSending || isLoading}
          >
            <Paperclip className="w-4 h-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            disabled={isSending || isLoading}
          >
            <Smile className="w-4 h-4" />
          </Button>
        </div>

        {/* Campo de texto */}
        <div className="flex-1 relative">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Digite sua mensagem..."
            className="min-h-[44px] max-h-32 resize-none pr-12 bg-background border-border focus:ring-primary"
            rows={1}
            disabled={isSending || isLoading}
          />
        </div>

        {/* Botão de envio ou gravação */}
        {message.trim() ? (
          <Button 
            onClick={handleSend} 
            size="sm" 
            className="shrink-0 h-11 px-4 bg-primary hover:bg-primary/90 transition-colors"
            disabled={isSending || isLoading}
          >
            {isSending || isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        ) : (
          <Button
            variant={isRecording ? "destructive" : "secondary"}
            size="sm"
            onClick={handleVoiceRecord}
            className="shrink-0 h-11 px-4 transition-colors"
            disabled={isSending || isLoading}
          >
            <Mic className={`w-4 h-4 ${isRecording ? 'animate-pulse' : ''}`} />
          </Button>
        )}
      </div>
      
      {/* Contador de caracteres e status */}
      <div className="flex items-center justify-between mt-2">
        {message.length > 100 && (
          <div className="text-xs text-muted-foreground">
            {message.length}/4096 caracteres
          </div>
        )}
        
        {(isSending || isLoading) && (
          <div className="text-xs text-primary flex items-center gap-1">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            Enviando...
          </div>
        )}
      </div>
    </div>
  );
};