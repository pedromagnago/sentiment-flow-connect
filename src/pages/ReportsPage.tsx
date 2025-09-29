import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAIMetrics } from '@/hooks/useAIMetrics';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Sparkles, TrendingUp, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const COLORS = {
  payment: '#ef4444',
  invoice: '#3b82f6',
  task: '#10b981',
  question: '#f59e0b',
  document_analysis: '#8b5cf6',
};

const ACTION_LABELS = {
  payment: 'Pagamentos',
  invoice: 'Faturas',
  task: 'Tarefas',
  question: 'Perguntas',
  document_analysis: 'Documentos',
};

export default function ReportsPage() {
  const { data: metrics, isLoading } = useAIMetrics();

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div>
          <Skeleton className="h-10 w-[300px]" />
          <Skeleton className="h-5 w-[400px] mt-2" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-[100px]" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-[60px]" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!metrics) return null;

  const pieData = Object.entries(metrics.actionsByType)
    .filter(([_, value]) => value > 0)
    .map(([key, value]) => ({
      name: ACTION_LABELS[key as keyof typeof ACTION_LABELS],
      value,
      color: COLORS[key as keyof typeof COLORS],
    }));

  const barData = metrics.last7Days.map(day => ({
    date: format(new Date(day.date), 'dd/MMM', { locale: ptBR }),
    Pagamentos: day.payment,
    Faturas: day.invoice,
    Tarefas: day.task,
    Perguntas: day.question,
    Documentos: day.document_analysis,
    total: day.payment + day.invoice + day.task + day.question + day.document_analysis,
  }));

  const totalActions = Object.values(metrics.actionsByType).reduce((a, b) => a + b, 0);

  return (
    <div className="container mx-auto p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Sparkles className="h-8 w-8 text-primary" />
            Relatórios de IA
          </h1>
          <p className="text-muted-foreground mt-1">
            Análise detalhada das ações sugeridas pela inteligência artificial
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          Últimos 7 dias
        </Badge>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Ações</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalActions}</div>
            <p className="text-xs text-muted-foreground">
              Sugestões geradas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Aprovação</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.approvalRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Ações processadas com sucesso
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tempo Economizado</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.floor(metrics.timeSaved / 60)}h {metrics.timeSaved % 60}m
            </div>
            <p className="text-xs text-muted-foreground">
              Estimativa baseada em 15min/ação
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hoje</CardTitle>
            <Sparkles className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.todayActions}</div>
            <p className="text-xs text-muted-foreground">
              Novas sugestões
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="timeline" className="space-y-4">
        <TabsList>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="distribution">Distribuição</TabsTrigger>
          <TabsTrigger value="details">Detalhes</TabsTrigger>
        </TabsList>

        <TabsContent value="timeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Ações por Dia</CardTitle>
              <CardDescription>
                Distribuição temporal das ações sugeridas nos últimos 7 dias
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <YAxis 
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                  <Bar dataKey="Pagamentos" stackId="a" fill={COLORS.payment} />
                  <Bar dataKey="Faturas" stackId="a" fill={COLORS.invoice} />
                  <Bar dataKey="Tarefas" stackId="a" fill={COLORS.task} />
                  <Bar dataKey="Perguntas" stackId="a" fill={COLORS.question} />
                  <Bar dataKey="Documentos" stackId="a" fill={COLORS.document_analysis} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="distribution" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Distribuição por Tipo</CardTitle>
                <CardDescription>
                  Proporção de ações sugeridas por categoria
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Ações por Categoria</CardTitle>
                <CardDescription>
                  Quantidade total de ações por tipo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(metrics.actionsByType).map(([key, value]) => {
                    const percentage = totalActions > 0 ? (value / totalActions) * 100 : 0;
                    return (
                      <div key={key} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">
                            {ACTION_LABELS[key as keyof typeof ACTION_LABELS]}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {value} ({percentage.toFixed(1)}%)
                          </span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className="h-2 rounded-full transition-all"
                            style={{
                              width: `${percentage}%`,
                              backgroundColor: COLORS[key as keyof typeof COLORS],
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Resumo Detalhado</CardTitle>
              <CardDescription>
                Informações completas sobre as métricas de IA
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Eficiência da IA</h3>
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="flex items-center gap-3 p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                      <CheckCircle2 className="h-8 w-8 text-green-600" />
                      <div>
                        <p className="text-sm text-muted-foreground">Taxa de Aprovação</p>
                        <p className="text-2xl font-bold">{metrics.approvalRate.toFixed(1)}%</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-red-500/10 rounded-lg border border-red-500/20">
                      <XCircle className="h-8 w-8 text-red-600" />
                      <div>
                        <p className="text-sm text-muted-foreground">Taxa de Rejeição</p>
                        <p className="text-2xl font-bold">{(100 - metrics.approvalRate).toFixed(1)}%</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Produtividade</h3>
                  <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Tempo Total Economizado</p>
                        <p className="text-3xl font-bold">
                          {Math.floor(metrics.timeSaved / 60)}h {metrics.timeSaved % 60}min
                        </p>
                      </div>
                      <Clock className="h-12 w-12 text-blue-600" />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Baseado em uma estimativa de 15 minutos economizados por ação processada
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Tendências</h3>
                  <div className="space-y-2">
                    {barData.map((day, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <span className="text-sm font-medium">{day.date}</span>
                        <Badge variant="outline">{day.total} ações</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
