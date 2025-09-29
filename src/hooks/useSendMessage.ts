import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const useSendMessage = () => {
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();

  const sendMessage = async (phone: string, message: string) => {
    setIsSending(true);
    
    try {
      // ZAPI endpoint
      const zapiUrl = 'https://api.z-api.io/instances/3E28F704EF3780EC48861A5333D349DF/token/B8F4DFA45820AEDD56A82906/send-text';
      
      const zapiPayload = {
        phone: phone,
        message: message
      };

      console.log('Sending message via ZAPI:', { phone, message });

      // Send message via ZAPI
      const zapiResponse = await fetch(zapiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(zapiPayload)
      });

      const zapiResult = await zapiResponse.json();
      console.log('ZAPI Response:', zapiResult);

      if (!zapiResponse.ok) {
        throw new Error(`ZAPI Error: ${zapiResult.message || 'Failed to send message'}`);
      }

      // Save message to database
      const { data: messageData, error: dbError } = await supabase
        .from('messages')
        .insert({
          contact_id: phone,
          conteudo_mensagem: message,
          fromme: true,
          status_processamento: 'enviado',
          data_hora: new Date().toISOString(),
          nome_membro: 'Você',
          message_id: zapiResult.messageId || null
        })
        .select()
        .single();

      if (dbError) {
        console.error('Error saving message to database:', dbError);
        // Don't throw - message was sent successfully via ZAPI
      } else {
        console.log('Message saved to database:', messageData);
      }

      toast({
        title: 'Mensagem enviada',
        description: 'Sua mensagem foi enviada com sucesso',
      });

      return zapiResult;
      
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