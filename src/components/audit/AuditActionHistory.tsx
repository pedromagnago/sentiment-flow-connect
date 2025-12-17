import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  History, 
  Lock, 
  Unlock, 
  CheckCircle2,
  User
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface AuditLog {
  id: string;
  action: string;
  table_name: string;
  record_id: string | null;
  old_data: any;
  new_data: any;
  user_id: string | null;
  created_at: string;
}

interface AuditActionHistoryProps {
  history: AuditLog[];
}

export const AuditActionHistory: React.FC<AuditActionHistoryProps> = ({ history }) => {
  const getActionIcon = (action: string, newData: any) => {
    if (newData?.status === 'locked') return Lock;
    if (newData?.status === 'approved') return CheckCircle2;
    if (newData?.status === 'open') return Unlock;
    return History;
  };

  const getActionLabel = (action: string, newData: any) => {
    if (newData?.status === 'locked') return 'Bloqueou período';
    if (newData?.status === 'approved') return 'Aprovou período';
    if (newData?.status === 'open') return 'Desbloqueou período';
    return action;
  };

  const getActionColor = (newData: any) => {
    if (newData?.status === 'locked') return 'bg-amber-100 text-amber-700 border-amber-300';
    if (newData?.status === 'approved') return 'bg-green-100 text-green-700 border-green-300';
    if (newData?.status === 'open') return 'bg-gray-100 text-gray-700 border-gray-300';
    return 'bg-blue-100 text-blue-700 border-blue-300';
  };

  if (history.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <History className="w-5 h-5" />
            Histórico de Ações
          </CardTitle>
        </CardHeader>
        <CardContent className="py-12 text-center">
          <History className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            Nenhuma ação de auditoria registrada ainda.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <History className="w-5 h-5" />
          Histórico de Ações
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-[500px] overflow-y-auto">
          {history.map((log) => {
            const Icon = getActionIcon(log.action, log.new_data);
            const newData = log.new_data || {};
            
            return (
              <div 
                key={log.id}
                className="flex items-start gap-4 p-4 bg-muted/30 rounded-lg border"
              >
                <div className={`p-2 rounded-lg ${getActionColor(newData)}`}>
                  <Icon className="w-4 h-4" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">
                      {getActionLabel(log.action, newData)}
                    </span>
                    {newData.period_start && newData.period_end && (
                      <Badge variant="outline" className="text-xs">
                        {newData.period_start} - {newData.period_end}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {log.user_id ? `Usuário: ${log.user_id.slice(0, 8)}...` : 'Sistema'}
                    </span>
                    <span>
                      {format(parseISO(log.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                    </span>
                  </div>
                  
                  {newData.notes && (
                    <p className="text-sm text-muted-foreground mt-2 italic">
                      "{newData.notes}"
                    </p>
                  )}
                  
                  {newData.transactions_count !== undefined && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {newData.transactions_count} transações | 
                      D: R$ {Number(newData.total_debits || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} | 
                      C: R$ {Number(newData.total_credits || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
