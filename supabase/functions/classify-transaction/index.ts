import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { description, amount, memo } = await req.json();
    
    if (!description && !memo) {
      throw new Error('Description or memo is required for classification');
    }

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const transactionText = `${description || ''} ${memo || ''}`.trim();
    const amountValue = parseFloat(amount) || 0;
    const isCredit = amountValue > 0;

    const prompt = `Analise esta transação bancária e classifique-a em uma categoria apropriada.

Transação: "${transactionText}"
Valor: ${amountValue} (${isCredit ? 'Entrada' : 'Saída'})

Com base na descrição da transação e no valor, determine:
1. A categoria mais apropriada (exemplos: Alimentação, Transporte, Salário, Vendas, Fornecedores, Impostos, Marketing, Tecnologia, etc.)
2. Se é uma entrada ou saída de dinheiro
3. Um nível de confiança na classificação (baixo, médio, alto)

Responda APENAS em formato JSON com esta estrutura:
{
  "categoria": "nome_da_categoria",
  "tipo": "entrada" ou "saida",
  "confianca": "baixo" ou "medio" ou "alto",
  "razao": "breve explicacao da classificacao"
}`;

    console.log('Sending classification request to OpenAI for:', transactionText);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'Você é um especialista em classificação de transações financeiras. Analise cada transação e forneça uma classificação precisa baseada na descrição e padrões comuns de movimentação bancária.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 200
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('OpenAI API error:', error);
      throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;
    
    console.log('OpenAI response:', aiResponse);

    // Parse JSON response
    let classification;
    try {
      classification = JSON.parse(aiResponse);
    } catch (e) {
      console.error('Failed to parse AI response as JSON:', aiResponse);
      // Fallback classification
      classification = {
        categoria: isCredit ? 'Receita' : 'Despesa',
        tipo: isCredit ? 'entrada' : 'saida',
        confianca: 'baixo',
        razao: 'Classificação automática baseada no valor'
      };
    }

    return new Response(JSON.stringify({
      success: true,
      classification
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in classify-transaction function:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});