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

    const prompt = `Analise esta transação bancária e classifique-a em uma categoria precisa.

Transação: "${transactionText}"
Valor: ${amountValue} (${isCredit ? 'Entrada' : 'Saída'})

IMPORTANTE: Responda APENAS com JSON válido, sem formatação markdown ou blocos de código.

Categorias específicas disponíveis:
- Receitas: Vendas, Serviços, Consultorias, Royalties, Juros Recebidos
- Despesas Operacionais: Fornecedores, Serviços Terceirizados, Marketing, Publicidade
- Despesas Administrativas: Contabilidade, Jurídico, Seguros, Taxas Bancárias
- Tecnologia: Software, Hardware, Hospedagem, Domínios, SaaS
- Recursos Humanos: Salários, Benefícios, Treinamentos, Consultorias RH
- Infraestrutura: Aluguel, Energia, Internet, Telefone, Manutenção
- Transportes: Combustível, Manutenção Veículos, Uber, Passagens
- Alimentação: Refeições, Coffee Break, Alimentação Equipe
- Saúde: Planos de Saúde, Consultas, Medicamentos, Exames
- Impostos: IRPJ, CSLL, ISS, PIS, COFINS, Simples Nacional
- Financeiro: Juros Pagos, Taxas, Empréstimos, Financiamentos

Retorne JSON puro:
{
  "categoria": "categoria_especifica",
  "tipo": "entrada" ou "saida",  
  "confianca": "baixo" ou "medio" ou "alto",
  "razao": "explicacao baseada na descricao da empresa/transacao"
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

    // Smart JSON parsing with markdown fallback
    let classification;
    try {
      classification = JSON.parse(aiResponse);
    } catch (e) {
      console.log('First JSON parse failed, trying markdown extraction');
      
      // Try to extract JSON from markdown code blocks
      const jsonMatch = aiResponse.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
      if (jsonMatch) {
        try {
          classification = JSON.parse(jsonMatch[1]);
          console.log('Successfully extracted JSON from markdown');
        } catch (e2) {
          console.error('Failed to parse extracted JSON:', jsonMatch[1]);
          classification = null;
        }
      }
      
      // Final fallback if all parsing fails
      if (!classification) {
        console.error('All JSON parsing attempts failed for:', aiResponse);
        classification = {
          categoria: isCredit ? 'Receitas' : 'Despesas Operacionais',
          tipo: isCredit ? 'entrada' : 'saida',
          confianca: 'baixo',
          razao: 'Classificação automática - erro no parsing da resposta da IA'
        };
      }
    }

    // Validate required fields
    if (!classification.categoria || !classification.tipo || !classification.confianca) {
      console.error('Invalid classification structure:', classification);
      classification = {
        categoria: isCredit ? 'Receitas' : 'Despesas Operacionais',
        tipo: isCredit ? 'entrada' : 'saida',
        confianca: 'baixo',
        razao: 'Classificação automática - estrutura inválida da IA'
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