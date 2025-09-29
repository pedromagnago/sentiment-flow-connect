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
    const { message_id, contact_id, content, sender_name } = await req.json() as AnalyzeMessageRequest;

    console.log('Analyzing message:', { message_id, contact_id, content: content.substring(0, 100) });

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
        temperature: 0.3,
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
