
import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  TooltipProps,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface StackedBarChartProps {
  data: any[];
  keys: string[];
  colors: string[];
  title: string;
  xAxisKey?: string;
  yAxisUnit?: string;
}

const StackedBarChart: React.FC<StackedBarChartProps> = ({
  data,
  keys,
  colors,
  title,
  xAxisKey = 'name',
  yAxisUnit = '',
}) => {
  const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-md p-3 shadow-lg">
          <p className="font-medium">{label}</p>
          <div className="mt-2 space-y-1">
            {payload.map((entry, index) => (
              <div key={`tooltip-item-${index}`} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-sm text-muted-foreground">
                  {entry.name}: {entry.value} {yAxisUnit}
                </span>
              </div>
            ))}
            <div className="pt-1 border-t border-border mt-1">
              <span className="text-sm font-medium">
                Total: {payload.reduce((sum, entry) => sum + (entry.value as number), 0)} {yAxisUnit}
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-cyan-50 to-teal-50 dark:from-cyan-900/30 dark:to-teal-900/30">
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
            <XAxis 
              dataKey={xAxisKey} 
              tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }} 
            />
            <YAxis 
              tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
              unit={yAxisUnit ? ` ${yAxisUnit}` : ''}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              formatter={(value) => <span style={{ color: 'var(--foreground)' }}>{value}</span>}
            />
            {keys.map((key, index) => (
              <Bar
                key={key}
                dataKey={key}
                stackId="a"
                fill={colors[index % colors.length]}
                radius={[index === keys.length - 1 ? 4 : 0, index === keys.length - 1 ? 4 : 0, 0, 0]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default StackedBarChart;
