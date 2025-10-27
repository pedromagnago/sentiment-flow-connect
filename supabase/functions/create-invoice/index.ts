import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface InvoiceRequest {
  suggested_action_id: string
  extracted_data: {
    valor: string
    descricao: string
    destinatario: string
    data_vencimento?: string
    tipo_nota?: string
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
    const { suggested_action_id, extracted_data, contact_id, message_id }: InvoiceRequest = await req.json()

    console.log('Creating invoice:', {
      suggested_action_id,
      extracted_data,
      contact_id,
      company_id: profile.company_id
    })

    // Validate contact belongs to user's company
    const { data: contact, error: contactError } = await supabase
      .from('contacts')
      .select('company_id')
      .eq('id_contact', contact_id)
      .maybeSingle()

    if (contactError) {
      console.error('Error fetching contact:', contactError)
      throw new Error('Error validating contact access')
    }

    if (contact && contact.company_id && contact.company_id !== profile.company_id) {
      console.error('Unauthorized contact access:', { 
        user_company: profile.company_id, 
        contact_company: contact.company_id 
      })
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Contact does not belong to your company' }),
        { 
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Validate suggested_action belongs to user's company
    const { data: suggestedAction, error: actionError } = await supabase
      .from('suggested_actions')
      .select('contact_id')
      .eq('id', suggested_action_id)
      .single()

    if (actionError) {
      console.error('Error fetching suggested action:', actionError)
      throw new Error('Suggested action not found')
    }

    // Verify the suggested action's contact also belongs to the company
    const { data: actionContact, error: actionContactError } = await supabase
      .from('contacts')
      .select('company_id')
      .eq('id_contact', suggestedAction.contact_id)
      .maybeSingle()

    if (actionContactError || 
        (actionContact && actionContact.company_id && actionContact.company_id !== profile.company_id)) {
      console.error('Unauthorized suggested action access')
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Suggested action does not belong to your company' }),
        { 
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

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

    // Parse data_vencimento se fornecida
    let dataVencimento = extracted_data.data_vencimento
    if (dataVencimento && dataVencimento.includes('/')) {
      const [day, month, year] = dataVencimento.split('/')
      dataVencimento = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
    }

    // Create invoice record
    const { data: invoice, error: invoiceError } = await supabase
      .from('faturas')
      .insert({
        company_id: profile.company_id,
        user_id: user.id,
        suggested_action_id,
        contact_id,
        message_id,
        valor,
        descricao: extracted_data.descricao,
        destinatario: extracted_data.destinatario,
        data_vencimento: dataVencimento || null,
        tipo_nota: extracted_data.tipo_nota || 'nfse',
        status: 'pendente'
      })
      .select()
      .single()

    if (invoiceError) {
      console.error('Error creating invoice:', invoiceError)
      throw invoiceError
    }

    // Update suggested action status
    await supabase
      .from('suggested_actions')
      .update({
        status: 'completed',
        executed_by: user.id,
        executed_at: new Date().toISOString(),
        result_data: { invoice_id: invoice.id }
      })
      .eq('id', suggested_action_id)

    console.log('Invoice created successfully:', invoice)

    return new Response(
      JSON.stringify({
        success: true,
        invoice
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error) {
    console.error('Error in create-invoice:', error)
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
