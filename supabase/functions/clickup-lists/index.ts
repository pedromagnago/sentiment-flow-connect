
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

    console.log('🚀 Fetching ClickUp lists for workspace:', workspaceId);

    if (!apiKey || !workspaceId) {
      throw new Error('Missing required parameters: apiKey or workspaceId');
    }

    // First, get spaces in the workspace
    const spacesUrl = `https://api.clickup.com/api/v2/team/${workspaceId}/space`;
    console.log('📡 Fetching spaces from ClickUp:', spacesUrl);

    const spacesResponse = await fetch(spacesUrl, {
      headers: {
        'Authorization': apiKey,
        'Content-Type': 'application/json'
      }
    });

    if (!spacesResponse.ok) {
      const errorText = await spacesResponse.text();
      console.error('❌ ClickUp spaces API error:', spacesResponse.status, errorText);
      throw new Error(`ClickUp API error: ${spacesResponse.status} - ${errorText}`);
    }

    const spacesData = await spacesResponse.json();
    console.log('📋 Received spaces from ClickUp:', spacesData.spaces?.length || 0);

    const allLists: any[] = [];

    // For each space, get folders and lists
    for (const space of spacesData.spaces || []) {
      try {
        // Get folders in the space
        const foldersUrl = `https://api.clickup.com/api/v2/space/${space.id}/folder`;
        const foldersResponse = await fetch(foldersUrl, {
          headers: {
            'Authorization': apiKey,
            'Content-Type': 'application/json'
          }
        });

        if (foldersResponse.ok) {
          const foldersData = await foldersResponse.json();
          
          // Get lists from each folder
          for (const folder of foldersData.folders || []) {
            for (const list of folder.lists || []) {
              allLists.push({
                ...list,
                space_name: space.name,
                folder_name: folder.name
              });
            }
          }
        }

        // Also get folderless lists directly from space
        const folderlessUrl = `https://api.clickup.com/api/v2/space/${space.id}/list`;
        const folderlessResponse = await fetch(folderlessUrl, {
          headers: {
            'Authorization': apiKey,
            'Content-Type': 'application/json'
          }
        });

        if (folderlessResponse.ok) {
          const folderlessData = await folderlessResponse.json();
          for (const list of folderlessData.lists || []) {
            allLists.push({
              ...list,
              space_name: space.name,
              folder_name: 'No Folder'
            });
          }
        }
      } catch (spaceError) {
        console.error('❌ Error processing space:', space.id, spaceError);
      }
    }

    console.log('✅ Total lists found:', allLists.length);

    return new Response(
      JSON.stringify({ 
        success: true, 
        lists: allLists 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('💥 ClickUp lists function error:', error);
    
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
