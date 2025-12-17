import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  AlertTriangle, 
  Tag, 
  Paperclip, 
  CheckCircle2,
  Clock,
  FileCheck
} from 'lucide-react';
import { PendingStats } from '@/hooks/useAuditPeriods';
import { useCompanies } from '@/hooks/useCompanies';

interface PendingDashboardProps {
  pendingStats: Record<string, PendingStats>;
}

export const PendingDashboard: React.FC<PendingDashboardProps> = ({ pendingStats }) => {
  const { companies } = useCompanies();
  
  // Aggregate stats
  const aggregated = Object.values(pendingStats).reduce(
    (acc, stats) => ({
      uncategorized: acc.uncategorized + stats.uncategorized,
      withoutAttachment: acc.withoutAttachment + stats.withoutAttachment,
      total: acc.total + stats.total,
      pendingCount: acc.pendingCount + stats.pendingCount,
      classifiedCount: acc.classifiedCount + stats.classifiedCount,
      auditedCount: acc.auditedCount + stats.auditedCount
    }),
    { uncategorized: 0, withoutAttachment: 0, total: 0, pendingCount: 0, classifiedCount: 0, auditedCount: 0 }
  );

  const categorizedPercent = aggregated.total > 0 
    ? Math.round(((aggregated.total - aggregated.uncategorized) / aggregated.total) * 100) 
    : 0;
    
  const attachedPercent = aggregated.total > 0 
    ? Math.round(((aggregated.total - aggregated.withoutAttachment) / aggregated.total) * 100) 
    : 0;
    
  const auditedPercent = aggregated.total > 0 
    ? Math.round((aggregated.auditedCount / aggregated.total) * 100) 
    : 0;

  const statCards = [
    {
      title: 'Sem Categoria',
      value: aggregated.uncategorized,
      icon: Tag,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      description: 'Transações sem classificação'
    },
    {
      title: 'Sem Anexo',
      value: aggregated.withoutAttachment,
      icon: Paperclip,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      description: 'Transações sem comprovante'
    },
    {
      title: 'Pendentes',
      value: aggregated.pendingCount,
      icon: Clock,
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200',
      description: 'Aguardando classificação'
    },
    {
      title: 'Classificadas',
      value: aggregated.classifiedCount,
      icon: FileCheck,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      description: 'Prontas para auditoria'
    },
    {
      title: 'Auditadas',
      value: aggregated.auditedCount,
      icon: CheckCircle2,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      description: 'Aprovadas pelo BPO'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.title} className={`${card.borderColor} border-2`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className={`p-2 rounded-lg ${card.bgColor}`}>
                    <Icon className={`w-5 h-5 ${card.color}`} />
                  </div>
                  <span className={`text-2xl font-bold ${card.color}`}>
                    {card.value}
                  </span>
                </div>
                <h3 className="font-medium text-sm">{card.title}</h3>
                <p className="text-xs text-muted-foreground">{card.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Progress Bars */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Progresso de Auditoria</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Categorizadas</span>
              <span className="text-sm text-muted-foreground">
                {categorizedPercent}% ({aggregated.total - aggregated.uncategorized}/{aggregated.total})
              </span>
            </div>
            <Progress value={categorizedPercent} className="h-3" />
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Com Anexo</span>
              <span className="text-sm text-muted-foreground">
                {attachedPercent}% ({aggregated.total - aggregated.withoutAttachment}/{aggregated.total})
              </span>
            </div>
            <Progress value={attachedPercent} className="h-3" />
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Auditadas</span>
              <span className="text-sm text-muted-foreground">
                {auditedPercent}% ({aggregated.auditedCount}/{aggregated.total})
              </span>
            </div>
            <Progress value={auditedPercent} className="h-3 [&>div]:bg-green-500" />
          </div>
        </CardContent>
      </Card>

      {/* Per Company Stats */}
      {Object.keys(pendingStats).length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Por Empresa</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(pendingStats).map(([companyId, stats]) => {
                const company = companies.find(c => c.id === companyId);
                const companyAuditedPercent = stats.total > 0 
                  ? Math.round((stats.auditedCount / stats.total) * 100) 
                  : 0;
                
                return (
                  <div key={companyId} className="p-4 bg-muted/30 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">{company?.nome || 'Empresa'}</h4>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="flex items-center gap-1 text-amber-600">
                          <AlertTriangle className="w-4 h-4" />
                          {stats.uncategorized} sem categoria
                        </span>
                        <span className="flex items-center gap-1 text-orange-600">
                          <Paperclip className="w-4 h-4" />
                          {stats.withoutAttachment} sem anexo
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={companyAuditedPercent} className="h-2 flex-1" />
                      <span className="text-sm font-medium w-12 text-right">{companyAuditedPercent}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
