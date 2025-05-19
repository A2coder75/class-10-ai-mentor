
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
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  LineChart,
  Line,
  CartesianGrid,
  Sector
} from 'recharts';
import { CheckCircle, XCircle, AlertTriangle, AlertCircle, BarChart3, PieChartIcon, Clock, Circle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GradeResponse, QuestionEvaluation, Question, TestResult } from '@/types';
import { Progress } from "@/components/ui/progress";

interface TestResultsAnalysisProps {
  results: GradeResponse;
  questions?: Question[];
  evaluations?: QuestionEvaluation[];
  answers?: {[key: string]: string | string[]};
}

// Helper functions
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

const renderActiveShape = (props: any) => {
  const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
  const sin = Math.sin(-midAngle * Math.PI / 180);
  const cos = Math.cos(-midAngle * Math.PI / 180);
  const sx = cx + (outerRadius + 10) * cos;
  const sy = cy + (outerRadius + 10) * sin;
  const mx = cx + (outerRadius + 30) * cos;
  const my = cy + (outerRadius + 30) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 22;
  const ey = my;
  const textAnchor = cos >= 0 ? 'start' : 'end';

  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 6}
        outerRadius={outerRadius + 10}
        fill={fill}
      />
      <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
      <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#333" fontSize={12}>{`${payload.name}: ${value}`}</text>
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="#999" fontSize={11}>
        {`(${(percent * 100).toFixed(0)}%)`}
      </text>
    </g>
  );
};

