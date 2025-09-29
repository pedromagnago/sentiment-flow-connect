import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const useSendMessage = () => {
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();

  const sendMessage = async (phone: string, message: string) => {
    setIsSending(true);
    
    try {
      console.log('Sending message:', { phone, message });

      // Call edge function to send message
      const { data, error } = await supabase.functions.invoke('send-whatsapp-message', {
        body: {
          phone: phone,
          message: message
        }
      });

      if (error) {
        console.error('Edge function error:', error);
        throw new Error(error.message || 'Failed to send message');
      }

      if (data?.error) {
        console.error('ZAPI error:', data.error);
        throw new Error(data.error);
      }

      console.log('Message sent successfully:', data);

      toast({
        title: 'Mensagem enviada',
        description: 'Sua mensagem foi enviada com sucesso',
      });

      return data;
      
    } catch (error: any) {
      console.error('Error sending message:', error);
      
      toast({
        title: 'Erro ao enviar mensagem',
        description: error.message || 'Ocorreu um erro ao enviar a mensagem',
        variant: 'destructive'
      });
      
      throw error;
    } finally {
      setIsSending(false);
    }
  };

  return { sendMessage, isSending };
};