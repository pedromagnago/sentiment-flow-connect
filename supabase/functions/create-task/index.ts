import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface TaskRequest {
  suggested_action_id: string
  extracted_data: {
    descricao: string
    prazo?: string
    prioridade?: string
  }
  contact_id: string
  message_id?: string
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Missing authorization header')
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)
    
    if (userError || !user) {
      throw new Error('Invalid authorization')
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('company_id')
      .eq('id', user.id)
      .single()

    if (profileError || !profile?.company_id) {
      throw new Error('User profile not found or company not set')
    }

    const { suggested_action_id, extracted_data, contact_id, message_id }: TaskRequest = await req.json()

    console.log('Creating task:', {
      suggested_action_id,
      extracted_data,
      contact_id,
      company_id: profile.company_id
    })

    // Parse prazo se fornecido
    let prazo = extracted_data.prazo
    if (prazo && prazo.includes('/')) {
      const [day, month, year] = prazo.split('/')
      prazo = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
    }

    // Extract título from descricao (first 100 chars)
    const titulo = extracted_data.descricao.substring(0, 100)

    const { data: task, error: taskError } = await supabase
      .from('tasks')
      .insert({
        company_id: profile.company_id,
        user_id: user.id,
        suggested_action_id,
        contact_id,
        message_id,
        titulo,
        descricao: extracted_data.descricao,
        prazo: prazo || null,
        prioridade: extracted_data.prioridade || 'normal',
        status: 'todo'
      })
      .select()
      .single()

    if (taskError) {
      console.error('Error creating task:', taskError)
      throw taskError
    }

    await supabase
      .from('suggested_actions')
      .update({
        status: 'completed',
        executed_by: user.id,
        executed_at: new Date().toISOString(),
        result_data: { task_id: task.id }
      })
      .eq('id', suggested_action_id)

    console.log('Task created successfully:', task)

    return new Response(
      JSON.stringify({
        success: true,
        task
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error) {
    console.error('Error in create-task:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    )
  }
})
