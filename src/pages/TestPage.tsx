
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mockQuestions } from "../utils/mockData";
import { toast } from "@/components/ui/use-toast";
import { Question, TestResult, QuestionResult, GradeRequest, QuestionEvaluation } from "../types";
import { fetchQuestionsFromAPI, gradeQuestions } from "../utils/api";
import { Download, Send, CheckCircle, XCircle, FileCheck, Loader2, ArrowRight } from "lucide-react";
import QuestionCard from "@/components/QuestionCard";
import { Progress } from "@/components/ui/progress";

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

  useEffect(() => {
    // Sort and initialize questions from mock data
    const sortedMockQuestions = [...mockQuestions].sort((a, b) => {
      // First sort by section
      if (a.section && b.section) {
        if (a.section < b.section) return -1;
        if (a.section > b.section) return 1;
      }
      // Then sort by question_number if available
      if (a.question_number && b.question_number) {
        return a.question_number.localeCompare(b.question_number);
      }
      return 0;
    });
    
    setQuestions(sortedMockQuestions);
    
    // Fetch questions from API when the component mounts
    const loadQuestions = async () => {
      try {
        const apiQuestions = await fetchQuestionsFromAPI();
        // Sort the API questions the same way
        const sortedApiQuestions = [...apiQuestions].sort((a, b) => {
          if (a.section && b.section) {
            if (a.section < b.section) return -1;
            if (a.section > b.section) return 1;
          }
          if (a.question_number && b.question_number) {
            return a.question_number.localeCompare(b.question_number);
          }
          return 0;
        });
        
        setQuestions(sortedApiQuestions);
      } catch (error) {
        toast({
          title: "Download failed",
          description: "Could not download questions from the server. Using mock data instead.",
          variant: "destructive",
        });
        console.error("Error downloading questions:", error);
      }
    };
    loadQuestions();
  }, []);

  // Filter questions by section
  const sectionAQuestions = questions.filter((q) => q.section === "A");
  const sectionBQuestions = questions.filter((q) => q.section === "B");
  
  // Filter out root questions (type: "question")
  const answerableQuestions = questions.filter(q => q.type !== "question");

  const handleDownloadQuestions = async () => {
    setIsLoading(true);

    try {
      const apiQuestions = await fetchQuestionsFromAPI();
      
      // Sort the questions by section and question number
      const sortedApiQuestions = [...apiQuestions].sort((a, b) => {
        if (a.section && b.section) {
          if (a.section < b.section) return -1;
          if (a.section > b.section) return 1;
        }
        if (a.question_number && b.question_number) {
          return a.question_number.localeCompare(b.question_number);
        }
        return 0;
      });
      
      setQuestions(sortedApiQuestions);
      setTestSubmitted(false);
      setTestResults(null);
      setEvaluations([]);

      toast({
        title: "Questions downloaded",
        description: `Successfully loaded ${apiQuestions.length} questions from the server.`,
      });
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
      // Get answerable questions (exclude root questions)
      const questionsToGrade = questions.filter(q => 
        q.type !== "question" && 
        q.question_number && 
        q.section &&
        answers[q.id || q.question_number]
      );
      
      // Prepare batches of 10 questions
      const batchSize = 10;
      const batches = [];
      
      for (let i = 0; i < questionsToGrade.length; i += batchSize) {
        const batch = questionsToGrade.slice(i, i + batchSize);
        batches.push(batch);
      }
      
      let allEvaluations: QuestionEvaluation[] = [];
      
      // Process each batch
      for (let i = 0; i < batches.length; i++) {
        const batch = batches[i];
        const gradeRequest: GradeRequest = {
          questions: batch.map(q => ({
            section: q.section || "",
            question_number: q.question_number || "",
            student_answer: answers[q.id || q.question_number]?.toString() || ""
          }))
        };
        
        const response = await gradeQuestions(gradeRequest);
        allEvaluations = [...allEvaluations, ...response.evaluations];
        
        // Update progress
        setGradingProgress(Math.round(((i + 1) / batches.length) * 100));
      }
      
      // Calculate total score - FIX: renamed 'eval' to 'evaluation'
      const totalScore = allEvaluations.reduce((sum, evaluation) => sum + evaluation.marks_awarded, 0);
      const maxScore = allEvaluations.reduce((sum, evaluation) => sum + evaluation.total_marks, 0);
      
      // Calculate section scores - FIX: renamed 'eval' to 'evaluation'
      const sectionScores: {[key: string]: {score: number, total: number}} = {};
      allEvaluations.forEach(evaluation => {
        if (!sectionScores[evaluation.section]) {
          sectionScores[evaluation.section] = { score: 0, total: 0 };
        }
        sectionScores[evaluation.section].score += evaluation.marks_awarded;
        sectionScores[evaluation.section].total += evaluation.total_marks;
      });
      
      // Create test results - FIX: renamed 'eval' to 'evaluation'
      const testResults: TestResult = {
        totalScore,
        maxScore,
        sectionScores,
        questionResults: allEvaluations.map(evaluation => ({
          questionId: evaluation.question_number,
          studentAnswer: answers[evaluation.question_number] || "",
          isCorrect: evaluation.marks_awarded === evaluation.total_marks,
          marks: evaluation.marks_awarded,
          maxMarks: evaluation.total_marks,
          feedback: evaluation.final_feedback
        }))
      };
      
      setTestResults(testResults);
      setEvaluations(allEvaluations);
      setTestSubmitted(true);
      
      toast({
        title: "Test graded",
        description: `Your score: ${totalScore}/${maxScore}`,
      });
    } catch (error) {
      toast({
        title: "Grading failed",
        description: "Could not grade your test. Please try again.",
        variant: "destructive"
      });
      console.error("Error grading test:", error);
    } finally {
      setIsGrading(false);
      setGradingProgress(100);
    }
  };
  
  const findEvaluation = (question: Question): QuestionEvaluation | undefined => {
    if (!question.question_number) return undefined;
    return evaluations.find(e => e.question_number === question.question_number);
  };

  const renderQuestionCard = (question: Question) => {
    if (question.type === "question") {
      // For root questions, render a header card
      return (
        <div key={question.question_number || question.id} className="mb-8 animate-fade-in">
          <Card className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/50 dark:to-blue-950/50 border-none shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center">
                <span className="text-xl gradient-text">{question.question_text}</span>
              </CardTitle>
            </CardHeader>
          </Card>
        </div>
      );
    }
    
    // For answerable questions
    return (
      <QuestionCard 
        key={question.question_number || question.id}
        question={question}
        onAnswerChange={handleAnswerChange}
        studentAnswer={answers[question.id || question.question_number || ""]}
        showResults={testSubmitted}
        evaluation={findEvaluation(question)}
      />
    );
  };

  return (
    <div className="page-container pb-20">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-2">Practice Test</h1>
          <p className="text-muted-foreground">
            Review questions from all sections
          </p>
        </div>

        <div className="flex gap-3">
          <Button 
            onClick={handleDownloadQuestions}
            variant="outline" 
            disabled={isLoading}
            className="flex items-center gap-2"
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
              className="flex items-center gap-2"
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
        <Card className="mb-6 bg-muted/50">
          <CardContent className="py-4">
            <div className="text-center mb-2">Grading in progress...</div>
            <Progress value={gradingProgress} className="h-2" />
          </CardContent>
        </Card>
      )}

      {testSubmitted && testResults ? (
        <div className="mb-6 animate-fade-in">
          <Card className="mb-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 border-none shadow-lg">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-6 items-center">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-inner w-full md:w-1/3 flex flex-col items-center">
                  <h2 className="text-lg font-semibold mb-1 text-muted-foreground">Your Score</h2>
                  <div className="text-4xl font-bold mb-1 gradient-text">
                    {testResults.totalScore}/{testResults.maxScore}
                  </div>
                  <Progress 
                    value={(testResults.totalScore / testResults.maxScore) * 100} 
                    className="h-2 w-full mt-2"
                  />
                  <div className="text-sm text-muted-foreground mt-2">
                    {Math.round((testResults.totalScore / testResults.maxScore) * 100)}% score
                  </div>
                </div>
                
                <div className="flex-1 w-full">
                  <h3 className="text-lg font-semibold mb-3">Section Scores</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {Object.entries(testResults.sectionScores).map(([section, data]) => (
                      <Card key={section} className="bg-white dark:bg-gray-800 shadow-sm border-none">
                        <CardContent className="p-4 flex justify-between items-center">
                          <div>
                            <h4 className="font-medium">Section {section}</h4>
                            <p className="text-2xl font-semibold">
                              {data.score}/{data.total}
                            </p>
                          </div>
                          <div className="h-12 w-12 rounded-full flex items-center justify-center">
                            {data.score === data.total ? (
                              <CheckCircle className="h-10 w-10 text-green-500" />
                            ) : data.score >= data.total / 2 ? (
                              <FileCheck className="h-10 w-10 text-amber-500" />
                            ) : (
                              <XCircle className="h-10 w-10 text-red-500" />
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="mt-6 text-center">
                <Button 
                  onClick={() => setTestSubmitted(false)}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <ArrowRight className="h-4 w-4" />
                  Review Your Answers
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Tabs defaultValue="section-a" className="mb-6" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="section-a">Section A</TabsTrigger>
            <TabsTrigger value="section-b">Section B</TabsTrigger>
            <TabsTrigger value="full">Full Paper</TabsTrigger>
          </TabsList>
          <TabsContent value="section-a" className="mt-4 space-y-4">
            {sectionAQuestions.length > 0 ? (
              sectionAQuestions.map(question => renderQuestionCard(question))
            ) : (
              <div className="text-center p-6 text-muted-foreground">No questions available for Section A</div>
            )}
          </TabsContent>
          <TabsContent value="section-b" className="mt-4 space-y-4">
            {sectionBQuestions.length > 0 ? (
              sectionBQuestions.map(question => renderQuestionCard(question))
            ) : (
              <div className="text-center p-6 text-muted-foreground">No questions available for Section B</div>
            )}
          </TabsContent>
          <TabsContent value="full" className="mt-4 space-y-4">
            {questions.length > 0 ? (
              questions.map(question => renderQuestionCard(question))
            ) : (
              <div className="text-center p-6 text-muted-foreground">No questions available</div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default TestPage;

