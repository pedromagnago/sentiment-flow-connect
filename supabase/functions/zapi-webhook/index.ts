import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

interface ZAPIMessage {
  instanceId: string;
  messageId: string;
  phone: string;
  fromMe: boolean;
  momment: number;
  status: string;
  chatName: string;
  senderPhoto: string;
  senderName: string;
  participantPhone?: string;
  photo?: string;
  broadcast?: boolean;
  type: string;
  notification?: string;
  isEdit?: boolean;
  editMessageId?: string;
  text?: {
    message: string;
  };
  image?: {
    caption?: string;
    imageUrl: string;
    thumbnailUrl: string;
    mimeType: string;
  };
  audio?: {
    audioUrl: string;
    mimeType: string;
  };
  video?: {
    caption?: string;
    videoUrl: string;
    mimeType: string;
  };
  document?: {
    documentUrl: string;
    mimeType: string;
    title: string;
    pageCount: number;
  };
  location?: {
    latitude: number;
    longitude: number;
    address: string;
    url: string;
  };
  contact?: {
    displayName: string;
    vcard: string;
  };
  isGroup: boolean;
  isNewsletter: boolean;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const zapMessage: ZAPIMessage = await req.json();
    
    console.log('Received ZAPI webhook:', JSON.stringify(zapMessage, null, 2));

