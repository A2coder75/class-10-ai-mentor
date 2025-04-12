import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mockQuestions } from "../utils/mockData";
import QuestionCard from "@/components/QuestionCard";
import Navbar from "@/components/Navbar";
import { toast } from "@/components/ui/use-toast";
import { Question, TestResult, QuestionResult } from "../types";
import { fetchQuestionsFromAPI } from "../utils/api";
import { Download } from "lucide-react";

const TestPage = () => {
  const [activeTab, setActiveTab] = useState<string>("section-a");
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [testSubmitted, setTestSubmitted] = useState(false);
  const [testResults, setTestResults] = useState<TestResult | null>(null);
  const [questions, setQuestions] = useState<Question[]>(mockQuestions);
  const [isLoading, setIsLoading] = useState(false);

  const sectionAQuestions = questions.filter((q, idx) => idx < 3);
  const sectionBQuestions = questions.filter((q, idx) => idx >= 3);

  useEffect(() => {
    // Fetch questions from API when the component mounts
    const loadQuestions = async () => {
      try {
        const apiQuestions = await fetchQuestionsFromAPI();
        setQuestions(apiQuestions);
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

  const handleAnswerChange = (questionId: string, answer: string | string[]) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const calculateResults = () => {
    const questionResults: QuestionResult[] = [];
    let totalScore = 0;
    let maxScore = 0;

    const sectionScores = {
      'Section A': { score: 0, total: 0 },
      'Section B': { score: 0, total: 0 }
    };

    questions.forEach((question) => {
      const studentAnswer = answers[question.id] || "";
      const isCorrect = Array.isArray(question.correctAnswer) 
        ? question.correctAnswer.includes(studentAnswer.toString())
        : studentAnswer === question.correctAnswer;

      const earnedMarks = isCorrect ? question.marks : 0;
      totalScore += earnedMarks;
      maxScore += question.marks;

      const section = questions.indexOf(question) < 3 ? 'Section A' : 'Section B';
      sectionScores[section].score += earnedMarks;
      sectionScores[section].total += question.marks;

      questionResults.push({
        questionId: question.id,
        studentAnswer,
        isCorrect,
        marks: earnedMarks,
        maxMarks: question.marks,
        feedback: !isCorrect ? "Review this question again" : undefined
      });
    });

    return {
      totalScore,
      maxScore,
      sectionScores,
      questionResults
    };
  };

  const handleSubmit = () => {
    // Check if all questions are answered
    const allQuestionsAnswered = questions.every(q => answers[q.id]);

    if (!allQuestionsAnswered) {
      toast({
        title: "Incomplete test",
        description: "Please answer all questions before submitting.",
        variant: "destructive"
      });
      return;
    }

    // Calculate and set results
    const results = calculateResults();
    setTestResults(results);
    setTestSubmitted(true);

    toast({
      title: "Test submitted",
      description: `You scored ${results.totalScore}/${results.maxScore}`,
    });
  };

  const resetTest = () => {
    setAnswers({});
    setTestSubmitted(false);
    setTestResults(null);
  };

  const handleDownloadQuestions = async () => {
    setIsLoading(true);

    try {
      const apiQuestions = await fetchQuestionsFromAPI();
      setQuestions(apiQuestions);
      setAnswers({});
      setTestSubmitted(false);
      setTestResults(null);

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

  const renderQuestions = (questions: Question[]) => {
    return questions.map((question) => (
      <div key={question.id} className="mb-4">
        {/* Display question number and text */}
        <h3 className="text-lg font-bold">{question.question_number}</h3>
        <p className="text-sm">{question.question_text}</p>

        {/* Render diagram if available */}
        {question.diagram && (
          <img
            src={question.diagram}
            alt={`Diagram for ${question.question_number}`}
            className="w-full my-2"
          />
        )}

        {/* Render options if question type is MCQ */}
        {question.type === "mcq" && question.options && (
          <div className="mt-2">
            {question.options.map((option, idx) => (
              <label key={idx} className="block">
                <input
                  type="radio"
                  name={question.id}
                  value={option}
                  checked={answers[question.id] === option}
                  onChange={() => handleAnswerChange(question.id, option)}
                />
                {option}
              </label>
            ))}
          </div>
        )}

        {/* Render answer box for descriptive or numerical questions */}
        {(question.type === "descriptive" || question.type === "numerical") && (
          <textarea
            value={answers[question.id] || ""}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            className="w-full mt-2 p-2 border"
            placeholder={`Your answer to ${question.question_number}`}
          />
        )}

        {/* Display marks if available */}
        {question.marks && (
          <p className="mt-1 text-sm text-gray-600">Marks: {question.marks}</p>
        )}
      </div>
    ));
  };

  return (
    <div className="page-container pb-20">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-2">Practice Test</h1>
          <p className="text-muted-foreground">
            Answer all questions to complete the test
          </p>
        </div>

        <Button 
          onClick={handleDownloadQuestions}
          variant="outline" 
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          {isLoading ? "Loading..." : "Load from API"}
        </Button>
      </div>

      {testSubmitted && testResults ? (
        <div className="mb-6">
          <Card className="mb-4 bg-gradient-to-r from-blue-50 to-purple-50">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-2">Test Results</h2>
              <div className="text-3xl font-bold mb-4">
                {testResults.totalScore}/{testResults.maxScore}
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                {Object.entries(testResults.sectionScores).map(([section, data]) => (
                  <div key={section} className="bg-white rounded-md p-3 shadow-sm">
                    <h3 className="text-sm font-medium">{section}</h3>
                    <p className="text-lg font-semibold">{data.score}/{data.total}</p>
                  </div>
                ))}
              </div>

              <Button onClick={resetTest} className="w-full">
                Try Again
              </Button>
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
          <TabsContent value="section-a">
            {renderQuestions(sectionAQuestions)}
          </TabsContent>
          <TabsContent value="section-b">
            {renderQuestions(sectionBQuestions)}
          </TabsContent>
          <TabsContent value="full">
            {renderQuestions(questions)}
          </TabsContent>
        </Tabs>
      )}

      {!testSubmitted && (
        <Button onClick={handleSubmit} className="w-full" disabled={isLoading}>
          Submit Test
        </Button>
      )}
    </div>
  );
};

export default TestPage;
