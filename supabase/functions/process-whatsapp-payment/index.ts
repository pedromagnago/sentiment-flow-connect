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
    const authHeader = req.headers.get('Authorization')!;
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { action_id, company_id } = await req.json();

    if (!action_id || !company_id) {
      return new Response(JSON.stringify({ error: 'action_id and company_id are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Buscar a ação sugerida com a mensagem associada
    const { data: action, error: actionError } = await supabase
      .from('suggested_actions')
      .select(`
        *,
        messages (
          id,
          link_arquivo,
          conteudo_mensagem,
          contact_id
        )
      `)
      .eq('id', action_id)
      .single();

    if (actionError || !action) {
      return new Response(JSON.stringify({ error: 'Action not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Se a ação não tem documento ou já está vinculada, retornar
    if (!action.messages?.link_arquivo) {
      return new Response(JSON.stringify({ 
        error: 'No document attached to this message' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Verificar se já existe conta vinculada
    if (action.payable_id || action.receivable_id) {
      return new Response(JSON.stringify({ 
        message: 'Action already has an account linked',
        payable_id: action.payable_id,
        receivable_id: action.receivable_id
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Chamar a edge function process-document para analisar o documento
    const { data: analysisResult, error: analysisError } = await supabase.functions.invoke(
      'process-document',
      {
        body: {
          file_url: action.messages.link_arquivo,
          contact_id: action.messages.contact_id,
          message_id: action.message_id,
          company_id
        }
      }
    );

    if (analysisError) {
      console.error('Error analyzing document:', analysisError);
      return new Response(JSON.stringify({ 
        error: 'Failed to analyze document',
        details: analysisError 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Extrair dados da análise
    const extracted = analysisResult?.extracted_data || action.extracted_data || {};
    const accountType = action.action_type;

    let accountId: string | null = null;

    // Criar conta a pagar ou receber baseado no tipo de ação
    if (accountType === 'payment_request' || accountType === 'expense_identified') {
      // Criar conta a pagar
      const { data: payable, error: payableError } = await supabase
        .from('contas_pagar')
        .insert({
          company_id,
          user_id: user.id,
          suggested_action_id: action_id,
          message_id: action.message_id,
          contact_id: action.contact_id,
          beneficiario: extracted.beneficiario || action.contact_id || 'Não identificado',
          cpf_cnpj_beneficiario: extracted.cpf_cnpj,
          descricao: extracted.descricao || action.ai_suggestion || 'Pagamento via WhatsApp',
          valor: extracted.valor || 0,
          vencimento: extracted.vencimento || new Date().toISOString().split('T')[0],
          categoria: extracted.categoria || 'despesas_operacionais',
          status: 'pendente',
          whatsapp_document_url: action.messages.link_arquivo,
          document_analysis: analysisResult || {},
          historico_atividades: [{
            timestamp: new Date().toISOString(),
            user_id: user.id,
            action: 'criou_automaticamente',
            origem: 'whatsapp',
            details: 'Conta criada automaticamente via WhatsApp'
          }]
        })
        .select()
        .single();

      if (payableError) throw payableError;
      accountId = payable.id;

      // Atualizar ação sugerida com link para conta
      await supabase
        .from('suggested_actions')
        .update({ payable_id: accountId })
        .eq('id', action_id);

    } else if (accountType === 'invoice_request' || accountType === 'payment_received') {
      // Criar conta a receber
      const { data: receivable, error: receivableError } = await supabase
        .from('contas_receber')
        .insert({
          company_id,
          user_id: user.id,
          suggested_action_id: action_id,
          message_id: action.message_id,
          contact_id: action.contact_id,
          cliente: extracted.cliente || action.contact_id || 'Não identificado',
          cpf_cnpj_cliente: extracted.cpf_cnpj,
          descricao: extracted.descricao || action.ai_suggestion || 'Recebimento via WhatsApp',
          valor_total: extracted.valor || 0,
          data_vencimento: extracted.vencimento || new Date().toISOString().split('T')[0],
          data_competencia: extracted.competencia || new Date().toISOString().split('T')[0],
          categoria: extracted.categoria || 'servicos',
          status: 'pendente',
          whatsapp_document_url: action.messages.link_arquivo,
          document_analysis: analysisResult || {},
          historico_atividades: [{
            timestamp: new Date().toISOString(),
            user_id: user.id,
            action: 'criou_automaticamente',
            origem: 'whatsapp',
            details: 'Conta criada automaticamente via WhatsApp'
          }]
        })
        .select()
        .single();

      if (receivableError) throw receivableError;
      accountId = receivable.id;

      // Atualizar ação sugerida com link para conta
      await supabase
        .from('suggested_actions')
        .update({ receivable_id: accountId })
        .eq('id', action_id);
    }

    // Tentar match automático com transações bancárias
    let matchResult = null;
    if (accountId) {
      try {
        const { data: matchData } = await supabase.functions.invoke(
          'match-transactions',
          {
            body: {
              company_id,
              auto_confirm_threshold: 95 // Mais conservador para auto-confirmação
            }
          }
        );
        matchResult = matchData;
      } catch (matchError) {
        console.error('Error matching transactions:', matchError);
        // Não falhar se o matching não funcionar
      }
    }

    return new Response(JSON.stringify({
      success: true,
      account_id: accountId,
      account_type: accountType === 'payment_request' || accountType === 'expense_identified' ? 'payable' : 'receivable',
      extracted_data: extracted,
      match_result: matchResult,
      message: 'Payment processed successfully'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in process-whatsapp-payment:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
