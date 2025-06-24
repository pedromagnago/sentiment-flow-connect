
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ClickUpTask {
  id: string;
  name: string;
  status: {
    status: string;
    color: string;
  };
  assignees: Array<{
    id: number;
    username: string;
    email: string;
  }>;
  priority: {
    id: string;
    priority: string;
    color: string;
  } | null;
  due_date: string | null;
  description: string;
  url: string;
  list: {
    id: string;
    name: string;
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { companyId, listId, apiKey } = await req.json();

    console.log('🚀 Starting ClickUp sync for company:', companyId, 'list:', listId);

    if (!companyId || !listId || !apiKey) {
      throw new Error('Missing required parameters: companyId, listId, or apiKey');
    }

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Fetch tasks from ClickUp
    const clickUpUrl = `https://api.clickup.com/api/v2/list/${listId}/task`;
    console.log('📡 Fetching tasks from ClickUp:', clickUpUrl);

    const clickUpResponse = await fetch(clickUpUrl, {
      headers: {
        'Authorization': apiKey,
        'Content-Type': 'application/json'
      }
    });

    if (!clickUpResponse.ok) {
      const errorText = await clickUpResponse.text();
      console.error('❌ ClickUp API error:', clickUpResponse.status, errorText);
      throw new Error(`ClickUp API error: ${clickUpResponse.status} - ${errorText}`);
    }

    const clickUpData = await clickUpResponse.json();
    console.log('📋 Received tasks from ClickUp:', clickUpData.tasks?.length || 0);

    if (!clickUpData.tasks || !Array.isArray(clickUpData.tasks)) {
      console.log('⚠️ No tasks found in ClickUp response');
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No tasks found',
          synced: 0 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let syncedCount = 0;
    const errors: string[] = [];

    // Process each task
    for (const task of clickUpData.tasks) {
      try {
        console.log('🔄 Processing task:', task.id, task.name);

        // Check if task already exists
        const { data: existingTask, error: checkError } = await supabase
          .from('taskgroups')
          .select('id')
          .eq('id', task.id)
          .single();

        if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows found
          console.error('❌ Error checking existing task:', checkError);
          continue;
        }

        const taskData = {
          id: task.id,
          nome_grupo: task.name,
          status_clickup: task.status?.status || 'unknown',
          'workflow.name': `ClickUp List: ${task.list?.name || 'Unknown'}`,
          'workflow.id': listId,
          'execution.id': `clickup-${task.id}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        if (existingTask) {
          // Update existing task
          const { error: updateError } = await supabase
            .from('taskgroups')
            .update(taskData)
            .eq('id', task.id);

          if (updateError) {
            console.error('❌ Error updating task:', updateError);
            errors.push(`Failed to update task ${task.id}: ${updateError.message}`);
          } else {
            console.log('✅ Task updated:', task.id);
            syncedCount++;
          }
        } else {
          // Insert new task
          const { error: insertError } = await supabase
            .from('taskgroups')
            .insert(taskData);

          if (insertError) {
            console.error('❌ Error inserting task:', insertError);
            errors.push(`Failed to insert task ${task.id}: ${insertError.message}`);
          } else {
            console.log('✅ Task inserted:', task.id);
            syncedCount++;
          }
        }
      } catch (taskError) {
        console.error('❌ Error processing task:', taskError);
        errors.push(`Failed to process task ${task.id}: ${taskError instanceof Error ? taskError.message : 'Unknown error'}`);
      }
    }

    const result = {
      success: true,
      synced: syncedCount,
      total: clickUpData.tasks.length,
      errors: errors.length > 0 ? errors : undefined
    };

    console.log('✅ ClickUp sync completed:', result);

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('💥 ClickUp sync function error:', error);
    
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
