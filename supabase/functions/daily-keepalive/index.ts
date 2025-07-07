import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Fazer uma query simples para manter o banco ativo
    const { data, error } = await supabase
      .from('companies')
      .select('id')
      .limit(1)

    if (error) {
      console.error('Error in keepalive query:', error)
    }

    const timestamp = new Date().toISOString()
    console.log('Daily keepalive executed at:', timestamp)
    console.log('Query result:', data ? 'Success' : 'No data')
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        timestamp,
        message: 'Database keepalive completed',
        dataFound: !!data
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    )
  } catch (error) {
    console.error('Keepalive function error:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    )
  }
})