import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { Bookmark, BookmarkCheck, Send, Trash2, Brain, Clock, Star, Loader2, MessageCircle, Sparkles, AlignLeft } from 'lucide-react';
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
  const [activeTab, setActiveTab] = useState<'ask' | 'history'>('ask');

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    const savedChatsJson = localStorage.getItem('doubts_chat_history');
    if (savedChatsJson) {
      try {
        const parsedChats = JSON.parse(savedChatsJson);
        const processedChats = parsedChats.map((chat: any) => ({
          ...chat,
          lastUpdated: new Date(chat.lastUpdated),
          messages: chat.messages.map((msg: any) => ({ ...msg, timestamp: new Date(msg.timestamp) })),
        }));
        setSavedChats(processedChats);
      } catch {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('doubts_chat_history', JSON.stringify(savedChats));
  }, [savedChats]);

  useEffect(() => {
    if (messagesEndRef.current) messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [activeChat]);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const adjustHeight = () => {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`; // Max height
    };
    textarea.addEventListener('input', adjustHeight);
    adjustHeight();
    return () => textarea.removeEventListener('input', adjustHeight);
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
    let updatedChat = activeChatIndex !== null ? [...activeChat, userMessage] : [userMessage];
    setActiveChat(updatedChat);

    try {
      const contextMessages = updatedChat.map(msg => msg.content);
      const data = await solveDoubt(prompt.trim(), isImportant, contextMessages);
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
        const newChat: ChatHistory = { prompt: prompt.trim(), messages: finalChat, important: isImportant, lastUpdated: new Date() };
        setSavedChats(prev => [newChat, ...prev]);
        setActiveChatIndex(0); // Keep in chat, do NOT auto-switch tab
      }
      setPrompt('');
    } catch {
      toast({ title: "Error", description: "Failed to get AI response.", variant: "destructive" });
    } finally { setIsLoading(false); }
  };

  const startNewChat = () => { setActiveChat([]); setActiveChatIndex(null); setPrompt(''); setIsImportant(false); setActiveTab('ask'); };
  const deleteChat = (index: number) => {
    setSavedChats(prev => { const updated = [...prev]; updated.splice(index, 1); return updated; });
    if (activeChatIndex === index) startNewChat();
    else if (activeChatIndex !== null && activeChatIndex > index) setActiveChatIndex(activeChatIndex - 1);
  };
  const openChat = (index: number) => { setActiveChat(savedChats[index].messages); setActiveChatIndex(index); setIsImportant(savedChats[index].important); setActiveTab('ask'); };
  const toggleImportance = (index: number) => { setSavedChats(prev => { const updated = [...prev]; updated[index] = { ...updated[index], important: !updated[index].important }; if (activeChatIndex === index) setIsImportant(!updated[index].important); return updated; }); };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white dark:from-gray-900 dark:to-gray-950 p-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-6">
        
        {/* Chat Area */}
        <div className="flex-1 flex flex-col gap-4">
          <Card className="flex flex-col h-full shadow-xl rounded-2xl bg-white dark:bg-gray-800 overflow-hidden">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <CardHeader className="flex items-center justify-between pb-0 px-6 pt-4">
                <CardTitle className="text-2xl font-bold flex items-center gap-2 text-indigo-700 dark:text-indigo-400">
                  <MessageCircle className="h-6 w-6" /> AI Doubt Solver
                </CardTitle>
                <TabsList className="bg-indigo-100/40 dark:bg-indigo-900/30 rounded-xl p-1">
                  <TabsTrigger value="ask" className="px-4 py-1 rounded-xl">Ask</TabsTrigger>
                  <TabsTrigger value="history" className="px-4 py-1 rounded-xl">History</TabsTrigger>
                </TabsList>
              </CardHeader>

              <TabsContent value="ask" className="flex flex-col flex-1 overflow-hidden px-6 pt-2">
                <ScrollArea className="flex-1 mb-4">
                  <div className="space-y-3">
                    {activeChat.length > 0 ? activeChat.map((msg, idx) => (
                      <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[75%] p-4 rounded-2xl shadow-md whitespace-pre-wrap ${msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100'}`}>
                          {msg.content}
                          <div className="text-xs mt-1 text-gray-500 dark:text-gray-400 text-right">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                        </div>
                      </div>
                    )) : (
                      <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 dark:text-gray-500 mt-12">
                        <Brain className="h-12 w-12 mb-3 opacity-30" />
                        <div className="text-lg font-medium mb-1">Ask me anything</div>
                        <div className="max-w-xs">I can help you understand tricky concepts or solve problems quickly.</div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                <form onSubmit={handleSubmit} className="flex items-end gap-3 border-t border-gray-200 dark:border-gray-700 pt-3 pb-2">
                  <Textarea
                    ref={textareaRef}
                    value={prompt}
                    onChange={e => setPrompt(e.target.value)}
                    placeholder="Type your question..."
                    className="flex-1 min-h-[44px] max-h-[120px] resize-none p-3 rounded-2xl border border-gray-300 dark:border-gray-600 shadow-sm focus:ring-2 focus:ring-indigo-400 dark:focus:ring-indigo-500"
                  />
                  <Button type="submit" className="h-11 w-11 flex-shrink-0 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white p-2 shadow-lg" disabled={isLoading || !prompt.trim()}>
                    {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : <Send className="h-5 w-5" />}
                  </Button>
                  <div className="flex items-center gap-1">
                    <Switch id="important" checked={isImportant} onCheckedChange={setIsImportant} />
                    <Label htmlFor="important" className="flex items-center gap-1 text-sm"><Star className="h-4 w-4 text-yellow-400" />Important</Label>
                  </div>
                  {activeChatIndex !== null && <Button variant="ghost" size="sm" onClick={startNewChat}>New Chat</Button>}
                </form>
              </TabsContent>

              <TabsContent value="history">
                <ScrollArea className="h-[450px] p-4 space-y-3">
                  {savedChats.length > 0 ? savedChats.map((chat, idx) => (
                    <Card key={idx} className={`p-3 rounded-xl shadow hover:shadow-lg transition cursor-pointer ${activeChatIndex === idx ? 'border-indigo-500 border-2' : ''}`} onClick={() => openChat(idx)}>
                      <div className="flex justify-between items-center">
                        <div className="truncate">
                          <div className="font-medium truncate text-indigo-700 dark:text-indigo-400">{chat.prompt}</div>
                          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mt-1">
                            <Clock className="h-3 w-3" /> {new Date(chat.lastUpdated).toLocaleDateString()} • {chat.messages.length} messages
                          </div>
                        </div>
                        <div className="flex gap-2 items-center">
                          <Button variant="ghost" size="icon" onClick={e => { e.stopPropagation(); toggleImportance(idx); }}>
                            {chat.important ? <BookmarkCheck className="h-4 w-4 text-yellow-400" /> : <Bookmark className="h-4 w-4" />}
                          </Button>
                          <Button variant="ghost" size="icon" onClick={e => { e.stopPropagation(); deleteChat(idx); }}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  )) : (
                    <div className="flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 mt-12">
                      <AlignLeft className="h-12 w-12 mb-3 opacity-30" />
                      <div className="text-lg font-medium mb-1">No chat history</div>
                      <div>Your previous conversations will appear here.</div>
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </Card>
        </div>

        {/* Sidebar Tips */}
        <div className="w-full md:w-4/12 flex flex-col gap-4">
          <Card className="shadow-xl rounded-2xl overflow-hidden bg-white dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2 text-indigo-700 dark:text-indigo-400">
                <Sparkles className="h-5 w-5" /> Study Tips
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {[
                { title: "Ask Specific Questions", desc: "The more specific your question, the more helpful the answer will be." },
                { title: "Include Context", desc: "Mention any background info that might help the AI understand better." },
                { title: "Mark Important Questions", desc: "Use the star icon to mark questions you'd like to revisit." },
                { title: "Follow Up", desc: "If the answer isn't clear, ask follow-ups in the same chat." }
              ].map((tip, idx) => (
                <div key={idx} className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl shadow-sm">
                  <h4 className="font-medium mb-1">{tip.title}</h4>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">{tip.desc}</p>
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
