
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { CheckCircle, XCircle, AlertTriangle, AlertCircle, BarChart3, PieChart as PieChartIcon } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GradeResponse, QuestionEvaluation, Question, TestResult } from '@/types';

interface TestResultsAnalysisProps {
  results: GradeResponse;
  questions?: Question[];
  evaluations?: QuestionEvaluation[];
  answers?: {[key: string]: string | string[]};
}

const TestResultsAnalysis: React.FC<TestResultsAnalysisProps> = ({ results }) => {
  const chartData = useMemo(() => {
    // Extract data for visualization
    if (!results?.evaluations) {
      console.log("No evaluations found in results:", results);
      return [];
    }
    return results.evaluations.map((evaluation) => ({
      question: evaluation.question_number,
      correct: evaluation.verdict === 'correct' ? 1 : 0,
      wrong: evaluation.verdict === 'wrong' ? 1 : 0,
      partial: evaluation.verdict === 'partial' ? 1 : 0,
      marks: evaluation.marks_awarded,
      totalMarks: evaluation.total_marks || 1,
      verdict: evaluation.verdict,
    }));
  }, [results]);

  const summaryData = useMemo(() => {
    if (!results?.evaluations) {
      console.log("No evaluations found for summary data");
      return { correct: 0, wrong: 0, partial: 0, totalMarks: 0, marksAwarded: 0 };
    }

    return results.evaluations.reduce((acc, evaluation) => {
      if (evaluation.verdict === 'correct') acc.correct++;
      else if (evaluation.verdict === 'wrong') acc.wrong++;
      else if (evaluation.verdict === 'partial') acc.partial++;
      
      acc.marksAwarded += evaluation.marks_awarded || 0;
      acc.totalMarks += evaluation.total_marks || 1;
      
      return acc;
    }, { correct: 0, wrong: 0, partial: 0, totalMarks: 0, marksAwarded: 0 });
  }, [results]);

  const pieData = useMemo(() => {
    return [
      { name: 'Correct', value: summaryData.correct, color: '#22c55e' },
      { name: 'Wrong', value: summaryData.wrong, color: '#ef4444' },
      { name: 'Partial', value: summaryData.partial, color: '#f59e0b' },
    ].filter(item => item.value > 0);
  }, [summaryData]);

  const mistakeTypeData = useMemo(() => {
    if (!results?.evaluations) return [];
    
    const mistakeTypes: Record<string, number> = {};
    
    results.evaluations.forEach(evaluation => {
      if (evaluation.verdict !== 'correct' && Array.isArray(evaluation.mistake_type)) {
        evaluation.mistake_type.forEach(type => {
          if (typeof type === 'string') {
            mistakeTypes[type] = (mistakeTypes[type] || 0) + 1;
          }
        });
      } else if (evaluation.verdict !== 'correct' && typeof evaluation.mistake_type === 'string') {
        mistakeTypes[evaluation.mistake_type] = (mistakeTypes[evaluation.mistake_type] || 0) + 1;
      }
    });
    
    return Object.entries(mistakeTypes).map(([type, count]) => ({
      name: type.charAt(0).toUpperCase() + type.slice(1),
      value: count,
      color: getColorForMistakeType(type),
    }));
  }, [results]);

  const getColorForMistakeType = (type: string) => {
    const colors: Record<string, string> = {
      conceptual: '#ef4444',
      calculation: '#f59e0b',
      interpretation: '#06b6d4',
      application: '#8b5cf6',
      procedural: '#ec4899',
    };
    
    return colors[type.toLowerCase()] || '#94a3b8';
  };

  const getVerdictBadge = (verdict: string) => {
    switch (verdict) {
      case 'correct':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400">Correct</Badge>;
      case 'wrong':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400">Incorrect</Badge>;
      case 'partial':
        return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-400">Partial</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  // If no results or evaluations, display a message
  if (!results || !results.evaluations || results.evaluations.length === 0) {
    console.log("No valid results data for analysis:", results);
    return (
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Test Results Analysis</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Analysis Available</h3>
          <p className="text-muted-foreground">
            There are no test results available to analyze. Try taking a test first.
          </p>
        </CardContent>
      </Card>
    );
  }

  const percentageScore = summaryData.totalMarks > 0 
    ? Math.round((summaryData.marksAwarded / summaryData.totalMarks) * 100) 
    : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-6">
              <div>
                <div className="text-4xl font-bold text-primary">
                  {summaryData.marksAwarded}/{summaryData.totalMarks}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  Score ({percentageScore}%)
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="flex flex-col items-center">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 mb-1">
                    <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="text-lg font-semibold">{summaryData.correct}</div>
                  <div className="text-xs text-muted-foreground">Correct</div>
                </div>
                
                <div className="flex flex-col items-center">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 mb-1">
                    <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                  </div>
                  <div className="text-lg font-semibold">{summaryData.wrong}</div>
                  <div className="text-xs text-muted-foreground">Wrong</div>
                </div>
                
                <div className="flex flex-col items-center">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 mb-1">
                    <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div className="text-lg font-semibold">{summaryData.partial}</div>
                  <div className="text-xs text-muted-foreground">Partial</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-1 md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Performance Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="chart" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="chart" className="flex items-center gap-1">
                  <BarChart3 className="h-4 w-4" />
                  <span>Scores</span>
                </TabsTrigger>
                <TabsTrigger value="pie" className="flex items-center gap-1">
                  <PieChartIcon className="h-4 w-4" />
                  <span>Distribution</span>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="chart" className="mt-4">
                <div className="h-[250px] w-full">
                  {chartData.length > 0 ? (
                    <ChartContainer
                      config={{
                        correct: { color: "#22c55e" },
                        wrong: { color: "#ef4444" },
                        partial: { color: "#f59e0b" },
                      }}
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                          <XAxis dataKey="question" />
                          <YAxis />
                          <Tooltip content={<ChartTooltipContent />} />
                          <Legend />
                          <Bar dataKey="correct" stackId="a" fill="var(--color-correct)" name="Correct" />
                          <Bar dataKey="wrong" stackId="a" fill="var(--color-wrong)" name="Wrong" />
                          <Bar dataKey="partial" stackId="a" fill="var(--color-partial)" name="Partial" />
                        </BarChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                      <AlertCircle className="mr-2 h-4 w-4" /> No chart data available
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="pie" className="mt-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="h-[200px]">
                    <p className="text-sm font-medium mb-2 text-center">Question Results</p>
                    {pieData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          >
                            {pieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => [`${value} questions`, 'Count']} />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                        <AlertCircle className="mr-2 h-4 w-4" /> No pie data available
                      </div>
                    )}
                  </div>
                  
                  <div className="h-[200px]">
                    <p className="text-sm font-medium mb-2 text-center">Error Types</p>
                    <ResponsiveContainer width="100%" height="100%">
                      {mistakeTypeData.length > 0 ? (
                        <PieChart>
                          <Pie
                            data={mistakeTypeData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          >
                            {mistakeTypeData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => [`${value} questions`, 'Count']} />
                        </PieChart>
                      ) : (
                        <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                          <AlertCircle className="mr-2 h-4 w-4" /> No error data available
                        </div>
                      )}
                    </ResponsiveContainer>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Detailed Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {results?.evaluations?.map((evaluation: QuestionEvaluation, index) => (
              <Card key={index} className="overflow-hidden">
                <div className={`px-4 py-3 border-l-4 ${
                  evaluation.verdict === 'correct' ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 
                  evaluation.verdict === 'partial' ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20' :
                  'border-red-500 bg-red-50 dark:bg-red-900/20'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        evaluation.verdict === 'correct' ? 'bg-green-100 dark:bg-green-800/50 text-green-600 dark:text-green-400' :
                        evaluation.verdict === 'partial' ? 'bg-amber-100 dark:bg-amber-800/50 text-amber-600 dark:text-amber-400' :
                        'bg-red-100 dark:bg-red-800/50 text-red-600 dark:text-red-400'
                      }`}>
                        {evaluation.verdict === 'correct' ? (
                          <CheckCircle className="h-5 w-5" />
                        ) : evaluation.verdict === 'partial' ? (
                          <AlertTriangle className="h-5 w-5" />
                        ) : (
                          <XCircle className="h-5 w-5" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium">
                          Question {evaluation.question_number}
                          {evaluation.section ? ` (${evaluation.section})` : ''}
                        </div>
                        <div className="text-sm text-muted-foreground mt-0.5">
                          Score: {evaluation.marks_awarded}/{evaluation.total_marks || 1}
                        </div>
                      </div>
                    </div>
                    <div>
                      {getVerdictBadge(evaluation.verdict || '')}
                    </div>
                  </div>
                </div>
                <div className="px-4 py-3 bg-background">
                  {evaluation.verdict !== 'correct' && (
                    <div className="space-y-3">
                      {evaluation.mistake && (
                        <div>
                          <p className="text-sm font-medium">Error:</p>
                          <p className="text-sm text-muted-foreground">
                            {Array.isArray(evaluation.mistake) 
                              ? evaluation.mistake.join(', ') 
                              : evaluation.mistake}
                          </p>
                        </div>
                      )}
                      
                      {evaluation.correct_answer && (
                        <div>
                          <p className="text-sm font-medium">Correct Answer:</p>
                          <p className="text-sm text-muted-foreground">
                            {Array.isArray(evaluation.correct_answer) 
                              ? evaluation.correct_answer.join(', ') 
                              : evaluation.correct_answer}
                          </p>
                        </div>
                      )}
                      
                      {evaluation.mistake_type && (
                        <div className="flex gap-2 flex-wrap">
                          <p className="text-sm font-medium">Error type:</p>
                          {Array.isArray(evaluation.mistake_type) ? (
                            evaluation.mistake_type.map((type, i) => (
                              <Badge key={i} variant="outline" className="capitalize">
                                {type}
                              </Badge>
                            ))
                          ) : (
                            <Badge variant="outline" className="capitalize">
                              {evaluation.mistake_type}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                  
                  {evaluation.final_feedback && (
                    <div className={evaluation.verdict !== 'correct' ? 'mt-3' : ''}>
                      <p className="text-sm font-medium">Feedback:</p>
                      <p className="text-sm text-muted-foreground">{evaluation.final_feedback}</p>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TestResultsAnalysis;
