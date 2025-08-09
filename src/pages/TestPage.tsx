import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mockQuestions } from "../utils/mockData";
import { toast } from "@/components/ui/use-toast";
import { Question, TestResult, QuestionResult, GradeRequest, QuestionEvaluation } from "../types/index.d";
import { fetchQuestionsFromAPI, gradeQuestions } from "../utils/api";
import { Download, Send, Loader2, ChevronUp } from "lucide-react";
import QuestionCard from "@/components/QuestionCard";
import { Progress } from "@/components/ui/progress";
import TestResultsReviewNew from "@/components/TestResultsReviewNew";

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

  const mappedEvaluations = React.useMemo(() => {
    return evaluations.map((e) => {
      const qMeta = questions.find((q) => (q.question_number || q.id) === e.question_number);
      const ansKey = qMeta?.id || e.question_number;
      const studentAns = (answers as any)[ansKey || ""] ?? "";
      const verdict = e.verdict === "correct" ? "correct" : "wrong";
      return {
        question_number: e.question_number,
        section: e.section,
        question: (e as any).question ?? qMeta?.question ?? (qMeta as any)?.question_text ?? (qMeta as any)?.text ?? "",
        type: (e as any).type ?? qMeta?.type,
        verdict,
        marks_awarded: e.marks_awarded ?? 0,
        mistake: e.mistake ?? [],
        correct_answer: e.correct_answer ?? [],
        mistake_type: e.mistake_type ?? [],
        feedback: (e as any).feedback ?? e.final_feedback ?? [],
        student_answer: studentAns,
      };
    });
  }, [evaluations, questions, answers]);

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
        <div className="animate-fade-in mb-6">
          <TestResultsReviewNew evaluations={mappedEvaluations as any} testName="Practice Test" />
        </div>
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
