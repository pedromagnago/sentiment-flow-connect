import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PaymentRequest {
  suggested_action_id: string
  extracted_data: {
    valor: string
    vencimento: string
    beneficiario: string
    descricao?: string
    categoria?: string
    forma_pagamento?: string
  }
  contact_id: string
  message_id?: string
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get auth header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Missing authorization header')
    }

    // Get user from JWT
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)
    
    if (userError || !user) {
      throw new Error('Invalid authorization')
    }

    // Get user's company_id from profiles
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('company_id')
      .eq('id', user.id)
      .single()

    if (profileError || !profile?.company_id) {
      throw new Error('User profile not found or company not set')
    }

    // Parse request body
    const { suggested_action_id, extracted_data, contact_id, message_id }: PaymentRequest = await req.json()

    console.log('Creating payment:', {
      suggested_action_id,
      extracted_data,
      contact_id,
      company_id: profile.company_id
    })

    // Parse valor (pode vir como "R$ 1.000,00" ou "1000.00")
    const valorStr = extracted_data.valor
      .replace(/R\$/g, '')
      .replace(/\./g, '')
      .replace(/,/g, '.')
      .trim()
    const valor = parseFloat(valorStr)

    if (isNaN(valor)) {
      throw new Error(`Invalid valor format: ${extracted_data.valor}`)
    }

    // Parse vencimento (pode vir como "DD/MM/YYYY" ou "YYYY-MM-DD")
    let vencimento = extracted_data.vencimento
    if (vencimento.includes('/')) {
      const [day, month, year] = vencimento.split('/')
      vencimento = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
    }

    // Create payment record
    const { data: payment, error: paymentError } = await supabase
      .from('contas_pagar')
      .insert({
        company_id: profile.company_id,
        user_id: user.id,
        suggested_action_id,
        contact_id,
        message_id,
        valor,
        vencimento,
        beneficiario: extracted_data.beneficiario,
        descricao: extracted_data.descricao || `Pagamento via WhatsApp`,
        categoria: extracted_data.categoria || 'Diversos',
        forma_pagamento: extracted_data.forma_pagamento,
        status: 'pendente'
      })
      .select()
      .single()

    if (paymentError) {
      console.error('Error creating payment:', paymentError)
      throw paymentError
    }

    // Update suggested action status
    await supabase
      .from('suggested_actions')
      .update({
        status: 'completed',
        executed_by: user.id,
        executed_at: new Date().toISOString(),
        result_data: { payment_id: payment.id }
      })
      .eq('id', suggested_action_id)

    console.log('Payment created successfully:', payment)

    return new Response(
      JSON.stringify({
        success: true,
        payment
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error) {
    console.error('Error in create-payment:', error)
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
