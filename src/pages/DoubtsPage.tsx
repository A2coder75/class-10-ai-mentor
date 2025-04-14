
import React, { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Lightbulb, Loader2, ArrowLeftCircle, PlusCircle } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { solveDoubt, getChatHistories, saveChatHistory, deleteChatHistory, getChatHistoryById } from "@/utils/api";
import { Message, Doubt, AIModelResponse, ChatHistory } from "../types"; 
import { v4 as uuidv4 } from "uuid";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import ChatMessage from "@/components/doubts/ChatMessage";
import ChatInput from "@/components/doubts/ChatInput";
import ChatHistoryList from "@/components/doubts/ChatHistory";
import PhysicsTips from "@/components/doubts/PhysicsTips";
import DoubtExamples from "@/components/doubts/DoubtExamples";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/use-mobile";

const DoubtsPage = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [aiResponse, setAiResponse] = useState<AIModelResponse | null>(null);
  const [chatHistories, setChatHistories] = useState<ChatHistory[]>([]);
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [isImportant, setIsImportant] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isMobile = useMediaQuery("(max-width: 768px)");

  // Load chat histories on mount
  useEffect(() => {
    const histories = getChatHistories();
    setChatHistories(histories);
  }, []);

  // Scroll to bottom when messages update
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const formatAIResponse = (text: string): string => {
    // Remove the <think></think> block if present
    return text.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
  };

  const handleSubmitDoubt = useCallback(async (content: string, important: boolean) => {
    if (content.trim() === "") {
      toast({
        title: "Empty doubt",
        description: "Please enter your doubt before submitting.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    // Create a new message from the user
    const newUserMessage: Message = {
      role: "user",
      content: content.trim(),
      timestamp: new Date().toISOString(),
    };

    // If starting a new chat
    if (!activeChat) {
      const chatId = uuidv4();
      setActiveChat(chatId);
      setIsImportant(important);
      
      // Create a new chat history
      const newChat: ChatHistory = {
        id: chatId,
        title: content.substring(0, 30) + (content.length > 30 ? "..." : ""),
        messages: [newUserMessage],
        important: important,
        lastUpdated: new Date().toISOString(),
      };
      
      // Update chat histories
      setChatHistories(prev => [...prev, newChat]);
      
      // Save to localStorage
      saveChatHistory(newChat);
      
      // Update messages
      setMessages([newUserMessage]);
    } else {
      // Update existing chat
      setMessages(prev => [...prev, newUserMessage]);
      
      // Get current chat
      const currentChat = chatHistories.find(chat => chat.id === activeChat);
      
      if (currentChat) {
        const updatedMessages = [...currentChat.messages, newUserMessage];
        
        // Update chat history
        const updatedChat: ChatHistory = {
          ...currentChat,
          messages: updatedMessages,
          lastUpdated: new Date().toISOString(),
        };
        
        // Update chat histories
        setChatHistories(prev => prev.map(chat => 
          chat.id === activeChat ? updatedChat : chat
        ));
        
        // Save to localStorage
        saveChatHistory(updatedChat);
      }
    }

    try {
      // Get the current chat history for context
      const currentChat = getChatHistoryById(activeChat || "");
      
      // Create the doubt request
      const doubt: Doubt = {
        prompt: content,
        important: important || isImportant, // Use chat's importance setting if continuing
        context: currentChat?.messages || []
      };
      
      const result = await solveDoubt(doubt);
      
      if (result.response) {
        setAiResponse(result.response);
        
        // Create AI message
        const aiMessage: Message = {
          role: "assistant",
          content: formatAIResponse(result.response.answer),
          timestamp: new Date().toISOString(),
        };
        
        // Update messages
        setMessages(prev => [...prev, aiMessage]);
        
        // Update chat history
        if (activeChat) {
          const currentChat = getChatHistoryById(activeChat);
          
          if (currentChat) {
            const updatedChat: ChatHistory = {
              ...currentChat,
              messages: [...currentChat.messages, newUserMessage, aiMessage],
              lastUpdated: new Date().toISOString(),
            };
            
            // Update chat histories
            setChatHistories(prev => prev.map(chat => 
              chat.id === activeChat ? updatedChat : chat
            ));
            
            // Save to localStorage
            saveChatHistory(updatedChat);
          }
        }
        
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
  }, [activeChat, chatHistories, isImportant]);

  const handleSelectChat = (chatId: string) => {
    const chat = getChatHistoryById(chatId);
    
    if (chat) {
      setActiveChat(chatId);
      setMessages(chat.messages);
      setIsImportant(chat.important);
      
      if (isMobile) {
        // Close drawer on mobile after selecting a chat
        const closeButton = document.querySelector('[data-radix-collection-item]');
        if (closeButton instanceof HTMLElement) {
          closeButton.click();
        }
      }
    }
  };

  const handleDeleteChat = (chatId: string) => {
    // Delete from localStorage
    deleteChatHistory(chatId);
    
    // Update state
    setChatHistories(prev => prev.filter(chat => chat.id !== chatId));
    
    // If the active chat is deleted, clear the active chat
    if (activeChat === chatId) {
      setActiveChat(null);
      setMessages([]);
    }
  };

  const handleNewChat = () => {
    setActiveChat(null);
    setMessages([]);
    setAiResponse(null);
    setIsImportant(false);
  };

  const handleExampleClick = (example: string) => {
    handleSubmitDoubt(example, false);
  };

  return (
    <div className="page-container pb-20">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-[calc(100vh-200px)]">
        {/* Sidebar for desktop */}
        <div className="md:col-span-4 lg:col-span-3 hidden md:block">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold flex items-center">
              <Lightbulb className="mr-2 h-5 w-5 text-yellow-500" />
              Physics Doubts
            </h2>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleNewChat}
              className="flex items-center text-xs h-8"
            >
              <PlusCircle className="h-3.5 w-3.5 mr-1" />
              New Chat
            </Button>
          </div>
          
          <div className="space-y-5">
            <ChatHistoryList 
              chats={chatHistories}
              onSelectChat={handleSelectChat}
              onDeleteChat={handleDeleteChat}
              activeChat={activeChat || undefined}
            />
            
            <PhysicsTips />
          </div>
        </div>

        {/* Mobile drawer for chat history */}
        <div className="md:hidden">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold flex items-center">
              <Lightbulb className="mr-2 h-5 w-5 text-yellow-500" />
              Physics Doubts
            </h2>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleNewChat}
                className="flex items-center text-xs h-8"
              >
                <PlusCircle className="h-3.5 w-3.5 mr-1" />
                New
              </Button>
              
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon" className="h-8 w-8">
                    <Lightbulb className="h-4 w-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[85%] sm:w-[350px]">
                  <div className="flex flex-col h-full">
                    <h2 className="text-xl font-bold mb-4 flex items-center">
                      <Lightbulb className="mr-2 h-5 w-5 text-yellow-500" />
                      Previous Doubts
                    </h2>
                    
                    <div className="flex-1 overflow-auto">
                      <ChatHistoryList 
                        chats={chatHistories}
                        onSelectChat={handleSelectChat}
                        onDeleteChat={handleDeleteChat}
                        activeChat={activeChat || undefined}
                      />
                    </div>
                    
                    <div className="mt-4">
                      <PhysicsTips />
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>

        {/* Main chat area */}
        <div className="md:col-span-8 lg:col-span-9 flex flex-col h-full">
          <Card className="border shadow-sm flex-1 flex flex-col overflow-hidden">
            <CardHeader className={cn(
              "flex-row items-center justify-between gap-2 px-4 py-3",
              activeChat ? "border-b bg-muted/30" : ""
            )}>
              {activeChat ? (
                <>
                  <div className="flex items-center">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 mr-2 md:hidden" 
                      onClick={handleNewChat}
                    >
                      <ArrowLeftCircle className="h-4 w-4" />
                    </Button>
                    <CardTitle className="text-base">
                      {chatHistories.find(ch => ch.id === activeChat)?.title || "Chat"}
                    </CardTitle>
                  </div>
                  <div className="flex items-center">
                    {isImportant && (
                      <span className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 text-xs px-2 py-0.5 rounded-full flex items-center">
                        <Lightbulb className="h-3 w-3 mr-1" />
                        Important
                      </span>
                    )}
                  </div>
                </>
              ) : (
                <CardTitle className="text-lg">New Doubt</CardTitle>
              )}
            </CardHeader>
            
            <CardContent className={cn(
              "flex-1 overflow-y-auto p-4",
              messages.length === 0 ? "flex items-center justify-center" : ""
            )}>
              {messages.length === 0 ? (
                <div className="max-w-lg w-full mx-auto space-y-6">
                  <div className="text-center">
                    <Lightbulb className="h-12 w-12 mx-auto mb-3 text-primary opacity-80" />
                    <h3 className="text-lg font-medium mb-2">Ask Your Physics Doubts</h3>
                    <p className="text-sm text-muted-foreground mb-6">
                      Get help with physics concepts, formulas, or problem-solving techniques
                    </p>
                  </div>
                  
                  <DoubtExamples onSelectExample={handleExampleClick} />
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message, index) => (
                    <ChatMessage key={index} message={message} />
                  ))}
                  {isLoading && (
                    <div className="flex justify-center py-4">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </CardContent>
            
            <CardFooter className="border-t p-4 bg-card">
              <ChatInput 
                onSubmit={handleSubmitDoubt}
                isLoading={isLoading}
                defaultImportant={isImportant}
                disableImportantToggle={activeChat !== null} // Can't change importance for existing chats
              />
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DoubtsPage;
