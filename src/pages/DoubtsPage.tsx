
import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import Navbar from "@/components/Navbar";
import { Send, Loader2, Brain, Star, MessageSquareText } from "lucide-react";
import { solveDoubt } from "@/utils/api";
import { toast } from "@/components/ui/use-toast";
import { Label } from "@/components/ui/label";

interface Message {
  id: string;
  text: string;
  sender: "user" | "ai";
  timestamp: Date;
  thinking?: string;
  tokensUsed?: number;
}

const DoubtsPage = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      text: "Hi! I'm your Physics AI assistant. How can I help you with your studies today?",
      sender: "ai",
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isImportant, setIsImportant] = useState(false);
  const [totalTokensUsed, setTotalTokensUsed] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSend = async () => {
    if (!inputText.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setIsLoading(true);

    try {
      const response = await solveDoubt(inputText, isImportant);
      
      let aiText = response.response.answer;
      let thinking = "";
      
      // Extract thinking part if it exists
      const thinkMatch = aiText.match(/<think>(.*?)<\/think>/s);
      if (thinkMatch && thinkMatch[1]) {
        thinking = thinkMatch[1].trim();
        aiText = aiText.replace(/<think>.*?<\/think>/s, "").trim();
      }

      const tokensUsed = response.response.tokens_used;
      setTotalTokensUsed(prev => prev + tokensUsed);
      
      const aiMessage: Message = {
        id: Date.now().toString(),
        text: aiText,
        sender: "ai",
        timestamp: new Date(),
        thinking: thinking,
        tokensUsed: tokensUsed
      };

      setMessages((prev) => [...prev, aiMessage]);
      
    } catch (error) {
      console.error("Error sending doubt:", error);
      toast({
        title: "Error",
        description: "Failed to get a response. Please try again later.",
        variant: "destructive"
      });
      
      const errorMessage: Message = {
        id: Date.now().toString(),
        text: "Sorry, I couldn't process your question. Please try again later.",
        sender: "ai",
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setIsImportant(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Function to format thinking text with proper line breaks
  const formatThinking = (text: string) => {
    return text.split("\n").map((line, i) => (
      <React.Fragment key={i}>
        {line}
        <br />
      </React.Fragment>
    ));
  };

  return (
    <div className="page-container pb-20">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Ask a Doubt</h1>
        <p className="text-muted-foreground">
          Get help with physics concepts and problems
        </p>
      </div>

      <div className="flex flex-col h-[calc(100vh-250px)]">
        <Card className="flex-1 overflow-hidden mb-4 border border-primary/20 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-4 h-full overflow-y-auto">
            <div className="space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${
                    msg.sender === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      msg.sender === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted hover:bg-muted/90 transition-colors"
                    }`}
                  >
                    {msg.thinking && (
                      <div className="mb-3 border-l-2 border-primary/60 pl-3 py-1 text-sm italic text-muted-foreground bg-background/30 rounded-sm">
                        <div className="flex items-center gap-2 mb-1">
                          <Brain className="h-4 w-4 text-primary/80" />
                          <span className="font-medium text-primary/80">Thinking...</span>
                        </div>
                        <div className="whitespace-pre-wrap">
                          {formatThinking(msg.thinking)}
                        </div>
                      </div>
                    )}
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                    <div
                      className={`flex justify-between items-center text-xs mt-2 ${
                        msg.sender === "user" ? "text-primary-foreground/70" : "text-muted-foreground"
                      }`}
                    >
                      <span>
                        {msg.timestamp.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      {msg.tokensUsed && (
                        <span className="flex items-center gap-1 bg-background/40 px-2 py-0.5 rounded-full">
                          <MessageSquareText className="h-3 w-3" />
                          {msg.tokensUsed} tokens
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="max-w-[80%] rounded-lg p-4 bg-muted">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 relative">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                        </div>
                      </div>
                      <span className="text-sm font-medium">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </CardContent>
        </Card>

        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center space-x-2">
              <Switch
                id="important"
                checked={isImportant}
                onCheckedChange={setIsImportant}
              />
              <Label htmlFor="important" className="flex items-center gap-1 text-sm cursor-pointer">
                <Star className={`h-4 w-4 ${isImportant ? "text-amber-400" : "text-muted-foreground"}`} />
                Mark as important
              </Label>
            </div>
            <div className="text-xs text-muted-foreground">
              Total tokens: {totalTokensUsed}
            </div>
          </div>
          
          <div className="flex">
            <Textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your physics question here..."
              className="flex-1 mr-2 bg-background/70 border-primary/30 focus:border-primary/50"
              rows={2}
            />
            <Button
              onClick={handleSend}
              disabled={isLoading || !inputText.trim()}
              className="self-end"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>

      <Navbar />
    </div>
  );
};

export default DoubtsPage;
