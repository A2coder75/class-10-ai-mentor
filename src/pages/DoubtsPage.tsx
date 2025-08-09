
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { Bookmark, BookmarkCheck, Send, Trash2, AlignLeft, Brain, Clock, Star, Loader2, MessageCircle, Sparkles } from 'lucide-react';
import { solveDoubt } from '@/utils/api';
import { ChatMessage } from '@/types';
import Header from '@/components/Header';

interface ChatHistory {
  prompt: string;
  messages: ChatMessage[];
  important: boolean;
  lastUpdated: Date;
}

const DoubtsPage: React.FC = () => {
  const [prompt, setPrompt] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isImportant, setIsImportant] = useState<boolean>(false);
  const [savedChats, setSavedChats] = useState<ChatHistory[]>([]);
  const [activeChat, setActiveChat] = useState<ChatMessage[]>([]);
  const [activeChatIndex, setActiveChatIndex] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<string>('ask');
  
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Load saved chats from localStorage on initial render
  useEffect(() => {
    const savedChatsJson = localStorage.getItem('doubts_chat_history');
    if (savedChatsJson) {
      try {
        const parsedChats = JSON.parse(savedChatsJson);
        
        // Convert string dates back to Date objects
        const processedChats = parsedChats.map((chat: any) => ({
          ...chat,
          lastUpdated: new Date(chat.lastUpdated),
          messages: chat.messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }))
        }));
        
        setSavedChats(processedChats);
      } catch (error) {
        console.error('Error loading saved chats:', error);
      }
    }
  }, []);

  // Save chats to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('doubts_chat_history', JSON.stringify(savedChats));
  }, [savedChats]);

  // Auto-scroll to the latest message
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeChat]);

  // Fix: Use autosize for textarea with useRef instead of auto-growing textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const adjustHeight = () => {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    };

    textarea.addEventListener('input', adjustHeight);
    // Set initial height
    adjustHeight();

    return () => {
      textarea.removeEventListener('input', adjustHeight);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!prompt.trim()) {
      toast({
        title: "Empty prompt",
        description: "Please enter a question or doubt.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    const isChatMode = activeChatIndex !== null;
    const now = new Date();
    
    // Create the new user message
    const userMessage: ChatMessage = {
      role: 'user',
      content: prompt.trim(),
      timestamp: now
    };
    
    try {
      // Update UI immediately with user message
      let updatedChat: ChatMessage[];
      
      if (isChatMode) {
        // Update existing chat
        updatedChat = [...activeChat, userMessage];
        setActiveChat(updatedChat);
      } else {
        // New chat
        updatedChat = [userMessage];
        setActiveChat(updatedChat);
      }

      // Extract just the content strings from the context messages
      const contextMessages = isChatMode 
        ? updatedChat.map(msg => msg.content)
        : undefined;
      
      // Fixed: Pass contextMessages directly as it's already the correct format (array of strings)
      // or undefined if it's a new chat
      const data = await solveDoubt(prompt.trim(), isImportant, contextMessages);
      
      // Create AI response message
      const aiMessage: ChatMessage = {
        role: 'assistant',
        content: data.response.answer,
        timestamp: new Date()
      };
      
      // Update with AI response
      const finalChat = [...updatedChat, aiMessage];
      setActiveChat(finalChat);
      
      if (isChatMode) {
        // Update existing chat history
        setSavedChats(prev => {
          const updated = [...prev];
          updated[activeChatIndex] = {
            prompt: updated[activeChatIndex].prompt,
            messages: finalChat,
            important: isImportant,
            lastUpdated: new Date()
          };
          return updated;
        });
      } else {
        // Create new chat history
        const newChatHistory: ChatHistory = {
          prompt: prompt.trim(),
          messages: finalChat,
          important: isImportant,
          lastUpdated: new Date()
        };
        
        setSavedChats(prev => [newChatHistory, ...prev]);
        setActiveChatIndex(0);
        setActiveTab('history');
      }
      
      // Clear prompt for new input
      setPrompt('');
    } catch (error) {
      console.error('Error solving doubt:', error);
      toast({
        title: "Error",
        description: "Failed to get AI response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const startNewChat = () => {
    setActiveChat([]);
    setActiveChatIndex(null);
    setActiveTab('ask');
    setPrompt('');
    setIsImportant(false);
  };
  
  const deleteChat = (index: number) => {
    setSavedChats(prev => {
      const updated = [...prev];
      updated.splice(index, 1);
      return updated;
    });
    
    if (activeChatIndex === index) {
      startNewChat();
    } else if (activeChatIndex !== null && activeChatIndex > index) {
      setActiveChatIndex(activeChatIndex - 1);
    }
  };
  
  const openChat = (index: number) => {
    setActiveChat(savedChats[index].messages);
    setActiveChatIndex(index);
    setIsImportant(savedChats[index].important);
    setActiveTab('ask');
  };
  
  const toggleImportance = (index: number) => {
    setSavedChats(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        important: !updated[index].important
      };
      
      if (activeChatIndex === index) {
        setIsImportant(!updated[index].important);
      }
      
      return updated;
    });
  };

  return (
    <div className="page-container">
      <Header 
        title="AI Doubt Solver"
        subtitle="Ask questions and get AI-powered explanations"
        showLogo={false}
      />
      
      <div className="flex flex-col gap-8">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-8/12">
            <Card className="h-full">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <CardHeader className="pb-0">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-2xl font-bold text-primary">AI Doubt Solver</CardTitle>
                    <TabsList>
                      <TabsTrigger value="ask" className="flex gap-2 items-center">
                        <MessageCircle className="h-4 w-4" />
                        Ask
                      </TabsTrigger>
                      <TabsTrigger value="history" className="flex gap-2 items-center">
                        <Clock className="h-4 w-4" />
                        History
                      </TabsTrigger>
                    </TabsList>
                  </div>
                </CardHeader>
                
                <TabsContent value="ask" className="pt-2 pb-0 px-0">
                  <CardContent className="space-y-4 pt-4">
                    <ScrollArea className="h-[400px] pr-4">
                      {activeChat.length > 0 ? (
                        <div className="space-y-4">
                          {activeChat.map((message, idx) => (
                            <div 
                              key={idx} 
                              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                              <div
                                className={`max-w-[80%] rounded-lg p-4 ${
                                  message.role === 'user'
                                    ? 'bg-primary text-primary-foreground ml-auto'
                                    : 'bg-card border shadow-sm'
                                }`}
                              >
                                <div className="whitespace-pre-wrap">{message.content}</div>
                                <div 
                                  className={`text-xs mt-2 ${
                                    message.role === 'user'
                                      ? 'text-primary-foreground/70'
                                      : 'text-muted-foreground'
                                  }`}
                                >
                                  {new Date(message.timestamp).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </div>
                              </div>
                            </div>
                          ))}
                          <div ref={messagesEndRef} />
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                          <Brain className="h-12 w-12 mb-4 opacity-20" />
                          <h3 className="text-lg font-medium mb-2">Ask me anything</h3>
                          <p className="max-w-sm">
                            I can help you understand tricky concepts or solve complex problems.
                          </p>
                        </div>
                      )}
                    </ScrollArea>
                  </CardContent>
                  
                  <CardFooter className="pt-4 border-t mt-4">
                    <form onSubmit={handleSubmit} className="w-full space-y-4">
                      <div className="grid gap-4">
                        <div className="relative">
                          <Textarea
                            ref={textareaRef}
                            placeholder="Type your question here..."
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            className="min-h-20 resize-none pr-12 overflow-y-auto"
                            disabled={isLoading}
                            rows={1}
                          />
                          <Button
                            type="submit"
                            size="icon"
                            disabled={isLoading || !prompt.trim()}
                            className="absolute right-2 bottom-2"
                          >
                            {isLoading ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Send className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Switch 
                              id="important" 
                              checked={isImportant}
                              onCheckedChange={setIsImportant}
                            />
                            <Label htmlFor="important" className="flex items-center gap-1">
                              <Star className="h-4 w-4 text-amber-500" />
                              Important question
                            </Label>
                          </div>
                          
                          {activeChatIndex !== null && (
                            <Button variant="ghost" onClick={startNewChat} size="sm">
                              New Chat
                            </Button>
                          )}
                        </div>
                      </div>
                    </form>
                  </CardFooter>
                </TabsContent>
                
                <TabsContent value="history" className="pt-2 pb-0 px-0">
                  <CardContent className="pt-4">
                    <ScrollArea className="h-[450px] pr-4">
                      {savedChats.length > 0 ? (
                        <div className="space-y-4">
                          {savedChats.map((chat, idx) => (
                            <Card 
                              key={idx}
                              className={`cursor-pointer hover:bg-accent/50 transition-colors ${
                                activeChatIndex === idx ? 'border-primary' : ''
                              }`}
                              onClick={() => openChat(idx)}
                            >
                              <CardContent className="p-4 flex justify-between items-center">
                                <div className="flex-1 truncate">
                                  <div className="font-medium truncate">{chat.prompt}</div>
                                  <div className="text-sm text-muted-foreground flex items-center gap-2">
                                    <Clock className="h-3 w-3" />
                                    {new Date(chat.lastUpdated).toLocaleDateString()} • 
                                    {chat.messages.length} messages
                                  </div>
                                </div>
                                
                                <div className="flex gap-2">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleImportance(idx);
                                    }}
                                  >
                                    {chat.important ? (
                                      <BookmarkCheck className="h-4 w-4 text-amber-500" />
                                    ) : (
                                      <Bookmark className="h-4 w-4" />
                                    )}
                                  </Button>
                                  
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      deleteChat(idx);
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                          <AlignLeft className="h-12 w-12 mb-4 opacity-20" />
                          <h3 className="text-lg font-medium mb-2">No chat history</h3>
                          <p>Your previous conversations will appear here.</p>
                        </div>
                      )}
                    </ScrollArea>
                  </CardContent>
                </TabsContent>
              </Tabs>
            </Card>
          </div>
          
          <div className="w-full md:w-4/12">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Study Tips
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <h4 className="font-medium mb-1">Ask Specific Questions</h4>
                  <p className="text-muted-foreground">The more specific your question, the more helpful the answer will be.</p>
                </div>
                
                <div className="p-3 bg-primary/10 rounded-lg">
                  <h4 className="font-medium mb-1">Include Context</h4>
                  <p className="text-muted-foreground">Mention any background information that might help the AI understand your question better.</p>
                </div>
                
                <div className="p-3 bg-primary/10 rounded-lg">
                  <h4 className="font-medium mb-1">Mark Important Questions</h4>
                  <p className="text-muted-foreground">Use the star icon to mark important questions that you'd like to revisit later.</p>
                </div>
                
                <div className="p-3 bg-primary/10 rounded-lg">
                  <h4 className="font-medium mb-1">Follow Up</h4>
                  <p className="text-muted-foreground">If the answer isn't clear, ask follow-up questions in the same chat thread for better context.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoubtsPage;
