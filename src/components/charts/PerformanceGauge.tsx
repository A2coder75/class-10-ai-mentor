
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent 
} from '@/components/ui/chart';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Progress } from '@/components/ui/progress';
import { Gauge } from 'lucide-react';

interface PerformanceGaugeProps {
  score: number;
  maxScore?: number;
  title?: string;
}

const PerformanceGauge = ({ score, maxScore = 100, title = "Overall Score" }: PerformanceGaugeProps) => {
  const percentage = Math.round((score / maxScore) * 100);
  
  // Generate color based on score percentage
  const getScoreColor = () => {
    if (percentage >= 80) return 'from-green-400 to-emerald-500';
    if (percentage >= 60) return 'from-blue-400 to-cyan-500';
    if (percentage >= 40) return 'from-yellow-400 to-amber-500';
    return 'from-red-400 to-rose-500';
  };
  
  // Generate letter grade based on score percentage
  const getGrade = () => {
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B';
    if (percentage >= 60) return 'C';
    if (percentage >= 50) return 'D';
    return 'F';
  };
  
  // Data for the semi-circle gauge
  const gaugeData = [
    { name: 'Score', value: percentage },
    { name: 'Remaining', value: 100 - percentage }
  ];
  
  // Colors for the gauge segments
  const COLORS = ['url(#gaugeGradient)', '#f3f4f6'];

  return (
    <Card className="border-none shadow-md rounded-xl overflow-hidden bg-white dark:bg-gray-900">
      <CardHeader className="pb-2 pt-4 px-4">
        <CardTitle className="text-base text-slate-700 dark:text-slate-300 flex items-center gap-2">
          <Gauge className="h-5 w-5 text-indigo-500" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 px-4 pb-4">
        <div className="flex flex-col items-center">
          <div className="h-44 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <defs>
                  <linearGradient id="gaugeGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#6366f1" />
                  </linearGradient>
                </defs>
                <Pie
                  data={gaugeData}
                  cx="50%"
                  cy="90%"
                  startAngle={180}
                  endAngle={0}
                  innerRadius="70%"
                  outerRadius="90%"
                  cornerRadius={6}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {gaugeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <ChartTooltip 
                  content={<ChartTooltipContent />}
                />
              </PieChart>
            </ResponsiveContainer>
            
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
              <div className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
                {percentage}%
              </div>
              <div className="text-lg font-semibold text-slate-700 dark:text-slate-300">
                Grade: <span className={`text-${getScoreColor().split(' ')[1].replace('to-', '')}`}>{getGrade()}</span>
              </div>
            </div>
          </div>
          
          <div className="w-full mt-2">
            <div className="flex justify-between mb-2 text-sm text-slate-600 dark:text-slate-400">
              <span>Low</span>
              <span>Medium</span>
              <span>High</span>
            </div>
            <Progress 
              value={percentage} 
              className="h-2.5 bg-slate-200 dark:bg-slate-700"
              indicatorClassName={`bg-gradient-to-r ${getScoreColor()}`}
            />
          </div>
          
          <div className="text-sm text-slate-600 dark:text-slate-400 mt-3">
            {percentage >= 80 && "Excellent! Keep up the good work!"}
            {percentage >= 60 && percentage < 80 && "Good progress! You're on the right track."}
            {percentage >= 40 && percentage < 60 && "You're making progress, but need more practice."}
            {percentage < 40 && "More study time needed in this area."}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PerformanceGauge;
