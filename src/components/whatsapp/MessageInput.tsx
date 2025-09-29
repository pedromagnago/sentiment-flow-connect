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
    <div className="p-4">
      <div className="flex items-end gap-2">
        {/* Botões de ação */}
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleFileUpload}
            className="text-muted-foreground hover:text-foreground"
          >
            <Paperclip className="w-4 h-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground"
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
            className="min-h-[40px] max-h-32 resize-none pr-12"
            rows={1}
          />
        </div>

        {/* Botão de envio ou gravação */}
        {message.trim() ? (
          <Button 
            onClick={handleSend} 
            size="sm" 
            className="shrink-0"
            disabled={isSending || isLoading}
          >
            <Send className="w-4 h-4" />
          </Button>
        ) : (
          <Button
            variant={isRecording ? "destructive" : "secondary"}
            size="sm"
            onClick={handleVoiceRecord}
            className="shrink-0"
          >
            <Mic className="w-4 h-4" />
          </Button>
        )}
      </div>
      
      {/* Contador de caracteres */}
      {message.length > 100 && (
        <div className="text-xs text-muted-foreground mt-1 text-right">
          {message.length}/4096
        </div>
      )}
    </div>
  );
};