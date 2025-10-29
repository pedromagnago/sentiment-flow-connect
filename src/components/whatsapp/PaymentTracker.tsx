import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Receipt, CheckCircle2, Clock, AlertCircle, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';

interface PaymentTrackerProps {
  messageId: string;
  contactId: string;
}

export const PaymentTracker = ({ messageId, contactId }: PaymentTrackerProps) => {
  // Buscar ação sugerida associada à mensagem
  const { data: action, isLoading } = useQuery({
    queryKey: ['payment_action', messageId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('suggested_actions')
        .select('*')
        .eq('message_id', messageId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
  });

  // Buscar conta associada (se existir)
  const { data: account } = useQuery({
    queryKey: ['payment_account', action?.payable_id, action?.receivable_id],
    queryFn: async () => {
      if (action?.payable_id) {
        const { data, error } = await supabase
          .from('contas_pagar')
          .select('*')
          .eq('id', action.payable_id)
          .single();
        if (error) throw error;
        return { ...data, type: 'payable' };
      }
      
      if (action?.receivable_id) {
        const { data, error } = await supabase
          .from('contas_receber')
          .select('*')
          .eq('id', action.receivable_id)
          .single();
        if (error) throw error;
        return { ...data, type: 'receivable' };
      }
      
      return null;
    },
    enabled: !!(action?.payable_id || action?.receivable_id),
  });

  if (isLoading || !action) return null;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const getStatusInfo = () => {
    if (!account) {
      return {
        icon: Clock,
        label: 'Aguardando Análise',
        variant: 'secondary' as const,
        color: 'text-yellow-600',
      };
    }

    if (account.reconciled) {
      return {
        icon: CheckCircle2,
        label: 'Reconciliado',
        variant: 'default' as const,
        color: 'text-green-600',
      };
    }

    if (account.status === 'pago' || account.status === 'recebido') {
      return {
        icon: CheckCircle2,
        label: account.type === 'payable' ? 'Pago' : 'Recebido',
        variant: 'default' as const,
        color: 'text-green-600',
      };
    }

    return {
      icon: AlertCircle,
      label: 'Aguardando Pagamento',
      variant: 'secondary' as const,
      color: 'text-orange-600',
    };
  };

  const status = getStatusInfo();
  const StatusIcon = status.icon;

  return (
    <Card className="mt-2">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Receipt className="h-4 w-4" />
          Rastreamento de Pagamento
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Status:</span>
          <Badge variant={status.variant} className="gap-1">
            <StatusIcon className="h-3 w-3" />
            {status.label}
          </Badge>
        </div>

        {(action.extracted_data as any)?.valor && (
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Valor:</span>
            <span className="text-sm font-medium">
              {formatCurrency((action.extracted_data as any).valor)}
            </span>
          </div>
        )}

        {account && (
          <>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Vencimento:</span>
              <span className="text-sm">
                {format(
                  new Date((account as any).type === 'payable' ? (account as any).vencimento : (account as any).data_vencimento),
                  'dd/MM/yyyy'
                )}
              </span>
            </div>

            {account.reconciled && account.reconciled_at && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Reconciliado em:</span>
                <span className="text-sm">
                  {format(new Date(account.reconciled_at), 'dd/MM/yyyy HH:mm')}
                </span>
              </div>
            )}

            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => {
                const path = account.type === 'payable' ? '/payables' : '/receivables';
                window.open(path, '_blank');
              }}
            >
              <ExternalLink className="h-3 w-3 mr-2" />
              Ver Detalhes da Conta
            </Button>
          </>
        )}

        {!account && action.ai_suggestion && (
          <div className="text-xs text-muted-foreground p-2 bg-muted rounded">
            <p className="font-medium mb-1">Sugestão da IA:</p>
            <p>{action.ai_suggestion}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
