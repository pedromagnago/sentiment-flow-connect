import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useCompanyContext } from '@/contexts/CompanyContext';
import { useToast } from '@/hooks/use-toast';

export interface Receivable {
  id: string;
  company_id: string;
  user_id: string;
  cliente: string;
  cpf_cnpj_cliente: string | null;
  descricao: string;
  valor_total: number;
  valor_recebido: number;
  saldo_devedor: number | null;
  data_emissao: string | null;
  data_vencimento: string;
  data_competencia: string;
  recebido_em: string | null;
  status: string;
  tipo_documento: string;
  chave_nfe: string | null;
  numero_recibo: string | null;
  categoria: string | null;
  subcategoria: string | null;
  centro_custo: string | null;
  projeto: string | null;
  forma_recebimento: string | null;
  observacoes: string | null;
  created_at: string;
  updated_at: string;
}

interface UseReceivablesResult {
  receivables: Receivable[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  totalPending: number;
  totalReceived: number;
  totalOverdue: number;
}

export function useReceivables(): UseReceivablesResult {
  const { activeCompanyId } = useCompanyContext();
  const { toast } = useToast();
  const [receivables, setReceivables] = useState<Receivable[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReceivables = async () => {
    if (!activeCompanyId) {
      setReceivables([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('contas_receber')
        .select('*')
        .eq('company_id', activeCompanyId)
        .order('data_vencimento', { ascending: false });

      if (fetchError) throw fetchError;
      setReceivables((data as Receivable[]) || []);
    } catch (err: any) {
      const errorMessage = err?.message || 'Erro ao carregar contas a receber';
      setError(errorMessage);
      toast({
        title: 'Erro ao carregar dados',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReceivables();
  }, [activeCompanyId]);

  // Calculate totals
  const totalPending = receivables
    .filter(r => r.status === 'pendente')
    .reduce((sum, r) => sum + Number(r.valor_total), 0);

  const totalReceived = receivables
    .filter(r => r.status === 'recebido')
    .reduce((sum, r) => sum + Number(r.valor_recebido), 0);

  const totalOverdue = receivables
    .filter(r => {
      if (r.status !== 'pendente') return false;
      const today = new Date();
      const dueDate = new Date(r.data_vencimento);
      return dueDate < today;
    })
    .reduce((sum, r) => sum + Number(r.valor_total), 0);

  return {
    receivables,
    loading,
    error,
    refetch: fetchReceivables,
    totalPending,
    totalReceived,
    totalOverdue,
  };
}
