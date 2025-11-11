import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { instanceId, token, clientToken } = await req.json();

    console.log('🔍 Testing ZAPI connection:', { 
      instanceId: instanceId?.slice(0, 8) + '***',
      hasClientToken: !!clientToken 
    });

    if (!instanceId || !token) {
      throw new Error('Missing required parameters: instanceId or token');
    }

    // Build headers with client-token if provided
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    
    if (clientToken) {
      headers['Client-Token'] = clientToken;
    }

    // Test connection by fetching status
    const statusUrl = `https://api.z-api.io/instances/${instanceId}/token/${token}/status`;
    console.log('📡 Testing ZAPI status endpoint:', statusUrl);
    console.log('📋 Headers:', { ...headers, 'Client-Token': clientToken ? '***' : 'not provided' });

    const statusResponse = await fetch(statusUrl, {
      method: 'GET',
      headers
    });

    const responseText = await statusResponse.text();
    console.log('📥 ZAPI Response Status:', statusResponse.status);
    console.log('📥 ZAPI Response Body:', responseText);

    if (!statusResponse.ok) {
      console.error('❌ ZAPI API error:', statusResponse.status, responseText);
      
      let errorMessage = 'Erro ao conectar com ZAPI';
      if (statusResponse.status === 401) {
        errorMessage = 'Credenciais inválidas. Verifique seu Instance ID e Token.';
      } else if (statusResponse.status === 404) {
        errorMessage = 'Instância não encontrada. Verifique seu Instance ID.';
      } else if (statusResponse.status === 403) {
        errorMessage = 'Acesso negado. Verifique suas permissões.';
      }

      return new Response(
        JSON.stringify({ 
          error: errorMessage,
          details: responseText,
          statusCode: statusResponse.status
        }),
        { 
          status: 200, // Return 200 so frontend can handle the error properly
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const statusData = JSON.parse(responseText);
    console.log('✅ ZAPI connection test successful:', statusData);

    // Also test /me endpoint for more info
    const meUrl = `https://api.z-api.io/instances/${instanceId}/token/${token}/me`;
    const meResponse = await fetch(meUrl, {
      method: 'GET',
      headers
    });

    let meData = null;
    if (meResponse.ok) {
      meData = await meResponse.json();
      console.log('📱 WhatsApp instance info:', meData);
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        connected: statusData.connected || false,
        battery: statusData.battery || null,
        phone: meData?.phone || null,
        waName: meData?.waName || null,
        message: 'Conexão estabelecida com sucesso'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('💥 Test ZAPI connection error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        details: 'Verifique suas credenciais e tente novamente'
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
