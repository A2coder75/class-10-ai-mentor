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

interface Question {
  id: number;
  question: string;
  studentAnswer: string;
  correctAnswer: string;
  marks: number;
  maxMarks: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  type: 'MCQ' | 'Short Answer' | 'Long Answer';
  topic: string;
  mistakes?: string[];
  feedback?: string;
}

interface TestResultsReviewProps {
  totalMarks: number;
  maxMarks: number;
  timeTaken?: number;
  questions: Question[];
  testName: string;
}

const TestResultsReviewNew: React.FC<TestResultsReviewProps> = ({
  totalMarks,
  maxMarks,
  timeTaken,
  questions,
  testName
}) => {
  const [expandedQuestions, setExpandedQuestions] = useState<Set<number>>(new Set());

  const percentage = Math.round((totalMarks / maxMarks) * 100);
  const correctAnswers = questions.filter(q => q.marks === q.maxMarks).length;
  const partialAnswers = questions.filter(q => q.marks > 0 && q.marks < q.maxMarks).length;
  const incorrectAnswers = questions.filter(q => q.marks === 0).length;

  // Calculate performance by topic
  const topicPerformance = questions.reduce((acc, q) => {
    if (!acc[q.topic]) {
      acc[q.topic] = { correct: 0, total: 0, marks: 0, maxMarks: 0 };
    }
    acc[q.topic].total++;
    acc[q.topic].maxMarks += q.maxMarks;
    acc[q.topic].marks += q.marks;
    if (q.marks === q.maxMarks) acc[q.topic].correct++;
    return acc;
  }, {} as Record<string, any>);

  const topicChartData = Object.entries(topicPerformance).map(([topic, data]: [string, any]) => ({
    topic: topic.length > 12 ? topic.substring(0, 12) + '...' : topic,
    percentage: Math.round((data.marks / data.maxMarks) * 100),
    fullTopic: topic
  }));

  const performanceDistribution = [
    { name: 'Correct', value: correctAnswers, color: 'hsl(var(--success))' },
    { name: 'Partial', value: partialAnswers, color: 'hsl(var(--warning))' },
    { name: 'Incorrect', value: incorrectAnswers, color: 'hsl(var(--destructive))' }
  ];

  const difficultyData = ['Easy', 'Medium', 'Hard'].map(difficulty => {
    const diffQuestions = questions.filter(q => q.difficulty === difficulty);
    const diffCorrect = diffQuestions.filter(q => q.marks === q.maxMarks).length;
    return {
      difficulty,
      percentage: diffQuestions.length > 0 ? Math.round((diffCorrect / diffQuestions.length) * 100) : 0,
      total: diffQuestions.length
    };
  });

  const toggleQuestion = (questionId: number) => {
    const newExpanded = new Set(expandedQuestions);
    if (newExpanded.has(questionId)) {
      newExpanded.delete(questionId);
    } else {
      newExpanded.add(questionId);
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
          {/* Topic Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Performance by Topic
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topicChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
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

        {/* Difficulty Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Performance by Difficulty
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {difficultyData.map((data) => (
                <div key={data.difficulty} className="text-center p-4 rounded-lg border">
                  <div className="text-lg font-semibold mb-2">{data.difficulty}</div>
                  <div className={`text-3xl font-bold ${getScoreColor(data.percentage)}`}>
                    {data.percentage}%
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {data.total} questions
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Question-by-Question Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Question Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {questions.map((question) => {
              const isCorrect = question.marks === question.maxMarks;
              const isPartial = question.marks > 0 && question.marks < question.maxMarks;
              const isIncorrect = question.marks === 0;
              const isExpanded = expandedQuestions.has(question.id);

              return (
                <div key={question.id} className="border rounded-lg overflow-hidden">
                  <div 
                    className={`p-4 cursor-pointer transition-colors hover:bg-muted/50 ${
                      isCorrect ? 'border-l-4 border-l-green-500' :
                      isPartial ? 'border-l-4 border-l-amber-500' :
                      'border-l-4 border-l-red-500'
                    }`}
                    onClick={() => toggleQuestion(question.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="font-medium">Q{question.id}</div>
                        {isCorrect ? (
                          <CheckCircle2 className="w-5 h-5 text-green-500" />
                        ) : isPartial ? (
                          <AlertCircle className="w-5 h-5 text-amber-500" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-500" />
                        )}
                        <div className="flex gap-2">
                          <Badge variant="outline" className="text-xs">{question.topic}</Badge>
                          <Badge variant="secondary" className="text-xs">{question.difficulty}</Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`font-semibold ${
                          isCorrect ? 'text-green-600' :
                          isPartial ? 'text-amber-600' :
                          'text-red-600'
                        }`}>
                          {question.marks}/{question.maxMarks}
                        </span>
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="border-t bg-muted/25">
                      <div className="p-4 space-y-4">
                        {/* Question Text */}
                        <div>
                          <h4 className="font-medium mb-2">Question:</h4>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {question.question}
                          </p>
                        </div>

                        <Separator />

                        {/* Answer Comparison */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h4 className={`font-medium mb-2 ${
                              isCorrect ? 'text-green-600' : 'text-red-600'
                            }`}>
                              Your Answer:
                            </h4>
                            <div className={`p-3 rounded-lg text-sm ${
                              isCorrect ? 'bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800' :
                              'bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800'
                            }`}>
                              {question.studentAnswer.trim() || "Not attempted"}
                            </div>
                          </div>
                          
                          {!isCorrect && (
                            <div>
                              <h4 className="font-medium mb-2 text-green-600">
                                Correct Answer:
                              </h4>
                              <div className="p-3 rounded-lg text-sm bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800">
                                {question.correctAnswer}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* AI Feedback */}
                        {question.feedback && (
                          <>
                            <Separator />
                            <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                              <h4 className="font-medium mb-2 text-blue-600 flex items-center gap-2">
                                <MessageSquare className="w-4 h-4" />
                                AI Feedback:
                              </h4>
                              <p className="text-sm leading-relaxed">{question.feedback}</p>
                            </div>
                          </>
                        )}

                        {/* Common Mistakes */}
                        {question.mistakes && question.mistakes.length > 0 && (
                          <>
                            <Separator />
                            <div>
                              <h4 className="font-medium mb-2 text-amber-600">
                                Common Mistakes:
                              </h4>
                              <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
                                {question.mistakes.map((mistake, index) => (
                                  <li key={index}>{mistake}</li>
                                ))}
                              </ul>
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