import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Lock, 
  Unlock, 
  CheckCircle2, 
  Calendar,
  Building2,
  AlertCircle
} from 'lucide-react';
import { AuditPeriod } from '@/hooks/useAuditPeriods';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface AuditPeriodsListProps {
  periods: AuditPeriod[];
  onLock: (companyId: string, start: string, end: string) => void;
  onUnlock: (companyId: string, start: string, end: string) => void;
  onApprove: (companyId: string, start: string, end: string) => void;
  isLocking: boolean;
}

export const AuditPeriodsList: React.FC<AuditPeriodsListProps> = ({
  periods,
  onLock,
  onUnlock,
  onApprove,
  isLocking
}) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getStatusBadge = (status: string) => {
    const config = {
      open: { label: 'Aberto', variant: 'secondary' as const, icon: AlertCircle },
      locked: { label: 'Bloqueado', variant: 'default' as const, icon: Lock },
      approved: { label: 'Aprovado', variant: 'outline' as const, icon: CheckCircle2 }
    };

    const { label, variant, icon: Icon } = config[status as keyof typeof config] || config.open;

    return (
      <Badge variant={variant} className={`flex items-center gap-1 ${
        status === 'approved' ? 'bg-green-100 text-green-700 border-green-300' :
        status === 'locked' ? 'bg-amber-100 text-amber-700 border-amber-300' :
        'bg-gray-100 text-gray-700'
      }`}>
        <Icon className="w-3 h-3" />
        {label}
      </Badge>
    );
  };

  const formatDateRange = (start: string, end: string) => {
    const startDate = parseISO(start);
    const endDate = parseISO(end);
    return `${format(startDate, "dd/MM", { locale: ptBR })} - ${format(endDate, "dd/MM/yyyy", { locale: ptBR })}`;
  };

  // Group periods by company
  const periodsByCompany = periods.reduce((acc, period) => {
    const companyName = period.company?.nome || 'Empresa';
    if (!acc[period.company_id]) {
      acc[period.company_id] = { name: companyName, periods: [] };
    }
    acc[period.company_id].periods.push(period);
    return acc;
  }, {} as Record<string, { name: string; periods: AuditPeriod[] }>);

  if (periods.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-foreground">Nenhum período encontrado</h3>
          <p className="text-sm text-muted-foreground mt-2">
            Crie períodos de auditoria para começar a gerenciar o fechamento contábil.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {Object.entries(periodsByCompany).map(([companyId, { name, periods: companyPeriods }]) => (
        <Card key={companyId}>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Building2 className="w-5 h-5 text-primary" />
              {name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {companyPeriods.map((period) => (
                <div 
                  key={period.id}
                  className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 min-w-[180px]">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">
                        {formatDateRange(period.period_start, period.period_end)}
                      </span>
                    </div>
                    
                    {getStatusBadge(period.status)}
                    
                    <div className="text-sm text-muted-foreground hidden md:flex items-center gap-4">
                      <span>{period.transactions_count} transações</span>
                      <span className="text-red-600">
                        D: {formatCurrency(period.total_debits || 0)}
                      </span>
                      <span className="text-green-600">
                        C: {formatCurrency(period.total_credits || 0)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {period.status === 'open' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onLock(period.company_id, period.period_start, period.period_end)}
                        disabled={isLocking}
                        className="gap-1"
                      >
                        <Lock className="w-4 h-4" />
                        Bloquear
                      </Button>
                    )}
                    
                    {period.status === 'locked' && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onUnlock(period.company_id, period.period_start, period.period_end)}
                          disabled={isLocking}
                          className="gap-1"
                        >
                          <Unlock className="w-4 h-4" />
                          Desbloquear
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => onApprove(period.company_id, period.period_start, period.period_end)}
                          disabled={isLocking}
                          className="gap-1 bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          Aprovar
                        </Button>
                      </>
                    )}
                    
                    {period.status === 'approved' && (
                      <span className="text-sm text-green-600 font-medium flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" />
                        Aprovado em {period.approved_at ? format(parseISO(period.approved_at), "dd/MM/yyyy HH:mm", { locale: ptBR }) : '-'}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
