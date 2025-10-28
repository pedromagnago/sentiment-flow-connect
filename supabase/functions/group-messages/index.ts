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

    console.log('Starting message grouping...');

    // Buscar contatos ativos com mensagens pendentes
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);

    const { data: contactsWithPendingMessages, error: contactsError } = await supabase
      .from('messages')
      .select('contact_id, nome_grupo')
      .eq('status_processamento', 'pendente')
      .lte('data_hora', tenMinutesAgo.toISOString())
      .order('contact_id');

    if (contactsError) {
      console.error('Error fetching contacts:', contactsError);
      throw contactsError;
    }

    if (!contactsWithPendingMessages || contactsWithPendingMessages.length === 0) {
      console.log('No contacts with pending messages');
      return new Response(
        JSON.stringify({ success: true, processed: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Agrupar por contato
    const uniqueContacts = [...new Set(contactsWithPendingMessages.map(c => c.contact_id))];
    console.log(`Found ${uniqueContacts.length} contacts with pending messages`);

    let processedGroups = 0;

    for (const contactId of uniqueContacts) {
      try {
        // Buscar mensagens pendentes deste contato (últimas 10 minutos)
        const { data: messages, error: messagesError } = await supabase
          .from('messages')
          .select('*')
          .eq('contact_id', contactId)
          .eq('status_processamento', 'pendente')
          .lte('data_hora', tenMinutesAgo.toISOString())
          .order('data_hora', { ascending: true })
          .limit(50);

        if (messagesError || !messages || messages.length === 0) {
          console.log(`No messages to process for contact ${contactId}`);
          continue;
        }

        console.log(`Processing ${messages.length} messages for contact ${contactId}`);

        // Formatar mensagens para análise
        const groupedMessages = messages.map(m => ({
          timestamp: m.data_hora,
          sender: m.nome_membro,
          content: m.conteudo_mensagem,
          type: m.tipo_mensagem
        }));

        const messagesText = groupedMessages.map(m => 
          `[${new Date(m.timestamp).toLocaleTimeString('pt-BR')}] ${m.sender}: ${m.content}`
        ).join('\n');

        // Analisar grupo com GPT-5
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
                content: `Você é um assistente de BPO financeiro que analisa grupos de mensagens e identifica tarefas complexas.

Analise este grupo de mensagens e identifique:
1. Se há uma ou mais tarefas explícitas ou implícitas
2. Para cada tarefa: descrição clara, prazo (se mencionado), prioridade, responsável (se indicado)
3. Contexto adicional relevante
4. Resumo da conversa

Responda em formato JSON:
{
  "tem_tarefa": true/false,
  "quantidade_tarefas": número,
  "resposta_ia": "Análise detalhada",
  "tasks": [
    {
      "titulo": "Título da tarefa",
      "descricao": "Descrição completa",
      "prazo": "YYYY-MM-DD ou null",
      "prioridade": "low/normal/high/urgent",
      "responsavel": "nome ou null",
      "confidence": 0.0-1.0
    }
  ]
}`
              },
              {
                role: 'user',
                content: `Grupo de mensagens:\n\n${messagesText}`
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
        const aiResponse = data.choices[0].message.content;

        // Parse JSON response
        let analysis;
        try {
          analysis = JSON.parse(aiResponse);
        } catch (e) {
          console.error('Failed to parse AI response:', aiResponse);
          analysis = {
            tem_tarefa: false,
            quantidade_tarefas: 0,
            resposta_ia: aiResponse,
            tasks: []
          };
        }

        // Salvar grupo de mensagens
        const { data: groupMessage, error: groupError } = await supabase
          .from('groups_message')
          .insert({
            contact_id: contactId,
            nome_grupo: messages[0].nome_grupo,
            grupo_mensagens: JSON.stringify(groupedMessages),
            resposta_ia: analysis.resposta_ia,
            tem_tarefa: analysis.tem_tarefa,
            quantidade_tarefas: analysis.quantidade_tarefas || 0,
            tasks_ids: [],
          })
          .select()
          .single();

        if (groupError) {
          console.error('Error inserting group message:', groupError);
          continue;
        }

        console.log('Group message created:', groupMessage.id);

        // Criar suggested_actions para tarefas identificadas
        if (analysis.tem_tarefa && analysis.tasks && analysis.tasks.length > 0) {
          for (const task of analysis.tasks) {
            const { data: suggestedAction, error: actionError } = await supabase
              .from('suggested_actions')
              .insert({
                contact_id: contactId,
                message_id: messages[0].id, // Primeira mensagem do grupo
                action_type: 'task',
                extracted_data: {
                  titulo: task.titulo,
                  descricao: task.descricao,
                  prazo: task.prazo,
                  prioridade: task.prioridade,
                  responsavel: task.responsavel,
                  grupo_mensagens_id: groupMessage.id
                },
                ai_confidence: task.confidence || 0.7,
                status: 'pending',
                priority: task.prioridade || 'normal',
                ai_suggestion: task.descricao,
              })
              .select()
              .single();

            if (actionError) {
              console.error('Error creating suggested action:', actionError);
            } else {
              console.log('Suggested action created from group:', suggestedAction.id);
            }
          }
        }

        // Marcar mensagens como processadas
        const messageIds = messages.map(m => m.id);
        await supabase
          .from('messages')
          .update({ status_processamento: 'processado' })
          .in('id', messageIds);

        processedGroups++;

      } catch (contactError) {
        console.error(`Error processing contact ${contactId}:`, contactError);
        // Continuar com próximo contato
      }
    }

    console.log(`Message grouping completed. Processed ${processedGroups} groups`);

    return new Response(
      JSON.stringify({ success: true, processed: processedGroups }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in group-messages:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
