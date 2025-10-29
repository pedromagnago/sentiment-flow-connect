import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Levenshtein distance para fuzzy matching
function levenshteinDistance(s1: string, s2: string): number {
  const len1 = s1.length;
  const len2 = s2.length;
  const dp: number[][] = Array(len1 + 1).fill(null).map(() => Array(len2 + 1).fill(0));

  for (let i = 0; i <= len1; i++) dp[i][0] = i;
  for (let j = 0; j <= len2; j++) dp[0][j] = j;

  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      );
    }
  }

  return dp[len1][len2];
}

function levenshteinSimilarity(s1: string, s2: string): number {
  const distance = levenshteinDistance(s1, s2);
  const maxLen = Math.max(s1.length, s2.length);
  return maxLen === 0 ? 1 : 1 - distance / maxLen;
}

// Extrair CPF/CNPJ de string
function extractCPFCNPJ(text: string): string | null {
  const cpfRegex = /\d{3}\.\d{3}\.\d{3}-\d{2}/;
  const cnpjRegex = /\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}/;
  
  const cpfMatch = text.match(cpfRegex);
  if (cpfMatch) return cpfMatch[0];
  
  const cnpjMatch = text.match(cnpjRegex);
  if (cnpjMatch) return cnpjMatch[0];
  
  return null;
}

interface MatchCandidate {
  id: string;
  type: 'payable' | 'receivable';
  score: number;
  reasons: string[];
  details: any;
}

