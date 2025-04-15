
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, TooltipProps } from "recharts";
import { TestResult, Question, QuestionEvaluation } from "../types/index.d";
import QuestionCard from "./QuestionCard";
import { CheckCircle, XCircle, BarChart3, PieChartIcon, ClipboardList, AlignLeft, AlertTriangle, BadgeCheck, BadgeX } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";

interface TestResultsAnalysisProps {
  testResults: TestResult;
  questions: Question[];
  evaluations: QuestionEvaluation[];
  answers: {[key: string]: string | string[]};
}

const TestResultsAnalysis: React.FC<TestResultsAnalysisProps> = ({
  testResults,
  questions,
  evaluations,
  answers
}) => {
  // Type-based performance data
  const questionTypeData = React.useMemo(() => {
    const typeStats: {[key: string]: {correct: number, incorrect: number, total: number}} = {};
    
    questions.forEach(question => {
      if (question.type === "question") return;
      
      const type = question.type || "other";
      if (!typeStats[type]) {
        typeStats[type] = {correct: 0, incorrect: 0, total: 0};
      }
      
      const evaluation = evaluations.find(e => 
        e.question_number === (question.question_number || question.id)
      );
      
      if (evaluation) {
        typeStats[type].total++;
        if (evaluation.marks_awarded === evaluation.total_marks) {
          typeStats[type].correct++;
        } else {
          typeStats[type].incorrect++;
        }
      }
    });
    
    return Object.entries(typeStats).map(([type, stats]) => ({
      name: type === "mcq" ? "Multiple Choice" : 
            type === "descriptive" ? "Descriptive" : 
            type === "fill_in_blank" ? "Fill in Blank" : 
            type === "numerical" ? "Numerical" :
            type.charAt(0).toUpperCase() + type.slice(1),
      correct: stats.correct,
      incorrect: stats.incorrect,
      total: stats.total,
      percentage: Math.round((stats.correct / stats.total) * 100) || 0
    }));
  }, [questions, evaluations]);
  
  // Overall performance data for pie chart
  const pieChartData = React.useMemo(() => [
    { name: "Correct", value: evaluations.filter(e => e.marks_awarded === e.total_marks).length },
    { name: "Incorrect", value: evaluations.filter(e => e.marks_awarded !== e.total_marks).length }
  ], [evaluations]);

  // Mistake types data for analysis
  const mistakeTypesData = React.useMemo(() => {
    const mistakeTypes: {[key: string]: number} = {};
    
    evaluations.forEach(evalItem => {
      if (evalItem.marks_awarded < evalItem.total_marks && evalItem.mistake_type) {
        const mistakeTypeArray = Array.isArray(evalItem.mistake_type) ? 
                               evalItem.mistake_type : 
                               [evalItem.mistake_type];
                               
        mistakeTypeArray.forEach(type => {
          if (type) {
            mistakeTypes[type] = (mistakeTypes[type] || 0) + 1;
          }
        });
      }
    });
    
    return Object.entries(mistakeTypes).map(([type, count]) => ({
      name: type.charAt(0).toUpperCase() + type.slice(1),
      value: count
    }));
  }, [evaluations]);

  // Section performance data
  const sectionPerformanceData = React.useMemo(() => {
    return Object.entries(testResults.sectionScores).map(([section, data]) => ({
      name: `Section ${section}`,
      score: data.score,
      total: data.total,
      percentage: Math.round((data.score / data.total) * 100)
    }));
  }, [testResults]);

  // Group questions by section
  const sectionQuestions = React.useMemo(() => {
    const grouped: {[key: string]: Question[]} = {};
    
    questions.forEach(q => {
      if (q.type !== "question") {
        if (!grouped[q.section || '']) {
          grouped[q.section || ''] = [];
        }
        grouped[q.section || ''].push(q);
      }
    });
    
    Object.keys(grouped).forEach(section => {
      grouped[section].sort((a, b) => {
        if (a.question_number && b.question_number) {
          return a.question_number.localeCompare(b.question_number, undefined, { numeric: true });
        }
        return 0;
      });
    });
    
    return grouped;
  }, [questions]);

  // Only show questions that have been attempted
  const attemptedQuestions = React.useMemo(() => {
    return questions.filter(question => {
      const questionId = question.id || question.question_number || "";
      return question.type !== "question" && answers[questionId] !== undefined;
    });
  }, [questions, answers]);

  // Find evaluation for a question
  const findEvaluation = (question: Question): QuestionEvaluation | undefined => {
    return evaluations.find(e => 
      e.question_number === (question.question_number || question.id)
    );
  };

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }: TooltipProps<any, any>) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border/60 p-3 rounded-lg shadow-md">
          <p className="text-sm font-medium mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={`item-${index}`} className="flex items-center gap-2 text-xs">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.fill }}
              />
              <span className="font-medium">{entry.name}:</span>
              <span>{entry.value}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  // Colors for charts
  const COLORS = {
    correct: '#10B981',
    incorrect: '#EF4444',
    neutral: '#6366F1',
    section1: '#3B82F6',
    section2: '#8B5CF6',
    section3: '#EC4899'
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="questions" className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4" />
            All Questions
          </TabsTrigger>
          <TabsTrigger value="charts" className="flex items-center gap-2">
            <PieChartIcon className="h-4 w-4" />
            Charts
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="pt-6">
          {/* Overall Score Summary */}
          <Card className="mb-6 overflow-hidden shadow-lg border border-primary/10 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
            <div className="h-1.5 bg-gradient-to-r from-blue-600 via-violet-600 to-purple-600"></div>
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl font-bold">Test Results</CardTitle>
                  <CardDescription>Your overall performance</CardDescription>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                    {Math.round((testResults.totalScore / testResults.maxScore) * 100)}%
                  </div>
                  <div className="text-muted-foreground text-sm">
                    {testResults.totalScore}/{testResults.maxScore} points
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div>Total Score</div>
                    <div className="font-medium">{testResults.totalScore}/{testResults.maxScore}</div>
                  </div>
                  <Progress 
                    value={(testResults.totalScore / testResults.maxScore) * 100} 
                    className="h-2.5" 
                    indicatorClassName={
                      `${(testResults.totalScore / testResults.maxScore) * 100 >= 70 ? 'bg-green-500' : 
                      (testResults.totalScore / testResults.maxScore) * 100 >= 40 ? 'bg-amber-500' : 'bg-red-500'}`
                    }
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <div className="text-sm">Correct Answers</div>
                    </div>
                    <div className="text-2xl font-bold">{pieChartData[0].value}</div>
                    <div className="text-sm text-muted-foreground">
                      out of {pieChartData[0].value + pieChartData[1].value} questions
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <div className="text-sm">Incorrect Answers</div>
                    </div>
                    <div className="text-2xl font-bold">{pieChartData[1].value}</div>
                    <div className="text-sm text-muted-foreground">
                      Marks lost: {testResults.maxScore - testResults.totalScore}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Section-wise Performance */}
            <Card className="overflow-hidden shadow-lg border border-blue-500/10">
              <div className="h-1.5 bg-gradient-to-r from-blue-500 via-blue-400 to-blue-300"></div>
              <CardHeader className="pb-2">
                <CardTitle className="text-xl font-semibold">Section Performance</CardTitle>
                <CardDescription>
                  How well you did in each section
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-4">
                  {Object.entries(testResults.sectionScores).map(([section, data], index) => (
                    <div key={section} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <div className="font-medium">Section {section}</div>
                        <div>{data.score}/{data.total} ({Math.round((data.score / data.total) * 100)}%)</div>
                      </div>
                      <Progress 
                        value={(data.score / data.total) * 100} 
                        className="h-2" 
                        indicatorClassName={
                          index === 0 ? 'bg-blue-500' : 
                          index === 1 ? 'bg-purple-500' : 
                          'bg-pink-500'
                        }
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            {/* Question Types Performance */}
            <Card className="overflow-hidden shadow-lg border border-purple-500/10">
              <div className="h-1.5 bg-gradient-to-r from-purple-500 via-purple-400 to-purple-300"></div>
              <CardHeader className="pb-2">
                <CardTitle className="text-xl font-semibold">Question Types</CardTitle>
                <CardDescription>
                  Performance by question format
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-4">
                  {questionTypeData.map((item, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <div className="font-medium">{item.name}</div>
                        <div>{item.correct}/{item.total} ({item.percentage}%)</div>
                      </div>
                      <div className="flex h-2 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
                        <div 
                          className="bg-green-500" 
                          style={{width: `${(item.correct / item.total) * 100}%`}}
                        ></div>
                        <div 
                          className="bg-red-500" 
                          style={{width: `${(item.incorrect / item.total) * 100}%`}}
                        ></div>
                      </div>
                      <div className="flex text-xs text-muted-foreground justify-between">
                        <span>Correct: {item.correct}</span>
                        <span>Incorrect: {item.incorrect}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            {/* Mistake Analysis */}
            {mistakeTypesData.length > 0 && (
              <Card className="md:col-span-2 overflow-hidden shadow-lg border border-amber-500/10">
                <div className="h-1.5 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-300"></div>
                <CardHeader className="pb-2 flex flex-row items-start justify-between">
                  <div>
                    <CardTitle className="text-xl font-semibold flex items-center">
                      <AlertTriangle className="h-5 w-5 mr-2 text-amber-500" />
                      Mistake Analysis
                    </CardTitle>
                    <CardDescription>
                      Areas for improvement based on your errors
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {mistakeTypesData.map((mistake, index) => (
                      <div 
                        key={index} 
                        className="flex items-center p-4 rounded-lg border border-amber-200/50 dark:border-amber-800/50 bg-amber-50/50 dark:bg-amber-950/30"
                      >
                        <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900 flex items-center justify-center mr-4">
                          <span className="text-lg font-bold text-amber-600 dark:text-amber-400">{mistake.value}</span>
                        </div>
                        <div>
                          <div className="font-medium">{mistake.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {mistake.value} {mistake.value === 1 ? 'question' : 'questions'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="bg-muted/30 py-3">
                  <span className="text-xs text-muted-foreground flex items-center">
                    <AlignLeft className="h-3 w-3 mr-1" />
                    Focus on improving areas with the highest count of mistakes
                  </span>
                </CardFooter>
              </Card>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="questions" className="pt-6">
          <div className="space-y-6">
            <Card className="border-none shadow-lg overflow-hidden">
              <div className="h-1.5 bg-gradient-to-r from-indigo-500 via-indigo-400 to-indigo-300"></div>
              <CardHeader className="bg-gradient-to-r from-indigo-500/10 to-indigo-600/5">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl font-semibold">Detailed Question Review</CardTitle>
                    <CardDescription>
                      Review your performance on each question with AI feedback
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="flex items-center text-sm font-medium text-green-500">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Correct: {pieChartData[0].value}
                    </span>
                    <span className="flex items-center text-sm font-medium text-red-500">
                      <XCircle className="h-4 w-4 mr-1" />
                      Incorrect: {pieChartData[1].value}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[140px]">Question</TableHead>
                      <TableHead>Your Answer</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">AI Feedback</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Object.entries(sectionQuestions).sort().map(([section, sectionQuestions]) => {
                      // Filter questions that have been attempted
                      const attemptedSectionQuestions = sectionQuestions.filter(q => {
                        const questionId = q.id || q.question_number || "";
                        return answers[questionId] !== undefined;
                      });
                      
                      if (attemptedSectionQuestions.length === 0) return null;
                      
                      return (
                        <React.Fragment key={section}>
                          <TableRow className="bg-muted/30">
                            <TableCell colSpan={4} className="font-medium">Section {section}</TableCell>
                          </TableRow>
                          {attemptedSectionQuestions.map(question => {
                            const evaluation = findEvaluation(question);
                            if (!evaluation) return null;
                            
                            const isCorrect = evaluation.marks_awarded === evaluation.total_marks;
                            const studentAnswer = answers[question.id || question.question_number || ""] || "";
                            
                            return (
                              <TableRow key={question.id || question.question_number} className="hover:bg-muted/20 transition-colors">
                                <TableCell className="font-medium">{question.question_number}</TableCell>
                                <TableCell 
                                  className={`max-w-[200px] truncate ${isCorrect ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}
                                >
                                  {typeof studentAnswer === 'string' ? studentAnswer : studentAnswer.join(', ')}
                                </TableCell>
                                <TableCell>
                                  {isCorrect ? (
                                    <div className="flex items-center text-green-500">
                                      <BadgeCheck className="mr-1 h-4 w-4" />
                                      <span>Correct</span>
                                    </div>
                                  ) : (
                                    <div className="flex items-center text-red-500">
                                      <BadgeX className="mr-1 h-4 w-4" />
                                      <span>Incorrect</span>
                                    </div>
                                  )}
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex justify-end">
                                    {isCorrect ? (
                                      <span className="text-sm text-muted-foreground">
                                        {evaluation.final_feedback || "Correct answer"}
                                      </span>
                                    ) : (
                                      <div className="flex flex-col items-end">
                                        {evaluation.mistake && (
                                          <span className="text-sm text-red-500/80 mb-1">
                                            {Array.isArray(evaluation.mistake) 
                                              ? evaluation.mistake.join(', ') 
                                              : evaluation.mistake}
                                          </span>
                                        )}
                                        {evaluation.correct_answer && (
                                          <span className="text-xs text-green-600 dark:text-green-400">
                                            Correct: {Array.isArray(evaluation.correct_answer) 
                                              ? evaluation.correct_answer.join(', ') 
                                              : evaluation.correct_answer}
                                          </span>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </React.Fragment>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
            
            <div className="space-y-8">
              {attemptedQuestions.map(question => {
                const evaluation = findEvaluation(question);
                if (!evaluation) return null;
                
                return (
                  <QuestionCard
                    key={question.id || question.question_number}
                    question={question}
                    onAnswerChange={() => {}}
                    studentAnswer={answers[question.id || question.question_number || ""]}
                    showResults={true}
                    evaluation={evaluation}
                  />
                );
              })}
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="charts" className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Correct vs Incorrect Chart */}
            <Card className="overflow-hidden shadow-lg border border-primary/10">
              <div className="h-1.5 bg-gradient-to-r from-blue-500 via-blue-400 to-blue-300"></div>
              <CardHeader className="pb-2">
                <CardTitle className="text-xl font-semibold">Correct vs Incorrect</CardTitle>
                <CardDescription>
                  Distribution of correct and incorrect answers
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                        nameKey="name"
                        label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        labelLine={{ stroke: 'var(--foreground)', strokeOpacity: 0.3, strokeWidth: 1 }}
                        animationDuration={1000}
                        animationBegin={200}
                      >
                        <Cell fill={COLORS.correct} stroke="var(--background)" strokeWidth={2} />
                        <Cell fill={COLORS.incorrect} stroke="var(--background)" strokeWidth={2} />
                      </Pie>
                      <Tooltip
                        content={<CustomTooltip />}
                        wrapperStyle={{ outline: 'none' }}
                      />
                      <Legend 
                        verticalAlign="bottom"
                        formatter={(value) => <span className="text-sm font-medium">{value}</span>}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="mt-4 flex items-center justify-center gap-6">
                  <div className="flex items-center p-2 rounded-md bg-green-50 dark:bg-green-950/30 border border-green-100 dark:border-green-900">
                    <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                    <span className="text-green-700 dark:text-green-300">Correct: {pieChartData[0].value}</span>
                  </div>
                  <div className="flex items-center p-2 rounded-md bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900">
                    <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                    <span className="text-red-700 dark:text-red-300">Incorrect: {pieChartData[1].value}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Section Performance Chart */}
            <Card className="overflow-hidden shadow-lg border border-primary/10">
              <div className="h-1.5 bg-gradient-to-r from-purple-500 via-purple-400 to-purple-300"></div>
              <CardHeader className="pb-2">
                <CardTitle className="text-xl font-semibold">Section Performance</CardTitle>
                <CardDescription>
                  Your scores by section
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart 
                      data={sectionPerformanceData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
                      barGap={0}
                      barCategoryGap="20%"
                    >
                      <XAxis 
                        dataKey="name" 
                        tick={{ fontSize: 12 }}
                        axisLine={{ stroke: 'var(--border)' }}
                        tickLine={{ stroke: 'var(--border)' }}
                      />
                      <YAxis 
                        axisLine={{ stroke: 'var(--border)' }}
                        tickLine={{ stroke: 'var(--border)' }}
                        tick={{ fontSize: 12 }}
                      />
                      <Tooltip
                        content={<CustomTooltip />}
                        wrapperStyle={{ outline: 'none' }}
                        cursor={{ fill: 'var(--muted)', opacity: 0.1 }}
                      />
                      <Legend 
                        verticalAlign="top" 
                        height={36}
                        formatter={(value) => <span className="text-sm font-medium">{value === "score" ? "Your Score" : "Total Available"}</span>}
                      />
                      <Bar 
                        dataKey="score" 
                        name="Your Score" 
                        fill={COLORS.correct}
                        radius={[4, 4, 0, 0]}
                        animationDuration={1000}
                        animationBegin={0}
                      />
                      <Bar 
                        dataKey="total" 
                        name="Total Available" 
                        fill={COLORS.neutral}
                        radius={[4, 4, 0, 0]}
                        animationDuration={1000}
                        animationBegin={200}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
              <CardFooter className="bg-muted/30 py-3">
                <span className="text-xs text-muted-foreground">
                  Highest score: {Math.max(...sectionPerformanceData.map(item => item.percentage))}% in {
                    sectionPerformanceData.reduce((acc, curr) => 
                      curr.percentage > (acc?.percentage || 0) ? curr : acc, 
                      { name: '', percentage: 0 }
                    ).name
                  }
                </span>
              </CardFooter>
            </Card>

            {/* Question Types Chart */}
            <Card className="overflow-hidden shadow-lg border border-primary/10 md:col-span-2">
              <div className="h-1.5 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-300"></div>
              <CardHeader className="pb-2">
                <CardTitle className="text-xl font-semibold">Question Type Analysis</CardTitle>
                <CardDescription>
                  Performance across different question formats
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart 
                      data={questionTypeData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
                      barGap={0}
                      barCategoryGap="20%"
                    >
                      <XAxis 
                        dataKey="name" 
                        tick={{ fontSize: 12 }}
                        axisLine={{ stroke: 'var(--border)' }}
                        tickLine={{ stroke: 'var(--border)' }}
                      />
                      <YAxis 
                        axisLine={{ stroke: 'var(--border)' }}
                        tickLine={{ stroke: 'var(--border)' }}
                        tick={{ fontSize: 12 }}
                      />
                      <Tooltip
                        content={<CustomTooltip />}
                        wrapperStyle={{ outline: 'none' }}
                        cursor={{ fill: 'var(--muted)', opacity: 0.1 }}
                      />
                      <Legend 
                        verticalAlign="top" 
                        height={36}
                        formatter={(value) => <span className="text-sm font-medium">{value === "correct" ? "Correct" : "Incorrect"}</span>}
                      />
                      <Bar 
                        dataKey="correct" 
                        name="Correct" 
                        stackId="a"
                        fill={COLORS.correct}
                        radius={[4, 0, 0, 0]}
                        animationDuration={1000}
                        animationBegin={0}
                      />
                      <Bar 
                        dataKey="incorrect" 
                        name="Incorrect" 
                        stackId="a"
                        fill={COLORS.incorrect}
                        radius={[0, 4, 0, 0]}
                        animationDuration={1000}
                        animationBegin={200}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
              <CardFooter className="bg-muted/30 py-3 flex justify-between">
                <span className="text-xs text-muted-foreground">
                  Best performance in: {questionTypeData.reduce((acc, curr) => 
                    curr.percentage > (acc?.percentage || 0) ? curr : acc, 
                    { name: '', percentage: 0 }
                  ).name} ({questionTypeData.reduce((acc, curr) => 
                    curr.percentage > (acc?.percentage || 0) ? curr : acc, 
                    { name: '', percentage: 0 }
                  ).percentage}%)
                </span>
                <span className="text-xs text-muted-foreground">
                  Needs improvement: {questionTypeData.reduce((acc, curr) => 
                    curr.percentage < (acc?.percentage || 100) && curr.total > 0 ? curr : acc, 
                    { name: '', percentage: 100 }
                  ).name} ({questionTypeData.reduce((acc, curr) => 
                    curr.percentage < (acc?.percentage || 100) && curr.total > 0 ? curr : acc, 
                    { name: '', percentage: 100 }
                  ).percentage}%)
                </span>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TestResultsAnalysis;
