
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mockQuestions } from "../utils/mockData";
import { toast } from "@/components/ui/use-toast";
import { Question, TestResult, QuestionResult } from "../types";
import { fetchQuestionsFromAPI } from "../utils/api";
import { Download } from "lucide-react";

const TestPage = () => {
  const [activeTab, setActiveTab] = useState<string>("section-a");
  const [testSubmitted, setTestSubmitted] = useState(false);
  const [testResults, setTestResults] = useState<TestResult | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(false);

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
    if (!questions || questions.length === 0) {
      return <div className="text-center p-4">No questions available for this section</div>;
    }
    
    return questions.map((question) => (
      <div key={question.question_number || question.id} className="mb-8 p-4 rounded-lg border dark:border-gray-700 bg-white dark:bg-gray-800">
        {/* Display section and question number */}
        <div className="text-lg font-bold mb-2 flex items-center justify-between">
          <div>{`Section ${question.section} - Q${question.question_number}`}</div>
          <div className="text-sm font-normal bg-secondary/50 dark:bg-gray-700 px-2 py-1 rounded">
            {question.type === "question" ? "Root Question" : question.type}
          </div>
        </div>

        {/* Display question text */}
        <p className="mb-4 text-gray-800 dark:text-gray-200">{question.question_text}</p>

        {/* Render diagram if available */}
        {question.diagram && (
          <div className="my-4 flex justify-center">
            <img
              src={question.diagram}
              alt={`Diagram for ${question.question_number}`}
              className="max-w-full h-auto rounded border dark:border-gray-600"
              style={{ maxHeight: "300px" }}
            />
          </div>
        )}

        {/* Only show options for MCQ questions */}
        {question.type === "mcq" && question.options && (
          <div className="mt-4 space-y-2">
            <p className="font-medium text-gray-700 dark:text-gray-300">Options:</p>
            {question.options.map((option, idx) => (
              <div key={idx} className="ml-4 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
                {option}
              </div>
            ))}
          </div>
        )}

        {/* For fill_in_blank questions */}
        {question.type === "fill_in_blank" && (
          <div className="mt-4">
            <p className="italic text-gray-600 dark:text-gray-400">This is a fill in the blank question</p>
          </div>
        )}

        {/* For descriptive questions */}
        {question.type === "descriptive" && (
          <div className="mt-4">
            <p className="italic text-gray-600 dark:text-gray-400">This is a descriptive question</p>
          </div>
        )}

        {/* Skip rendering answer prompts for "question" type, which are just root questions */}
        {question.type !== "question" && (
          <div className="mt-4 text-right">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Answer not required for this demo
            </span>
          </div>
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
            Review questions from all sections
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
          <Card className="mb-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-2">Test Results</h2>
              <div className="text-3xl font-bold mb-4">
                {testResults.totalScore}/{testResults.maxScore}
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                {Object.entries(testResults.sectionScores).map(([section, data]) => (
                  <div key={section} className="bg-white dark:bg-gray-800 rounded-md p-3 shadow-sm">
                    <h3 className="text-sm font-medium">{section}</h3>
                    <p className="text-lg font-semibold">{data.score}/{data.total}</p>
                  </div>
                ))}
              </div>

              <Button onClick={() => setTestSubmitted(false)} className="w-full">
                Back to Questions
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
    </div>
  );
};

export default TestPage;