const TestResultsAnalysis: React.FC<TestResultsAnalysisProps> = ({ results }) => {
  const [activeQuestionIndex, setActiveQuestionIndex] = React.useState(0);
  const [activeTopicIndex, setActiveTopicIndex] = React.useState(0);
  const [activeMistakeIndex, setActiveMistakeIndex] = React.useState(0);

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
      topic: evaluation.section || 'General',
      marksPercentage: Math.round((evaluation.marks_awarded / (evaluation.total_marks || 1)) * 100),
      mistakeType: evaluation.mistake_type || 'none',
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

  // 1. Calculate topic-wise performance data
  const topicPerformanceData = useMemo(() => {
    if (!chartData.length) return [];
    
    const topicMap: Record<string, { total: number, correct: number, partial: number, wrong: number, score: number }> = {};
    
    chartData.forEach(item => {
      const topic = item.topic;
      if (!topicMap[topic]) {
        topicMap[topic] = { total: 0, correct: 0, partial: 0, wrong: 0, score: 0 };
      }
      
      topicMap[topic].total++;
      topicMap[topic].correct += item.correct;
      topicMap[topic].partial += item.partial;
      topicMap[topic].wrong += item.wrong;
      topicMap[topic].score += item.marksPercentage;
    });
    
    return Object.entries(topicMap).map(([topic, data]) => ({
      topic,
      score: Math.round(data.score / data.total),
      correct: data.correct,
      partial: data.partial,
      wrong: data.wrong,
      fullMark: 100,
    }));
  }, [chartData]);

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

  // 3. Calculate question type data (based on sections)
  const questionTypeData = useMemo(() => {
    if (!chartData.length) return [];
    
    const typeMap: Record<string, { total: number, correct: number, wrong: number, partial: number }> = {};
    
    chartData.forEach(item => {
      // If the test doesn't have specific question types, we'll use the verdict as "types"
      const type = item.topic || 'General';
      
      if (!typeMap[type]) {
        typeMap[type] = { total: 0, correct: 0, wrong: 0, partial: 0 };
      }
      
      typeMap[type].total++;
      if (item.correct) typeMap[type].correct++;
      if (item.wrong) typeMap[type].wrong++;
      if (item.partial) typeMap[type].partial++;
    });
    
    return Object.entries(typeMap).map(([type, data]) => ({
      name: type,
      correct: data.correct,
      wrong: data.wrong,
      partial: data.partial,
      total: data.total,
    }));
  }, [chartData]);

  // 5. Calculate attempted vs unattempted data
  // For this example we'll just use correct + wrong + partial as attempted, 
  // and total - attempted as unattempted
  const attemptedData = useMemo(() => {
    if (!summaryData) return [];
    
    const total = summaryData.correct + summaryData.wrong + summaryData.partial;
    // For demo purposes - adjust as needed based on your real data
    const unattempted = Math.max(0, Math.round(total * 0.1)); // Assuming 10% unattempted for demo
    
    return [
      { name: 'Attempted', value: total, color: '#3b82f6' },
      { name: 'Unattempted', value: unattempted, color: '#cbd5e1' },
    ];
  }, [summaryData]);

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
      {/* 1. Overall Score / Performance Gauge */}
      <Card className="overflow-hidden border-none shadow-lg bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/30 dark:to-blue-900/30">
        <CardHeader className="border-b border-indigo-100 dark:border-indigo-900/50 bg-white/50 dark:bg-white/5">
          <CardTitle className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-600 dark:from-indigo-400 dark:to-blue-400">
            Overall Performance
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="w-full md:w-1/3 flex flex-col items-center">
              <div className="relative mb-4">
                <div className="w-48 h-48 rounded-full border-8 border-gray-100 dark:border-gray-800 flex items-center justify-center">
                  <div className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-indigo-600 to-blue-600 dark:from-indigo-400 dark:to-blue-400">
                    {percentageScore}%
                  </div>
                </div>
                <svg className="absolute top-0 left-0 w-48 h-48 -rotate-90">
                  <circle 
                    className="text-gray-200 dark:text-gray-700" 
                    strokeWidth="12" 
                    stroke="currentColor" 
                    fill="transparent" 
                    r="68" 
                    cx="96" 
                    cy="96" 
                  />
                  <circle 
                    className="text-indigo-500 dark:text-indigo-400" 
                    strokeWidth="12" 
                    strokeDasharray={`${percentageScore * 4.25} 425`}
                    strokeLinecap="round" 
                    stroke="currentColor" 
                    fill="transparent" 
                    r="68" 
                    cx="96" 
                    cy="96" 
                  />
                </svg>
              </div>
              <div className="text-center mt-2">
                <p className="text-lg font-medium text-gray-900 dark:text-gray-200">
                  Overall Score
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  {summaryData.marksAwarded}/{summaryData.totalMarks} marks
                </p>
                <div className="mt-4 flex justify-between text-sm text-gray-500 px-2">
                  <span>0%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
                <Progress value={percentageScore} className="h-2 mt-1" />
              </div>
            </div>
            
            <div className="flex-1 w-full md:w-2/3 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col items-center justify-center p-4 bg-white dark:bg-gray-800/50 rounded-xl shadow-sm border border-indigo-100 dark:border-indigo-900/30">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 mb-3">
                  <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">{summaryData.correct}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Correct Answers</div>
              </div>
              
              <div className="flex flex-col items-center justify-center p-4 bg-white dark:bg-gray-800/50 rounded-xl shadow-sm border border-indigo-100 dark:border-indigo-900/30">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 mb-3">
                  <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">{summaryData.wrong}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Incorrect Answers</div>
              </div>
              
              <div className="flex flex-col items-center justify-center p-4 bg-white dark:bg-gray-800/50 rounded-xl shadow-sm border border-indigo-100 dark:border-indigo-900/30">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 mb-3">
                  <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{summaryData.partial}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Partial Answers</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Advanced Charts */}
      <Card className="overflow-hidden border-none shadow-lg">
        <CardHeader className="border-b bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/30 dark:to-indigo-900/30">
          <CardTitle className="text-xl">Performance Analytics</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <Tabs defaultValue="topics" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="topics" className="flex items-center gap-1">
                <BarChart3 className="h-4 w-4" />
                <span>Topic Performance</span>
              </TabsTrigger>
              <TabsTrigger value="questionTypes" className="flex items-center gap-1">
                <PieChartIcon className="h-4 w-4" />
                <span>Question Types</span>
              </TabsTrigger>
              <TabsTrigger value="mistakeAnalysis" className="flex items-center gap-1">
                <AlertTriangle className="h-4 w-4" />
                <span>Error Types</span>
              </TabsTrigger>
              <TabsTrigger value="attempted" className="flex items-center gap-1">
                <Circle className="h-4 w-4" />
                <span>Attempt Rate</span>
              </TabsTrigger>
            </TabsList>
            
            {/* Topic Performance - Radar Chart */}
            <TabsContent value="topics" className="mt-6">
              <div className="bg-white dark:bg-gray-800/50 p-4 rounded-xl border border-indigo-100 dark:border-indigo-900/30 mb-6">
                <h3 className="text-lg font-medium mb-2 text-purple-900 dark:text-purple-400">Topic Performance</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  This radar chart shows your performance across different topics. Larger area indicates better performance.
                </p>
                <div className="h-[350px] w-full">
                  {topicPerformanceData.length > 0 ? (
                    <ChartContainer
                      config={{
                        score: { color: "#8b5cf6" },
                      }}
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart data={topicPerformanceData} margin={{ top: 10, right: 30, left: 30, bottom: 10 }}>
                          <PolarGrid stroke="#e5e7eb" />
                          <PolarAngleAxis dataKey="topic" tick={{ fill: '#6b7280', fontSize: 12 }} />
                          <PolarRadiusAxis domain={[0, 100]} />
                          <Radar 
                            dataKey="score" 
                            stroke="var(--color-score)" 
                            fill="var(--color-score)" 
                            fillOpacity={0.5} 
                            name="Score (%)"
                          />
                          <Tooltip content={<ChartTooltipContent />} />
                        </RadarChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                      <AlertCircle className="mr-2 h-4 w-4" /> No topic performance data available
                    </div>
                  )}
                </div>
              </div>
              
              {/* Topic Performance - Bar Chart */}
              <div className="bg-white dark:bg-gray-800/50 p-4 rounded-xl border border-indigo-100 dark:border-indigo-900/30">
                <h3 className="text-lg font-medium mb-2 text-indigo-900 dark:text-indigo-400">Topic-wise Score Breakdown</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  This bar chart breaks down your performance by topic. Higher bars indicate better performance.
                </p>
                <div className="h-[350px] w-full">
                  {topicPerformanceData.length > 0 ? (
                    <ChartContainer
                      config={{
                        score: { color: "#8b5cf6" },
                      }}
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart 
                          data={topicPerformanceData}
                          margin={{ top: 10, right: 30, left: 30, bottom: 50 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.2)" />
                          <XAxis 
                            dataKey="topic" 
                            tick={{ fill: '#6b7280', fontSize: 12 }} 
                            angle={-45} 
                            textAnchor="end"
                            interval={0}
                          />
                          <YAxis domain={[0, 100]} tick={{ fill: '#6b7280' }} />
                          <Tooltip content={<ChartTooltipContent />} />
                          <Bar 
                            dataKey="score" 
                            fill="var(--color-score)" 
                            name="Score (%)"
                            radius={[4, 4, 0, 0]}
                            animationDuration={1500}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                      <AlertCircle className="mr-2 h-4 w-4" /> No topic performance data available
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
            
            {/* Question Types - Pie and Bar Chart */}
            <TabsContent value="questionTypes" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-800/50 p-4 rounded-xl border border-indigo-100 dark:border-indigo-900/30">
                  <h3 className="text-lg font-medium mb-2 text-cyan-900 dark:text-cyan-400">Question Type Distribution</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    Shows the distribution of questions across different types or categories.
                  </p>
                  <div className="h-[300px] w-full">
                    {questionTypeData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            activeIndex={activeQuestionIndex}
                            activeShape={renderActiveShape}
                            data={questionTypeData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            fill="#06b6d4"
                            dataKey="total"
                            nameKey="name"
                            onMouseEnter={(_, index) => setActiveQuestionIndex(index)}
                          />
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                        <AlertCircle className="mr-2 h-4 w-4" /> No question type data available
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="bg-white dark:bg-gray-800/50 p-4 rounded-xl border border-indigo-100 dark:border-indigo-900/30">
                  <h3 className="text-lg font-medium mb-2 text-emerald-900 dark:text-emerald-400">Question Type Accuracy</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    Shows your performance across different question types.
                  </p>
                  <div className="h-[300px] w-full">
                    {questionTypeData.length > 0 ? (
                      <ChartContainer
                        config={{
                          correct: { color: "#22c55e" },
                          partial: { color: "#f59e0b" },
                          wrong: { color: "#ef4444" },
                        }}
                      >
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart 
                            data={questionTypeData}
                            margin={{ top: 10, right: 30, left: 10, bottom: 50 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.2)" />
                            <XAxis 
                              dataKey="name" 
                              tick={{ fill: '#6b7280', fontSize: 12 }} 
                              angle={-45} 
                              textAnchor="end"
                              interval={0}
                            />
                            <YAxis tick={{ fill: '#6b7280' }} />
                            <Tooltip content={<ChartTooltipContent />} />
                            <Legend />
                            <Bar dataKey="correct" stackId="a" fill="var(--color-correct)" name="Correct" />
                            <Bar dataKey="partial" stackId="a" fill="var(--color-partial)" name="Partial" />
                            <Bar dataKey="wrong" stackId="a" fill="var(--color-wrong)" name="Wrong" />
                          </BarChart>
                        </ResponsiveContainer>
                      </ChartContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                        <AlertCircle className="mr-2 h-4 w-4" /> No question type data available
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>
            
            {/* Mistake Analysis Pie Chart */}
            <TabsContent value="mistakeAnalysis" className="mt-6">
              <div className="bg-white dark:bg-gray-800/50 p-4 rounded-xl border border-indigo-100 dark:border-indigo-900/30">
                <h3 className="text-lg font-medium mb-2 text-rose-900 dark:text-rose-400">Error Type Analysis</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  This chart shows the distribution of different types of mistakes you made.
                </p>
                <div className="h-[350px] w-full">
                  {mistakeTypeData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          activeIndex={activeMistakeIndex}
                          activeShape={renderActiveShape}
                          data={mistakeTypeData}
                          cx="50%"
                          cy="50%"
                          innerRadius={70}
                          outerRadius={100}
                          dataKey="value"
                          nameKey="name"
                          onMouseEnter={(_, index) => setActiveMistakeIndex(index)}
                        >
                          {mistakeTypeData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`${value} questions`, 'Count']} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                      <AlertCircle className="mr-2 h-4 w-4" /> No error type data available
                    </div>
                  )}
                </div>
                
                {mistakeTypeData.length > 0 && (
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {mistakeTypeData.slice(0, 4).map((mistake, index) => (
                      <div key={index} className="p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: mistake.color }}></span>
                          <h4 className="font-medium">{mistake.name}</h4>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {mistake.value} questions ({((mistake.value / mistakeTypeData.reduce((acc, item) => acc + item.value, 0)) * 100).toFixed(0)}%)
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
            
            {/* Attempted vs Unattempted */}
            <TabsContent value="attempted" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-800/50 p-4 rounded-xl border border-indigo-100 dark:border-indigo-900/30">
                  <h3 className="text-lg font-medium mb-2 text-blue-900 dark:text-blue-400">Attempt Rate</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    This chart shows the percentage of attempted vs. unattempted questions.
                  </p>
                  <div className="h-[300px] w-full">
                    {attemptedData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            activeIndex={activeTopicIndex}
                            activeShape={renderActiveShape}
                            data={attemptedData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            dataKey="value"
                            nameKey="name"
                            label
                            onMouseEnter={(_, index) => setActiveTopicIndex(index)}
                          >
                            {attemptedData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => [`${value} questions`, 'Count']} />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                        <AlertCircle className="mr-2 h-4 w-4" /> No attempt data available
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="bg-white dark:bg-gray-800/50 p-4 rounded-xl border border-indigo-100 dark:border-indigo-900/30">
                  <h3 className="text-lg font-medium mb-2 text-indigo-900 dark:text-indigo-400">Attempt Rate Summary</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    Key statistics about your attempt rate and completion.
                  </p>
                  <div className="flex flex-col h-full justify-center space-y-6">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">Attempted Questions</span>
                        <span className="text-sm font-medium">{summaryData.correct + summaryData.wrong + summaryData.partial}</span>
                      </div>
                      <Progress value={100} className="h-2" />
                    </div>
                    
                    {attemptedData[1].value > 0 && (
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">Unattempted Questions</span>
                          <span className="text-sm font-medium">{attemptedData[1].value}</span>
                        </div>
                        <Progress 
                          value={Math.round((attemptedData[1].value / (attemptedData[0].value + attemptedData[1].value)) * 100)} 
                          className="h-2" 
                        />
                      </div>
                    )}
                    
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-900/50">
                      <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">Attempt Rate</h4>
                      <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                        {attemptedData[1].value === 0 ? '100%' : Math.round((attemptedData[0].value / (attemptedData[0].value + attemptedData[1].value)) * 100) + '%'}
                      </div>
                      <p className="text-sm text-blue-700 dark:text-blue-300 opacity-80">
                        {attemptedData[1].value === 0 
                          ? 'Great job! You attempted all questions.' 
                          : 'Try to attempt all questions in your next test to maximize your score potential.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      {/* Detailed Question Analysis Section */}
      <Card className="overflow-hidden border-none shadow-lg">
        <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-b">
          <CardTitle className="text-xl">Question-by-Question Analysis</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {results?.evaluations?.map((evaluation: QuestionEvaluation, index) => {
              const isThink = evaluation.mistake_type === 'thinking' || 
                (Array.isArray(evaluation.mistake_type) && 
                 evaluation.mistake_type.includes('thinking'));
              
              return (
                <Card 
                  key={index} 
                  className={`overflow-hidden ${
                    isThink ? 'border-l-4 border-l-purple-500 animate-pulse' : ''
                  }`}
                >
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
                      <div className="flex items-center gap-2">
                        {isThink && (
                          <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-400 border border-purple-200 dark:border-purple-800">
                            Thinking
                          </Badge>
                        )}
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
                                <Badge key={i} variant="outline" className={`capitalize ${
                                  type === 'thinking' ? 'border-purple-500 text-purple-600 dark:text-purple-400 animate-pulse' : ''
                                }`}>
                                  {type}
                                </Badge>
                              ))
                            ) : (
                              <Badge 
                                variant="outline" 
                                className={`capitalize ${
                                  evaluation.mistake_type === 'thinking' ? 'border-purple-500 text-purple-600 dark:text-purple-400 animate-pulse' : ''
                                }`}
                              >
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
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TestResultsAnalysis;
