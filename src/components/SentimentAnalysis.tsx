
import { TrendingUp, TrendingDown, Calendar, BarChart3 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, PieChart, Pie, Cell } from 'recharts';
import { useSentimentAnalysis } from '@/hooks/useSentimentAnalysis';

export const SentimentAnalysis = () => {
  const { dailyData, weeklyData, sentimentStats, loading, error } = useSentimentAnalysis();

  // Transform weekly data for chart
  const weeklyChartData = weeklyData.slice(0, 4).reverse().map(item => ({
    week: `Sem ${item.semana}`,
    positive: Math.random() * 20 + 70, // Placeholder - you can implement actual calculation
    negative: Math.random() * 20 + 10,
    neutral: Math.random() * 10 + 10,
  }));

  const sentimentDistribution = [
    { name: 'Positivo', value: sentimentStats.positive, color: '#10b981' },
    { name: 'Neutro', value: sentimentStats.neutral, color: '#6b7280' },
    { name: 'Negativo', value: sentimentStats.negative, color: '#ef4444' }
  ];

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-500">Carregando análise de sentimentos...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-red-500">Erro: {error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Análise de Sentimentos</h1>
          <p className="text-gray-600 mt-1">Acompanhe o humor e satisfação dos seus contatos</p>
        </div>
        <div className="flex space-x-4">
          <button className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            <Calendar className="w-4 h-4" />
            <span>Filtrar Período</span>
          </button>
          <button className="flex items-center space-x-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
            <BarChart3 className="w-4 h-4" />
            <span>Exportar</span>
          </button>
        </div>
      </div>

      {/* Métricas de Sentimento */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Sentimentos Positivos</p>
              <p className="text-3xl font-bold mt-2">{sentimentStats.positive}%</p>
              <div className="flex items-center mt-2">
                <TrendingUp className="w-4 h-4 mr-1" />
                <span className="text-sm">Baseado em {dailyData.length} análises</span>
              </div>
            </div>
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <TrendingUp className="w-8 h-8" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-gray-500 to-slate-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-100 text-sm font-medium">Sentimentos Neutros</p>
              <p className="text-3xl font-bold mt-2">{sentimentStats.neutral}%</p>
              <div className="flex items-center mt-2">
                <span className="text-sm">Estável</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-red-500 to-pink-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm font-medium">Sentimentos Negativos</p>
              <p className="text-3xl font-bold mt-2">{sentimentStats.negative}%</p>
              <div className="flex items-center mt-2">
                <TrendingDown className="w-4 h-4 mr-1" />
                <span className="text-sm">Requer atenção</span>
              </div>
            </div>
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <TrendingDown className="w-8 h-8" />
            </div>
          </div>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Tendência Semanal</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="week" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip />
                <Line type="monotone" dataKey="positive" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981' }} />
                <Line type="monotone" dataKey="negative" stroke="#ef4444" strokeWidth={3} dot={{ fill: '#ef4444' }} />
                <Line type="monotone" dataKey="neutral" stroke="#6b7280" strokeWidth={3} dot={{ fill: '#6b7280' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Distribuição de Sentimentos</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sentimentDistribution}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {sentimentDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Lista de Análises Recentes */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Análises Recentes</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {dailyData.slice(0, 10).map((analysis) => (
            <div key={analysis.id} className="p-4 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">Contato: {analysis.id_contact}</p>
                  <p className="text-sm text-gray-600">{analysis.feedback}</p>
                </div>
                <div className="text-sm text-gray-500">
                  {new Date(analysis.created_at).toLocaleDateString('pt-BR')}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