    // Ignorar notificações de grupo (participantes adicionados/removidos, etc)
    if (zapMessage.notification) {
      console.log('Ignoring group notification:', zapMessage.notification);
      return new Response(JSON.stringify({ status: 'ignored', reason: 'notification' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Verificar se não é mensagem nossa (fromMe = true)
    if (zapMessage.fromMe) {
      console.log('Ignoring message from me');
      return new Response(JSON.stringify({ status: 'ignored', reason: 'from_me' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Extrair conteúdo da mensagem
    const messageContent = extractMessageContent(zapMessage);

    // Não salvar mensagens sem conteúdo real
    if (!messageContent || messageContent === `[${zapMessage.type}]`) {
      console.log('Ignoring message without real content:', zapMessage.type);
      return new Response(JSON.stringify({ status: 'ignored', reason: 'no_content' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Se for mensagem editada, atualizar a existente
    if (zapMessage.isEdit && zapMessage.editMessageId) {
      const { error: updateError } = await supabase
        .from('messages')
        .update({
          conteudo_mensagem: messageContent,
          updated_at: new Date().toISOString()
        })
        .eq('message_id', zapMessage.editMessageId);
      
      if (updateError) {
        console.error('Error updating edited message:', updateError);
      } else {
        console.log('Updated edited message:', zapMessage.editMessageId);
        return new Response(JSON.stringify({ status: 'updated' }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    // Preparar dados da mensagem
    const messageData = {
      message_id: zapMessage.messageId,
      contact_id: zapMessage.phone,
      nome_membro: zapMessage.senderName || zapMessage.chatName,
      telefone_membro: zapMessage.phone,
      conteudo_mensagem: messageContent,
      tipo_mensagem: zapMessage.type,
      data_hora: new Date(zapMessage.momment).toISOString(),
      fromme: false,
      status_processamento: 'pendente',
      nome_grupo: zapMessage.isGroup ? zapMessage.chatName : null,
      link_arquivo: extractFileUrl(zapMessage)
    };

    // Inserir mensagem no banco
    const { data: insertedMessage, error: messageError } = await supabase
      .from('messages')
      .insert(messageData)
      .select()
      .single();

    if (messageError) {
      console.error('Error inserting message:', messageError);
      throw messageError;
    }

    // ✅ SISTEMA DE CLASSIFICAÇÃO MANUAL
    // SEMPRE cria contato SEM empresa (company_id = NULL)
    // Usa upsert para atualizar se já existir
    const contactData = {
      id_contact: zapMessage.phone,
      nome: zapMessage.senderName || zapMessage.chatName,
      is_group: zapMessage.isGroup,
      status: true,
      feedback: true,
      data_criacao: new Date().toISOString(),
      company_id: null,  // 🎯 SEMPRE NULL - Classificação 100% manual
      updated_at: new Date().toISOString()
    };

    const { error: contactError } = await supabase
      .from('contacts')
      .upsert(contactData, {
        onConflict: 'id_contact',
        ignoreDuplicates: false  // Atualiza se já existir
      });

    if (contactError) {
      console.error('❌ Error upserting contact:', contactError);
    } else {
      console.log('✅ Contato criado/atualizado SEM empresa (aguarda classificação manual):', zapMessage.phone);
    }

    // ⏸️ NÃO cria conversation_assignment automaticamente
    // Apenas após classificação manual o contato terá assignment
    console.log('⏸️ Contato aguarda classificação manual antes de criar assignment');

    console.log('Message processed successfully');

    // Chamar analyze-sentiment após mensagem salva (async, não bloqueia)
    const { data: contact } = await supabase
      .from('contacts')
      .select('feedback')
      .eq('id_contact', zapMessage.phone)
      .single();

    if (contact?.feedback) {
      // Chamar análise de sentimento diária (async)
      fetch(`${supabaseUrl}/functions/v1/analyze-sentiment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseServiceKey}`,
        },
        body: JSON.stringify({
          contact_id: zapMessage.phone,
          type: 'daily',
        }),
      }).catch(err => {
        console.error('Error calling analyze-sentiment (async):', err);
      });
    }

    // Chamar analyze-message de forma assíncrona (não bloqueia resposta)
    if (insertedMessage?.id) {
      // Detectar tipo de mídia
      let mediaType: 'image' | 'audio' | 'document' | 'video' | undefined;
      let mediaUrl: string | undefined;
      let mediaMimeType: string | undefined;
      let mediaCaption: string | undefined;

      if (zapMessage.image) {
        mediaType = 'image';
        mediaUrl = zapMessage.image.imageUrl;
        mediaMimeType = zapMessage.image.mimeType;
        mediaCaption = zapMessage.image.caption;
      } else if (zapMessage.audio) {
        mediaType = 'audio';
        mediaUrl = zapMessage.audio.audioUrl;
        mediaMimeType = zapMessage.audio.mimeType;
      } else if (zapMessage.document) {
        mediaType = 'document';
        mediaUrl = zapMessage.document.documentUrl;
        mediaMimeType = zapMessage.document.mimeType;
        mediaCaption = zapMessage.document.title;
      } else if (zapMessage.video) {
        mediaType = 'video';
        mediaUrl = zapMessage.video.videoUrl;
        mediaMimeType = zapMessage.video.mimeType;
        mediaCaption = zapMessage.video.caption;
      }

      fetch(`${supabaseUrl}/functions/v1/analyze-message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseServiceKey}`,
        },
        body: JSON.stringify({
          message_id: insertedMessage.id,
          contact_id: zapMessage.phone,
          content: messageContent,
          sender_name: zapMessage.senderName || zapMessage.chatName,
          has_media: !!mediaUrl,
          media_type: mediaType,
          media_url: mediaUrl,
          media_mime_type: mediaMimeType,
          media_caption: mediaCaption,
        }),
      }).catch(err => {
        console.error('Error calling analyze-message (async):', err);
        // Não falha o webhook, apenas loga
      });
    }

    return new Response(JSON.stringify({ 
      status: 'success',
      messageId: zapMessage.messageId,
      contactId: zapMessage.phone
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('Error processing webhook:', error);
    
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

function extractMessageContent(zapMessage: ZAPIMessage): string {
  // Verificar campos de conteúdo independente do type
  if (zapMessage.text?.message) {
    return zapMessage.text.message;
  }
  if (zapMessage.image) {
    return zapMessage.image.caption || '[Imagem]';
  }
  if (zapMessage.document) {
    return `[Documento: ${zapMessage.document.title}]`;
  }
  if (zapMessage.video) {
    return zapMessage.video.caption || '[Vídeo]';
  }
  if (zapMessage.audio) {
    return '[Áudio]';
  }
  if (zapMessage.location) {
    return `[Localização: ${zapMessage.location.address}]`;
  }
  if (zapMessage.contact) {
    return `[Contato: ${zapMessage.contact.displayName}]`;
  }
  
  // Se não encontrou conteúdo, logar e retornar tipo
  console.log('No content found for message type:', zapMessage.type);
  return `[${zapMessage.type}]`;
}

function extractFileUrl(zapMessage: ZAPIMessage): string | null {
  switch (zapMessage.type) {
    case 'image':
      return zapMessage.image?.imageUrl || null;
    case 'video':
      return zapMessage.video?.videoUrl || null;
    case 'audio':
      return zapMessage.audio?.audioUrl || null;
    case 'document':
      return zapMessage.document?.documentUrl || null;
    default:
      return null;
  }
}

async function handleConversationAssignment(supabase: any, contactId: string) {
  // Verificar se já existe assignment ativo para este contato
  const { data: existingAssignment } = await supabase
    .from('conversation_assignments')
    .select('*')
    .eq('contact_id', contactId)
    .in('status', ['aguardando', 'em_atendimento', 'aguardando_retorno'])
    .single();

  if (existingAssignment) {
    // Atualizar timestamp da assignment existente
    await supabase
      .from('conversation_assignments')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', existingAssignment.id);
    
    console.log('Updated existing assignment for contact:', contactId);
  } else {
    // Criar nova assignment
    const newAssignment = {
      contact_id: contactId,
      status: 'aguardando',
      priority: 'media',
      tags: [],
      sla_deadline: null // TODO: calcular baseado nas regras de SLA
    };

    const { error } = await supabase
      .from('conversation_assignments')
      .insert(newAssignment);

    if (error) {
      console.error('Error creating assignment:', error);
    } else {
      console.log('Created new assignment for contact:', contactId);
    }
  }
}