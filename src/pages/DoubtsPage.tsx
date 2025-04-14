
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { ExternalLink, Send, CheckCircle2, XCircle, BrainCircuit, InfoIcon } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { HoverCard, HoverCardTrigger, HoverCardContent } from "@/components/ui/hover-card";
import { AIModelResponse, Doubt, DoubtsResponse } from "../types";

const DoubtsPage: React.FC = () => {
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isImportant, setIsImportant] = useState(false);
  const [response, setResponse] = useState<AIModelResponse | null>(null);
  const [recentDoubts, setRecentDoubts] = useState<{ prompt: string; timestamp: Date }[]>([]);
  const [tokenCount, setTokenCount] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    // Set dark mode as default
    document.documentElement.classList.add('dark');
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!prompt.trim()) {
      toast({
        title: "Empty prompt",
        description: "Please enter a doubt or question.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const doubt: Doubt = {
        prompt: prompt.trim(),
        important: isImportant
      };
      
      const response = await fetch("http://127.0.0.1:8000/solve_doubt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(doubt),
      });
      
      if (!response.ok) {
        throw new Error(`Server returned ${response.status} ${response.statusText}`);
      }
      
      const data: DoubtsResponse = await response.json();
      setResponse(data.response);
      setTokenCount(prev => prev + data.response.tokens_used);
      
      // Add to recent doubts
      setRecentDoubts(prev => [
        { prompt: prompt.trim(), timestamp: new Date() },
        ...prev.slice(0, 4), // Keep only 5 recent doubts
      ]);
      
      // Clear prompt field
      setPrompt("");
      
      toast({
        title: "Response received!",
        description: `Answered using ${data.response.model}`,
        variant: "default",
      });
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
  };

  // Helper function to format the AI response
  const formatAIResponse = (text: string): JSX.Element => {
    // Check if response contains a thinking section
    if (text.includes('<think>') && text.includes('</think>')) {
      const parts = text.split(/<think>|<\/think>/);
      if (parts.length >= 3) {
        const thinking = parts[1].trim();
        const answer = parts[2].trim();
        
        return (
          <div className="space-y-4">
            <div className="p-4 bg-gray-800 border-l-4 border-amber-500 rounded">
              <div className="flex items-start">
                <BrainCircuit className="h-5 w-5 mr-2 flex-shrink-0 text-amber-500 mt-1" />
                <div>
                  <p className="text-sm font-medium text-amber-500 mb-2">Thinking process:</p>
                  <p className="text-sm text-gray-300 whitespace-pre-wrap">{thinking}</p>
                </div>
              </div>
            </div>
            <div className="whitespace-pre-wrap">{answer}</div>
          </div>
        );
      }
    }
    
    // If no thinking section is found, return the whole text
    return <div className="whitespace-pre-wrap">{text}</div>;
  };

  return (
    <div className="page-container pb-20">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Ask Your Doubts</h1>
        <p className="text-muted-foreground">
          Get instant explanations for physics concepts from AI
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="bg-card shadow-lg border-primary/10 overflow-hidden">
            <div className="h-1.5 bg-gradient-to-r from-violet-500 via-purple-500 to-indigo-500"></div>
            <CardHeader>
              <CardTitle className="text-xl flex items-center">
                <BrainCircuit className="h-5 w-5 mr-2 text-primary" />
                Physics AI Assistant
              </CardTitle>
              <CardDescription>
                Ask any physics doubt and get AI-generated explanations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <Textarea
                    placeholder="Enter your physics question or concept you need help with..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="min-h-[150px] text-base"
                    disabled={isLoading}
                  />
                  <div className="flex items-center gap-2">
                    <Switch
                      id="important"
                      checked={isImportant}
                      onCheckedChange={setIsImportant}
                      disabled={isLoading}
                    />
                    <Label htmlFor="important" className="flex items-center gap-1">
                      Mark as important 
                      <HoverCard>
                        <HoverCardTrigger asChild>
                          <InfoIcon className="h-4 w-4 text-muted-foreground cursor-help" />
                        </HoverCardTrigger>
                        <HoverCardContent className="w-80">
                          <div className="space-y-2">
                            <h4 className="font-medium">Important Questions</h4>
                            <p className="text-sm text-muted-foreground">
                              Select this option for complex or logical questions requiring detailed explanations. This may use more tokens but will provide deeper insights.
                            </p>
                          </div>
                        </HoverCardContent>
                      </HoverCard>
                    </Label>
                  </div>
                </div>
                <Button 
                  type="submit" 
                  className="mt-4 w-full bg-primary hover:bg-primary/90" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <Send className="h-4 w-4 mr-2" />
                      Submit Question
                    </span>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {response && (
            <Card className="mt-6 shadow-lg border-primary/10 overflow-hidden animate-fade-in">
              <div className="h-1.5 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500"></div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div>
                  <CardTitle className="text-xl flex items-center">
                    <CheckCircle2 className="h-5 w-5 mr-2 text-green-500" />
                    AI Response
                  </CardTitle>
                  <CardDescription>
                    Using model: <span className="font-semibold">{response.model}</span>
                  </CardDescription>
                </div>
                <div className="text-sm text-muted-foreground px-2 py-1 bg-muted rounded-md">
                  Tokens used: {response.tokens_used}
                </div>
              </CardHeader>
              <CardContent className="pt-4 prose prose-sm dark:prose-invert max-w-none">
                {formatAIResponse(response.answer)}
              </CardContent>
              <CardFooter className="border-t bg-muted/20 flex justify-between items-center py-3 text-sm">
                <span className="text-muted-foreground">
                  Total tokens used in this session: {tokenCount}
                </span>
                <Button variant="ghost" size="sm" className="gap-1">
                  <ExternalLink className="h-3.5 w-3.5" />
                  Share
                </Button>
              </CardFooter>
            </Card>
          )}
        </div>

        <div>
          <Card className="bg-card shadow-lg border-primary/10 overflow-hidden">
            <div className="h-1.5 bg-gradient-to-r from-blue-500 via-blue-400 to-blue-300"></div>
            <CardHeader>
              <CardTitle className="text-lg">Recent Questions</CardTitle>
              <CardDescription>
                Your previously asked questions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentDoubts.length > 0 ? (
                <ul className="space-y-3">
                  {recentDoubts.map((doubt, i) => (
                    <li 
                      key={i} 
                      className="p-3 bg-muted/30 rounded-md hover:bg-muted/50 transition-colors text-sm cursor-pointer"
                      onClick={() => setPrompt(doubt.prompt)}
                    >
                      <div className="line-clamp-2 font-medium">{doubt.prompt}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {doubt.timestamp.toLocaleTimeString()} - {doubt.timestamp.toLocaleDateString()}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="py-8 text-center">
                  <p className="text-muted-foreground">No recent questions</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="mt-4 bg-card shadow-lg border-primary/10 overflow-hidden">
            <div className="h-1.5 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-300"></div>
            <CardHeader>
              <CardTitle className="text-lg">Tips</CardTitle>
              <CardDescription>How to get better responses</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span>Be specific with your questions</span>
                </li>
                <li className="flex gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span>Include relevant context</span>
                </li>
                <li className="flex gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span>For derivations, mark as "important"</span>
                </li>
                <li className="flex gap-2">
                  <XCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                  <span>Avoid asking multiple questions at once</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DoubtsPage;
