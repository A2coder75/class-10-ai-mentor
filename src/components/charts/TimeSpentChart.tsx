import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent
} from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell, Tooltip, Legend } from 'recharts';
import { BarChartHorizontal } from 'lucide-react';

interface TimeData {
  subject: string;
  timeSpent: number; // in minutes
  recommendedTime?: number; // optional recommended time
}

interface TimeSpentChartProps {
  data: TimeData[];
  title?: string;
}

const TimeSpentChart = ({ data, title = "Time Spent per Subject" }: TimeSpentChartProps) => {
  const config = {
    time: { 
      theme: {
        light: "#8b5cf6",
        dark: "#a78bfa"
      }
    },
    recommended: {
      theme: {
        light: "#94a3b8",
        dark: "#64748b"
      }
    }
  };
  
  // Format the data for better display
  const formattedData = data.map(item => ({
    ...item,
    formattedTimeSpent: formatTime(item.timeSpent),
    formattedRecommendedTime: item.recommendedTime ? formatTime(item.recommendedTime) : undefined
  }));

  // Function to format minutes into hours and minutes
  function formatTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  }

  return (
    <Card className="border-none shadow-md rounded-xl overflow-hidden bg-white dark:bg-gray-900">
      <CardHeader className="pb-2 pt-4 px-4">
        <CardTitle className="text-base text-slate-700 dark:text-slate-300 flex items-center gap-2">
          <BarChartHorizontal className="h-5 w-5 text-indigo-500" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 px-4 pb-4">
        <div className="h-80">
          <ChartContainer config={config}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={formattedData}
                layout="vertical"
                margin={{
                  top: 5,
                  right: 30,
                  left: 80,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} opacity={0.15} />
                <XAxis
                  type="number" 
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(value) => `${value}m`}
                />
                <YAxis
                  type="category"
                  dataKey="subject"
                  axisLine={false}
                  tickLine={false}
                  width={80}
                />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="rounded-lg border bg-background p-2 shadow-md">
                          <div className="font-bold">{data.subject}</div>
                          <div className="text-sm">
                            Time spent: <span className="font-medium">{data.formattedTimeSpent}</span>
                          </div>
                          {data.recommendedTime && (
                            <div className="text-sm">
                              Recommended: <span className="font-medium">{data.formattedRecommendedTime}</span>
                            </div>
                          )}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend />
                {data[0]?.recommendedTime && (
                  <Bar 
                    dataKey="recommendedTime" 
                    fill="var(--color-recommended)"
                    opacity={0.3}
                    name="Recommended Time"
                    radius={[0, 4, 4, 0]}
                  />
                )}
                <Bar 
                  dataKey="timeSpent" 
                  fill="var(--color-time)"
                  name="Time Spent" 
                  radius={[0, 4, 4, 0]}
                >
                  {formattedData.map((entry, index) => {
                    // Calculate color based on time spent vs recommended
                    let color = '#6366f1'; // default color
                    
                    if (entry.recommendedTime) {
                      const ratio = entry.timeSpent / entry.recommendedTime;
                      if (ratio > 1.2) color = '#ef4444'; // too much time
                      else if (ratio < 0.8) color = '#22c55e'; // efficient
                      else color = '#3b82f6'; // good balance
                    }
                    
                    return <Cell key={`cell-${index}`} fill={color} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default TimeSpentChart;
