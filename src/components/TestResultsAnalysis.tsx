
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { TestResult, Question, QuestionEvaluation } from "../types";
import QuestionCard from "./QuestionCard";
import { CheckCircle, XCircle, BarChart3, PieChart as PieChartIcon, ClipboardList } from "lucide-react";

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
            "Other",
      correct: stats.correct,
      incorrect: stats.incorrect,
      total: stats.total
    }));
  }, [questions, evaluations]);
  
  const pieChartData = React.useMemo(() => [
    { name: "Correct", value: evaluations.filter(e => e.marks_awarded === e.total_marks).length },
    { name: "Incorrect", value: evaluations.filter(e => e.marks_awarded !== e.total_marks).length }
  ], [evaluations]);

  const sectionPerformanceData = React.useMemo(() => {
    return Object.entries(testResults.sectionScores).map(([section, data]) => ({
      name: `Section ${section}`,
      score: data.score,
      total: data.total,
      percentage: Math.round((data.score / data.total) * 100)
    }));
  }, [testResults]);

  const COLORS = ['#10B981', '#EF4444'];
  const TYPE_COLORS = {
    correct: '#10B981',
    incorrect: '#EF4444'
  };

  const findEvaluation = (question: Question): QuestionEvaluation | undefined => {
    return evaluations.find(e => 
      e.question_number === (question.question_number || question.id)
    );
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
            <Card className="overflow-hidden shadow-lg border-none bg-gradient-to-br from-white to-purple-50 dark:from-gray-800 dark:to-gray-900">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl font-semibold text-primary">Overall Performance</CardTitle>
                <CardDescription>
                  Your score breakdown across all questions
                </CardDescription>
              </CardHeader>
              <CardContent>
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
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 text-center">
                  <span className="text-2xl font-bold">{testResults.totalScore}/{testResults.maxScore}</span>
                  <span className="ml-2 text-muted-foreground">
                    ({Math.round((testResults.totalScore / testResults.maxScore) * 100)}%)
                  </span>
                </div>
              </CardContent>
            </Card>
            
            <Card className="overflow-hidden shadow-lg border-none bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-gray-900">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl font-semibold text-primary">Question Types Performance</CardTitle>
                <CardDescription>
                  How well you did across different question formats
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart 
                      data={questionTypeData}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" />
                      <Tooltip content={<CustomBarTooltip />} />
                      <Legend />
                      <Bar dataKey="correct" name="Correct" fill={TYPE_COLORS.correct} stackId="a" />
                      <Bar dataKey="incorrect" name="Incorrect" fill={TYPE_COLORS.incorrect} stackId="a" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card className="md:col-span-2 overflow-hidden shadow-lg border-none bg-gradient-to-br from-white to-green-50 dark:from-gray-800 dark:to-gray-900">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl font-semibold text-primary">Section Performance</CardTitle>
                <CardDescription>
                  Your performance across different sections of the test
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart 
                      data={sectionPerformanceData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <XAxis dataKey="name" />
                      <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                      <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" domain={[0, 100]} />
                      <Tooltip content={<CustomBarTooltip />} />
                      <Legend />
                      <Bar yAxisId="left" dataKey="score" name="Score" fill="#8884d8" />
                      <Bar yAxisId="right" dataKey="percentage" name="Percentage (%)" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="questions" className="pt-6">
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-primary">Detailed Question Review</h3>
            <p className="text-muted-foreground">Review your performance on each question with AI feedback</p>
            
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
            <Card className="overflow-hidden shadow-lg border-none bg-gradient-to-br from-white to-indigo-50 dark:from-gray-800 dark:to-indigo-950">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl font-semibold text-primary">Correct vs Incorrect</CardTitle>
                <CardDescription>
                  Distribution of correct and incorrect answers
                </CardDescription>
              </CardHeader>
              <CardContent>
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
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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
            </Card>
            
            <Card className="overflow-hidden shadow-lg border-none bg-gradient-to-br from-white to-amber-50 dark:from-gray-800 dark:to-amber-950">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl font-semibold text-primary">Section-wise Analysis</CardTitle>
                <CardDescription>
                  Performance breakdown by section
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart 
                      data={sectionPerformanceData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip content={<CustomBarTooltip />} />
                      <Legend />
                      <Bar dataKey="score" name="Score" fill="#8884d8" />
                      <Bar dataKey="total" name="Total Available" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
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
      <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
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
      <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
        <p className="font-medium">{payload[0].payload.name}</p>
        {payload.map((item: any, index: number) => (
          <p key={index} style={{ color: item.color }}>
            {item.name}: {item.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default TestResultsAnalysis;
