
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface DailySentiment {
  id: number;
  data: string;
  feedback: string;
  id_contact: string;
  created_at: string;
}

export interface WeeklySentiment {
  id: number;
  semana: number;
  ano: number;
  data_inicio: string;
  data_fim: string;
  feedback: string;
  id_contact: string;
}

export const useSentimentAnalysis = () => {
  const [dailyData, setDailyData] = useState<DailySentiment[]>([]);
  const [weeklyData, setWeeklyData] = useState<WeeklySentiment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSentimentData = async () => {
    try {
      setLoading(true);
      
      const [dailyResponse, weeklyResponse] = await Promise.all([
        supabase.from('analise_sentimento_diario').select('*').order('created_at', { ascending: false }).limit(30),
        supabase.from('analise_sentimento_semanal').select('*').order('ano', { ascending: false }).order('semana', { ascending: false }).limit(10)
      ]);

      if (dailyResponse.error) throw dailyResponse.error;
      if (weeklyResponse.error) throw weeklyResponse.error;

      setDailyData(dailyResponse.data || []);
      setWeeklyData(weeklyResponse.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados de sentimento');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSentimentData();
  }, []);

  const calculateSentimentStats = () => {
    if (!dailyData.length) return { positive: 0, negative: 0, neutral: 0 };

    const sentiments = dailyData.reduce((acc, item) => {
      const feedback = item.feedback?.toLowerCase() || '';
      if (feedback.includes('positiv') || feedback.includes('bom') || feedback.includes('satisfeit')) {
        acc.positive++;
      } else if (feedback.includes('negativ') || feedback.includes('ruim') || feedback.includes('insatisfeit')) {
        acc.negative++;
      } else {
        acc.neutral++;
      }
      return acc;
    }, { positive: 0, negative: 0, neutral: 0 });

    const total = sentiments.positive + sentiments.negative + sentiments.neutral;
    return {
      positive: total ? Math.round((sentiments.positive / total) * 100) : 0,
      negative: total ? Math.round((sentiments.negative / total) * 100) : 0,
      neutral: total ? Math.round((sentiments.neutral / total) * 100) : 0,
    };
  };

  return { 
    dailyData, 
    weeklyData, 
    loading, 
    error, 
    sentimentStats: calculateSentimentStats(),
    refetch: fetchSentimentData 
  };
};
