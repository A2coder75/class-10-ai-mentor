
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mockQuestions } from "../utils/mockData";
import QuestionCard from "@/components/QuestionCard";
import Navbar from "@/components/Navbar";
import { toast } from "@/components/ui/use-toast";
import { Question, TestResult, QuestionResult } from "../types";

const TestPage = () => {
  const [activeTab, setActiveTab] = useState<string>("section-a");
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [testSubmitted, setTestSubmitted] = useState(false);
  const [testResults, setTestResults] = useState<TestResult | null>(null);

  const sectionAQuestions = mockQuestions.filter((q, idx) => idx < 3);
  const sectionBQuestions = mockQuestions.filter((q, idx) => idx >= 3);

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
    
    mockQuestions.forEach((question) => {
      const studentAnswer = answers[question.id] || "";
      const isCorrect = Array.isArray(question.correctAnswer) 
        ? question.correctAnswer.includes(studentAnswer.toString())
        : studentAnswer === question.correctAnswer;
      
      const earnedMarks = isCorrect ? question.marks : 0;
      totalScore += earnedMarks;
      maxScore += question.marks;
      
      const section = mockQuestions.indexOf(question) < 3 ? 'Section A' : 'Section B';
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
    const allQuestionsAnswered = mockQuestions.every(q => answers[q.id]);
    
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

  const renderQuestions = (questions: Question[]) => {
    return questions.map((question) => (
      <QuestionCard
        key={question.id}
        question={question}
        onAnswerChange={handleAnswerChange}
        studentAnswer={answers[question.id]}
        showResults={testSubmitted}
      />
    ));
  };

  return (
    <div className="page-container pb-20">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Practice Test</h1>
        <p className="text-muted-foreground">
          Answer all questions to complete the test
        </p>
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
            {renderQuestions(mockQuestions)}
          </TabsContent>
        </Tabs>
      )}

      {!testSubmitted && (
        <Button 
          onClick={handleSubmit} 
          className="w-full bg-primary"
          size="lg"
        >
          Submit Test
        </Button>
      )}

      <Navbar />
    </div>
  );
};

export default TestPage;
