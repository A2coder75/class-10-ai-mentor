
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent
} from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell, Tooltip, Legend, RadarChart, PolarGrid, PolarAngleAxis, Radar, PolarRadiusAxis } from 'recharts';
import { BarChart2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface TopicData {
  topic: string;
  accuracy: number;
  attempted: number;
  total: number;
}

interface TopicPerformanceProps {
  data: TopicData[];
  title?: string;
  chartType?: 'bar' | 'radar';
}

const TopicPerformanceChart = ({ data, title = "Topic-wise Performance", chartType = 'bar' }: TopicPerformanceProps) => {
  const config = {
    radar: { 
      theme: {
        light: "#8b5cf6",
        dark: "#a78bfa"
      }
    },
    bar: {
      theme: {
        light: "#818cf8",
        dark: "#6366f1"
      }
    }
  };
  
  // Format the data for better display
  const formattedData = data.map(item => ({
    ...item,
    accuracyPercentage: Math.round(item.accuracy * 100)
  }));

  return (
    <Card className="border-none shadow-md rounded-xl overflow-hidden bg-white dark:bg-gray-900">
      <CardHeader className="pb-2 pt-4 px-4">
        <CardTitle className="text-base text-slate-700 dark:text-slate-300 flex items-center gap-2">
          <BarChart2 className="h-5 w-5 text-indigo-500" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 px-4 pb-4">
        <Tabs defaultValue={chartType} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="bar">Bar Chart</TabsTrigger>
            <TabsTrigger value="radar">Radar Chart</TabsTrigger>
          </TabsList>
          
          <TabsContent value="bar" className="h-80">
            <ChartContainer config={config}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={formattedData}
                  margin={{
                    top: 5,
                    right: 20,
                    left: 0,
                    bottom: 30,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis 
                    dataKey="topic" 
                    axisLine={false}
                    tickLine={false}
                    angle={-25}
                    textAnchor="end"
                    height={60}
                    fontSize={12}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    domain={[0, 100]}
                    tickFormatter={(value) => `${value}%`}
                  />
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="rounded-lg border bg-background p-2 shadow-md">
                            <div className="font-bold">{data.topic}</div>
                            <div className="text-sm">
                              Accuracy: <span className="font-medium">{data.accuracyPercentage}%</span>
                            </div>
                            <div className="text-sm">
                              Attempted: <span className="font-medium">{data.attempted}/{data.total}</span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar 
                    dataKey="accuracyPercentage" 
                    fill="var(--color-bar)" 
                    radius={[4, 4, 0, 0]}
                  >
                    {formattedData.map((entry, index) => {
                      let color;
                      if (entry.accuracyPercentage >= 80) color = '#22c55e';
                      else if (entry.accuracyPercentage >= 60) color = '#3b82f6';
                      else if (entry.accuracyPercentage >= 40) color = '#f59e0b';
                      else color = '#ef4444';
                      
                      return <Cell key={`cell-${index}`} fill={color} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </TabsContent>
          
          <TabsContent value="radar" className="h-80">
            <ChartContainer config={config}>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={formattedData}>
                  <PolarGrid gridType="polygon" strokeOpacity={0.2} />
                  <PolarAngleAxis 
                    dataKey="topic" 
                    tick={{ fontSize: 12, fill: 'var(--tw-prose-headings)' }} 
                  />
                  <PolarRadiusAxis 
                    angle={90} 
                    domain={[0, 100]} 
                    tick={{ fontSize: 10 }}
                    axisLine={false}
                    tickFormatter={(value) => `${value}%`}
                  />
                  <Radar 
                    name="Accuracy" 
                    dataKey="accuracyPercentage" 
                    stroke="var(--color-radar)" 
                    fill="var(--color-radar)" 
                    fillOpacity={0.5} 
                  />
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="rounded-lg border bg-background p-2 shadow-md">
                            <div className="font-bold">{data.topic}</div>
                            <div className="text-sm">
                              Accuracy: <span className="font-medium">{data.accuracyPercentage}%</span>
                            </div>
                            <div className="text-sm">
                              Attempted: <span className="font-medium">{data.attempted}/{data.total}</span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default TopicPerformanceChart;
