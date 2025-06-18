
import { TrendingUp, TrendingDown, Calendar, BarChart3 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, PieChart, Pie, Cell } from 'recharts';

const weeklyData = [
  { week: 'Sem 1', positive: 82, negative: 18, neutral: 15 },
  { week: 'Sem 2', positive: 85, negative: 15, neutral: 12 },
  { week: 'Sem 3', positive: 78, negative: 22, neutral: 18 },
  { week: 'Sem 4', positive: 87, negative: 13, neutral: 10 }
];

const sentimentDistribution = [
  { name: 'Positivo', value: 65, color: '#10b981' },
  { name: 'Neutro', value: 20, color: '#6b7280' },
  { name: 'Negativo', value: 15, color: '#ef4444' }
];

export const SentimentAnalysis = () => {
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
              <p className="text-3xl font-bold mt-2">65%</p>
              <div className="flex items-center mt-2">
                <TrendingUp className="w-4 h-4 mr-1" />
                <span className="text-sm">+3.2% esta semana</span>
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
              <p className="text-3xl font-bold mt-2">20%</p>
              <div className="flex items-center mt-2">
                <span className="text-sm">-1.1% esta semana</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-red-500 to-pink-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm font-medium">Sentimentos Negativos</p>
              <p className="text-3xl font-bold mt-2">15%</p>
              <div className="flex items-center mt-2">
                <TrendingDown className="w-4 h-4 mr-1" />
                <span className="text-sm">-2.1% esta semana</span>
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
              <LineChart data={weeklyData}>
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
    </div>
  );
};
