import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

    // Parse multipart form data
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const transactionId = formData.get('transaction_id') as string;
    const companyId = formData.get('company_id') as string;
    const attachmentType = formData.get('type') as string || 'comprovante';

    console.log('Upload request:', { 
      transaction_id: transactionId, 
      company_id: companyId,
      file_name: file?.name,
      file_size: file?.size,
      type: attachmentType,
      user_id: user.id
    });

    // Validate inputs
    if (!file) {
      throw new Error('Arquivo não fornecido');
    }

    if (!transactionId || !companyId) {
      throw new Error('transaction_id e company_id são obrigatórios');
    }

    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new Error('Arquivo muito grande. Máximo permitido: 10MB');
    }

    // Validate file type
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv'
    ];

    if (!allowedTypes.includes(file.type)) {
      throw new Error('Tipo de arquivo não permitido. Use: JPG, PNG, PDF, Excel ou CSV');
    }

    // Check user has access to company
    const { data: hasAccess } = await supabase
      .from('user_roles')
      .select('id')
      .eq('user_id', user.id)
      .eq('company_id', companyId)
      .eq('is_active', true)
      .is('revoked_at', null)
      .maybeSingle();

    if (!hasAccess) {
      return new Response(
        JSON.stringify({ error: 'Sem acesso a esta empresa' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check transaction exists and belongs to company
    const { data: transaction, error: txError } = await supabase
      .from('bank_transactions')
      .select('id, company_id, date')
      .eq('id', transactionId)
      .eq('company_id', companyId)
      .maybeSingle();

    if (txError || !transaction) {
      console.error('Transaction lookup error:', txError);
      throw new Error('Transação não encontrada ou sem permissão');
    }

    // Check if period is locked
    const { data: lockedPeriod } = await supabase
      .from('audit_periods')
      .select('id, status')
      .eq('company_id', companyId)
      .lte('period_start', transaction.date)
      .gte('period_end', transaction.date)
      .in('status', ['locked', 'approved'])
      .maybeSingle();

    if (lockedPeriod) {
      return new Response(
        JSON.stringify({ error: 'Período fechado para edição. Contate o BPO.' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate file path
    const fileExt = file.name.split('.').pop();
    const timestamp = Date.now();
    const fileName = `${transactionId}_${attachmentType}_${timestamp}.${fileExt}`;
    const filePath = `${companyId}/transactions/${fileName}`;

    // Upload to storage
    const fileBuffer = await file.arrayBuffer();
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('attachments')
      .upload(filePath, fileBuffer, {
        contentType: file.type,
        upsert: true
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      
      // Check if bucket exists, if not create it
      if (uploadError.message?.includes('not found')) {
        console.log('Creating attachments bucket...');
        
        const { error: bucketError } = await supabase.storage.createBucket('attachments', {
          public: false,
          fileSizeLimit: 10485760 // 10MB
        });

        if (bucketError && !bucketError.message?.includes('already exists')) {
          console.error('Bucket creation error:', bucketError);
          throw new Error('Erro ao criar storage');
        }

        // Retry upload
        const { error: retryError } = await supabase.storage
          .from('attachments')
          .upload(filePath, fileBuffer, {
            contentType: file.type,
            upsert: true
          });

        if (retryError) {
          console.error('Retry upload error:', retryError);
          throw new Error('Erro ao fazer upload do arquivo');
        }
      } else {
        throw new Error('Erro ao fazer upload: ' + uploadError.message);
      }
    }

    // Get public URL (signed for private bucket)
    const { data: signedUrl } = await supabase.storage
      .from('attachments')
      .createSignedUrl(filePath, 60 * 60 * 24 * 365); // 1 year

    const attachmentUrl = signedUrl?.signedUrl || `attachments/${filePath}`;

    // Update transaction with attachment URL
    const { error: updateError } = await supabase
      .from('bank_transactions')
      .update({
        attachment_url: attachmentUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', transactionId);

    if (updateError) {
      console.error('Transaction update error:', updateError);
      throw new Error('Erro ao vincular arquivo à transação');
    }

    // Log action
    await supabase
      .from('audit_logs')
      .insert({
        table_name: 'bank_transactions',
        action: 'ATTACHMENT_UPLOAD',
        record_id: transactionId,
        user_id: user.id,
        new_data: {
          file_name: file.name,
          file_size: file.size,
          file_type: file.type,
          attachment_url: attachmentUrl
        }
      });

    console.log('Upload completed:', { 
      transaction_id: transactionId, 
      file_path: filePath,
      url: attachmentUrl.substring(0, 50) + '...'
    });

    return new Response(
      JSON.stringify({
        success: true,
        attachment_url: attachmentUrl,
        file_name: file.name,
        file_size: file.size
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in upload-attachment:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
