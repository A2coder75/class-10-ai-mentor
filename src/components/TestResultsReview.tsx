import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Award, 
  Clock, 
  Target, 
  TrendingUp, 
  Brain, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  BookOpen,
  RotateCcw,
  Lightbulb,
  MessageSquare,
  BarChart3,
  PieChart,
  Radar as RadarIcon
} from 'lucide-react';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

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

const TestResultsReview: React.FC<TestResultsReviewProps> = ({
  totalMarks,
  maxMarks,
  timeTaken,
  questions,
  testName
}) => {
  const [selectedQuestion, setSelectedQuestion] = useState<number | null>(null);
  const [reflection, setReflection] = useState('');
  const [reflectionReasons, setReflectionReasons] = useState<string[]>([]);

  const percentage = Math.round((totalMarks / maxMarks) * 100);
  
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

  // Calculate performance stats
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

  const questionTypePerformance = questions.reduce((acc, q) => {
    if (!acc[q.type]) {
      acc[q.type] = { correct: 0, total: 0, marks: 0, maxMarks: 0 };
    }
    acc[q.type].total++;
    acc[q.type].maxMarks += q.maxMarks;
    acc[q.type].marks += q.marks;
    if (q.marks === q.maxMarks) acc[q.type].correct++;
    return acc;
  }, {} as Record<string, any>);

  const difficultyPerformance = questions.reduce((acc, q) => {
    if (!acc[q.difficulty]) {
      acc[q.difficulty] = { correct: 0, total: 0, marks: 0, maxMarks: 0 };
    }
    acc[q.difficulty].total++;
    acc[q.difficulty].maxMarks += q.maxMarks;
    acc[q.difficulty].marks += q.marks;
    if (q.marks === q.maxMarks) acc[q.difficulty].correct++;
    return acc;
  }, {} as Record<string, any>);

  const incorrectQuestions = questions.filter(q => q.marks < q.maxMarks);
  const attemptedCount = questions.filter(q => q.studentAnswer.trim() !== '').length;

  // Chart data
  const topicChartData = Object.entries(topicPerformance).map(([topic, data]: [string, any]) => ({
    topic,
    percentage: Math.round((data.marks / data.maxMarks) * 100)
  }));

  const questionTypeChartData = Object.entries(questionTypePerformance).map(([type, data]: [string, any]) => ({
    name: type,
    value: Math.round((data.marks / data.maxMarks) * 100),
    count: data.total
  }));

  const attemptedData = [
    { name: 'Attempted', value: attemptedCount, color: '#22c55e' },
    { name: 'Unattempted', value: questions.length - attemptedCount, color: '#ef4444' }
  ];

  const radarData = Object.entries(topicPerformance).map(([topic, data]: [string, any]) => ({
    subject: topic,
    A: Math.round((data.marks / data.maxMarks) * 100)
  }));

  const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6'];

  const reflectionOptions = [
    'Misread the question',
    'Forgot the concept',
    'Did not revise this topic',
    'Careless mistake',
    'Ran out of time',
    'Calculation error'
  ];

  const handleReflectionChange = (reason: string, checked: boolean) => {
    if (checked) {
      setReflectionReasons([...reflectionReasons, reason]);
    } else {
      setReflectionReasons(reflectionReasons.filter(r => r !== reason));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Test Results Review</h1>
          <p className="text-muted-foreground text-lg">{testName}</p>
        </div>

        {/* Score Summary */}
        <Card className="overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-500/10 to-purple-500/10">
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              Score Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center space-y-2">
                <div className="text-4xl font-bold text-primary">{percentage}%</div>
                <div className="text-sm text-muted-foreground">Overall Score</div>
                <Badge variant={percentage >= 80 ? 'default' : percentage >= 60 ? 'secondary' : 'destructive'}>
                  Grade: {getGrade(percentage)}
                </Badge>
              </div>
              <div className="text-center space-y-2">
                <div className="text-2xl font-semibold">{totalMarks}/{maxMarks}</div>
                <div className="text-sm text-muted-foreground">Total Marks</div>
                <Progress value={percentage} className="w-full" variant={percentage >= 80 ? 'success' : percentage >= 60 ? 'info' : 'danger'} />
              </div>
              <div className="text-center space-y-2">
                {timeTaken && (
                  <>
                    <div className="flex items-center justify-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span className="text-xl font-semibold">{timeTaken} min</span>
                    </div>
                    <div className="text-sm text-muted-foreground">Time Taken</div>
                  </>
                )}
                <div className="flex items-center justify-center gap-1 text-green-600">
                  <Target className="w-4 h-4" />
                  <span className="font-medium">{attemptedCount}/{questions.length} Attempted</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performance Charts */}
        <Tabs defaultValue="topics" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="topics" className="flex items-center gap-2">
              <RadarIcon className="w-4 h-4" />
              Topics
            </TabsTrigger>
            <TabsTrigger value="types" className="flex items-center gap-2">
              <PieChart className="w-4 h-4" />
              Question Types
            </TabsTrigger>
            <TabsTrigger value="difficulty" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Time Analysis
            </TabsTrigger>
            <TabsTrigger value="attempted" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Attempted
            </TabsTrigger>
          </TabsList>

          <TabsContent value="topics">
            <Card>
              <CardHeader>
                <CardTitle>Topic-wise Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} />
                    <Radar dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="types">
            <Card>
              <CardHeader>
                <CardTitle>Question Type Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={questionTypeChartData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}%`}
                    >
                      {questionTypeChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="difficulty">
            <Card>
              <CardHeader>
                <CardTitle>Time Spent Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(topicPerformance).map(([topic, data]: [string, any]) => {
                    const avgTimePerQuestion = Math.round((timeTaken || 0) * (data.total / questions.length));
                    const efficiency = Math.round((data.marks / data.maxMarks) * 100);
                    return (
                      <div key={topic} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">{topic}</span>
                            <span className="text-sm text-muted-foreground">{avgTimePerQuestion} min estimated</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="flex-1">
                              <div className="flex justify-between text-xs mb-1">
                                <span>Efficiency</span>
                                <span>{efficiency}%</span>
                              </div>
                              <Progress value={efficiency} className="h-2" variant={efficiency >= 80 ? 'success' : efficiency >= 60 ? 'info' : 'warning'} />
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-medium">{data.marks}/{data.maxMarks}</div>
                              <div className="text-xs text-muted-foreground">{data.total} questions</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="attempted">
            <Card>
              <CardHeader>
                <CardTitle>Attempted vs Unattempted</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={attemptedData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {attemptedData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Question-by-Question Review */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Question-by-Question Review
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {questions.map((question) => (
                <div 
                  key={question.id} 
                  className={`border rounded-lg p-4 transition-all hover:shadow-md cursor-pointer ${
                    selectedQuestion === question.id ? 'border-primary bg-primary/5' : ''
                  }`}
                  onClick={() => setSelectedQuestion(selectedQuestion === question.id ? null : question.id)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Q{question.id}</span>
                      {question.marks === question.maxMarks ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : question.marks > 0 ? (
                        <AlertCircle className="w-4 h-4 text-amber-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-500" />
                      )}
                      <Badge variant="outline">{question.type}</Badge>
                      <Badge variant="secondary">{question.difficulty}</Badge>
                      <Badge variant="outline">{question.topic}</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`font-medium ${
                        question.marks === question.maxMarks ? 'text-green-600' : 
                        question.marks > 0 ? 'text-amber-600' : 'text-red-600'
                      }`}>
                        {question.marks}/{question.maxMarks}
                      </span>
                    </div>
                  </div>
                  
                  {selectedQuestion === question.id && (
                    <div className="mt-4 space-y-4 border-t pt-4">
                      <div>
                        <h4 className="font-medium mb-2">Question:</h4>
                        <p className="text-sm text-muted-foreground">{question.question}</p>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium mb-2 text-red-600">Your Answer:</h4>
                          <p className="text-sm p-2 bg-red-50 dark:bg-red-900/20 rounded border">
                            {question.studentAnswer || "Not attempted"}
                          </p>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2 text-green-600">Correct Answer:</h4>
                          <p className="text-sm p-2 bg-green-50 dark:bg-green-900/20 rounded border">
                            {question.correctAnswer}
                          </p>
                        </div>
                      </div>
                      
                      {question.mistakes && question.mistakes.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-2 flex items-center gap-2">
                            <Brain className="w-4 h-4" />
                            Common Mistakes:
                          </h4>
                          <ul className="list-disc list-inside text-sm space-y-1">
                            {question.mistakes.map((mistake, index) => (
                              <li key={index} className="text-muted-foreground">{mistake}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {question.feedback && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                          <h4 className="font-medium mb-2 flex items-center gap-2 text-blue-600">
                            <Lightbulb className="w-4 h-4" />
                            AI Feedback:
                          </h4>
                          <p className="text-sm">{question.feedback}</p>
                        </div>
                      )}
                      
                      {question.marks < question.maxMarks && (
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="flex items-center gap-2">
                            <BookOpen className="w-4 h-4" />
                            Study This Topic
                          </Button>
                          <Button variant="outline" size="sm" className="flex items-center gap-2">
                            <RotateCcw className="w-4 h-4" />
                            Practice Similar
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Learning Insights & Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5" />
                Learning Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Top 3 Areas to Improve:</h4>
                  <ul className="space-y-2">
                    {Object.entries(topicPerformance)
                      .sort(([,a], [,b]) => (a.marks/a.maxMarks) - (b.marks/b.maxMarks))
                      .slice(0, 3)
                      .map(([topic, data]: [string, any]) => (
                        <li key={topic} className="flex items-center justify-between p-2 bg-muted rounded">
                          <span className="text-sm">{topic}</span>
                          <Badge variant="destructive">{Math.round((data.marks/data.maxMarks) * 100)}%</Badge>
                        </li>
                      ))}
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Tips for Next Test:</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Review topics with lowest scores first</li>
                    <li>• Practice more {Object.entries(questionTypePerformance)
                      .sort(([,a], [,b]) => (a.marks/a.maxMarks) - (b.marks/b.maxMarks))[0][0]} questions</li>
                    <li>• Spend extra time on {Object.entries(difficultyPerformance)
                      .sort(([,a], [,b]) => (a.marks/a.maxMarks) - (b.marks/b.maxMarks))[0][0]} level problems</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button className="w-full justify-start" variant="outline">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Retake Incorrect Questions ({incorrectQuestions.length})
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Practice Weak Topics
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  View Study Recommendations
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Reflection */}
        <Card>
          <CardHeader>
            <CardTitle>Reflection & Learning</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Why do you think you got some questions wrong?</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {reflectionOptions.map((option) => (
                    <div key={option} className="flex items-center space-x-2">
                      <Checkbox 
                        id={option}
                        checked={reflectionReasons.includes(option)}
                        onCheckedChange={(checked) => handleReflectionChange(option, checked as boolean)}
                      />
                      <label htmlFor={option} className="text-sm">{option}</label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Additional thoughts:</h4>
                <Textarea 
                  placeholder="What did you learn from this test? What will you do differently next time?"
                  value={reflection}
                  onChange={(e) => setReflection(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
              
              <Button className="w-full md:w-auto">
                Save Reflection
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TestResultsReview;