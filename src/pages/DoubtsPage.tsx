import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { Bookmark, BookmarkCheck, Send, Trash2, Clock, Brain, Sparkles } from 'lucide-react';
import { solveDoubt } from '@/utils/api';
import { ChatMessage } from '@/types';

interface ChatHistory {
  prompt: string;
  messages: ChatMessage[];
  important: boolean;
  lastUpdated: Date;
}

const ThinkingDots: React.FC = () => (
  <span className="flex space-x-1 mt-2">
    {[0, 1, 2].map((i) => (
      <span key={i} className="w-2 h-2 rounded-full bg-white animate-bounce" style={{ animationDelay: `${i * 0.2}s` }} />
    ))}
  </span>
);

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
    const data = localStorage.getItem('doubts_chat_history');
    if (data) {
      try {
        const parsed = JSON.parse(data);
        const processed = parsed.map((chat: any) => ({
          ...chat,
          lastUpdated: new Date(chat.lastUpdated),
          messages: chat.messages.map((msg: any) => ({ ...msg, timestamp: new Date(msg.timestamp) })),
        }));
        setSavedChats(processed);
      } catch { }
    }
  }, []);

  // Save chats
  useEffect(() => {
    localStorage.setItem('doubts_chat_history', JSON.stringify(savedChats));
  }, [savedChats]);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeChat]);

  // Autosize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const adjust = () => {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    };
    textarea.addEventListener('input', adjust);
    adjust();
    return () => textarea.removeEventListener('input', adjust);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) {
      toast({ title: "Empty prompt", description: "Please enter a question.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    const userMessage: ChatMessage = { role: 'user', content: prompt.trim(), timestamp: new Date() };
    try {
      const updatedChat = activeChatIndex !== null ? [...activeChat, userMessage] : [userMessage];
      setActiveChat(updatedChat);

      const context = activeChatIndex !== null ? updatedChat.map(m => m.content) : undefined;
      const data = await solveDoubt(prompt.trim(), isImportant, context);

      const aiMessage: ChatMessage = { role: 'assistant', content: data.response.answer, timestamp: new Date() };
      const finalChat = [...updatedChat, aiMessage];
      setActiveChat(finalChat);

      if (activeChatIndex !== null) {
        setSavedChats(prev => {
          const updated = [...prev];
          updated[activeChatIndex] = { ...updated[activeChatIndex], messages: finalChat, important: isImportant, lastUpdated: new Date() };
          return updated;
        });
      } else {
        setSavedChats(prev => [{ prompt: prompt.trim(), messages: finalChat, important: isImportant, lastUpdated: new Date() }, ...prev]);
        setActiveChatIndex(0);
      }
      setPrompt('');
    } catch {
      toast({ title: "Error", description: "Failed to get AI response.", variant: "destructive" });
    } finally { setIsLoading(false); }
  };

  const startNewChat = () => { setActiveChat([]); setActiveChatIndex(null); setPrompt(''); setIsImportant(false); };
  const deleteChat = (i: number) => { setSavedChats(prev => { const u = [...prev]; u.splice(i, 1); return u; }); if (activeChatIndex === i) startNewChat(); else if (activeChatIndex !== null && activeChatIndex > i) setActiveChatIndex(activeChatIndex - 1); };
  const openChat = (i: number) => { setActiveChat(savedChats[i].messages); setActiveChatIndex(i); setIsImportant(savedChats[i].important); };
  const toggleImportance = (i: number) => { setSavedChats(prev => { const u = [...prev]; u[i] = { ...u[i], important: !u[i].important }; if (activeChatIndex === i) setIsImportant(!u[i].important); return u; }); };

  return (
    <div className="flex flex-col md:flex-row gap-4 w-full h-screen p-4 bg-background">
      {/* Chat section */}
      <div className="flex-1 flex flex-col rounded-xl bg-primary/5 shadow-lg overflow-hidden relative">
        <ScrollArea className="flex-1 p-4 space-y-4">
          {activeChat.length === 0 && (
            <div className="flex flex-col items-center justify-center text-center text-muted-foreground h-full space-y-2">
              <Brain className="w-12 h-12 opacity-30" />
              <h2 className="text-lg font-semibold">Ask a question</h2>
              <p>AI will provide detailed explanations here.</p>
            </div>
          )}
          {activeChat.map((m, idx) => {
            const isUser = m.role === 'user';
            const isThinking = !isUser && m.content.includes('<think>');
            const content = m.content.replace('<think>', '');
            return (
              <div key={idx} className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-fadeIn`}>
                <div className={`max-w-[70%] px-4 py-2 rounded-2xl shadow-md break-words
                  ${isUser ? 'bg-primary text-white' : 'bg-white/10 text-white backdrop-blur-md border border-white/20'}`}>
                  <div className="whitespace-pre-wrap">{content}</div>
                  {isThinking && <ThinkingDots />}
                  <div className="text-xs mt-1 text-white/70 text-right">
                    {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </ScrollArea>

        {/* Input */}
        <form onSubmit={handleSubmit} className="p-4 flex items-center gap-2 bg-primary/10">
          <Textarea
            ref={textareaRef}
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            placeholder="Type your doubt..."
            rows={1}
            className="flex-1 min-h-[36px] max-h-24 resize-none rounded-lg p-3 bg-background/30 text-white placeholder-white/50 focus:ring-2 focus:ring-primary transition"
            disabled={isLoading}
          />
          <Button type="submit" disabled={isLoading || !prompt.trim()} className="p-3 rounded-full bg-primary hover:bg-primary/80 text-white shadow-md">
            {isLoading ? <Send className="animate-spin" /> : <Send />}
          </Button>
        </form>
      </div>

      {/* Sidebar */}
      <div className="w-80 flex flex-col gap-4">
        {/* Study Tips */}
        <Card className="p-3 bg-primary/10 text-white rounded-xl shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2"><Sparkles className="w-5 h-5"/> Study Tips</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {[
              { t: "Ask Specific Questions", d: "More precise questions get better answers." },
              { t: "Include Context", d: "Provide background to help AI answer accurately." },
              { t: "Mark Important", d: "Star key questions to revisit later." },
              { t: "Follow Up", d: "Ask follow-ups for clarity in same thread." }
            ].map((tip,i)=>(
              <div key={i} className="p-2 rounded-md bg-white/10">{tip.t}: <span className="text-white/70">{tip.d}</span></div>
            ))}
          </CardContent>
        </Card>

        {/* History */}
        <Card className="flex-1 p-2 bg-primary/10 text-white rounded-xl shadow-lg overflow-y-auto">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2"><Clock className="w-5 h-5"/> History</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {savedChats.length === 0 && (
              <div className="flex flex-col items-center justify-center text-white/50 py-4 space-y-2">
                <p>No history yet</p>
              </div>
            )}
            {savedChats.map((c,i)=>(
              <div key={i} className="flex justify-between items-center p-2 rounded-md hover:bg-white/10 cursor-pointer" onClick={()=>openChat(i)}>
                <span className="truncate">{c.prompt}</span>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={e=>{e.stopPropagation();toggleImportance(i)}}>
                    {c.important?<BookmarkCheck className="w-4 h-4 text-amber-400"/>:<Bookmark className="w-4 h-4"/>}
                  </Button>
                  <Button variant="ghost" size="icon" onClick={e=>{e.stopPropagation();deleteChat(i)}}>
                    <Trash2 className="w-4 h-4 text-red-400"/>
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
