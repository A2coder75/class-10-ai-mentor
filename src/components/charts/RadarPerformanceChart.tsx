
import React from 'react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { ChapterPerformance } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface RadarPerformanceChartProps {
  data: ChapterPerformance[];
}

const RadarPerformanceChart: React.FC<RadarPerformanceChartProps> = ({ data }) => {
  // Transform data for the chart
  const chartData = data.map((item) => ({
    subject: item.chapter,
    score: Math.round((item.score / item.total) * 100),
    fullMark: 100,
  }));

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/30 dark:to-blue-900/30">
        <CardTitle className="text-lg font-semibold">
          Topic Performance
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <ResponsiveContainer width="100%" height={300}>
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
            <PolarGrid strokeDasharray="3 3" />
            <PolarAngleAxis
              dataKey="subject"
              tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
            />
            <PolarRadiusAxis 
              angle={30} 
              domain={[0, 100]} 
              tick={{ fill: 'var(--muted-foreground)', fontSize: 10 }}
              tickFormatter={(value) => `${value}%`}
            />
            <Radar
              name="Score"
              dataKey="score"
              stroke="#8884d8"
              fill="#8884d8"
              fillOpacity={0.6}
            />
            <Tooltip 
              formatter={(value) => [`${value}%`, 'Score']}
              contentStyle={{ 
                background: 'var(--background)',
                border: '1px solid var(--border)',
                borderRadius: '0.375rem',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default RadarPerformanceChart;
