import "https://deno.land/x/xhr@0.1.0/mod.ts";
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
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    if (!openAIApiKey) {
      throw new Error('OPENAI_API_KEY não configurada');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const { contact_id, type = 'daily' } = await req.json();

    console.log('Analyzing sentiment:', { contact_id, type });

    if (type === 'daily') {
      // Análise diária: buscar mensagens do dia anterior
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);
      
      const today = new Date(yesterday);
      today.setHours(23, 59, 59, 999);

      const { data: messages, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .eq('contact_id', contact_id)
        .gte('data_hora', yesterday.toISOString())
        .lte('data_hora', today.toISOString())
        .order('data_hora', { ascending: true });

      if (messagesError) {
        console.error('Error fetching messages:', messagesError);
        throw messagesError;
      }

      if (!messages || messages.length === 0) {
        console.log('No messages found for yesterday');
        return new Response(
          JSON.stringify({ success: true, created: false, reason: 'no_messages' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Formatar mensagens para a IA
      const messagesText = messages.map(m => 
        `[${new Date(m.data_hora).toLocaleTimeString('pt-BR')}] ${m.nome_membro}: ${m.conteudo_mensagem}`
      ).join('\n');

      // Chamar GPT-5 Mini para análise de sentimento
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
              content: `Você é um assistente especializado em análise de sentimento de clientes de BPO financeiro.

Analise as mensagens do dia e forneça:
1. Sentimento geral (positivo, neutro, negativo)
2. Principais temas abordados
3. Reclamações (se houver)
4. Elogios (se houver)
5. Nível de urgência percebido
6. Recomendações de ação

Seja conciso e objetivo, máximo 300 palavras.`
            },
            {
              role: 'user',
              content: `Mensagens do dia ${yesterday.toLocaleDateString('pt-BR')}:\n\n${messagesText}`
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
      const feedback = data.choices[0].message.content;

      // Salvar análise diária
      const { data: dailyAnalysis, error: insertError } = await supabase
        .from('analise_sentimento_diario')
        .insert({
          id_contact: contact_id,
          data: yesterday.toISOString().split('T')[0],
          feedback,
        })
        .select()
        .single();

      if (insertError) {
        console.error('Error inserting daily analysis:', insertError);
        throw insertError;
      }

      console.log('Daily sentiment analysis created:', dailyAnalysis.id);

      return new Response(
        JSON.stringify({ success: true, analysis: dailyAnalysis }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } else if (type === 'weekly') {
      // Análise semanal: consolidar análises diárias da semana passada
      const today = new Date();
      const lastMonday = new Date(today);
      lastMonday.setDate(today.getDate() - today.getDay() - 6); // Segunda da semana passada
      lastMonday.setHours(0, 0, 0, 0);

      const lastSunday = new Date(lastMonday);
      lastSunday.setDate(lastMonday.getDate() + 6);
      lastSunday.setHours(23, 59, 59, 999);

      const weekNumber = getWeekNumber(lastMonday);
      const year = lastMonday.getFullYear();

      const { data: dailyAnalyses, error: dailyError } = await supabase
        .from('analise_sentimento_diario')
        .select('*')
        .eq('id_contact', contact_id)
        .gte('data', lastMonday.toISOString().split('T')[0])
        .lte('data', lastSunday.toISOString().split('T')[0])
        .order('data', { ascending: true });

      if (dailyError) {
        console.error('Error fetching daily analyses:', dailyError);
        throw dailyError;
      }

      if (!dailyAnalyses || dailyAnalyses.length === 0) {
        console.log('No daily analyses found for last week');
        return new Response(
          JSON.stringify({ success: true, created: false, reason: 'no_daily_analyses' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Consolidar análises diárias
      const consolidatedText = dailyAnalyses.map(a => 
        `Data: ${new Date(a.data).toLocaleDateString('pt-BR')}\n${a.feedback}`
      ).join('\n\n---\n\n');

      // Chamar GPT-5 Mini para análise semanal
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
              content: `Você é um assistente gerencial especializado em análise de tendências de satisfação de clientes.

Com base nas análises diárias da semana, forneça um relatório executivo com:
1. Evolução do sentimento ao longo da semana
2. Padrões identificados
3. Principais conquistas
4. Principais desafios
5. Tendências preocupantes (se houver)
6. Recomendações estratégicas

Seja objetivo e estratégico, máximo 500 palavras.`
            },
            {
              role: 'user',
              content: `Análises diárias da semana ${weekNumber}/${year} (${lastMonday.toLocaleDateString('pt-BR')} a ${lastSunday.toLocaleDateString('pt-BR')}):\n\n${consolidatedText}`
            }
          ],
          max_completion_tokens: 800,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('OpenAI API error:', response.status, errorText);
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      const feedback = data.choices[0].message.content;

      // Salvar análise semanal
      const { data: weeklyAnalysis, error: insertError } = await supabase
        .from('analise_sentimento_semanal')
        .insert({
          id_contact: contact_id,
          semana: weekNumber,
          ano: year,
          data_inicio: lastMonday.toISOString().split('T')[0],
          data_fim: lastSunday.toISOString().split('T')[0],
          feedback,
        })
        .select()
        .single();

      if (insertError) {
        console.error('Error inserting weekly analysis:', insertError);
        throw insertError;
      }

      console.log('Weekly sentiment analysis created:', weeklyAnalysis.id);

      return new Response(
        JSON.stringify({ success: true, analysis: weeklyAnalysis }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    throw new Error('Invalid type parameter');

  } catch (error: any) {
    console.error('Error in analyze-sentiment:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}
