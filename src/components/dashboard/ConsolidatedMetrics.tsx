import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useConsolidatedData } from '@/hooks/useConsolidatedData';
import { 
  MessageSquare, 
  Users, 
  TrendingUp, 
  CheckCircle2,
  Building2,
  DollarSign,
  TrendingDown
} from 'lucide-react';
import { LoadingSpinner } from '../common/LoadingSpinner';

export function ConsolidatedMetrics() {
  const { consolidatedData, isLoading, selectedCount } = useConsolidatedData();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  if (!consolidatedData) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center text-muted-foreground">
            Nenhum dado disponível para as empresas selecionadas
          </div>
        </CardContent>
      </Card>
    );
  }

  const { 
    totalMessages, 
    totalContacts, 
    totalActions, 
    totalCompletedActions,
    totalRevenue,
    totalExpenses,
    margin,
    byCompany 
  } = consolidatedData;

  const completionRate = totalActions > 0 
    ? Math.round((totalCompletedActions / totalActions) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Visão Consolidada</h2>
          <p className="text-sm text-muted-foreground">
            Métricas agregadas de {selectedCount} {selectedCount === 1 ? 'empresa' : 'empresas'}
          </p>
        </div>
        <Badge variant="outline" className="gap-1">
          <Building2 className="h-3 w-3" />
          {selectedCount} {selectedCount === 1 ? 'Empresa' : 'Empresas'}
        </Badge>
      </div>

      {/* Métricas Totais */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Mensagens
            </CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMessages.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              de todas as empresas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Contatos
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalContacts.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              base consolidada
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Taxa de Conclusão
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completionRate}%</div>
            <p className="text-xs text-muted-foreground">
              {totalCompletedActions} de {totalActions} ações
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Margem Consolidada
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{margin.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              receita vs despesas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Financeiro Consolidado */}
      {(totalRevenue > 0 || totalExpenses > 0) && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Receita Total
              </CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                R$ {totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Despesas Totais
              </CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                R$ {totalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Breakdown por Empresa */}
      <Card>
        <CardHeader>
          <CardTitle>Detalhamento por Empresa</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {byCompany.map((company) => {
            const companyPercentage = totalMessages > 0 
              ? (company.messagesCount / totalMessages) * 100
              : 0;
            
            return (
              <div key={company.companyId} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{company.companyName}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {companyPercentage.toFixed(1)}%
                  </div>
                </div>
                <Progress value={companyPercentage} className="h-2" />
                <div className="grid grid-cols-4 gap-2 text-xs text-muted-foreground">
                  <div>
                    <span className="font-medium">{company.messagesCount}</span> msgs
                  </div>
                  <div>
                    <span className="font-medium">{company.contactsCount}</span> contatos
                  </div>
                  <div>
                    <span className="font-medium">{company.actionsCount}</span> ações
                  </div>
                  <div>
                    <span className="font-medium">{company.completedActionsCount}</span> concluídas
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
