import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AnalyzeMessageRequest {
  message_id: string;
  contact_id: string;
  content: string;
  sender_name?: string;
  has_media?: boolean;
  media_type?: 'image' | 'audio' | 'document' | 'video';
  media_url?: string;
  media_mime_type?: string;
  media_caption?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    if (!openAIApiKey) {
      throw new Error('OPENAI_API_KEY não configurada');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    // Get user from JWT
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error('Invalid authorization');
    }

    // Get user's company_id
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('company_id')
      .eq('id', user.id)
      .single();

    if (profileError || !profile?.company_id) {
      throw new Error('User profile not found or company not set');
    }

    const requestData = await req.json() as AnalyzeMessageRequest;
    const { 
      message_id, 
      contact_id, 
      content, 
      sender_name,
      has_media,
      media_type,
      media_url,
      media_mime_type,
      media_caption
    } = requestData;

    console.log('Analyzing message:', { 
      message_id, 
      contact_id, 
      content: content?.substring(0, 100),
      has_media,
      media_type,
      media_url,
      user_company_id: profile.company_id
    });

    // Validate contact belongs to user's company
    const { data: contact, error: contactError } = await supabase
      .from('contacts')
      .select('company_id')
      .eq('id_contact', contact_id)
      .maybeSingle();

    if (contactError) {
      console.error('Error fetching contact:', contactError);
      throw new Error('Error validating contact access');
    }

    if (contact && contact.company_id && contact.company_id !== profile.company_id) {
      console.error('Unauthorized access attempt:', { 
        user_company: profile.company_id, 
        contact_company: contact.company_id 
      });
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Contact does not belong to your company' }),
        { 
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Check if auto-processing is enabled for documents
    const { data: settings } = await supabase
      .from('settings')
      .select('valor')
      .eq('nome', 'auto_process_documents')
      .maybeSingle();

    const autoProcessEnabled = settings?.valor === 'true';

    // If there's media attached, create a document_analysis action
    if (has_media && media_url && ['image', 'audio', 'document'].includes(media_type || '')) {
      console.log('Media detected, creating document_analysis action');

      const extractedData = {
        file_url: media_url,
        file_type: media_type,
        file_name: `${media_type}_${Date.now()}`,
        mime_type: media_mime_type,
        caption: media_caption || content,
      };

      const { data: docAction, error: docError } = await supabase
        .from('suggested_actions')
        .insert({
          message_id,
          contact_id,
          action_type: 'document_analysis',
          extracted_data: extractedData,
          ai_confidence: 0.95,
          status: autoProcessEnabled ? 'processing' : 'pending',
          priority: 'normal',
          ai_suggestion: `Análise de ${media_type === 'image' ? 'imagem' : media_type === 'audio' ? 'áudio' : 'documento'}: ${media_caption || 'sem legenda'}`,
        })
        .select()
        .single();

      if (docError) {
        console.error('Error creating document_analysis action:', docError);
      } else {
        console.log('Document analysis action created:', docAction.id);

        // If auto-processing is enabled, trigger processing
        if (autoProcessEnabled && docAction) {
          console.log('Auto-processing enabled, triggering process-document');
          
          // Call process-document edge function
          const { error: processError } = await supabase.functions.invoke('process-document', {
            body: {
              file_url: media_url,
              file_type: media_type,
              file_name: extractedData.file_name,
              suggested_action_id: docAction.id,
              contact_id,
              message_id,
            }
          });

          if (processError) {
            console.error('Error auto-processing document:', processError);
            // Update action status to failed
            await supabase
              .from('suggested_actions')
              .update({ status: 'failed', notes: `Auto-processing error: ${processError.message}` })
              .eq('id', docAction.id);
          }
        }
      }

      // Return early if we only have media without meaningful text
      if (!content || content.trim().length < 10) {
        return new Response(
          JSON.stringify({ success: true, created: true, action_type: 'document_analysis' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Continue with regular text analysis if there's content
    if (!content || content.trim().length < 10) {
      console.log('No meaningful content to analyze');
      return new Response(
        JSON.stringify({ success: true, created: false, reason: 'no_content' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Chamar OpenAI GPT-5 para análise
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-mini-2025-08-07',
        messages: [
          {
            role: 'system',
            content: `Você é um assistente de BPO financeiro que analisa mensagens de clientes e identifica ações necessárias.

Analise a mensagem e identifique se há uma demanda de:
1. **payment**: Conta a pagar, boleto, pagamento (extraia: valor, vencimento, beneficiário, código de barras se houver)
2. **invoice**: Solicitação de nota fiscal, faturamento (extraia: valor, descrição, cliente/destinatário)
3. **task**: Tarefa genérica, solicitação de trabalho (extraia: descrição, prazo se houver)
4. **question**: Pergunta que precisa de resposta (extraia: pergunta, contexto)
5. **none**: Mensagem que não requer ação (saudação, confirmação, etc)

Responda APENAS em JSON válido no formato:
{
  "action_type": "payment" | "invoice" | "task" | "question" | "none",
  "confidence": 0.0-1.0,
  "priority": "low" | "normal" | "high" | "urgent",
  "suggestion": "Descrição breve da ação sugerida em português",
  "extracted_data": {
    // Para payment: valor, vencimento, beneficiario, codigo_barras
    // Para invoice: valor, descricao, destinatario
    // Para task: descricao, prazo
    // Para question: pergunta, contexto
  }
}`
          },
          {
            role: 'user',
            content: `Remetente: ${sender_name || 'Cliente'}\n\nMensagem:\n${content}`
          }
        ],
        max_completion_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;
    
    console.log('AI Response:', aiResponse);

    // Parse JSON response
    let analysis;
    try {
      analysis = JSON.parse(aiResponse);
    } catch (e) {
      console.error('Failed to parse AI response:', aiResponse);
      // Fallback: não criar sugestão se não conseguir parsear
      return new Response(
        JSON.stringify({ success: true, created: false, reason: 'invalid_json' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Se não houver ação, não criar registro
    if (analysis.action_type === 'none') {
      console.log('No action required for this message');
      return new Response(
        JSON.stringify({ success: true, created: false, reason: 'no_action' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Inserir na tabela suggested_actions
    const { data: suggestedAction, error: insertError } = await supabase
      .from('suggested_actions')
      .insert({
        message_id,
        contact_id,
        action_type: analysis.action_type,
        extracted_data: analysis.extracted_data || {},
        ai_confidence: analysis.confidence || 0.5,
        status: 'pending',
        priority: analysis.priority || 'normal',
        ai_suggestion: analysis.suggestion,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting suggested action:', insertError);
      throw insertError;
    }

    console.log('Suggested action created:', suggestedAction.id);

    // HITL: Se confidence < 0.8, enviar para validação humana
    if (suggestedAction.ai_confidence < 0.8) {
      console.log('Low confidence, triggering HITL validation');
      
      // Buscar operador padrão ou primeiro admin da empresa
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id')
        .eq('company_id', profile.company_id)
        .eq('ativo', true)
        .limit(1)
        .single();

      if (profiles) {
        // TODO: Buscar telefone do operador configurado nas settings
        // Por enquanto, usar configuração padrão
        const { data: operatorPhone } = await supabase
          .from('settings')
          .select('valor')
          .eq('nome', 'hitl_operator_phone')
          .maybeSingle();

        if (operatorPhone?.valor) {
          // Chamar edge function para enviar validação (async, não bloqueia)
          fetch(`${supabaseUrl}/functions/v1/send-hitl-validation`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${supabaseServiceKey}`,
            },
            body: JSON.stringify({
              suggested_action_id: suggestedAction.id,
              operator_phone: operatorPhone.valor,
            }),
          }).catch(err => {
            console.error('Error calling send-hitl-validation (async):', err);
          });
        }
      }
    }

    return new Response(
      JSON.stringify({ success: true, created: true, action: suggestedAction }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in analyze-message:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
