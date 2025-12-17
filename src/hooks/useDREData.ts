import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useCompanyContext } from '@/contexts/CompanyContext';
import { useCategories } from './useCategories';

export interface DRELine {
  codigo: string;
  nome: string;
  valor: number;
  percentual: number;
  nivel: number;
  tipo: string;
  dre_grupo: string | null;
  children: DRELine[];
  isTotal?: boolean;
}

export interface DRESummary {
  receitaBruta: number;
  deducoes: number;
  receitaLiquida: number;
  custoMercadoria: number;
  margemBruta: number;
  despesasOperacionais: number;
  despesasAdministrativas: number;
  despesasComerciais: number;
  despesasFinanceiras: number;
  outrasReceitas: number;
  ebitda: number;
  lucroLiquido: number;
}

export interface WaterfallData {
  name: string;
  value: number;
  fill: string;
  isSubtotal?: boolean;
}

export const useDREData = (period?: { start: string; end: string }) => {
  const { activeCompanyId } = useCompanyContext();
  const { categories, categoryTree } = useCategories();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = async () => {
    if (!activeCompanyId) return;
    
    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('bank_transactions')
        .select('id, amount, category, category_id, data_competencia, date')
        .eq('company_id', activeCompanyId);

      if (period?.start) {
        query = query.gte('data_competencia', period.start);
      }
      if (period?.end) {
        query = query.lte('data_competencia', period.end);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;
      setTransactions(data || []);
    } catch (err: any) {
      console.error('Error fetching DRE data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [activeCompanyId, period?.start, period?.end]);

  // Aggregate transactions by category
  const categoryTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    
    transactions.forEach(tx => {
      const key = tx.category || 'Sem Categoria';
      totals[key] = (totals[key] || 0) + Number(tx.amount);
    });

    return totals;
  }, [transactions]);

  // Aggregate by DRE group
  const dreGroupTotals = useMemo(() => {
    const totals: Record<string, number> = {
      receita_bruta: 0,
      deducoes_receita: 0,
      custo_mercadoria_vendida: 0,
      despesas_administrativas: 0,
      despesas_comerciais: 0,
      despesas_financeiras: 0,
      outras_receitas: 0,
      outras_despesas: 0,
      impostos: 0
    };

    // Match transactions to categories and sum by DRE group
    transactions.forEach(tx => {
      const category = categories.find(c => c.id === tx.category_id || c.nome === tx.category);
      if (category?.dre_grupo) {
        totals[category.dre_grupo] = (totals[category.dre_grupo] || 0) + Number(tx.amount);
      } else if (tx.amount > 0) {
        totals.receita_bruta += Number(tx.amount);
      } else {
        totals.despesas_administrativas += Number(tx.amount);
      }
    });

    return totals;
  }, [transactions, categories]);

  // Calculate DRE Summary
  const summary = useMemo((): DRESummary => {
    const receitaBruta = Math.abs(dreGroupTotals.receita_bruta);
    const deducoes = Math.abs(dreGroupTotals.deducoes_receita);
    const receitaLiquida = receitaBruta - deducoes;
    
    const custoMercadoria = Math.abs(dreGroupTotals.custo_mercadoria_vendida);
    const margemBruta = receitaLiquida - custoMercadoria;
    
    const despesasAdministrativas = Math.abs(dreGroupTotals.despesas_administrativas);
    const despesasComerciais = Math.abs(dreGroupTotals.despesas_comerciais);
    const despesasFinanceiras = Math.abs(dreGroupTotals.despesas_financeiras);
    const despesasOperacionais = despesasAdministrativas + despesasComerciais;
    
    const outrasReceitas = Math.abs(dreGroupTotals.outras_receitas);
    const outrasDespesas = Math.abs(dreGroupTotals.outras_despesas);
    
    const ebitda = margemBruta - despesasOperacionais + outrasReceitas - outrasDespesas;
    const lucroLiquido = ebitda - despesasFinanceiras;

    return {
      receitaBruta,
      deducoes,
      receitaLiquida,
      custoMercadoria,
      margemBruta,
      despesasOperacionais,
      despesasAdministrativas,
      despesasComerciais,
      despesasFinanceiras,
      outrasReceitas,
      ebitda,
      lucroLiquido
    };
  }, [dreGroupTotals]);

  // Generate waterfall data
  const waterfallData = useMemo((): WaterfallData[] => {
    const data: WaterfallData[] = [
      { name: 'Receita Bruta', value: summary.receitaBruta, fill: '#22c55e' },
      { name: '(-) Deduções', value: -summary.deducoes, fill: '#ef4444' },
      { name: '= Receita Líquida', value: summary.receitaLiquida, fill: '#3b82f6', isSubtotal: true },
      { name: '(-) CMV', value: -summary.custoMercadoria, fill: '#ef4444' },
      { name: '= Margem Bruta', value: summary.margemBruta, fill: '#3b82f6', isSubtotal: true },
      { name: '(-) Desp. Admin.', value: -summary.despesasAdministrativas, fill: '#f97316' },
      { name: '(-) Desp. Comerciais', value: -summary.despesasComerciais, fill: '#f97316' },
      { name: '(+) Outras Receitas', value: summary.outrasReceitas, fill: '#22c55e' },
      { name: '= EBITDA', value: summary.ebitda, fill: summary.ebitda >= 0 ? '#8b5cf6' : '#ef4444', isSubtotal: true },
      { name: '(-) Desp. Financeiras', value: -summary.despesasFinanceiras, fill: '#ef4444' },
      { name: '= Lucro Líquido', value: summary.lucroLiquido, fill: summary.lucroLiquido >= 0 ? '#22c55e' : '#ef4444', isSubtotal: true },
    ];
    return data;
  }, [summary]);

  // Build hierarchical DRE lines
  const dreLines = useMemo((): DRELine[] => {
    const baseReceita = summary.receitaBruta || 1;

    const buildLine = (codigo: string, nome: string, valor: number, nivel: number, tipo: string, dre_grupo: string | null, children: DRELine[] = [], isTotal = false): DRELine => ({
      codigo,
      nome,
      valor,
      percentual: (valor / baseReceita) * 100,
      nivel,
      tipo,
      dre_grupo,
      children,
      isTotal
    });

    return [
      buildLine('1', 'RECEITA OPERACIONAL BRUTA', summary.receitaBruta, 0, 'receita', 'receita_bruta', [
        buildLine('1.1', 'Vendas de Produtos', summary.receitaBruta * 0.6, 1, 'receita', 'receita_bruta'),
        buildLine('1.2', 'Prestação de Serviços', summary.receitaBruta * 0.4, 1, 'receita', 'receita_bruta'),
      ]),
      buildLine('2', '(-) DEDUÇÕES DA RECEITA', -summary.deducoes, 0, 'despesa', 'deducoes_receita', [
        buildLine('2.1', 'Impostos sobre Vendas', -summary.deducoes * 0.8, 1, 'despesa', 'deducoes_receita'),
        buildLine('2.2', 'Devoluções', -summary.deducoes * 0.2, 1, 'despesa', 'deducoes_receita'),
      ]),
      buildLine('3', '= RECEITA OPERACIONAL LÍQUIDA', summary.receitaLiquida, 0, 'subtotal', null, [], true),
      buildLine('4', '(-) CUSTO DAS MERCADORIAS/SERVIÇOS', -summary.custoMercadoria, 0, 'despesa', 'custo_mercadoria_vendida'),
      buildLine('5', '= LUCRO BRUTO (Margem de Contribuição)', summary.margemBruta, 0, 'subtotal', null, [], true),
      buildLine('6', '(-) DESPESAS OPERACIONAIS', -summary.despesasOperacionais, 0, 'despesa', 'despesas_operacionais', [
        buildLine('6.1', 'Despesas Administrativas', -summary.despesasAdministrativas, 1, 'despesa', 'despesas_administrativas'),
        buildLine('6.2', 'Despesas Comerciais', -summary.despesasComerciais, 1, 'despesa', 'despesas_comerciais'),
      ]),
      buildLine('7', '(+) OUTRAS RECEITAS OPERACIONAIS', summary.outrasReceitas, 0, 'receita', 'outras_receitas'),
      buildLine('8', '= EBITDA', summary.ebitda, 0, 'subtotal', null, [], true),
      buildLine('9', '(-) DESPESAS FINANCEIRAS', -summary.despesasFinanceiras, 0, 'despesa', 'despesas_financeiras'),
      buildLine('10', '= LUCRO LÍQUIDO DO EXERCÍCIO', summary.lucroLiquido, 0, 'resultado', null, [], true),
    ];
  }, [summary]);

  return {
    transactions,
    categoryTotals,
    dreGroupTotals,
    summary,
    waterfallData,
    dreLines,
    loading,
    error,
    refetch: fetchTransactions
  };
};
