
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
    const { apiKey, workspaceId } = await req.json();

    console.log('🚀 Testing ClickUp connection for workspace:', workspaceId);

    if (!apiKey || !workspaceId) {
      throw new Error('Missing required parameters: apiKey or workspaceId');
    }

    // Test connection by fetching workspace/team info
    const testUrl = `https://api.clickup.com/api/v2/team/${workspaceId}`;
    console.log('📡 Testing ClickUp connection:', testUrl);

    const testResponse = await fetch(testUrl, {
      headers: {
        'Authorization': apiKey,
        'Content-Type': 'application/json'
      }
    });

    if (!testResponse.ok) {
      const errorText = await testResponse.text();
      console.error('❌ ClickUp test API error:', testResponse.status, errorText);
      throw new Error(`ClickUp API error: ${testResponse.status} - ${errorText}`);
    }

    const testData = await testResponse.json();
    console.log('✅ ClickUp connection test successful:', testData.team?.name);

    return new Response(
      JSON.stringify({ 
        success: true, 
        team: testData.team,
        message: 'Connection successful'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('💥 ClickUp test function error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
