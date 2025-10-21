import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";
import * as XLSX from "https://esm.sh/xlsx@0.18.5";
import { detectParser, extractAccountInfo } from './parsers.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('Auth error:', authError);
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get company_id from profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('company_id')
      .eq('id', user.id)
      .maybeSingle();

    if (profileError || !profile?.company_id) {
      console.error('Profile error:', profileError);
      return new Response(JSON.stringify({ error: 'Perfil sem empresa associada' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { fileBase64, fileName } = await req.json();

    if (!fileBase64 || !fileName) {
      return new Response(JSON.stringify({ error: 'Arquivo e nome são obrigatórios' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Processing spreadsheet: ${fileName}`);

    // Decode base64 to binary
    const binary = Uint8Array.from(atob(fileBase64), c => c.charCodeAt(0));
    
    // Read workbook
    const workbook = XLSX.read(binary, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    
    // Convert to JSON
    const jsonData = XLSX.utils.sheet_to_json(sheet);

    console.log(`Found ${jsonData.length} rows in spreadsheet`);

    if (jsonData.length === 0) {
      return new Response(JSON.stringify({ error: 'Planilha vazia ou formato inválido' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Detect bank format
    const parser = detectParser(jsonData);
    console.log(`✅ Formato detectado: ${parser.name}`);

    // Extract account information for Bradesco
    const accountInfo = parser.name === 'Bradesco' ? extractAccountInfo(jsonData) : null;
    if (accountInfo) {
      console.log(`🏦 Conta identificada: Banco ${accountInfo.bank_id}, Ag ${accountInfo.branch_id}, Conta ${accountInfo.account_id}`);
    }

    // Create import record
    const { data: importRecord, error: importError } = await supabase
      .from('transaction_imports')
      .insert({
        user_id: user.id,
        company_id: profile.company_id,
        file_name: fileName,
        status: 'processing',
        total_transactions: jsonData.length,
      })
      .select()
      .single();

    if (importError) {
      console.error('Import record error:', importError);
      throw importError;
    }

    // Fetch categorization rules
    const { data: rules } = await supabase
      .from('transaction_rules')
      .select('*')
      .eq('company_id', profile.company_id)
      .eq('active', true)
      .order('priority', { ascending: false });

    const transactions = [];
    let imported = 0;
    let ignored = 0;
    let minDate: Date | null = null;
    let maxDate: Date | null = null;

    // Process each row using detected parser
    for (const row of jsonData as any[]) {
      try {
        const parsed = parser.parse(row);
        
        if (!parsed) {
          ignored++;
          continue;
        }

        // Track date range
        if (!minDate || parsed.date < minDate) minDate = parsed.date;
        if (!maxDate || parsed.date > maxDate) maxDate = parsed.date;

        // Apply categorization rules
        let category = null;
        if (rules) {
          for (const rule of rules) {
            if (parsed.description.toLowerCase().includes(rule.pattern.toLowerCase())) {
              category = rule.category;
              break;
            }
          }
        }

        // Generate unique fitid from content
        const fitidSource = `${parsed.date.toISOString()}_${parsed.description}_${parsed.amount}`;
        const fitid = await crypto.subtle.digest(
          'SHA-256',
          new TextEncoder().encode(fitidSource)
        ).then(buf => Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 32));

        const transaction = {
          user_id: user.id,
          company_id: profile.company_id,
          import_id: importRecord.id,
          date: parsed.date.toISOString().split('T')[0],
          amount: parsed.amount,
          description: parsed.description,
          type: parsed.type,
          memo: parsed.memo || null,
          fitid,
          category,
          // Use extracted account info if available
          account_id: accountInfo?.account_id || 'spreadsheet',
          bank_id: accountInfo?.bank_id || null,
          branch_id: accountInfo?.branch_id || null,
          acct_type: accountInfo?.acct_type || null,
          // Include document number if available
          ...(parsed.document && { raw: { ...row, document: parsed.document } }),
          ...(!parsed.document && { raw: row }),
        };

        transactions.push(transaction);
        imported++;
      } catch (rowError) {
        console.error('Error processing row:', row, rowError);
        ignored++;
      }
    }

    // Insert transactions (upsert to avoid duplicates)
    if (transactions.length > 0) {
      const { error: insertError } = await supabase
        .from('bank_transactions')
        .upsert(transactions, {
          onConflict: 'company_id,fitid',
          ignoreDuplicates: true,
        });

      if (insertError) {
        console.error('Insert error:', insertError);
        throw insertError;
      }
    }

    // Update import record
    await supabase
      .from('transaction_imports')
      .update({
        status: 'completed',
        imported_transactions: imported,
      })
      .eq('id', importRecord.id);

    console.log('\n📊 RESUMO DA IMPORTAÇÃO:');
    console.log(`  ✅ Formato: ${parser.name}`);
    if (accountInfo) {
      console.log(`  🏦 Banco: ${accountInfo.bank_id} (Bradesco)`);
      console.log(`  🏢 Agência: ${accountInfo.branch_id}`);
      console.log(`  💳 Conta: ${accountInfo.account_id}`);
    }
    console.log(`  📄 Total de linhas: ${jsonData.length}`);
    console.log(`  ✅ Transações válidas: ${imported}`);
    console.log(`  ⏭️  Linhas ignoradas: ${ignored} (cabeçalhos, totais)`);
    if (minDate && maxDate) {
      console.log(`  📅 Período: ${minDate.toLocaleDateString('pt-BR')} a ${maxDate.toLocaleDateString('pt-BR')}`);
    }

    return new Response(
      JSON.stringify({
        importId: importRecord.id,
        total: jsonData.length,
        imported,
        ignored,
        format: parser.name,
        period: minDate && maxDate ? {
          start: minDate.toISOString(),
          end: maxDate.toISOString(),
        } : null,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error processing spreadsheet:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Erro ao processar planilha' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
