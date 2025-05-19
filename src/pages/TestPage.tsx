import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mockQuestions } from "../utils/mockData";
import { toast } from "@/components/ui/use-toast";
import { Question, TestResult, QuestionResult, GradeRequest, QuestionEvaluation } from "../types/index.d";
import { fetchQuestionsFromAPI, gradeQuestions } from "../utils/api";
import { Download, Send, CheckCircle, XCircle, FileCheck, Loader2, ArrowRight, ArrowLeft, BarChart3, ChevronUp } from "lucide-react";
import QuestionCard from "@/components/QuestionCard";
import { Progress } from "@/components/ui/progress";
import TestResultsAnalysis from "@/components/TestResultsAnalysis";

const TestPage = () => {
  const [activeTab, setActiveTab] = useState<string>("section-a");
  const [testSubmitted, setTestSubmitted] = useState(false);
  const [testResults, setTestResults] = useState<TestResult | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [answers, setAnswers] = useState<{[key: string]: string | string[]}>({});
  const [evaluations, setEvaluations] = useState<QuestionEvaluation[]>([]);
  const [isGrading, setIsGrading] = useState(false);
  const [gradingProgress, setGradingProgress] = useState(0);
  const [showDetailedAnalysis, setShowDetailedAnalysis] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const pageTopRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    pageTopRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    setQuestions([]);
    
    const loadQuestions = async () => {
      setIsLoading(true);
      try {
        const apiQuestions = await fetchQuestionsFromAPI();
        if (apiQuestions && apiQuestions.length > 0) {
          const processedQuestions = apiQuestions.map(q => ({
            ...q,
            id: q.id || q.question_number || Math.random().toString(36).substring(7),
            section: q.section || (q.question_number?.startsWith('A') ? 'A' : 'B')
          }));

          const sortedApiQuestions = [...processedQuestions].sort((a, b) => {
            if (a.section < b.section) return -1;
            if (a.section > b.section) return 1;
            if (a.question_number && b.question_number) {
              return a.question_number.localeCompare(b.question_number);
            }
            return 0;
          });
          
          setQuestions(sortedApiQuestions);
          toast({
            title: "Questions loaded",
            description: `Successfully loaded ${sortedApiQuestions.length} questions from the server.`,
          });
        } else {
          const sortedMockQuestions = [...mockQuestions].sort((a, b) => {
            if (a.section && b.section) {
              if (a.section < b.section) return -1;
              if (a.section > b.section) return 1;
            }
            if (a.question_number && b.question_number) {
              return a.question_number.localeCompare(b.question_number);
            }
            return 0;
          });
          
          setQuestions(sortedMockQuestions);
          toast({
            title: "Using mock data",
            description: "No questions available from API. Using built-in mock data instead.",
          });
        }
      } catch (error) {
        console.error("Error loading questions:", error);
        toast({
          title: "Load failed",
          description: "Could not load questions from the server. Using mock data instead.",
          variant: "destructive",
        });
        setQuestions([...mockQuestions]);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadQuestions();
  }, []);

  const sectionAQuestions = questions.filter((q) => q.section === "A");
  const sectionBQuestions = questions.filter((q) => q.section === "B");
  
  const answerableQuestions = questions.filter(q => q.type !== "question");

  const handleDownloadQuestions = async () => {
    setIsLoading(true);
    try {
      const apiQuestions = await fetchQuestionsFromAPI();
      
      if (apiQuestions && apiQuestions.length > 0) {
        const processedQuestions = apiQuestions.map(q => ({
          ...q,
          id: q.id || q.question_number || Math.random().toString(36).substring(7),
          section: q.section || (q.question_number?.startsWith('A') ? 'A' : 'B')
        }));

        const sortedApiQuestions = [...processedQuestions].sort((a, b) => {
          if (a.section < b.section) return -1;
          if (a.section > b.section) return 1;
          if (a.question_number && b.question_number) {
            return a.question_number.localeCompare(b.question_number);
          }
          return 0;
        });
        
        setQuestions(sortedApiQuestions);
        setTestSubmitted(false);
        setTestResults(null);
        setEvaluations([]);
        setAnswers({});

        toast({
          title: "Questions downloaded",
          description: `Successfully loaded ${apiQuestions.length} questions from the server.`,
        });
      } else {
        setQuestions([...mockQuestions]);
        
        toast({
          title: "Using mock data",
          description: "No questions available from API. Using built-in mock data instead.",
        });
      }
    } catch (error) {
      toast({
        title: "Download failed",
        description: "Could not download questions from the server. Using mock data instead.",
        variant: "destructive"
      });
      console.error("Error downloading questions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerChange = (questionId: string, answer: string | string[]) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const submitTest = async () => {
    setIsGrading(true);
    setGradingProgress(0);
    setEvaluations([]);
    
    try {
      const questionsToGrade = questions.filter(q => 
        q.type !== "question" && 
        (q.id || q.question_number) &&
        q.section &&
        answers[q.id || q.question_number || '']
      );
      
      if (questionsToGrade.length === 0) {
        toast({
          title: "No answers to grade",
          description: "Please answer at least one question before submitting.",
          variant: "destructive"
        });
        setIsGrading(false);
        return;
      }
      
      const gradeRequest: GradeRequest = {
        questions: questionsToGrade.map(q => ({
          section: q.section || "",
          question_number: q.question_number || q.id || "",
          student_answer: q.type === "mcq"
            ? answers[q.id || q.question_number || '']?.toString().trim().charAt(0).toLowerCase() || ""
            : answers[q.id || q.question_number || '']?.toString() || ""
        }))
      };
      
      console.log("Sending grading request:", JSON.stringify(gradeRequest, null, 2));
      
      const progressInterval = setInterval(() => {
        setGradingProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 300);
      
      const response = await gradeQuestions(gradeRequest);
      
      clearInterval(progressInterval);
      setGradingProgress(100);
      
      if (!response?.evaluations) {
        throw new Error("API returned invalid format. Expected evaluations array.");
      }
      
      setEvaluations(response.evaluations);
      
      const results = calculateTestResults(response.evaluations);
      setTestResults(results);
      setTestSubmitted(true);
      
      toast({
        title: "Test graded successfully",
        description: `Your score: ${results.totalScore}/${results.maxScore}`,
      });
    } catch (error) {
      console.error("Grading error:", error);
      toast({
        title: "Grading Error",
        description: `Failed to grade: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive"
      });
    } finally {
      setIsGrading(false);
      setGradingProgress(0);
    }
  };
  
  const calculateTestResults = (evalData: QuestionEvaluation[]): TestResult => {
    const sectionScores: {[key: string]: {score: number, total: number}} = {};
    const questionResults: QuestionResult[] = [];
    
    let totalScore = 0;
    let maxScore = 0;
    
    evalData.forEach(evalItem => {
      const isCorrect = evalItem.verdict === "correct" || 
                      (evalItem.verdict === undefined && 
                       (Array.isArray(evalItem.mistake) && evalItem.mistake.length === 0 ||
                        evalItem.mistake === ""));
      
      const marksAwarded = evalItem.marks_awarded;
      const totalMarks = evalItem.total_marks || 1;
      
      totalScore += marksAwarded;
      maxScore += totalMarks;
      
      if (!sectionScores[evalItem.section]) {
        sectionScores[evalItem.section] = { score: 0, total: 0 };
      }
      sectionScores[evalItem.section].score += marksAwarded;
      sectionScores[evalItem.section].total += totalMarks;
      
      questionResults.push({
        questionId: evalItem.question_number,
        studentAnswer: answers[evalItem.question_number] || "",
        isCorrect: isCorrect,
        marks: marksAwarded,
        maxMarks: totalMarks,
        feedback: evalItem.final_feedback || (evalItem.mistake ? 
          (Array.isArray(evalItem.mistake) ? evalItem.mistake.join(", ") : evalItem.mistake) : 
          (isCorrect ? "Correct answer" : "Incorrect answer"))
      });
    });
    
    return {
      totalScore,
      maxScore,
      sectionScores,
      questionResults
    };
  };
  
  const findEvaluation = (question: Question): QuestionEvaluation | undefined => {
    if (!question.question_number && !question.id) return undefined;
    return evaluations.find(e => 
      e.question_number === (question.question_number || question.id)
    );
  };

  const renderQuestionCard = (question: Question) => {
    return (
      <QuestionCard 
        key={question.id || question.question_number}
        question={question}
        onAnswerChange={handleAnswerChange}
        studentAnswer={answers[question.id || question.question_number || ""]}
        showResults={testSubmitted}
        evaluation={findEvaluation(question)}
      />
    );
  };

  return (
    <div className="page-container pb-20" ref={pageTopRef}>
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-2 text-primary">Practice Test</h1>
          <p className="text-muted-foreground">
            Review questions from all sections
          </p>
        </div>

        <div className="flex gap-3">
          <Button 
            onClick={handleDownloadQuestions}
            variant="outline" 
            disabled={isLoading}
            className="flex items-center gap-2 hover:bg-primary/10"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            {isLoading ? "Loading..." : "Load from API"}
          </Button>
          
          {!testSubmitted && answerableQuestions.length > 0 && (
            <Button
              onClick={submitTest}
              disabled={isGrading || Object.keys(answers).length === 0}
              className="flex items-center gap-2 bg-primary hover:bg-primary/90"
            >
              {isGrading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              {isGrading ? "Grading..." : "Submit Test"}
            </Button>
          )}
        </div>
      </div>

      {isGrading && (
        <Card className="mb-6 bg-white dark:bg-gray-800 border border-primary/20 shadow-lg">
          <CardContent className="py-6">
            <div className="text-center mb-4 text-primary font-semibold">Grading in progress...</div>
            <Progress value={gradingProgress} className="h-2 bg-primary/20" />
            <div className="text-center mt-2 text-muted-foreground text-sm">{gradingProgress}% complete</div>
          </CardContent>
        </Card>
      )}

      {testSubmitted && testResults ? (
        showDetailedAnalysis ? (
          <div className="animate-fade-in mb-6">
            <Button
              onClick={() => setShowDetailedAnalysis(false)}
              variant="outline"
              className="mb-6 flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Summary
            </Button>
            
            <TestResultsAnalysis 
              plannerResponse={{ 
                planner: JSON.stringify({ evaluations }) 
              }}
              questions={questions}
              answers={answers}
            />
          </div>
        ) : (
          <div className="mb-6 animate-fade-in">
            <Card className="mb-4 bg-white dark:bg-gray-800 border border-primary/20 shadow-lg overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-purple-400 via-blue-500 to-indigo-500"></div>
              <CardContent className="p-8">
                <div className="flex flex-col md:flex-row gap-8 items-center">
                  <div className="bg-white dark:bg-gray-900 rounded-lg p-8 shadow-lg border border-primary/10 w-full md:w-1/3 flex flex-col items-center">
                    <h2 className="text-lg font-semibold mb-2 text-primary">Your Score</h2>
                    <div className="text-5xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-500 dark:from-purple-400 dark:to-blue-300">
                      {testResults.totalScore}/{testResults.maxScore}
                    </div>
                    <Progress 
                      value={(testResults.totalScore / testResults.maxScore) * 100} 
                      className="h-3 w-full mt-2 bg-primary/10 rounded-full overflow-hidden"
                    />
                    <div className="flex justify-between w-full text-sm mt-3">
                      <span className="text-muted-foreground">0%</span>
                      <span className="font-semibold text-primary">
                        {Math.round((testResults.totalScore / testResults.maxScore) * 100)}%
                      </span>
                      <span className="text-muted-foreground">100%</span>
                    </div>
                  </div>
                  
                  <div className="flex-1 w-full">
                    <h3 className="text-lg font-semibold mb-4 text-primary flex items-center">
                      <FileCheck className="mr-2 h-5 w-5" /> Section Performance
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {Object.entries(testResults.sectionScores).map(([section, data]) => {
                        const percentage = Math.round((data.score / data.total) * 100);
                        let statusColor = "text-red-500";
                        let bgColor = "bg-red-50 dark:bg-red-950/30";
                        
                        if (data.score === data.total) {
                          statusColor = "text-green-500";
                          bgColor = "bg-green-50 dark:bg-green-950/30";
                        } else if (data.score >= data.total / 2) {
                          statusColor = "text-amber-500";
                          bgColor = "bg-amber-50 dark:bg-amber-950/30";
                        }
                        
                        return (
                          <Card key={section} className={`shadow-sm border-none ${bgColor} overflow-hidden hover:shadow-md transition-all`}>
                            <div className="h-1 bg-gradient-to-r from-purple-400 to-blue-500"></div>
                            <CardContent className="p-6 flex justify-between items-center">
                              <div>
                                <h4 className="font-medium mb-1">Section {section}</h4>
                                <p className="text-2xl font-semibold flex items-baseline">
                                  {data.score}
                                  <span className="text-muted-foreground text-sm mx-1">/</span>
                                  <span className="text-muted-foreground">{data.total}</span>
                                  <span className="text-sm ml-2">({percentage}%)</span>
                                </p>
                              </div>
                              <div className={`h-16 w-16 rounded-full flex items-center justify-center ${statusColor} bg-white dark:bg-gray-900 shadow-inner p-1`}>
                                {data.score === data.total ? (
                                  <CheckCircle className="h-10 w-10" />
                                ) : data.score >= data.total / 2 ? (
                                  <FileCheck className="h-10 w-10" />
                                ) : (
                                  <XCircle className="h-10 w-10" />
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                </div>
                
                <div className="mt-8 text-center flex justify-center gap-4">
                  <Button 
                    onClick={() => setTestSubmitted(false)}
                    variant="outline"
                    className="flex items-center gap-2 border-primary hover:bg-primary/10 px-6 py-5"
                  >
                    <ArrowRight className="h-4 w-4" />
                    Review Your Answers
                  </Button>
                  
                  <Button 
                    onClick={() => setShowDetailedAnalysis(true)}
                    className="flex items-center gap-2 bg-primary hover:bg-primary/90 px-6 py-5"
                  >
                    <BarChart3 className="h-4 w-4" />
                    Detailed Analysis
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )
      ) : (
        <Tabs defaultValue="section-a" className="mb-6" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="section-a">Section A</TabsTrigger>
            <TabsTrigger value="section-b">Section B</TabsTrigger>
            <TabsTrigger value="full">Full Paper</TabsTrigger>
          </TabsList>
          <TabsContent value="section-a" className="mt-4 space-y-6">
            {sectionAQuestions.length > 0 ? (
              sectionAQuestions.map(question => renderQuestionCard(question))
            ) : (
              <div className="text-center p-6 text-muted-foreground">No questions available for Section A</div>
            )}
          </TabsContent>
          <TabsContent value="section-b" className="mt-4 space-y-6">
            {sectionBQuestions.length > 0 ? (
              sectionBQuestions.map(question => renderQuestionCard(question))
            ) : (
              <div className="text-center p-6 text-muted-foreground">No questions available for Section B</div>
            )}
          </TabsContent>
          <TabsContent value="full" className="mt-4 space-y-6">
            {questions.length > 0 ? (
              questions.map(question => renderQuestionCard(question))
            ) : (
              <div className="text-center p-6 text-muted-foreground">No questions available</div>
            )}
          </TabsContent>
        </Tabs>
      )}

      {showBackToTop && (
        <Button
          onClick={scrollToTop}
          className="fixed bottom-24 right-6 rounded-full shadow-lg bg-primary hover:bg-primary/90 w-12 h-12 p-0 flex items-center justify-center z-50"
          aria-label="Back to top"
        >
          <ChevronUp className="h-6 w-6" />
        </Button>
      )}
    </div>
  );
};

export default TestPage;
