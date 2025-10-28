import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const zapiToken = Deno.env.get('ZAPI_TOKEN');
    const zapiInstanceId = Deno.env.get('ZAPI_INSTANCE_ID');
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    if (!zapiToken || !zapiInstanceId) {
      throw new Error('ZAPI credentials not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { suggested_action_id, operator_phone } = await req.json();

    console.log('Sending HITL validation:', { suggested_action_id, operator_phone });

    // Buscar suggested action
    const { data: action, error: actionError } = await supabase
      .from('suggested_actions')
      .select('*')
      .eq('id', suggested_action_id)
      .single();

    if (actionError || !action) {
      throw new Error('Suggested action not found');
    }

    // Buscar mensagem original
    const { data: message, error: messageError } = await supabase
      .from('messages')
      .select('*')
      .eq('id', action.message_id)
      .single();

    if (messageError || !message) {
      console.warn('Original message not found');
    }

    // Formatar mensagem de validação
    const actionTypeLabel = {
      'payment': '💰 Pagamento',
      'invoice': '📄 Fatura',
      'task': '📋 Tarefa',
      'question': '❓ Pergunta',
      'document_analysis': '📎 Análise de Documento'
    }[action.action_type] || '📌 Ação';

    const priorityEmoji = {
      'low': '🔵',
      'normal': '🟡',
      'high': '🟠',
      'urgent': '🔴'
    }[action.priority] || '🟡';

    const extractedDataText = formatExtractedData(action.action_type, action.extracted_data);

    const validationMessage = `🤖 *VALIDAÇÃO NECESSÁRIA* (Confiança: ${Math.round(action.ai_confidence * 100)}%)

${actionTypeLabel} ${priorityEmoji}

📝 *Sugestão da IA:*
${action.ai_suggestion}

${extractedDataText}

${message ? `\n💬 *Mensagem Original:*\n"${message.conteudo_mensagem.substring(0, 200)}${message.conteudo_mensagem.length > 200 ? '...' : ''}"` : ''}

*Validar esta ação:*
• ✅ Correto
• ✏️ Ajustar
• ❌ Cancelar

ID: ${suggested_action_id}`;

    // Enviar via ZAPI
    const zapiResponse = await fetch(
      `https://api.z-api.io/instances/${zapiInstanceId}/token/${zapiToken}/send-text`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: operator_phone,
          message: validationMessage
        })
      }
    );

    if (!zapiResponse.ok) {
      const error = await zapiResponse.text();
      console.error('ZAPI error:', error);
      throw new Error(`ZAPI error: ${error}`);
    }

    const zapiResult = await zapiResponse.json();
    console.log('HITL validation sent:', zapiResult);

    // Atualizar status da action
    await supabase
      .from('suggested_actions')
      .update({
        status: 'awaiting_validation',
        notes: `Validação enviada para ${operator_phone} em ${new Date().toISOString()}`
      })
      .eq('id', suggested_action_id);

    return new Response(
      JSON.stringify({ success: true, message_id: zapiResult.messageId }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in send-hitl-validation:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

function formatExtractedData(actionType: string, data: any): string {
  if (!data) return '';

  switch (actionType) {
    case 'payment':
      return `💵 *Dados Extraídos:*
• Valor: R$ ${data.valor || 'N/A'}
• Vencimento: ${data.vencimento || 'N/A'}
• Beneficiário: ${data.beneficiario || 'N/A'}
${data.codigo_barras ? `• Código: ${data.codigo_barras}` : ''}`;

    case 'invoice':
      return `📄 *Dados Extraídos:*
• Valor: R$ ${data.valor || 'N/A'}
• Descrição: ${data.descricao || 'N/A'}
• Cliente: ${data.destinatario || 'N/A'}`;

    case 'task':
      return `📋 *Dados Extraídos:*
• Descrição: ${data.descricao || data.titulo || 'N/A'}
${data.prazo ? `• Prazo: ${data.prazo}` : ''}
${data.responsavel ? `• Responsável: ${data.responsavel}` : ''}`;

    case 'question':
      return `❓ *Pergunta:*
${data.pergunta || 'N/A'}`;

    case 'document_analysis':
      return `📎 *Documento:*
• Tipo: ${data.file_type || 'N/A'}
• Nome: ${data.file_name || 'N/A'}`;

    default:
      return '';
  }
}
