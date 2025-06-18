
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';
import { useSentimentAnalysis } from '@/hooks/useSentimentAnalysis';
import { useMemo } from 'react';

export const SentimentChart = () => {
  const { dailyData, loading } = useSentimentAnalysis();

  const chartData = useMemo(() => {
    if (!dailyData.length) {
      // Dados de exemplo quando não há dados reais
      return [
        { day: 'Seg', positive: 85, negative: 15 },
        { day: 'Ter', positive: 88, negative: 12 },
        { day: 'Qua', positive: 82, negative: 18 },
        { day: 'Qui', positive: 90, negative: 10 },
        { day: 'Sex', positive: 87, negative: 13 },
        { day: 'Sáb', positive: 89, negative: 11 },
        { day: 'Dom', positive: 85, negative: 15 }
      ];
    }

    // Processar dados dos últimos 7 dias
    const last7Days = dailyData.slice(0, 7).reverse();
    const daysOfWeek = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    
    return last7Days.map(item => {
      const date = new Date(item.data);
      const dayName = daysOfWeek[date.getDay()];
      const feedback = item.feedback?.toLowerCase() || '';
      
      const isPositive = feedback.includes('positiv') || 
                        feedback.includes('bom') || 
                        feedback.includes('satisfeit');
      
      return {
        day: dayName,
        positive: isPositive ? 100 : 0,
        negative: isPositive ? 0 : 100
      };
    });
  }, [dailyData]);

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="text-gray-500">Carregando dados de sentimento...</div>
      </div>
    );
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="day" stroke="#6b7280" fontSize={12} />
          <YAxis stroke="#6b7280" fontSize={12} />
          <Tooltip 
            contentStyle={{
              background: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
            formatter={(value, name) => [
              `${value}%`, 
              name === 'positive' ? 'Positivo' : 'Negativo'
            ]}
          />
          <Bar dataKey="positive" fill="#10b981" radius={[4, 4, 0, 0]} />
          <Bar dataKey="negative" fill="#ef4444" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
