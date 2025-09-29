import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { phone, message } = await req.json();

    if (!phone || !message) {
      throw new Error('Phone and message are required');
    }

    // Get ZAPI credentials from environment
    const zapiInstanceId = Deno.env.get('ZAPI_INSTANCE_ID');
    const zapiToken = Deno.env.get('ZAPI_TOKEN');

    if (!zapiInstanceId || !zapiToken) {
      console.error('ZAPI credentials not configured');
      throw new Error('ZAPI credentials not configured. Please add ZAPI_INSTANCE_ID and ZAPI_TOKEN secrets.');
    }

    // Send message via ZAPI
    const zapiUrl = `https://api.z-api.io/instances/${zapiInstanceId}/token/${zapiToken}/send-text`;
    
    console.log('Sending message to:', phone);
    
    const zapiResponse = await fetch(zapiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phone: phone,
        message: message
      })
    });

    const zapiResult = await zapiResponse.json();
    console.log('ZAPI response:', zapiResult);

    if (!zapiResponse.ok || zapiResult.error) {
      throw new Error(zapiResult.error || zapiResult.message || 'Failed to send message via ZAPI');
    }

    // Save message to database
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

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
    } else {
      console.log('Message saved to database:', messageData?.id);
    }

    return new Response(
      JSON.stringify({
        success: true,
        messageId: zapiResult.messageId,
        savedMessage: messageData
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error: any) {
    console.error('Error in send-whatsapp-message function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to send message',
        details: error.toString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    );
  }
});
