import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";
import * as XLSX from "https://esm.sh/xlsx@0.18.5";

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

    for (const row of jsonData as any[]) {
      try {
        // Map common column names (flexible mapping)
        const date = row['Data'] || row['data'] || row['DATE'] || row['Date'];
        const description = row['Descrição'] || row['Descricao'] || row['descricao'] || row['Description'] || row['DESCRIPTION'];
        const amount = row['Valor'] || row['valor'] || row['Amount'] || row['AMOUNT'];
        const type = row['Tipo'] || row['tipo'] || row['Type'] || row['TYPE'];
        const memo = row['Memo'] || row['memo'] || row['Observação'] || row['observacao'];

        if (!date || !description || amount === undefined) {
          console.log('Skipping row - missing required fields:', row);
          continue;
        }

        // Parse date (supports multiple formats)
        let parsedDate: Date;
        if (typeof date === 'string') {
          // Try DD/MM/YYYY format first
          const parts = date.split('/');
          if (parts.length === 3) {
            parsedDate = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
          } else {
            parsedDate = new Date(date);
          }
        } else if (typeof date === 'number') {
          // Excel date number
          parsedDate = XLSX.SSF.parse_date_code(date);
        } else {
          parsedDate = new Date(date);
        }

        if (isNaN(parsedDate.getTime())) {
          console.log('Invalid date:', date);
          continue;
        }

        // Parse amount
        let parsedAmount: number;
        if (typeof amount === 'string') {
          parsedAmount = parseFloat(amount.replace(/[R$\s.]/g, '').replace(',', '.'));
        } else {
          parsedAmount = parseFloat(amount);
        }

        if (isNaN(parsedAmount)) {
          console.log('Invalid amount:', amount);
          continue;
        }

        // Determine transaction type
        let transactionType = 'DEBIT';
        if (type) {
          const typeStr = String(type).toLowerCase();
          if (typeStr.includes('credit') || typeStr.includes('crédito') || typeStr.includes('credito') || typeStr.includes('entrada')) {
            transactionType = 'CREDIT';
          }
        } else if (parsedAmount > 0) {
          transactionType = 'CREDIT';
        } else {
          parsedAmount = Math.abs(parsedAmount);
        }

        // Apply categorization rules
        let category = null;
        if (rules) {
          for (const rule of rules) {
            if (description.toLowerCase().includes(rule.pattern.toLowerCase())) {
              category = rule.category;
              break;
            }
          }
        }

        // Generate unique fitid from content
        const fitidSource = `${parsedDate.toISOString()}_${description}_${parsedAmount}`;
        const fitid = await crypto.subtle.digest(
          'SHA-256',
          new TextEncoder().encode(fitidSource)
        ).then(buf => Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 32));

        const transaction = {
          user_id: user.id,
          company_id: profile.company_id,
          import_id: importRecord.id,
          date: parsedDate.toISOString().split('T')[0],
          amount: parsedAmount,
          description,
          type: transactionType,
          memo: memo || null,
          fitid,
          category,
          account_id: 'spreadsheet',
          raw: row,
        };

        transactions.push(transaction);
        imported++;
      } catch (rowError) {
        console.error('Error processing row:', row, rowError);
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

    console.log(`Successfully imported ${imported} transactions`);

    return new Response(
      JSON.stringify({
        importId: importRecord.id,
        total: jsonData.length,
        imported,
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
