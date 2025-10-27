import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { file_url, file_type, file_name, suggested_action_id, contact_id, message_id } = await req.json();

    console.log('Processing document:', { file_name, file_type, file_url });

    if (!file_url || !file_type || !file_name) {
      throw new Error('Missing required fields: file_url, file_type, file_name');
    }

    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY not configured');
    }

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY');
    const supabase = createClient(supabaseUrl!, supabaseKey!, {
      global: { headers: { Authorization: authHeader } }
    });

    // Get user info
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    // Get user profile to get company_id
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('company_id')
      .eq('id', user.id)
      .single();

    if (profileError || !profile?.company_id) {
      throw new Error('User profile not found or missing company_id');
    }

    // Validate contact belongs to user's company if provided
    if (contact_id) {
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
        console.error('Unauthorized contact access:', { 
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
    }

    // Validate suggested_action belongs to user's company if provided
    if (suggested_action_id) {
      const { data: suggestedAction, error: actionError } = await supabase
        .from('suggested_actions')
        .select('contact_id')
        .eq('id', suggested_action_id)
        .single();

      if (actionError) {
        console.error('Error fetching suggested action:', actionError);
        throw new Error('Suggested action not found');
      }

      // Verify the suggested action's contact also belongs to the company
      const { data: actionContact, error: actionContactError } = await supabase
        .from('contacts')
        .select('company_id')
        .eq('id_contact', suggestedAction.contact_id)
        .maybeSingle();

      if (actionContactError || 
          (actionContact && actionContact.company_id && actionContact.company_id !== profile.company_id)) {
        console.error('Unauthorized suggested action access');
        return new Response(
          JSON.stringify({ error: 'Unauthorized: Suggested action does not belong to your company' }),
          { 
            status: 403,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
    }

    let extractedText = '';
    let summary = '';
    let analysisResult: any = {};

    // Process based on file type
    if (file_type === 'audio') {
      // Process audio with Whisper
      console.log('Processing audio with Whisper');
      
      const audioResponse = await fetch(file_url);
      const audioBlob = await audioResponse.blob();
      
      const formData = new FormData();
      formData.append('file', audioBlob, file_name);
      formData.append('model', 'whisper-1');

      const whisperResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
        },
        body: formData,
      });

      if (!whisperResponse.ok) {
        const error = await whisperResponse.text();
        console.error('Whisper API error:', error);
        throw new Error(`Whisper API error: ${error}`);
      }

      const whisperResult = await whisperResponse.json();
      extractedText = whisperResult.text;
      
      // Analyze transcription with GPT
      const analysisResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'Você é um assistente que analisa transcrições de áudio. Forneça um resumo conciso e identifique ações ou informações importantes.'
            },
            {
              role: 'user',
              content: `Analise esta transcrição e forneça um resumo:\n\n${extractedText}`
            }
          ],
        }),
      });

      const analysisData = await analysisResponse.json();
      summary = analysisData.choices[0].message.content;
      analysisResult = { transcription: extractedText, analysis: summary };

    } else if (file_type === 'image' || file_type === 'pdf') {
      // Process image/PDF with GPT-4o Vision
      console.log('Processing with GPT-4o Vision');
      
      const visionResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
              content: 'Você é um assistente que analisa documentos e imagens. Extraia todo o texto visível, identifique informações importantes como valores, datas, nomes, e forneça um resumo estruturado.'
            },
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: 'Analise este documento e extraia todas as informações relevantes. Identifique: valores monetários, datas, nomes, descrições, e qualquer outra informação importante.'
                },
                {
                  type: 'image_url',
                  image_url: { url: file_url }
                }
              ]
            }
          ],
        }),
      });

      if (!visionResponse.ok) {
        const error = await visionResponse.text();
        console.error('Vision API error:', error);
        throw new Error(`Vision API error: ${error}`);
      }

      const visionData = await visionResponse.json();
      const analysis = visionData.choices[0].message.content;
      
      extractedText = analysis;
      summary = analysis.substring(0, 500) + '...'; // First 500 chars as summary
      analysisResult = { analysis, file_type };
    }

    // Save to database
    const { data: analysisRecord, error: insertError } = await supabase
      .from('document_analysis')
      .insert({
        user_id: user.id,
        company_id: profile.company_id,
        file_name,
        file_url,
        file_type,
        analysis_result: analysisResult,
        extracted_text: extractedText,
        summary,
        suggested_action_id,
        contact_id,
        message_id,
        status: 'completed'
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error saving analysis:', insertError);
      throw insertError;
    }

    // Update suggested action if provided
    if (suggested_action_id) {
      await supabase
        .from('suggested_actions')
        .update({
          status: 'completed',
          executed_at: new Date().toISOString(),
          executed_by: user.id,
          result_data: { analysis_id: analysisRecord.id }
        })
        .eq('id', suggested_action_id);
    }

    console.log('Document processed successfully:', analysisRecord.id);

    return new Response(
      JSON.stringify({
        success: true,
        analysis_id: analysisRecord.id,
        extracted_text: extractedText,
        summary
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in process-document:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
