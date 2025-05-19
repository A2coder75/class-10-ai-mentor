
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Award, TrendingUp, ArrowDown, ArrowUp } from 'lucide-react';

interface OverallScoreProps {
  score: number;
  maxScore: number;
  previousScore?: number;
}

const OverallScore: React.FC<OverallScoreProps> = ({ 
  score, 
  maxScore,
  previousScore
}) => {
  const percentage = Math.round((score / maxScore) * 100);
  
  const getGrade = (percentage: number): string => {
    if (percentage >= 90) return 'A+';
    if (percentage >= 85) return 'A';
    if (percentage >= 80) return 'A-';
    if (percentage >= 75) return 'B+';
    if (percentage >= 70) return 'B';
    if (percentage >= 65) return 'B-';
    if (percentage >= 60) return 'C+';
    if (percentage >= 55) return 'C';
    if (percentage >= 50) return 'C-';
    if (percentage >= 45) return 'D+';
    if (percentage >= 40) return 'D';
    return 'F';
  };
  
  const grade = getGrade(percentage);
  
  const getScoreColor = (percentage: number): string => {
    if (percentage >= 80) return 'bg-emerald-500';
    if (percentage >= 65) return 'bg-blue-500';
    if (percentage >= 50) return 'bg-amber-500';
    return 'bg-red-500';
  };
  
  const scoreVariant = percentage >= 80 ? 'success' : 
                       percentage >= 65 ? 'info' : 
                       percentage >= 50 ? 'warning' : 
                       'danger';
  
  const showComparison = previousScore !== undefined;
  const scoreDiff = previousScore !== undefined ? percentage - Math.round((previousScore / maxScore) * 100) : 0;
  const isImproved = scoreDiff > 0;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30">
        <CardTitle className="text-lg font-semibold">Overall Performance</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row gap-6 items-center">
          <div className="relative w-32 h-32 flex items-center justify-center rounded-full bg-slate-50 dark:bg-slate-800 border-4 border-slate-100 dark:border-slate-700">
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
              <circle 
                cx="50" 
                cy="50" 
                r="45" 
                fill="none"
                stroke="var(--border)" 
                strokeWidth="6" 
              />
              <circle 
                cx="50" 
                cy="50" 
                r="45" 
                fill="none"
                stroke="currentColor" 
                strokeWidth="6" 
                strokeDasharray={`${percentage * 2.83} 283`} 
                strokeDashoffset="0" 
                strokeLinecap="round"
                className={getScoreColor(percentage)}
                transform="rotate(-90 50 50)"
              />
            </svg>
            <div className="flex flex-col items-center justify-center">
              <span className="text-3xl font-bold">{percentage}%</span>
              <div className="flex items-center mt-1">
                <Award className="w-4 h-4 mr-1 text-amber-500" />
                <span className="font-semibold">{grade}</span>
              </div>
            </div>
          </div>
          
          <div className="flex-1 w-full">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Score</span>
                <span className="font-medium">{score} / {maxScore} points</span>
              </div>
              <Progress 
                value={percentage} 
                variant={scoreVariant}
                size="lg"
                className="h-2.5"
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col p-3 rounded-md border">
                <span className="text-xs text-muted-foreground">Performance Rating</span>
                <div className="flex items-center mt-1">
                  <Badge className={`
                    ${percentage >= 80 ? 'bg-emerald-500 hover:bg-emerald-600' : 
                      percentage >= 65 ? 'bg-blue-500 hover:bg-blue-600' : 
                      percentage >= 50 ? 'bg-amber-500 hover:bg-amber-600' : 
                      'bg-red-500 hover:bg-red-600'}
                  `}>
                    {percentage >= 80 ? 'Excellent' : 
                     percentage >= 65 ? 'Good' : 
                     percentage >= 50 ? 'Average' : 
                     'Needs Improvement'}
                  </Badge>
                </div>
              </div>
              
              {showComparison && (
                <div className="flex flex-col p-3 rounded-md border">
                  <span className="text-xs text-muted-foreground">Compared to Previous</span>
                  <div className="flex items-center mt-1">
                    {isImproved ? (
                      <div className="flex items-center text-emerald-500">
                        <ArrowUp className="w-4 h-4 mr-1" />
                        <span className="font-medium">+{scoreDiff}% Improved</span>
                      </div>
                    ) : scoreDiff === 0 ? (
                      <div className="flex items-center text-blue-500">
                        <TrendingUp className="w-4 h-4 mr-1" />
                        <span className="font-medium">No Change</span>
                      </div>
                    ) : (
                      <div className="flex items-center text-red-500">
                        <ArrowDown className="w-4 h-4 mr-1" />
                        <span className="font-medium">{scoreDiff}% Decrease</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OverallScore;
