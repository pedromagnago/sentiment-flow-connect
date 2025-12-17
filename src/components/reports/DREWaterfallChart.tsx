import React, { useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  ReferenceLine,
  LabelList
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { WaterfallData } from '@/hooks/useDREData';

interface DREWaterfallChartProps {
  data: WaterfallData[];
  className?: string;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const formatCompact = (value: number) => {
  const abs = Math.abs(value);
  if (abs >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (abs >= 1000) {
    return `${(value / 1000).toFixed(0)}K`;
  }
  return value.toFixed(0);
};

export const DREWaterfallChart: React.FC<DREWaterfallChartProps> = ({ data, className }) => {
  // Transform data for waterfall effect
  const chartData = useMemo(() => {
    let runningTotal = 0;
    
    return data.map((item, index) => {
      const start = item.isSubtotal ? 0 : runningTotal;
      const end = item.isSubtotal ? item.value : runningTotal + item.value;
      
      if (!item.isSubtotal) {
        runningTotal += item.value;
      } else {
        runningTotal = item.value;
      }

      return {
        ...item,
        start: Math.min(start, end),
        end: Math.max(start, end),
        height: Math.abs(item.value),
        displayValue: item.value,
        isPositive: item.value >= 0,
      };
    });
  }, [data]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border rounded-lg shadow-lg p-3">
          <p className="font-medium">{data.name}</p>
          <p className={`text-lg font-bold ${data.isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(data.displayValue)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">DRE Waterfall</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
          >
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 10 }}
              angle={-45}
              textAnchor="end"
              height={80}
              interval={0}
            />
            <YAxis 
              tickFormatter={(value) => formatCompact(value)}
              tick={{ fontSize: 11 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={0} stroke="#666" strokeWidth={1} />
            <Bar 
              dataKey="height" 
              radius={[4, 4, 0, 0]}
              maxBarSize={60}
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.fill}
                  opacity={entry.isSubtotal ? 1 : 0.85}
                />
              ))}
              <LabelList 
                dataKey="displayValue" 
                position="top" 
                formatter={(value: number) => formatCompact(value)}
                style={{ fontSize: 10, fontWeight: 500 }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default DREWaterfallChart;
