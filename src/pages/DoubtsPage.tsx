
import React, { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Lightbulb, Loader2, Send } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { solveDoubt } from "@/utils/api";
import { Doubt, AIModelResponse } from "../types"; 

const DoubtsPage = () => {
  const [doubt, setDoubt] = useState<string>("");
  const [isImportant, setIsImportant] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [aiResponse, setAiResponse] = useState<AIModelResponse | null>(null);

  const handleSubmitDoubt = useCallback(async () => {
    if (doubt.trim() === "") {
      toast({
        title: "Empty doubt",
        description: "Please enter your doubt before submitting.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const result = await solveDoubt(doubt, isImportant);
      
      if (result.response) {
        setAiResponse(result.response);
        toast({
          title: "Response received",
          description: `AI model used: ${result.response.model}`,
        });
      } else {
        toast({
          title: "Error",
          description: "Received an invalid response from the server",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error submitting doubt:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to get a response",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [doubt, isImportant]);

  const formatAIResponse = (text: string): string => {
    // Remove the <think></think> block if present
    return text.replace(/<think>[\s\S]*?<\/think>/g, '');
  };

  return (
    <div className="page-container">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2 text-primary">Ask a Doubt</h1>
        <p className="text-muted-foreground">
          Get help with your physics concepts and questions
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5">
          <Card className="shadow-lg border border-primary/20 h-full">
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <Lightbulb className="mr-2 h-5 w-5 text-yellow-500" />
                Submit Your Doubt
              </CardTitle>
              <CardDescription>
                Be specific with your question for better results
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="doubt-input">Topic</Label>
                <Input
                  id="doubt-input"
                  placeholder="Enter the topic or concept"
                  value={doubt}
                  onChange={(e) => setDoubt(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between mb-1">
                  <Label htmlFor="priority-switch">Mark as Important</Label>
                  <Switch
                    id="priority-switch"
                    checked={isImportant}
                    onCheckedChange={setIsImportant}
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Important doubts use more advanced AI models for complex problems
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full font-semibold"
                onClick={handleSubmitDoubt}
                disabled={isLoading || doubt.trim() === ""}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Submit Doubt
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
        
        <div className="lg:col-span-7">
          <Card className="shadow-lg border border-blue-500/20 h-full">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-transparent dark:from-blue-950/20 dark:to-transparent">
              <CardTitle className="text-xl">AI Response</CardTitle>
              <CardDescription>
                {aiResponse && (
                  <span className="text-sm inline-flex items-center bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-2 py-1 rounded-md">
                    Model: {aiResponse.model}
                  </span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[500px] overflow-y-auto prose dark:prose-invert max-w-none">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <Loader2 className="h-8 w-8 animate-spin mb-4 text-primary" />
                  <p className="text-muted-foreground">Thinking...</p>
                </div>
              ) : aiResponse ? (
                <div className="whitespace-pre-wrap">
                  {formatAIResponse(aiResponse.answer)}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <p>Submit a doubt to see the AI response here</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DoubtsPage;
