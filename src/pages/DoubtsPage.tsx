import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { Bookmark, BookmarkCheck, Send, Trash2, Clock, Star, Loader2, Brain, Sparkles } from 'lucide-react';
import { solveDoubt } from '@/utils/api';
import { ChatMessage } from '@/types';

interface ChatHistory {
  prompt: string;
  messages: ChatMessage[];
  important: boolean;
  lastUpdated: Date;
}

const DoubtsPage: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isImportant, setIsImportant] = useState(false);
  const [savedChats, setSavedChats] = useState<ChatHistory[]>([]);
  const [activeChat, setActiveChat] = useState<ChatMessage[]>([]);
  const [activeChatIndex, setActiveChatIndex] = useState<number | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Load saved chats
  useEffect(() => {
    const saved = localStorage.getItem('doubts_chat_history');
    if (saved) {
      try {
        const parsed: ChatHistory[] = JSON.parse(saved).map((c: any) => ({
          ...c,
          lastUpdated: new Date(c.lastUpdated),
          messages: c.messages.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) }))
        }));
        setSavedChats(parsed);
      } catch {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('doubts_chat_history', JSON.stringify(savedChats));
  }, [savedChats]);

  useEffect(() => {
    if (messagesEndRef.current) messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [activeChat]);

  // Autosize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    const adjustHeight = () => {
      ta.style.height = 'auto';
      ta.style.height = `${ta.scrollHeight}px`;
    };
    ta.addEventListener('input', adjustHeight);
    adjustHeight();
    return () => ta.removeEventListener('input', adjustHeight);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return toast({ title: 'Empty prompt', variant: 'destructive' });
    setIsLoading(true);

    const now = new Date();
    const userMessage: ChatMessage = { role: 'user', content: prompt.trim(), timestamp: now };
    let updatedChat = [...activeChat, userMessage];
    setActiveChat(updatedChat);

    try {
      const data = await solveDoubt(prompt.trim(), isImportant, activeChat.map(m => m.content));
      const aiMessage: ChatMessage = {
        role: 'assistant',
        content: data.response.answer,
        timestamp: new Date()
      };
      updatedChat = [...updatedChat, aiMessage];
      setActiveChat(updatedChat);

      if (activeChatIndex !== null) {
        setSavedChats(prev => {
          const updated = [...prev];
          updated[activeChatIndex] = {
            ...updated[activeChatIndex],
            messages: updatedChat,
            important: isImportant,
            lastUpdated: new Date()
          };
          return updated;
        });
      } else {
        const newChat: ChatHistory = {
          prompt: prompt.trim(),
          messages: updatedChat,
          important: isImportant,
          lastUpdated: new Date()
        };
        setSavedChats(prev => [newChat, ...prev]);
        setActiveChatIndex(0);
      }
      setPrompt('');
    } catch {
      toast({ title: 'Error', description: 'Failed to get AI response', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const startNewChat = () => {
    setActiveChat([]);
    setActiveChatIndex(null);
    setPrompt('');
    setIsImportant(false);
  };

  const deleteChat = (index: number) => {
    setSavedChats(prev => prev.filter((_, i) => i !== index));
    if (activeChatIndex === index) startNewChat();
    else if (activeChatIndex !== null && activeChatIndex > index) setActiveChatIndex(activeChatIndex - 1);
  };

  const toggleImportance = (index: number) => {
    setSavedChats(prev => {
      const updated = [...prev];
      updated[index].important = !updated[index].important;
      if (activeChatIndex === index) setIsImportant(updated[index].important);
      return updated;
    });
  };

  const openChat = (index: number) => {
    setActiveChat(savedChats[index].messages);
    setActiveChatIndex(index);
    setIsImportant(savedChats[index].important);
  };

  return (
    <div className="page-container bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 min-h-screen p-4 md:p-8 flex flex-col md:flex-row gap-6">
      {/* Left: Chat Area */}
      <div className="flex-1 flex flex-col gap-4">
        <Card className="flex flex-col flex-1 shadow-2xl rounded-2xl overflow-hidden relative bg-white/80 dark:bg-gray-900/70 backdrop-blur-md">
          {/* Banner */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-green-500 rounded-tl-2xl rounded-tr-2xl" />
          <CardHeader className="pt-6">
            <CardTitle className="text-2xl font-extrabold text-foreground">AI Doubt Solver</CardTitle>
          </CardHeader>

          {/* Chat Messages */}
          <CardContent className="flex-1 p-4 overflow-y-auto space-y-4" style={{ minHeight: '400px' }}>
            {activeChat.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                <Brain className="h-16 w-16 mb-2 opacity-20" />
                <h3 className="text-lg font-medium mb-1">Ask me anything</h3>
                <p className="max-w-sm">I help you solve doubts and understand concepts clearly.</p>
              </div>
            )}
            {activeChat.map((msg, idx) => {
              const isUser = msg.role === 'user';
              const isThinking = msg.content.includes('<think>');
              return (
                <div key={idx} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`relative max-w-[80%] p-4 rounded-xl shadow-lg transition-transform transform hover:scale-[1.02]
                      ${isUser ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white ml-auto' : 'bg-white/80 dark:bg-gray-800/70 border border-gray-300 dark:border-gray-700'}
                    `}
                  >
                    <div className={`${isThinking ? 'animate-pulse opacity-70 font-semibold' : ''}`}>
                      {msg.content.replace('<think>', '')}
                    </div>
                    <div className={`text-xs mt-2 ${isUser ? 'text-white/70' : 'text-muted-foreground'}`}>
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </CardContent>

          {/* Input Area */}
          <CardFooter className="pt-4 border-t bg-gradient-to-t from-white/50 dark:from-gray-900/50 backdrop-blur-md flex flex-col md:flex-row items-center gap-2">
            <Textarea
              ref={textareaRef}
              placeholder="Type your question here..."
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              className="flex-1 min-h-[50px] max-h-[150px] resize-none p-3 rounded-xl shadow-inner focus:ring-2 focus:ring-emerald-400 dark:focus:ring-green-400 transition-all"
              disabled={isLoading}
            />
            <div className="flex items-center gap-2">
              <Switch
                id="important"
                checked={isImportant}
                onCheckedChange={setIsImportant}
                className="bg-gradient-to-r from-amber-400 to-amber-500 shadow-md"
              />
              <Label htmlFor="important" className="flex items-center gap-1 text-sm font-medium select-none">
                <Star className="h-4 w-4 text-amber-500" />
                Important
              </Label>
              <Button
                type="submit"
                onClick={handleSubmit}
                disabled={isLoading || !prompt.trim()}
                className="bg-gradient-to-r from-emerald-400 to-green-500 text-white hover:scale-105 transition-transform"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>

      {/* Right: History / Tips */}
      <div className="w-full md:w-4/12 flex flex-col gap-4">
        <Card className="shadow-2xl rounded-2xl overflow-hidden bg-gradient-to-tr from-white/80 to-white/50 dark:from-gray-900/80 dark:to-gray-800/50 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-semibold">
              <Sparkles className="h-5 w-5 text-primary" />
              Study Tips
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { title: 'Ask Specific Questions', text: 'Be precise for best results.', color: 'from-green-400 to-emerald-500' },
              { title: 'Include Context', text: 'Provide background to help AI.', color: 'from-blue-400 to-indigo-500' },
              { title: 'Mark Important Questions', text: 'Star questions to revisit later.', color: 'from-amber-400 to-yellow-500' },
              { title: 'Follow Up', text: 'Ask clarifying questions in the same thread.', color: 'from-pink-400 to-red-400' },
            ].map((tip, i) => (
              <div key={i} className={`p-3 rounded-xl bg-gradient-to-r ${tip.color} text-white shadow-lg flex flex-col`}>
                <h4 className="font-semibold">{tip.title}</h4>
                <p className="text-sm mt-1">{tip.text}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="flex-1 shadow-2xl rounded-2xl overflow-hidden bg-white/80 dark:bg-gray-900/70 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              History
            </CardTitle>
          </CardHeader>
          <CardContent className="p-2 overflow-y-auto space-y-2" style={{ maxHeight: '350px' }}>
            {savedChats.length === 0 && (
              <div className="flex flex-col items-center justify-center text-muted-foreground text-center py-6">
                No previous chats
              </div>
            )}
            {savedChats.map((chat, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-xl shadow-md flex justify-between items-center cursor-pointer hover:scale-[1.02] transition-transform
                  ${activeChatIndex === idx ? 'border-2 border-emerald-400 bg-gradient-to-r from-green-100/80 to-emerald-100/80' : 'bg-white/70 dark:bg-gray-800/60'}
                `}
                onClick={() => openChat(idx)}
              >
                <div className="flex-1 truncate">
                  <div className="font-medium truncate">{chat.prompt}</div>
                  <div className="text-xs text-muted-foreground">{chat.messages.length} messages • {new Date(chat.lastUpdated).toLocaleDateString()}</div>
                </div>
                <div className="flex gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={e => {
                      e.stopPropagation();
                      toggleImportance(idx);
                    }}
                  >
                    {chat.important ? <BookmarkCheck className="h-4 w-4 text-amber-500" /> : <Bookmark className="h-4 w-4" />}
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={e => {
                      e.stopPropagation();
                      deleteChat(idx);
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DoubtsPage;
