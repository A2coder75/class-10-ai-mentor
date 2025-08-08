import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Trophy, 
  Clock, 
  Target, 
  TrendingUp, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  BarChart3,
  PieChart,
  ChevronDown,
  ChevronUp,
  MessageSquare
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';

interface Evaluation {
  question_number: string;
  section: string;
  verdict: 'correct' | 'wrong';
  marks_awarded: number;
  mistake: string | string[];
  correct_answer: string[];
  mistake_type: string | string[];
}

interface TestResultsReviewProps {
  evaluations: Evaluation[];
  testName: string;
  timeTaken?: number;
}

const TestResultsReviewNew: React.FC<TestResultsReviewProps> = ({
  evaluations,
  testName,
  timeTaken
}) => {
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set());

  // Calculate totals from evaluations
  const totalMarks = evaluations.reduce((sum, evaluation) => sum + evaluation.marks_awarded, 0);
  const maxMarks = evaluations.length; // Assuming each question is worth 1 mark
  const percentage = Math.round((totalMarks / maxMarks) * 100);
  
  const correctAnswers = evaluations.filter(evaluation => evaluation.verdict === 'correct').length;
  const incorrectAnswers = evaluations.filter(evaluation => evaluation.verdict === 'wrong').length;
  const partialAnswers = 0; // No partial answers in this format

  // Calculate performance by section
  const sectionPerformance = evaluations.reduce((acc, evaluation) => {
    if (!acc[evaluation.section]) {
      acc[evaluation.section] = { correct: 0, total: 0, marks: 0, maxMarks: 0 };
    }
    acc[evaluation.section].total++;
    acc[evaluation.section].maxMarks += 1; // Assuming each question is worth 1 mark
    acc[evaluation.section].marks += evaluation.marks_awarded;
    if (evaluation.verdict === 'correct') acc[evaluation.section].correct++;
    return acc;
  }, {} as Record<string, any>);

  const sectionChartData = Object.entries(sectionPerformance).map(([section, data]: [string, any]) => ({
    topic: `Section ${section}`,
    percentage: Math.round((data.marks / data.maxMarks) * 100),
    fullTopic: `Section ${section}`
  }));

  const performanceDistribution = [
    { name: 'Correct', value: correctAnswers, color: 'hsl(var(--chart-1))' },
    { name: 'Incorrect', value: incorrectAnswers, color: 'hsl(var(--chart-2))' }
  ];

  // Calculate mistake type distribution
  const mistakeTypeData = evaluations
    .filter(evaluation => evaluation.verdict === 'wrong' && evaluation.mistake_type)
    .reduce((acc, evaluation) => {
      const types = Array.isArray(evaluation.mistake_type) ? evaluation.mistake_type : [evaluation.mistake_type];
      types.forEach(type => {
        if (type) {
          acc[type] = (acc[type] || 0) + 1;
        }
      });
      return acc;
    }, {} as Record<string, number>);

  const mistakeData = Object.entries(mistakeTypeData).map(([type, count]) => ({
    type: type.charAt(0).toUpperCase() + type.slice(1),
    count,
    percentage: Math.round((count / incorrectAnswers) * 100) || 0
  }));

  const toggleQuestion = (questionNumber: string) => {
    const newExpanded = new Set(expandedQuestions);
    if (newExpanded.has(questionNumber)) {
      newExpanded.delete(questionNumber);
    } else {
      newExpanded.add(questionNumber);
    }
    setExpandedQuestions(newExpanded);
  };

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600 dark:text-green-400';
    if (percentage >= 60) return 'text-amber-600 dark:text-amber-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getScoreBg = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800';
    if (percentage >= 60) return 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800';
    return 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800';
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Test Results</h1>
          <p className="text-muted-foreground">{testName}</p>
        </div>

        {/* Overall Score - Prominent Display */}
        <Card className={`${getScoreBg(percentage)} border-2`}>
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-center md:text-left">
                <div className="flex items-center gap-3 mb-2">
                  <Trophy className={`w-8 h-8 ${getScoreColor(percentage)}`} />
                  <span className="text-2xl font-bold text-foreground">Overall Score</span>
                </div>
                <div className={`text-6xl font-bold ${getScoreColor(percentage)}`}>
                  {percentage}%
                </div>
                <p className="text-muted-foreground mt-1">
                  {totalMarks} out of {maxMarks} marks
                </p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                <div className="space-y-1">
                  <div className="flex items-center justify-center gap-1 text-green-600">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="font-semibold">{correctAnswers}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Correct</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-center gap-1 text-amber-600">
                    <AlertCircle className="w-4 h-4" />
                    <span className="font-semibold">{partialAnswers}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Partial</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-center gap-1 text-red-600">
                    <XCircle className="w-4 h-4" />
                    <span className="font-semibold">{incorrectAnswers}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Incorrect</p>
                </div>
                {timeTaken && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span className="font-semibold">{timeTaken}m</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Time Taken</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performance Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Section Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Performance by Section
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={sectionChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                  <XAxis 
                    dataKey="topic" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))"
                    domain={[0, 100]}
                    fontSize={12}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px',
                      color: 'hsl(var(--foreground))'
                    }}
                    formatter={(value: any, name: any, props: any) => [
                      `${value}%`,
                      props.payload?.fullTopic || name
                    ]}
                  />
                  <Bar 
                    dataKey="percentage" 
                    fill="hsl(var(--primary))" 
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Performance Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="w-5 h-5" />
                Answer Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPieChart>
                  <Pie
                    data={performanceDistribution}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    dataKey="value"
                    label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                    labelLine={false}
                  >
                    {performanceDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px',
                      color: 'hsl(var(--foreground))'
                    }}
                  />
                </RechartsPieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Mistake Type Analysis */}
        {mistakeData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Common Mistake Types
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {mistakeData.map((data) => (
                  <div key={data.type} className="text-center p-4 rounded-lg border">
                    <div className="text-lg font-semibold mb-2">{data.type}</div>
                    <div className="text-3xl font-bold text-amber-600">
                      {data.count}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {data.percentage}% of errors
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Question-by-Question Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Question Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {evaluations.map((evaluation) => {
              const isCorrect = evaluation.verdict === 'correct';
              const isExpanded = expandedQuestions.has(evaluation.question_number);

              return (
                <div key={evaluation.question_number} className="border rounded-lg overflow-hidden">
                  <div 
                    className={`p-4 cursor-pointer transition-colors hover:bg-muted/50 ${
                      isCorrect ? 'border-l-4 border-l-green-500' : 'border-l-4 border-l-red-500'
                    }`}
                    onClick={() => toggleQuestion(evaluation.question_number)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="font-medium">Q{evaluation.question_number}</div>
                        {isCorrect ? (
                          <CheckCircle2 className="w-5 h-5 text-green-500" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-500" />
                        )}
                        <div className="flex gap-2">
                          <Badge variant="outline" className="text-xs">Section {evaluation.section}</Badge>
                          {evaluation.mistake_type && (
                            <Badge variant="secondary" className="text-xs">
                              {Array.isArray(evaluation.mistake_type) 
                                ? evaluation.mistake_type[0] 
                                : evaluation.mistake_type}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`font-semibold ${
                          isCorrect ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {evaluation.marks_awarded}/1
                        </span>
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="border-t bg-muted/25">
                      <div className="p-4 space-y-4">
                        {/* Question Number Info */}
                        <div>
                          <h4 className="font-medium mb-2">Question {evaluation.question_number}</h4>
                          <p className="text-sm text-muted-foreground">
                            Section {evaluation.section}
                          </p>
                        </div>

                        <Separator />

                        {/* Answer Status */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h4 className={`font-medium mb-2 ${
                              isCorrect ? 'text-green-600' : 'text-red-600'
                            }`}>
                              Result:
                            </h4>
                            <div className={`p-3 rounded-lg text-sm font-medium ${
                              isCorrect 
                                ? 'bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400' 
                                : 'bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400'
                            }`}>
                              {isCorrect ? 'Correct Answer' : 'Incorrect Answer'}
                            </div>
                          </div>
                          
                          {!isCorrect && evaluation.correct_answer.length > 0 && (
                            <div>
                              <h4 className="font-medium mb-2 text-green-600">
                                Correct Answer:
                              </h4>
                              <div className="p-3 rounded-lg text-sm bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800">
                                {evaluation.correct_answer.join(', ')}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Mistake Analysis */}
                        {!isCorrect && evaluation.mistake && (
                          <>
                            <Separator />
                            <div className="bg-amber-50 dark:bg-amber-950/30 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
                              <h4 className="font-medium mb-2 text-amber-600 flex items-center gap-2">
                                <AlertCircle className="w-4 h-4" />
                                Mistake Analysis:
                              </h4>
                              <p className="text-sm leading-relaxed">
                                {Array.isArray(evaluation.mistake) 
                                  ? evaluation.mistake.join('. ') 
                                  : evaluation.mistake}
                              </p>
                            </div>
                          </>
                        )}

                        {/* Mistake Type */}
                        {evaluation.mistake_type && (
                          <>
                            <Separator />
                            <div>
                              <h4 className="font-medium mb-2 text-blue-600">
                                Mistake Type:
                              </h4>
                              <div className="flex gap-2">
                                {(Array.isArray(evaluation.mistake_type) 
                                  ? evaluation.mistake_type 
                                  : [evaluation.mistake_type]
                                ).map((type, index) => (
                                  <Badge key={index} variant="secondary">
                                    {type.charAt(0).toUpperCase() + type.slice(1)}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TestResultsReviewNew;