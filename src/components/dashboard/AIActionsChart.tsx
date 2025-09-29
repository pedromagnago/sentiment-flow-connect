import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAIMetrics } from '@/hooks/useAIMetrics';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Skeleton } from '@/components/ui/skeleton';

export const AIActionsChart = () => {
  const { data: metrics, isLoading } = useAIMetrics();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-[200px]" />
          <Skeleton className="h-4 w-[300px] mt-2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!metrics) return null;

  const chartData = metrics.last7Days.map(day => ({
    date: format(new Date(day.date), 'dd/MMM', { locale: ptBR }),
    'Pagamentos': day.payment,
    'Faturas': day.invoice,
    'Tarefas': day.task,
    'Perguntas': day.question,
    'Documentos': day.document_analysis,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ações Sugeridas por Tipo</CardTitle>
        <CardDescription>
          Distribuição das ações sugeridas pela IA nos últimos 7 dias
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="date" 
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis 
              className="text-xs"
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
            <Bar dataKey="Pagamentos" fill="#ef4444" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Faturas" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Tarefas" fill="#10b981" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Perguntas" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Documentos" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
