
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { TestResult, Question, QuestionEvaluation } from "../types";
import QuestionCard from "./QuestionCard";
import { CheckCircle, XCircle, BarChart3, PieChartIcon, ClipboardList, AlertTriangle, BadgeCheck, BadgeX, AlignLeft } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

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
        if (evaluation.marks_awarded === (evaluation.total_marks || 1)) {
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
      percentage: Math.round((stats.correct / stats.total) * 100)
    }));
  }, [questions, evaluations]);
  
  const pieChartData = React.useMemo(() => [
    { name: "Correct", value: evaluations.filter(e => e.marks_awarded === (e.total_marks || 1)).length },
    { name: "Incorrect", value: evaluations.filter(e => e.marks_awarded !== (e.total_marks || 1)).length }
  ], [evaluations]);

  const mistakeTypesData = React.useMemo(() => {
    const mistakeTypes: {[key: string]: number} = {};
    
    evaluations.forEach(evalItem => {
      if (evalItem.marks_awarded === 0 && evalItem.mistake_type) {
        const mistakeTypeArray = Array.isArray(evalItem.mistake_type) ? 
                               evalItem.mistake_type : 
                               [evalItem.mistake_type];
                               
        mistakeTypeArray.forEach(type => {
          if (type) {
            const formattedType = type.charAt(0).toUpperCase() + type.slice(1);
            mistakeTypes[formattedType] = (mistakeTypes[formattedType] || 0) + 1;
          }
        });
      }
    });
    
    return Object.entries(mistakeTypes).map(([type, count]) => ({
      name: type,
      value: count
    }));
  }, [evaluations]);

  const sectionPerformanceData = React.useMemo(() => {
    return Object.entries(testResults.sectionScores).map(([section, data]) => ({
      name: `Section ${section}`,
      score: data.score,
      total: data.total,
      percentage: Math.round((data.score / data.total) * 100)
    }));
  }, [testResults]);

  const COLORS = ['#10B981', '#EF4444', '#F59E0B', '#6366F1'];
  const TYPE_COLORS = {
    correct: '#10B981',
    incorrect: '#EF4444'
  };

  const findEvaluation = (question: Question): QuestionEvaluation | undefined => {
    return evaluations.find(e => 
      e.question_number === (question.question_number || question.id)
    );
  };

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

  // Function to get correct answer display from question and evaluation
  const getCorrectAnswer = (question: Question, evaluation?: QuestionEvaluation): string => {
    // First try to get from the question itself
    if (question.correct_answer) {
      return Array.isArray(question.correct_answer) 
        ? question.correct_answer.join(", ")
        : question.correct_answer;
    }
    
    if (question.correctAnswer) {
      return Array.isArray(question.correctAnswer) 
        ? question.correctAnswer.join(", ")
        : question.correctAnswer.toString();
    }
    
    // Then try from evaluation
    if (evaluation?.correct_answer) {
      return Array.isArray(evaluation.correct_answer)
        ? evaluation.correct_answer.join(", ")
        : evaluation.correct_answer;
    }
    
    // For MCQ, we can derive from options if we have the correctAnswer index
    if (question.type === "mcq" && question.options && question.options.length > 0) {
      // Try to find the correct option
      const correctIndex = question.correctAnswer ? 
        (typeof question.correctAnswer === 'string' 
          ? question.correctAnswer.charCodeAt(0) - 97 // 'a' -> 0, 'b' -> 1, etc.
          : parseInt(question.correctAnswer.toString()) - 1) 
        : -1;
      
      if (correctIndex >= 0 && correctIndex < question.options.length) {
        return question.options[correctIndex];
      }
    }
    
    return "Not available";
  };

  // Function to get max marks from question or evaluation
  const getMaxMarks = (question: Question, evaluation?: QuestionEvaluation): number => {
    if (evaluation?.total_marks) {
      return evaluation.total_marks;
    }
    
    if (question.marks) {
      return question.marks;
    }
    
    return 1; // Default
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="overflow-hidden shadow-lg border border-primary/10 bg-gradient-to-br from-white to-primary/5 dark:from-gray-800 dark:to-primary/10 hover:shadow-xl transition-all duration-300">
              <div className="h-1.5 bg-gradient-to-r from-primary via-primary/70 to-primary/50"></div>
              <CardHeader className="pb-2">
                <CardTitle className="text-xl font-semibold">Overall Performance</CardTitle>
                <CardDescription>
                  Your score breakdown across all questions
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
                        fill="#8884d8"
                        paddingAngle={5}
                        dataKey="value"
                        label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {pieChartData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={index === 0 ? TYPE_COLORS.correct : TYPE_COLORS.incorrect} 
                            stroke="transparent"
                            className="hover:opacity-90 transition-opacity duration-300"
                          />
                        ))}
                      </Pie>
                      <Tooltip 
                        content={<CustomTooltip />} 
                        wrapperStyle={{
                          backgroundColor: 'var(--background)',
                          border: '1px solid var(--border)',
                          borderRadius: '0.5rem',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                        }}
                        animationDuration={200}
                        animationEasing="ease-out"
                      />
                      <Legend formatter={(value) => <span className="text-sm font-medium">{value}</span>} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 text-center">
                  <span className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
                    {testResults.totalScore}/{testResults.maxScore}
                  </span>
                  <span className="ml-2 text-muted-foreground">
                    ({Math.round((testResults.totalScore / testResults.maxScore) * 100)}%)
                  </span>
                </div>
              </CardContent>
            </Card>
            
            <Card className="overflow-hidden shadow-lg border border-blue-500/10 bg-gradient-to-br from-white to-blue-500/5 dark:from-gray-800 dark:to-blue-500/10 hover:shadow-xl transition-all duration-300">
              <div className="h-1.5 bg-gradient-to-r from-blue-500 via-blue-400 to-blue-300"></div>
              <CardHeader className="pb-2">
                <CardTitle className="text-xl font-semibold">Question Types</CardTitle>
                <CardDescription>
                  How well you did across different question formats
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart 
                      data={questionTypeData}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      barGap={0}
                      barCategoryGap="20%"
                    >
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 12}} />
                      <Tooltip 
                        content={<CustomBarTooltip />} 
                        cursor={{fill: 'rgba(0, 0, 0, 0.05)'}}
                        animationDuration={200}
                        animationEasing="ease-out"
                      />
                      <Legend wrapperStyle={{paddingTop: 10}} />
                      <Bar 
                        dataKey="correct" 
                        name="Correct" 
                        fill={TYPE_COLORS.correct} 
                        stackId="a"
                        radius={[0, 4, 4, 0]}
                        className="hover:opacity-90 transition-opacity duration-300"
                      />
                      <Bar 
                        dataKey="incorrect" 
                        name="Incorrect" 
                        fill={TYPE_COLORS.incorrect} 
                        stackId="a"
                        radius={[0, 4, 4, 0]}
                        className="hover:opacity-90 transition-opacity duration-300"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card className="md:col-span-2 overflow-hidden shadow-lg border border-green-500/10 bg-gradient-to-br from-white to-green-500/5 dark:from-gray-800 dark:to-green-500/10 hover:shadow-xl transition-all duration-300">
              <div className="h-1.5 bg-gradient-to-r from-green-500 via-green-400 to-green-300"></div>
              <CardHeader className="pb-2">
                <CardTitle className="text-xl font-semibold">Section Performance</CardTitle>
                <CardDescription>
                  Your performance across different sections of the test
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart 
                      data={sectionPerformanceData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      barGap={8}
                    >
                      <XAxis dataKey="name" tick={{fontSize: 12}} />
                      <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                      <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" domain={[0, 100]} />
                      <Tooltip 
                        content={<CustomBarTooltip />}
                        cursor={{fill: 'rgba(0, 0, 0, 0.05)'}}
                        animationDuration={200}
                        animationEasing="ease-out"
                      />
                      <Legend wrapperStyle={{paddingTop: 10}} />
                      <Bar 
                        yAxisId="left" 
                        dataKey="score" 
                        name="Score" 
                        fill="#8884d8" 
                        radius={[4, 4, 0, 0]}
                        className="hover:opacity-90 transition-opacity duration-300"
                      />
                      <Bar 
                        yAxisId="right" 
                        dataKey="percentage" 
                        name="Percentage (%)" 
                        fill="#82ca9d"
                        radius={[4, 4, 0, 0]}
                        className="hover:opacity-90 transition-opacity duration-300"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
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
                      <TableHead className="w-[100px]">Question</TableHead>
                      <TableHead>Your Answer</TableHead>
                      <TableHead>Correct Answer</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Marks</TableHead>
                      <TableHead className="text-right">Feedback</TableHead>
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
                            <TableCell colSpan={6} className="font-medium">Section {section}</TableCell>
                          </TableRow>
                          {attemptedSectionQuestions.map(question => {
                            const evaluation = findEvaluation(question);
                            if (!evaluation) return null;
                            
                            const isCorrect = evaluation.marks_awarded === (evaluation.total_marks || 1);
                            const studentAnswer = answers[question.id || question.question_number || ""] || "";
                            const correctAnswer = getCorrectAnswer(question, evaluation);
                            const maxMarks = getMaxMarks(question, evaluation);
                            
                            return (
                              <TableRow key={question.id || question.question_number} className="hover:bg-muted/20 transition-colors">
                                <TableCell className="font-medium">{question.question_number}</TableCell>
                                <TableCell 
                                  className="max-w-[150px] truncate"
                                >
                                  {typeof studentAnswer === 'string' ? studentAnswer : studentAnswer.join(', ')}
                                </TableCell>
                                <TableCell 
                                  className="max-w-[150px] truncate text-green-600 dark:text-green-400"
                                >
                                  {correctAnswer}
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
                                <TableCell className="text-right font-medium">
                                  {evaluation.marks_awarded}/{maxMarks}
                                </TableCell>
                                <TableCell className="text-right max-w-[200px] truncate">
                                  {evaluation.final_feedback || 
                                   (evaluation.mistake ? 
                                     (Array.isArray(evaluation.mistake) ? 
                                      evaluation.mistake[0] : 
                                      evaluation.mistake) : 
                                     (isCorrect ? "Correct" : "Incorrect"))}
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
              {attemptedQuestions.map(question => (
                <QuestionCard
                  key={question.id || question.question_number}
                  question={question}
                  onAnswerChange={() => {}}
                  studentAnswer={answers[question.id || question.question_number || ""]}
                  showResults={true}
                  evaluation={findEvaluation(question)}
                />
              ))}
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="charts" className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="overflow-hidden shadow-lg border border-indigo-500/10 bg-gradient-to-br from-white to-indigo-500/5 dark:from-gray-800 dark:to-indigo-500/10 hover:shadow-xl transition-all duration-300">
              <div className="h-1.5 bg-gradient-to-r from-indigo-500 via-indigo-400 to-indigo-300"></div>
              <CardHeader className="pb-2">
                <CardTitle className="text-xl font-semibold">Correct vs Incorrect</CardTitle>
                <CardDescription>
                  Distribution of correct and incorrect answers
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="h-[300px] w-full">
                  <ChartContainer 
                    config={{
                      correct: {
                        label: "Correct",
                        color: "#10B981"
                      },
                      incorrect: {
                        label: "Incorrect",
                        color: "#EF4444"
                      }
                    }}
                  >
                    <PieChart>
                      <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        fill="#8884d8"
                        paddingAngle={5}
                        dataKey="value"
                        label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {pieChartData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={index === 0 ? TYPE_COLORS.correct : TYPE_COLORS.incorrect}
                            className="hover:opacity-90 transition-opacity duration-300"
                          />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </PieChart>
                  </ChartContainer>
                </div>
                
                <div className="mt-6 flex items-center justify-center gap-6">
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
              <CardFooter className="bg-muted/30 py-3">
                <span className="text-xs text-muted-foreground">
                  Total questions answered: {pieChartData[0].value + pieChartData[1].value}
                </span>
              </CardFooter>
            </Card>
            
            <Card className="overflow-hidden shadow-lg border border-amber-500/10 bg-gradient-to-br from-white to-amber-500/5 dark:from-gray-800 dark:to-amber-500/10 hover:shadow-xl transition-all duration-300">
              <div className="h-1.5 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-300"></div>
              <CardHeader className="pb-2">
                <CardTitle className="text-xl font-semibold">Section-wise Analysis</CardTitle>
                <CardDescription>
                  Performance breakdown by section
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart 
                      data={sectionPerformanceData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      barGap={8}
                      barCategoryGap="20%"
                    >
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip 
                        content={<CustomBarTooltip />}
                        cursor={{fill: 'rgba(0, 0, 0, 0.05)'}}
                        animationDuration={200}
                        animationEasing="ease-out"
                      />
                      <Legend wrapperStyle={{paddingTop: 10}} />
                      <Bar 
                        dataKey="score" 
                        name="Score" 
                        fill="#8884d8" 
                        radius={[4, 4, 0, 0]}
                        className="hover:opacity-90 transition-opacity duration-300"
                      />
                      <Bar 
                        dataKey="total" 
                        name="Total Available" 
                        fill="#82ca9d"
                        radius={[4, 4, 0, 0]}
                        className="hover:opacity-90 transition-opacity duration-300"
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

            {/* Remove radar chart as requested */}

            {mistakeTypesData.length > 0 && (
              <Card className="overflow-hidden shadow-lg border border-red-500/10 bg-gradient-to-br from-white to-red-500/5 dark:from-gray-800 dark:to-red-500/10 hover:shadow-xl transition-all duration-300">
                <div className="h-1.5 bg-gradient-to-r from-red-500 via-red-400 to-red-300"></div>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl font-semibold flex items-center">
                    <AlertTriangle className="h-5 w-5 mr-2 text-amber-500" />
                    Mistake Analysis
                  </CardTitle>
                  <CardDescription>
                    Types of mistakes made across questions
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={mistakeTypesData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          fill="#8884d8"
                          paddingAngle={2}
                          dataKey="value"
                          label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {mistakeTypesData.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={COLORS[index % COLORS.length]}
                              className="hover:opacity-90 transition-opacity duration-300"
                            />
                          ))}
                        </Pie>
                        <Tooltip 
                          content={<CustomTooltip />}
                          cursor={{fill: 'rgba(0, 0, 0, 0.05)'}}
                          animationDuration={200}
                          animationEasing="ease-out"
                        />
                        <Legend wrapperStyle={{paddingTop: 10}} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
                <CardFooter className="bg-muted/30 py-3">
                  <span className="text-xs text-muted-foreground flex items-center">
                    <AlignLeft className="h-3 w-3 mr-1" />
                    Focus on improving areas with the highest percentage of mistakes
                  </span>
                </CardFooter>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card p-4 rounded-lg shadow-lg border border-border">
        <p className="font-medium">{payload[0].name}</p>
        <p>Count: {payload[0].value}</p>
      </div>
    );
  }
  return null;
};

const CustomBarTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card p-4 rounded-lg shadow-lg border border-border">
        <p className="font-medium">{payload[0].payload.name}</p>
        {payload.map((item: any, index: number) => (
          <p key={index} style={{ color: item.color }} className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></div>
            {item.name}: {item.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default TestResultsAnalysis;