function calculateMatch(transaction: any, account: any, type: 'payable' | 'receivable'): MatchCandidate {
  let score = 0;
  const reasons: string[] = [];
  
  // 1. Valor exato (40 pontos)
  const valorAccount = type === 'payable' ? account.valor : account.valor_total;
  const amountDiff = Math.abs(transaction.amount - valorAccount);
  
  if (amountDiff < 0.01) {
    score += 40;
    reasons.push('Valor exato');
  } else if (amountDiff < 10) {
    score += 20;
    reasons.push(`Valor próximo (diferença R$ ${amountDiff.toFixed(2)})`);
  } else if (amountDiff < 50) {
    score += 10;
    reasons.push(`Valor razoável (diferença R$ ${amountDiff.toFixed(2)})`);
  }
  
  // 2. Data próxima (30 pontos)
  const vencimento = type === 'payable' ? account.vencimento : account.data_vencimento;
  const dateDiff = Math.abs(
    new Date(transaction.date).getTime() - 
    new Date(vencimento).getTime()
  ) / (1000 * 60 * 60 * 24);
  
  if (dateDiff === 0) {
    score += 30;
    reasons.push('Data exata');
  } else if (dateDiff <= 3) {
    score += 20;
    reasons.push(`Data próxima (${Math.floor(dateDiff)} dias)`);
  } else if (dateDiff <= 7) {
    score += 10;
    reasons.push(`Data razoável (${Math.floor(dateDiff)} dias)`);
  }
  
  // 3. Similaridade de descrição (30 pontos)
  const transDesc = (transaction.description || '').toLowerCase();
  const accountDesc = (account.descricao || '').toLowerCase();
  const descSimilarity = levenshteinSimilarity(transDesc, accountDesc);
  
  if (descSimilarity > 0.8) {
    score += 30;
    reasons.push('Descrição muito similar');
  } else if (descSimilarity > 0.6) {
    score += 20;
    reasons.push('Descrição similar');
  } else if (descSimilarity > 0.4) {
    score += 10;
    reasons.push('Descrição parcialmente similar');
  }
  
  // 4. CPF/CNPJ match (bonus 10 pontos)
  if (transaction.nome_origem && account.cpf_cnpj_beneficiario) {
    const transCpf = extractCPFCNPJ(transaction.nome_origem);
    if (transCpf === account.cpf_cnpj_beneficiario) {
      score += 10;
      reasons.push('CPF/CNPJ corresponde');
    }
  }
  
  return {
    id: account.id,
    type,
    score: Math.min(score, 100),
    reasons,
    details: account
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization')!;
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { company_id, transaction_id, auto_confirm_threshold = 90 } = await req.json();

    if (!company_id) {
      return new Response(JSON.stringify({ error: 'company_id is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Buscar transação(ões) específica ou todas não reconciliadas
    const transQuery = supabase
      .from('bank_transactions')
      .select('*')
      .eq('company_id', company_id)
      .eq('reconciled', false);
    
    if (transaction_id) {
      transQuery.eq('id', transaction_id);
    }

    const { data: transactions, error: transError } = await transQuery;
    if (transError) throw transError;

    if (!transactions || transactions.length === 0) {
      return new Response(JSON.stringify({ 
        matches: [],
        message: 'No unreconciled transactions found' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Buscar contas a pagar e receber não reconciliadas
    const { data: payables, error: payablesError } = await supabase
      .from('contas_pagar')
      .select('*')
      .eq('company_id', company_id)
      .eq('reconciled', false)
      .in('status', ['pendente', 'aprovado']);

    const { data: receivables, error: receivablesError } = await supabase
      .from('contas_receber')
      .select('*')
      .eq('company_id', company_id)
      .eq('reconciled', false)
      .eq('status', 'pendente');

    if (payablesError) throw payablesError;
    if (receivablesError) throw receivablesError;

    const allMatches: any[] = [];
    const autoConfirmedMatches: any[] = [];

    // Para cada transação, buscar matches
    for (const transaction of transactions) {
      const candidates: MatchCandidate[] = [];
      
      // Match com contas a pagar (transações negativas)
      if (transaction.amount < 0 && payables) {
        for (const payable of payables) {
          const match = calculateMatch(transaction, payable, 'payable');
          if (match.score > 30) { // Só considerar se score mínimo
            candidates.push(match);
          }
        }
      }
      
      // Match com contas a receber (transações positivas)
      if (transaction.amount > 0 && receivables) {
        for (const receivable of receivables) {
          const match = calculateMatch(transaction, receivable, 'receivable');
          if (match.score > 30) {
            candidates.push(match);
          }
        }
      }

      // Ordenar por score
      candidates.sort((a, b) => b.score - a.score);

      // Pegar os 3 melhores matches
      const topMatches = candidates.slice(0, 3);

      for (const match of topMatches) {
        const matchData = {
          company_id,
          user_id: user.id,
          transaction_id: transaction.id,
          payable_id: match.type === 'payable' ? match.id : null,
          receivable_id: match.type === 'receivable' ? match.id : null,
          match_type: match.score >= 90 ? 'exact' : (match.score >= 70 ? 'fuzzy' : 'rule'),
          match_score: match.score,
          match_details: {
            reasons: match.reasons,
            transaction: {
              amount: transaction.amount,
              date: transaction.date,
              description: transaction.description
            },
            account: {
              descricao: match.details.descricao,
              valor: match.type === 'payable' ? match.details.valor : match.details.valor_total,
              vencimento: match.type === 'payable' ? match.details.vencimento : match.details.data_vencimento
            }
          },
          status: match.score >= auto_confirm_threshold ? 'confirmed' : 'suggested',
          confirmed_at: match.score >= auto_confirm_threshold ? new Date().toISOString() : null,
          confirmed_by: match.score >= auto_confirm_threshold ? user.id : null
        };

        // Inserir match
        const { data: insertedMatch, error: insertError } = await supabase
          .from('reconciliation_matches')
          .insert(matchData)
          .select()
          .single();

        if (insertError) {
          console.error('Error inserting match:', insertError);
          continue;
        }

        // Se auto-confirmado, marcar transação e conta como reconciliadas
        if (match.score >= auto_confirm_threshold) {
          await supabase
            .from('bank_transactions')
            .update({ 
              reconciled: true, 
              reconciled_at: new Date().toISOString(),
              reconciled_by: user.id
            })
            .eq('id', transaction.id);

          const accountTable = match.type === 'payable' ? 'contas_pagar' : 'contas_receber';
          await supabase
            .from(accountTable)
            .update({ 
              reconciled: true,
              reconciled_at: new Date().toISOString(),
              reconciled_by: user.id
            })
            .eq('id', match.id);

          autoConfirmedMatches.push(insertedMatch);
        }

        allMatches.push(insertedMatch);
      }
    }

    return new Response(JSON.stringify({
      success: true,
      total_matches: allMatches.length,
      auto_confirmed: autoConfirmedMatches.length,
      matches: allMatches
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in match-transactions:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
