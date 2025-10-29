import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useReconciliation } from '@/hooks/useReconciliation';
import { useCompanyContext } from '@/contexts/CompanyContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';

interface MatchSuggestionsProps {
  transaction: any;
  onMatchComplete?: () => void;
}

export const MatchSuggestions = ({ transaction, onMatchComplete }: MatchSuggestionsProps) => {
  const { activeCompanyId } = useCompanyContext();
  const { confirmMatch, rejectMatch, createManualMatch } = useReconciliation();

  // Buscar matches existentes para esta transação
  const { data: existingMatches, isLoading } = useQuery({
    queryKey: ['transaction_matches', transaction.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reconciliation_matches')
        .select('*')
        .eq('transaction_id', transaction.id)
        .order('match_score', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return 'default';
    if (score >= 60) return 'secondary';
    return 'destructive';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!existingMatches || existingMatches.length === 0) {
    return (
      <div className="text-center py-8">
        <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-3" />
        <p className="text-sm font-medium mb-2">Nenhum match encontrado</p>
        <p className="text-xs text-muted-foreground mb-4">
          Não foram encontradas contas correspondentes automaticamente
        </p>
        <Button size="sm" variant="outline">
          Criar Match Manual
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {existingMatches.map((match) => (
        <Card 
          key={match.id} 
          className={`p-4 ${
            match.status === 'confirmed' 
              ? 'border-green-500 bg-green-50/50' 
              : match.status === 'rejected'
              ? 'border-red-500 bg-red-50/50'
              : 'border-border'
          }`}
        >
          <div className="space-y-3">
            {/* Header com score */}
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant={getScoreBadge(match.match_score)}>
                    {match.match_score.toFixed(0)}% Match
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {match.match_type === 'exact' && 'Exato'}
                    {match.match_type === 'fuzzy' && 'Fuzzy'}
                    {match.match_type === 'rule' && 'Por Regra'}
                    {match.match_type === 'ai' && 'IA'}
                    {match.match_type === 'manual' && 'Manual'}
                  </Badge>
                  {match.status === 'confirmed' && (
                    <Badge variant="default" className="bg-green-600">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Confirmado
                    </Badge>
                  )}
                  {match.status === 'rejected' && (
                    <Badge variant="destructive">
                      <XCircle className="h-3 w-3 mr-1" />
                      Rejeitado
                    </Badge>
                  )}
                </div>
                <p className="text-sm font-medium">
                  {(match.match_details as any)?.account?.descricao || 'Sem descrição'}
                </p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                  <span>
                    Valor: {formatCurrency((match.match_details as any)?.account?.valor || 0)}
                  </span>
                  <span>
                    Vencimento: {(match.match_details as any)?.account?.vencimento 
                      ? format(new Date((match.match_details as any).account.vencimento), 'dd/MM/yyyy')
                      : 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            {/* Razões do match */}
            {(match.match_details as any)?.reasons && Array.isArray((match.match_details as any).reasons) && (
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">Motivos:</p>
                <ul className="space-y-0.5">
                  {((match.match_details as any).reasons as string[]).map((reason: string, idx: number) => (
                    <li key={idx} className="text-xs flex items-center gap-1">
                      <span className="text-green-600">✓</span>
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Ações */}
            {match.status === 'suggested' && (
              <div className="flex gap-2 pt-2 border-t">
                <Button
                  size="sm"
                  onClick={() => {
                    confirmMatch(match.id);
                    onMatchComplete?.();
                  }}
                  className="flex-1"
                >
                  <CheckCircle2 className="h-4 w-4 mr-1" />
                  Confirmar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    rejectMatch(match.id);
                  }}
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  Rejeitar
                </Button>
              </div>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
};
