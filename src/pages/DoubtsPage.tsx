import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { Bookmark, BookmarkCheck, Send, Trash2, AlignLeft, Brain, Clock, Star, Loader2, MessageCircle, Sparkles } from 'lucide-react';
import { solveDoubt } from '@/utils/api';
import { ChatMessage } from '@/types';

interface ChatHistory {
  prompt: string;
  messages: ChatMessage[];
  important: boolean;
  lastUpdated: Date;
}

const AnimatedDots: React.FC = () => (
  <span className="inline-flex space-x-1">
    {[...Array(3)].map((_, i) => (
      <span
        key={i}
        className="w-2 h-2 bg-white rounded-full animate-bounce"
        style={{ animationDelay: `${i * 0.2}s` }}
      />
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
    const now = new Date();
    const userMessage: ChatMessage = { role: 'user', content: prompt.trim(), timestamp: now };
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
    <div className="w-full h-screen bg-gradient-to-br from-purple-700 via-indigo-700 to-blue-800 flex flex-col p-4">
      <div className="flex flex-1 gap-4 overflow-hidden">
        {/* Left: Chat */}
        <div className="flex flex-col flex-1 bg-white/10 backdrop-blur-lg rounded-2xl shadow-xl p-4 relative">
          <ScrollArea className="flex-1 overflow-y-auto pr-2 space-y-4">
            {activeChat.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center text-white/70 space-y-2 animate-fadeIn">
                <Brain className="h-16 w-16 opacity-50" />
                <h2 className="text-xl font-bold">Ask me anything</h2>
                <p>AI will answer your doubts with detailed explanations.</p>
              </div>
            )}
            {activeChat.map((m, idx) => {
              const isUser = m.role === 'user';
              const hasThink = !isUser && m.content.includes('<think>');
              const content = m.content.replace('<think>', '');
              return (
                <div key={idx} className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-slideUp`}>
                  <div className={`max-w-[75%] p-4 rounded-2xl shadow-lg relative break-words
                    ${isUser ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white' : 'bg-white/20 backdrop-blur-lg text-white border border-white/30'}`}>
                    <div className="whitespace-pre-wrap">{content}</div>
                    {hasThink && <div className="flex mt-2 space-x-1"><AnimatedDots /></div>}
                    <div className="text-xs mt-2 text-white/70 text-right">
                      {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </ScrollArea>

          {/* Input bar */}
          <div className="absolute bottom-4 left-4 right-4 flex items-center gap-2">
            <Textarea
              ref={textareaRef}
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              placeholder="Type your doubt..."
              rows={1}
              className="flex-1 min-h-[40px] max-h-28 resize-none rounded-xl p-3 bg-white/30 text-white placeholder-white/60 backdrop-blur-md shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all"
              disabled={isLoading}
            />
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading || !prompt.trim()}
              className="p-3 rounded-full bg-indigo-500 hover:bg-indigo-600 shadow-lg transition-all"
            >
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin text-white" /> : <Send className="h-5 w-5 text-white" />}
            </Button>
          </div>
        </div>

        {/* Right: Tips + History */}
        <div className="w-80 flex flex-col gap-4 overflow-y-auto">
          {/* Study tips */}
          <Card className="backdrop-blur-lg bg-white/20 border border-white/30 shadow-xl rounded-2xl p-4 text-white">
            <CardHeader>
              <CardTitle className="text-lg font-bold flex items-center gap-2"><Sparkles className="h-5 w-5" /> Study Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {[
                { t: "Ask Specific Questions", d: "The more specific your question, the more helpful the answer." },
                { t: "Include Context", d: "Provide background info so AI can understand better." },
                { t: "Mark Important", d: "Use the star to mark questions you want to revisit." },
                { t: "Follow Up", d: "Ask follow-ups in the same thread for clarity." },
              ].map((tip, i) => (
                <div key={i} className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition">{tip.t}: <span className="text-white/80">{tip.d}</span></div>
              ))}
            </CardContent>
          </Card>

          {/* History */}
          <Card className="backdrop-blur-lg bg-white/20 border border-white/30 shadow-xl rounded-2xl p-2 flex-1 overflow-y-auto">
            <CardHeader>
              <CardTitle className="text-lg font-bold flex items-center gap-2"><Clock className="h-5 w-5" /> History</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-white">
              {savedChats.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-4 text-white/50 space-y-2">
                  <AlignLeft className="h-8 w-8" />
                  <p>No history yet</p>
                </div>
              ) : savedChats.map((c, i) => (
                <div key={i} className="p-2 rounded-lg hover:bg-white/20 cursor-pointer flex justify-between items-center" onClick={() => openChat(i)}>
                  <span className="truncate">{c.prompt}</span>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); toggleImportance(i); }}>
                      {c.important ? <BookmarkCheck className="h-4 w-4 text-amber-400" /> : <Bookmark className="h-4 w-4" />}
                    </Button>
                    <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); deleteChat(i); }}>
                      <Trash2 className="h-4 w-4 text-red-400" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DoubtsPage;
