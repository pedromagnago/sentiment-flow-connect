import React, { useState } from 'react';
import { useDREData } from '@/hooks/useDREData';
import { DREWaterfallChart } from '@/components/reports/DREWaterfallChart';
import { DREHierarchyTable } from '@/components/reports/DREHierarchyTable';
import { DREMetricCards } from '@/components/reports/DREMetricCards';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Calendar, 
  Download, 
  RefreshCw, 
  FileSpreadsheet,
  BarChart3,
  Table as TableIcon,
  PieChart
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, startOfYear, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const DREDashboard: React.FC = () => {
  const [periodType, setPeriodType] = useState<string>('month');
  const [customPeriod, setCustomPeriod] = useState({
    start: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    end: format(endOfMonth(new Date()), 'yyyy-MM-dd')
  });

  const getPeriod = () => {
    const now = new Date();
    switch (periodType) {
      case 'month':
        return {
          start: format(startOfMonth(now), 'yyyy-MM-dd'),
          end: format(endOfMonth(now), 'yyyy-MM-dd')
        };
      case 'quarter':
        return {
          start: format(subMonths(startOfMonth(now), 2), 'yyyy-MM-dd'),
          end: format(endOfMonth(now), 'yyyy-MM-dd')
        };
      case 'year':
        return {
          start: format(startOfYear(now), 'yyyy-MM-dd'),
          end: format(now, 'yyyy-MM-dd')
        };
      case 'custom':
        return customPeriod;
      default:
        return customPeriod;
    }
  };

  const period = getPeriod();
  const { summary, waterfallData, dreLines, loading, error, refetch } = useDREData(period);

  const exportToCSV = () => {
    const lines = [
      ['Código', 'Descrição', 'Valor', '% AV'],
      ...dreLines.map(line => [
        line.codigo,
        line.nome,
        line.valor.toFixed(2),
        line.percentual.toFixed(1) + '%'
      ])
    ];

    const csv = lines.map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dre-${period.start}-${period.end}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-[400px]" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">DRE Gerencial</h1>
          <p className="text-muted-foreground">
            Demonstração do Resultado do Exercício
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Select value={periodType} onValueChange={setPeriodType}>
            <SelectTrigger className="w-40">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">Este Mês</SelectItem>
              <SelectItem value="quarter">Trimestre</SelectItem>
              <SelectItem value="year">Este Ano</SelectItem>
              <SelectItem value="custom">Personalizado</SelectItem>
            </SelectContent>
          </Select>

          {periodType === 'custom' && (
            <>
              <Input
                type="date"
                value={customPeriod.start}
                onChange={(e) => setCustomPeriod(p => ({ ...p, start: e.target.value }))}
                className="w-36"
              />
              <span className="text-muted-foreground">até</span>
              <Input
                type="date"
                value={customPeriod.end}
                onChange={(e) => setCustomPeriod(p => ({ ...p, end: e.target.value }))}
                className="w-36"
              />
            </>
          )}

          <Button variant="outline" size="sm" onClick={refetch}>
            <RefreshCw className="h-4 w-4 mr-1" />
            Atualizar
          </Button>

          <Button variant="outline" size="sm" onClick={exportToCSV}>
            <Download className="h-4 w-4 mr-1" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Period Info */}
      <Card className="bg-muted/30">
        <CardContent className="py-3">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Período:</span>
            <span className="font-medium">
              {format(new Date(period.start), "dd 'de' MMMM", { locale: ptBR })} 
              {' '}até{' '}
              {format(new Date(period.end), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Metric Cards */}
      <DREMetricCards summary={summary} />

      {/* Main Content */}
      <Tabs defaultValue="waterfall" className="space-y-4">
        <TabsList>
          <TabsTrigger value="waterfall" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Waterfall
          </TabsTrigger>
          <TabsTrigger value="table" className="flex items-center gap-2">
            <TableIcon className="h-4 w-4" />
            Tabela DRE
          </TabsTrigger>
          <TabsTrigger value="analysis" className="flex items-center gap-2">
            <PieChart className="h-4 w-4" />
            Análise
          </TabsTrigger>
        </TabsList>

        <TabsContent value="waterfall">
          <DREWaterfallChart data={waterfallData} />
        </TabsContent>

        <TabsContent value="table">
          <DREHierarchyTable data={dreLines} />
        </TabsContent>

        <TabsContent value="analysis">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Margin Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Análise de Margens</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Margem Bruta</span>
                    <span className="font-semibold text-purple-600">
                      {summary.receitaBruta > 0 
                        ? ((summary.margemBruta / summary.receitaBruta) * 100).toFixed(1)
                        : 0}%
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-purple-600 h-2 rounded-full" 
                      style={{ 
                        width: `${Math.min(100, Math.max(0, (summary.margemBruta / (summary.receitaBruta || 1)) * 100))}%` 
                      }}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Margem EBITDA</span>
                    <span className={`font-semibold ${summary.ebitda >= 0 ? 'text-orange-600' : 'text-red-600'}`}>
                      {summary.receitaBruta > 0 
                        ? ((summary.ebitda / summary.receitaBruta) * 100).toFixed(1)
                        : 0}%
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${summary.ebitda >= 0 ? 'bg-orange-600' : 'bg-red-600'}`}
                      style={{ 
                        width: `${Math.min(100, Math.max(0, Math.abs(summary.ebitda / (summary.receitaBruta || 1)) * 100))}%` 
                      }}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Margem Líquida</span>
                    <span className={`font-semibold ${summary.lucroLiquido >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                      {summary.receitaBruta > 0 
                        ? ((summary.lucroLiquido / summary.receitaBruta) * 100).toFixed(1)
                        : 0}%
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${summary.lucroLiquido >= 0 ? 'bg-emerald-600' : 'bg-red-600'}`}
                      style={{ 
                        width: `${Math.min(100, Math.max(0, Math.abs(summary.lucroLiquido / (summary.receitaBruta || 1)) * 100))}%` 
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Expense Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Composição das Despesas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { name: 'CMV', value: summary.custoMercadoria, color: 'bg-red-500' },
                  { name: 'Administrativas', value: summary.despesasAdministrativas, color: 'bg-orange-500' },
                  { name: 'Comerciais', value: summary.despesasComerciais, color: 'bg-yellow-500' },
                  { name: 'Financeiras', value: summary.despesasFinanceiras, color: 'bg-purple-500' },
                ].map((item) => {
                  const total = summary.custoMercadoria + summary.despesasOperacionais + summary.despesasFinanceiras;
                  const percent = total > 0 ? (item.value / total) * 100 : 0;
                  
                  return (
                    <div key={item.name} className="space-y-1">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">{item.name}</span>
                        <span className="font-medium">
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.value)}
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className={`${item.color} h-2 rounded-full`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DREDashboard;
