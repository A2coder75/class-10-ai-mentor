
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { TestResult, Question, QuestionEvaluation } from "../types";
import QuestionCard from "./QuestionCard";
import { CheckCircle, XCircle, BarChart3, PieChartIcon, ClipboardList, AlignLeft, AlertTriangle, BadgeCheck, BadgeX } from "lucide-react";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

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
  // Prepare data for charts
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
    
    evaluations.forEach(eval => {
      if (eval.marks_awarded === 0 && eval.mistake_type) {
        const mistakeTypeArray = Array.isArray(eval.mistake_type) ? 
                               eval.mistake_type : 
                               [eval.mistake_type];
                               
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

  const sectionPerformanceData = React.useMemo(() => {
    return Object.entries(testResults.sectionScores).map(([section, data]) => ({
      name: `Section ${section}`,
      score: data.score,
      total: data.total,
      percentage: Math.round((data.score / data.total) * 100)
    }));
  }, [testResults]);

  // Radar data for performance across question types
  const radarData = React.useMemo(() => {
    return questionTypeData.map(item => ({
      subject: item.name,
      A: item.percentage,
      fullMark: 100
    }));
  }, [questionTypeData]);

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

  // Group questions by section for the table view
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
    
    // Sort each section's questions by question number
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
            <Card className="overflow-hidden shadow-lg border-none bg-gradient-to-br from-card to-card/50 hover:shadow-xl transition-all">
              <CardHeader className="pb-2 bg-gradient-to-r from-primary/10 to-primary/5">
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
                            fill={COLORS[index % COLORS.length]} 
                            stroke="transparent"
                            className="hover:opacity-95 transition-opacity"
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
            
            <Card className="overflow-hidden shadow-lg border-none bg-gradient-to-br from-card to-card/50 hover:shadow-xl transition-all">
              <CardHeader className="pb-2 bg-gradient-to-r from-blue-500/10 to-blue-600/5">
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
                      />
                      <Legend wrapperStyle={{paddingTop: 10}} />
                      <Bar 
                        dataKey="correct" 
                        name="Correct" 
                        fill={TYPE_COLORS.correct} 
                        stackId="a"
                        radius={[0, 4, 4, 0]}
                        className="hover:opacity-90 transition-opacity"
                      />
                      <Bar 
                        dataKey="incorrect" 
                        name="Incorrect" 
                        fill={TYPE_COLORS.incorrect} 
                        stackId="a"
                        radius={[0, 4, 4, 0]}
                        className="hover:opacity-90 transition-opacity"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card className="md:col-span-2 overflow-hidden shadow-lg border-none bg-gradient-to-br from-card to-card/50 hover:shadow-xl transition-all">
              <CardHeader className="pb-2 bg-gradient-to-r from-green-500/10 to-green-600/5">
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
                      <XAxis dataKey="name" />
                      <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                      <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" domain={[0, 100]} />
                      <Tooltip 
                        content={<CustomBarTooltip />}
                        cursor={{fill: 'rgba(0, 0, 0, 0.05)'}}
                      />
                      <Legend wrapperStyle={{paddingTop: 10}} />
                      <Bar 
                        yAxisId="left" 
                        dataKey="score" 
                        name="Score" 
                        fill="#8884d8" 
                        radius={[4, 4, 0, 0]}
                        className="hover:opacity-90 transition-opacity"
                      />
                      <Bar 
                        yAxisId="right" 
                        dataKey="percentage" 
                        name="Percentage (%)" 
                        fill="#82ca9d"
                        radius={[4, 4, 0, 0]}
                        className="hover:opacity-90 transition-opacity"
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
              <CardHeader className="bg-gradient-to-r from-indigo-500/10 to-indigo-600/5">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl font-semibold">Detailed Question Review</CardTitle>
                    <CardDescription>
                      Review your performance on each question with AI feedback
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
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
                    {Object.entries(sectionQuestions).sort().map(([section, sectionQuestions]) => (
                      <React.Fragment key={section}>
                        <TableRow className="bg-muted/30">
                          <TableCell colSpan={4} className="font-medium">Section {section}</TableCell>
                        </TableRow>
                        {sectionQuestions.map(question => {
                          const evaluation = findEvaluation(question);
                          if (!evaluation) return null;
                          
                          const isCorrect = evaluation.marks_awarded === (evaluation.total_marks || 1);
                          const studentAnswer = answers[question.id || question.question_number || ""] || "";
                          
                          return (
                            <TableRow key={question.id || question.question_number} className="hover:bg-muted/20">
                              <TableCell className="font-medium">{question.question_number}</TableCell>
                              <TableCell className="max-w-[200px] truncate">
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
                                      <span className="text-sm text-red-500/80 mb-1">
                                        {evaluation.mistake || evaluation.missing_or_wrong?.[0] || "Incorrect answer"}
                                      </span>
                                      {evaluation.correct_answer && (
                                        <span className="text-xs text-muted-foreground">
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
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
            
            <div className="space-y-8">
              {questions
                .filter(question => question.type !== "question")
                .map(question => (
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
            <Card className="overflow-hidden shadow-lg border-none bg-gradient-to-br from-card to-card/50 hover:shadow-xl transition-all">
              <CardHeader className="pb-2 bg-gradient-to-r from-indigo-500/10 to-indigo-600/5">
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
                            fill={COLORS[index % COLORS.length]}
                            className="hover:opacity-90 transition-opacity"
                          />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </PieChart>
                  </ChartContainer>
                </div>
                
                <div className="mt-6 flex items-center justify-center gap-6">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                    <span>Correct: {pieChartData[0].value}</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                    <span>Incorrect: {pieChartData[1].value}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-muted/30 py-3">
                <span className="text-xs text-muted-foreground">
                  Total questions answered: {pieChartData[0].value + pieChartData[1].value}
                </span>
              </CardFooter>
            </Card>
            
            <Card className="overflow-hidden shadow-lg border-none bg-gradient-to-br from-card to-card/50 hover:shadow-xl transition-all">
              <CardHeader className="pb-2 bg-gradient-to-r from-amber-500/10 to-amber-600/5">
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
                      barGap={0}
                      barCategoryGap="20%"
                    >
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip 
                        content={<CustomBarTooltip />}
                        cursor={{fill: 'rgba(0, 0, 0, 0.05)'}}
                      />
                      <Legend wrapperStyle={{paddingTop: 10}} />
                      <Bar 
                        dataKey="score" 
                        name="Score" 
                        fill="#8884d8" 
                        radius={[4, 4, 0, 0]}
                        className="hover:opacity-90 transition-opacity"
                      />
                      <Bar 
                        dataKey="total" 
                        name="Total Available" 
                        fill="#82ca9d"
                        radius={[4, 4, 0, 0]}
                        className="hover:opacity-90 transition-opacity"
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

            <Card className="overflow-hidden shadow-lg border-none bg-gradient-to-br from-card to-card/50 hover:shadow-xl transition-all">
              <CardHeader className="pb-2 bg-gradient-to-r from-blue-500/10 to-blue-600/5">
                <CardTitle className="text-xl font-semibold">Performance by Question Type</CardTitle>
                <CardDescription>
                  Radar chart showing percentage correct by question type
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                      <PolarGrid stroke="var(--border)" strokeWidth={1} />
                      <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} />
                      <Radar 
                        name="Proficiency" 
                        dataKey="A" 
                        stroke="#8884d8" 
                        fill="#8884d8" 
                        fillOpacity={0.6} 
                        className="hover:fill-opacity-80 transition-opacity"
                      />
                      <Tooltip 
                        content={<CustomBarTooltip />}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
              <CardFooter className="bg-muted/30 py-3">
                <span className="text-xs text-muted-foreground">
                  Each axis represents a question type with percentage correct
                </span>
              </CardFooter>
            </Card>

            {mistakeTypesData.length > 0 && (
              <Card className="overflow-hidden shadow-lg border-none bg-gradient-to-br from-card to-card/50 hover:shadow-xl transition-all">
                <CardHeader className="pb-2 bg-gradient-to-r from-red-500/10 to-red-600/5">
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
                          innerRadius={0}
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
                              className="hover:opacity-90 transition-opacity"
                            />
                          ))}
                        </Pie>
                        <Tooltip 
                          content={<CustomTooltip />}
                          cursor={{fill: 'rgba(0, 0, 0, 0.05)'}}
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

// Custom tooltip components 
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
