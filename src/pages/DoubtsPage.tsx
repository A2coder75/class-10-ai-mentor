import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { ExternalLink, Send, CheckCircle2, XCircle, BrainCircuit, InfoIcon, MessagesSquare, ArrowRight, Trash2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { HoverCard, HoverCardTrigger, HoverCardContent } from "@/components/ui/hover-card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AIModelResponse, Doubt, DoubtsResponse, ChatMessage, ChatHistory } from "../types/index.d";
import { solveDoubt } from "@/utils/api";
import { v4 as uuidv4 } from 'uuid';
import Navbar from "@/components/Navbar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

const DoubtsPage: React.FC = () => {
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isImportant, setIsImportant] = useState(false);
  const [response, setResponse] = useState<AIModelResponse | null>(null);
  const [recentDoubts, setRecentDoubts] = useState<ChatHistory[]>([]);
  const [tokenCount, setTokenCount] = useState(0);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [activeChat, setActiveChat] = useState<ChatMessage[]>([]);
  const [isChatMode, setIsChatMode] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    document.documentElement.classList.add('dark');
    
    const savedDoubts = localStorage.getItem('recentDoubts');
    if (savedDoubts) {
      try {
        const parsed = JSON.parse(savedDoubts);
        setRecentDoubts(parsed.map((doubt: any) => ({
          ...doubt,
          lastUpdated: new Date(doubt.lastUpdated)
        })));
      } catch (e) {
        console.error("Failed to load saved doubts:", e);
      }
    }
  }, []);

  useEffect(() => {
    if (document.activeElement === document.getElementById('doubt-textarea') as HTMLTextAreaElement) {
      const cursorPosition = document.getElementById('doubt-textarea') as HTMLTextAreaElement;
      setTimeout(() => {
        cursorPosition.focus();
        cursorPosition.setSelectionRange(cursorPosition.selectionStart, cursorPosition.selectionStart);
      }, 0);
    }
  }, [prompt, activeChat]);

  useEffect(() => {
    if (recentDoubts.length > 0) {
      localStorage.setItem('recentDoubts', JSON.stringify(recentDoubts));
    }
  }, [recentDoubts]);

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
      let updatedChat = [...activeChat];
      
      if (isChatMode) {
        const newMessage: ChatMessage = {
          role: 'user' as const,
          content: prompt.trim(),
          timestamp: new Date()
        };
        
        updatedChat = [...updatedChat, newMessage];
        setActiveChat(updatedChat);
      }

      const context = isChatMode ? updatedChat : undefined;
      
      const data = await solveDoubt(prompt.trim(), isImportant, context);
      setResponse(data.response);
      setTokenCount(prev => prev + data.response.tokens_used);
      
      if (isChatMode) {
        const aiMessage: ChatMessage = {
          role: 'assistant' as const,
          content: data.response.answer,
          timestamp: new Date()
        };
        
        const updatedChatWithResponse = [...updatedChat, aiMessage];
        setActiveChat(updatedChatWithResponse);
        
        const chatId = activeChatId || uuidv4();
        if (!activeChatId) {
          setActiveChatId(chatId);
        }
        
        const updatedDoubts = recentDoubts.filter(d => d.prompt !== chatId);
        const newChat: ChatHistory = {
          prompt: chatId,
          messages: updatedChatWithResponse,
          important: isImportant,
          lastUpdated: new Date()
        };
        
        setRecentDoubts([newChat, ...updatedDoubts]);
      } else {
        const doubtId = uuidv4();
        const newDoubt: ChatHistory = {
          prompt: doubtId,
          messages: [
            { role: 'user' as const, content: prompt.trim(), timestamp: new Date() },
            { role: 'assistant' as const, content: data.response.answer, timestamp: new Date() }
          ],
          important: isImportant,
          lastUpdated: new Date()
        };
        
        setRecentDoubts(prev => [newDoubt, ...prev.slice(0, 4)]);
      }
      
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

  const startNewChat = () => {
    setIsChatMode(false);
    setActiveChatId(null);
    setActiveChat([]);
    setResponse(null);
    setPrompt("");
  };

  const continueChat = () => {
    if (!response) return;
    
    setIsChatMode(true);
    
    if (activeChatId === null) {
      const chatId = uuidv4();
      setActiveChatId(chatId);
      
      const initialMessages: ChatMessage[] = [
        { role: 'user' as const, content: prompt, timestamp: new Date() },
        { role: 'assistant' as const, content: response.answer, timestamp: new Date() }
      ];
      
      setActiveChat(initialMessages);
    }
  };

  const loadChat = (chat: ChatHistory) => {
    setIsChatMode(true);
    setActiveChatId(chat.prompt);
    setActiveChat(chat.messages);
    setIsImportant(chat.important);
    setResponse(null);
    setPrompt("");
  };

  const clearRecentDoubts = () => {
    setRecentDoubts([]);
    localStorage.removeItem('recentDoubts');
    setActiveChat([]);
    setActiveChatId(null);
    setIsChatMode(false);
    setResponse(null);
    toast({
      title: "Recent doubts cleared",
      description: "All your saved questions have been removed.",
      variant: "default",
    });
  };

  const formatAIResponse = (text: string): JSX.Element => {
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
    
    return <div className="whitespace-pre-wrap">{text}</div>;
  };

  const ChatInput = () => (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        <Textarea
          id="doubt-textarea"
          placeholder="Enter your physics question or concept you need help with..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="min-h-[120px] text-base"
          disabled={isLoading}
        />
        <div className="flex items-center gap-2">
          <Switch
            id="important"
            checked={isImportant}
            onCheckedChange={setIsImportant}
            disabled={isLoading || (isChatMode && !isImportant)}
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
            {isChatMode ? "Send Message" : "Submit Question"}
          </span>
        )}
      </Button>
    </form>
  );

  const ChatMessage = ({ message }: { message: ChatMessage }) => (
    <div className={`flex mb-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[80%] rounded-lg shadow-md p-4 
        ${message.role === 'user' 
          ? 'bg-primary/20 text-foreground ml-12' 
          : 'bg-card border border-border/50 mr-12'}`}>
        <div className="prose dark:prose-invert prose-sm max-w-none">
          {message.role === 'assistant' 
            ? formatAIResponse(message.content)
            : <p>{message.content}</p>}
        </div>
        <div className="mt-1 text-xs text-right text-muted-foreground">
          {new Date(message.timestamp).toLocaleTimeString()}
        </div>
      </div>
    </div>
  );

  const ChatHistory = () => (
    <Card className="bg-card shadow-lg border-primary/10 overflow-hidden">
      <div className="h-1.5 bg-gradient-to-r from-blue-500 via-blue-400 to-blue-300"></div>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-lg">Recent Questions</CardTitle>
            <CardDescription>
              Your previously asked questions
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={startNewChat} 
              className="text-xs"
            >
              New Question
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="destructive" 
                  size="sm" 
                  disabled={recentDoubts.length === 0} 
                  className="text-xs"
                >
                  <Trash2 className="h-3.5 w-3.5 mr-1" />
                  Clear All
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Clear all recent doubts?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete all your saved questions and conversations.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={clearRecentDoubts}>
                    Yes, clear all
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {recentDoubts.length > 0 ? (
          <ScrollArea className="h-[400px] pr-4">
            <ul className="space-y-3">
              {recentDoubts.map((chat, i) => {
                const isMultiMessage = chat.messages.length > 2;
                const userMessage = chat.messages.find(m => m.role === 'user');
                const aiMessage = chat.messages.find(m => m.role === 'assistant');
                const isCurrentChat = chat.prompt === activeChatId;
                
                return (
                  <li 
                    key={i} 
                    className={`p-3 rounded-md transition-colors text-sm cursor-pointer
                      ${isCurrentChat 
                        ? 'bg-primary/20 border border-primary/30' 
                        : 'bg-muted/30 hover:bg-muted/50 border border-transparent'}`}
                    onClick={() => loadChat(chat)}
                  >
                    <div className="flex items-start gap-2">
                      {isMultiMessage && (
                        <MessagesSquare className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                      )}
                      <div className="flex-grow overflow-hidden">
                        <div className="line-clamp-2 font-medium">
                          {userMessage?.content || "No question found"}
                        </div>
                        {aiMessage && (
                          <div className="line-clamp-2 text-xs text-muted-foreground mt-1">
                            {aiMessage.content.replace(/<think>.*?<\/think>/s, '').trim()}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex justify-between items-center mt-2 text-xs text-muted-foreground">
                      <span>
                        {chat.important && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs bg-amber-500/20 text-amber-500 mr-2">
                            Important
                          </span>
                        )}
                        {isMultiMessage && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs bg-primary/20 text-primary">
                            {chat.messages.length/2} messages
                          </span>
                        )}
                      </span>
                      <span>
                        {new Date(chat.lastUpdated).toLocaleDateString()}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          </ScrollArea>
        ) : (
          <div className="py-8 text-center">
            <p className="text-muted-foreground">No recent questions</p>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const PhysicsTips = () => (
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
  );

  const DoubtExamples = () => (
    <Card className="bg-card shadow-lg border-primary/10 overflow-hidden mt-4">
      <div className="h-1.5 bg-gradient-to-r from-indigo-500 via-indigo-400 to-indigo-300"></div>
      <CardHeader>
        <CardTitle className="text-lg">Example Questions</CardTitle>
        <CardDescription>Try asking about these topics</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {[
            "Explain Newton's Second Law with an example",
            "What is the difference between speed and velocity?",
            "How does a transformer work?",
            "Derive the equation for kinetic energy",
            "Explain quantum tunneling"
          ].map((example, i) => (
            <li 
              key={i}
              onClick={() => setPrompt(example)}
              className="p-2 rounded-md bg-muted/30 hover:bg-muted/50 cursor-pointer text-sm transition-colors"
            >
              {example}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );

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
                {isChatMode ? "Physics AI Chat" : "Physics AI Assistant"}
              </CardTitle>
              <CardDescription>
                {isChatMode 
                  ? "Continue your conversation about physics concepts" 
                  : "Ask any physics doubt and get AI-generated explanations"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isChatMode ? (
                <div className="flex flex-col space-y-4">
                  <ScrollArea className="h-[300px] pr-4 mb-4">
                    {activeChat.map((message, index) => (
                      <ChatMessage key={index} message={message} />
                    ))}
                    <div ref={messagesEndRef} />
                  </ScrollArea>
                  <ChatInput />
                </div>
              ) : (
                <ChatInput />
              )}
            </CardContent>
          </Card>

          {response && !isChatMode && (
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
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="gap-1"
                    onClick={continueChat}
                  >
                    <MessagesSquare className="h-3.5 w-3.5" />
                    Continue Chat
                  </Button>
                  <Button variant="ghost" size="sm" className="gap-1">
                    <ExternalLink className="h-3.5 w-3.5" />
                    Share
                  </Button>
                </div>
              </CardFooter>
            </Card>
          )}
        </div>

        <div>
          <ChatHistory />
          <PhysicsTips />
          <DoubtExamples />
        </div>
      </div>
      
      <Navbar />
    </div>
  );
};

export default DoubtsPage;
