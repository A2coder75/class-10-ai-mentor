
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent
} from '@/components/ui/chart';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, Sector } from 'recharts';
import { PieChart as PieChartIcon } from 'lucide-react';

interface AttemptedDonutProps {
  attempted: number;
  total: number;
  title?: string;
}

const AttemptedDonutChart = ({ attempted, total, title = "Attempted vs Unattempted" }: AttemptedDonutProps) => {
  const [activeIndex, setActiveIndex] = React.useState<number | null>(null);

  const unattempted = Math.max(0, total - attempted);
  const attemptedPercentage = Math.round((attempted / total) * 100) || 0;
  const unattemptedPercentage = 100 - attemptedPercentage;

  const data = [
    { name: 'Attempted', value: attempted, percentage: attemptedPercentage },
    { name: 'Unattempted', value: unattempted, percentage: unattemptedPercentage }
  ];

  const COLORS = ['#818cf8', '#d1d5db'];

  // Active sector animation for the donut chart
  const renderActiveShape = (props: any) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
    
    return (
      <g>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + 6}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
          opacity={0.9}
        />
      </g>
    );
  };

  const onPieEnter = (_, index: number) => {
    setActiveIndex(index);
  };

  const onPieLeave = () => {
    setActiveIndex(null);
  };

  return (
    <Card className="border-none shadow-md rounded-xl overflow-hidden bg-white dark:bg-gray-900">
      <CardHeader className="pb-2 pt-4 px-4">
        <CardTitle className="text-base text-slate-700 dark:text-slate-300 flex items-center gap-2">
          <PieChartIcon className="h-5 w-5 text-indigo-500" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 px-4 pb-4">
        <div className="flex flex-col items-center h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                activeIndex={activeIndex !== null ? activeIndex : undefined}
                activeShape={renderActiveShape}
                data={data}
                cx="50%"
                cy="50%"
                innerRadius="60%"
                outerRadius="80%"
                paddingAngle={4}
                dataKey="value"
                onMouseEnter={onPieEnter}
                onMouseLeave={onPieLeave}
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[index % COLORS.length]} 
                    strokeWidth={1}
                    stroke={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="rounded-lg border bg-background p-2 shadow-md">
                        <div className="font-bold">{data.name}</div>
                        <div className="text-sm">
                          Count: <span className="font-medium">{data.value}</span>
                        </div>
                        <div className="text-sm">
                          Percentage: <span className="font-medium">{data.percentage}%</span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend 
                verticalAlign="bottom"
                align="center"
                layout="horizontal"
                formatter={(value, entry, index) => (
                  <span className="text-sm font-medium">
                    {value} ({data[index!].percentage}%)
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
          
          <div className="text-center mt-2">
            <div className="text-lg font-semibold">
              {attempted} of {total} questions attempted
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">
              {attemptedPercentage >= 90 && "Great job attempting almost all questions!"}
              {attemptedPercentage >= 70 && attemptedPercentage < 90 && "Good progress on question attempts!"}
              {attemptedPercentage >= 50 && attemptedPercentage < 70 && "Try to attempt more questions next time."}
              {attemptedPercentage < 50 && "Focus on attempting more questions in future tests."}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AttemptedDonutChart;
