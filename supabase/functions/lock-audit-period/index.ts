import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface LockPeriodRequest {
  company_id: string;
  period_start: string;
  period_end: string;
  action: 'lock' | 'unlock' | 'approve';
  notes?: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user from JWT
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      console.error('Auth error:', userError);
      throw new Error('Invalid authorization');
    }

    // Check if user is admin
    const { data: userRoles, error: rolesError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .is('revoked_at', null);

    if (rolesError) {
      console.error('Roles error:', rolesError);
      throw new Error('Error checking user roles');
    }

    const isAdmin = userRoles?.some(r => r.role === 'admin' || r.role === 'owner');
    if (!isAdmin) {
      return new Response(
        JSON.stringify({ error: 'Apenas administradores podem gerenciar períodos de auditoria' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const requestData = await req.json() as LockPeriodRequest;
    const { company_id, period_start, period_end, action, notes } = requestData;

    console.log('Lock period request:', { company_id, period_start, period_end, action, user_id: user.id });

    // Validate inputs
    if (!company_id || !period_start || !period_end || !action) {
      throw new Error('Missing required fields: company_id, period_start, period_end, action');
    }

    // Check if user has access to company
    const { data: hasAccess } = await supabase
      .from('user_roles')
      .select('id')
      .eq('user_id', user.id)
      .eq('company_id', company_id)
      .eq('is_active', true)
      .is('revoked_at', null)
      .maybeSingle();

    if (!hasAccess) {
      return new Response(
        JSON.stringify({ error: 'Sem acesso a esta empresa' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Count transactions in period
    const { count: transactionsCount } = await supabase
      .from('bank_transactions')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', company_id)
      .gte('date', period_start)
      .lte('date', period_end);

    // Calculate totals
    const { data: totals } = await supabase
      .from('bank_transactions')
      .select('amount')
      .eq('company_id', company_id)
      .gte('date', period_start)
      .lte('date', period_end);

    let totalDebits = 0;
    let totalCredits = 0;
    totals?.forEach(t => {
      if (t.amount < 0) totalDebits += Math.abs(t.amount);
      else totalCredits += t.amount;
    });

    // Determine new status based on action
    let newStatus: string;
    let lockFields: Record<string, any> = {};
    let approveFields: Record<string, any> = {};

    switch (action) {
      case 'lock':
        newStatus = 'locked';
        lockFields = {
          locked_by: user.id,
          locked_at: new Date().toISOString()
        };
        break;
      case 'unlock':
        newStatus = 'open';
        lockFields = {
          locked_by: null,
          locked_at: null,
          approved_by: null,
          approved_at: null
        };
        break;
      case 'approve':
        newStatus = 'approved';
        approveFields = {
          approved_by: user.id,
          approved_at: new Date().toISOString()
        };
        break;
      default:
        throw new Error('Invalid action');
    }

    // Upsert audit period
    const { data: period, error: periodError } = await supabase
      .from('audit_periods')
      .upsert({
        company_id,
        period_start,
        period_end,
        status: newStatus,
        notes,
        transactions_count: transactionsCount || 0,
        total_debits: totalDebits,
        total_credits: totalCredits,
        ...lockFields,
        ...approveFields,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'company_id,period_start,period_end'
      })
      .select()
      .single();

    if (periodError) {
      console.error('Period upsert error:', periodError);
      throw new Error('Error saving audit period');
    }

    // Update transaction status if locking/approving
    if (action === 'lock' || action === 'approve') {
      const transactionStatus = action === 'approve' ? 'audited' : 'classified';
      
      const { error: updateError } = await supabase
        .from('bank_transactions')
        .update({
          transaction_status: transactionStatus,
          audited_at: action === 'approve' ? new Date().toISOString() : null,
          audited_by: action === 'approve' ? user.id : null
        })
        .eq('company_id', company_id)
        .gte('date', period_start)
        .lte('date', period_end);

      if (updateError) {
        console.error('Transaction update error:', updateError);
        // Non-blocking error
      }
    }

    // Log action
    await supabase
      .from('audit_logs')
      .insert({
        table_name: 'audit_periods',
        action: action.toUpperCase(),
        record_id: period.id,
        user_id: user.id,
        new_data: period
      });

    console.log('Period action completed:', { period_id: period.id, action, status: newStatus });

    return new Response(
      JSON.stringify({
        success: true,
        period,
        transactions_affected: transactionsCount || 0
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in lock-audit-period:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
