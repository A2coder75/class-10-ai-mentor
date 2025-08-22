import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { Bookmark, BookmarkCheck, Send, Trash2, Clock, Star, Brain, Sparkles } from 'lucide-react';
import { solveDoubt } from '@/utils/api';
import { ChatMessage } from '@/types';

interface ChatHistory {
  prompt: string;
  messages: ChatMessage[];
  important: boolean;
  lastUpdated: Date;
}

const convertMathNotation = (text: string) => {
  return text
    .replace(/\{frac\}\{(\d+)\}\{(\d+)\}/g, '$1/$2')
    .replace(/\{sqrt\}\{(.+?)\}/g, '√$1')
    .replace(/\{sup\}\{(.+?)\}/g, '^$1')
    .replace(/\{sub\}\{(.+?)\}/g, '_$1');
};

const renderAIMessage = (content: string) => {
  const thinkRegex = /<think>([\s\S]*?)<\/think>/g;
  const parts: { text: string; type: 'normal' | 'think' }[] = [];
  let lastIndex = 0;
  let match;
  while ((match = thinkRegex.exec(content)) !== null) {
    if (match.index > lastIndex) parts.push({ text: content.slice(lastIndex, match.index), type: 'normal' });
    parts.push({ text: match[1], type: 'think' });
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < content.length) parts.push({ text: content.slice(lastIndex), type: 'normal' });
  return parts.map((part, idx) => (
    <div
      key={idx}
      className={`${part.type === 'think' ? 'italic text-gray-600 dark:text-gray-400 pl-3 border-l-2 border-green-400' : ''}`}
    >
      {convertMathNotation(part.text)}
    </div>
  ));
};

const DoubtsPage: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isImportant, setIsImportant] = useState(false);
  const [savedChats, setSavedChats] = useState<ChatHistory[]>([]);
  const [activeChat, setActiveChat] = useState<ChatMessage[]>([]);
  const [activeChatIndex, setActiveChatIndex] = useState<number | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

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
        if (parsed.length > 0) setActiveChat(parsed[0].messages);
      } catch {}
    } else {
      setActiveChat([
        {
          role: 'assistant',
          content: "Hi! I'm your AI Doubt Solver. Ask me anything to get started.",
          timestamp: new Date()
        }
      ]);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('doubts_chat_history', JSON.stringify(savedChats));
  }, [savedChats]);

  // Autosize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    const adjustHeight = () => {
      ta.style.height = 'auto';
      ta.style.height = `${Math.min(ta.scrollHeight, 120)}px`;
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
      const aiMessage: ChatMessage = { role: 'assistant', content: data.response.answer, timestamp: new Date() };
      updatedChat = [...updatedChat, aiMessage];
      setActiveChat(updatedChat);

      if (activeChatIndex !== null) {
        setSavedChats(prev => {
          const updated = [...prev];
          updated[activeChatIndex] = { ...updated[activeChatIndex], messages: updatedChat, important: isImportant, lastUpdated: new Date() };
          return updated;
        });
      } else {
        const newChat: ChatHistory = { prompt: prompt.trim(), messages: updatedChat, important: isImportant, lastUpdated: new Date() };
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
    setActiveChat([
      { role: 'assistant', content: "Hi! I'm your AI Doubt Solver. Ask me anything to get started.", timestamp: new Date() }
    ]);
    setActiveChatIndex(null);
    setPrompt('');
    setIsImportant(false);
  };

  const deleteChat = (index: number) => {
    setSavedChats(prev => prev.filter((_, i) => i !== index));
    if (activeChatIndex === index) startNewChat();
    else if (activeChatIndex !== null && activeChatIndex > index) setActiveChatIndex(activeChatIndex - 1);
  };

  const toggleImportance = () => setIsImportant(!isImportant);

  const openChat = (index: number) => {
    setActiveChat(savedChats[index].messages);
    setActiveChatIndex(index);
    setIsImportant(savedChats[index].important);
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 p-4 md:p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Chat Box */}
      <div className="flex-1 flex flex-col gap-4">
        <Card className="flex flex-col flex-1 rounded-xl shadow-lg overflow-hidden bg-white dark:bg-gray-800">
          {/* Banner line */}
          <div className="h-1 w-full bg-gradient-to-r from-green-400 to-green-600"></div>

          <CardHeader>
            <CardTitle className="text-3xl md:text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-500 drop-shadow-lg">
              AI Doubt Solver
            </CardTitle>
          </CardHeader>

          <CardContent className="flex-1 space-y-3 max-h-[400px] overflow-y-auto">
            {activeChat.map((msg, idx) => {
              const isUser = msg.role === 'user';
              return (
                <div key={idx} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`p-3 rounded-xl max-w-[75%] ${
                      isUser ? 'bg-green-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                    }`}
                  >
                    {!isUser && renderAIMessage(msg.content)}
                    {isUser && msg.content}
                    <div className={`text-xs mt-1 ${isUser ? 'text-white/80' : 'text-gray-600 dark:text-gray-300'}`}>
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              );
            })}
            {activeChat.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center text-gray-400">
                <Brain className="h-12 w-12 mb-4 opacity-40" />
                <div className="font-semibold text-lg">Your AI Doubt Solver</div>
                <div className="mt-1 text-sm">Ask me anything and I'll help you solve it!</div>
              </div>
            )}
          </CardContent>

          <CardFooter className="flex flex-col md:flex-row items-center gap-2 border-t p-3 bg-gray-50 dark:bg-gray-900">
            <Textarea
              ref={textareaRef}
              placeholder="Type your question..."
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              className="flex-1 min-h-[40px] max-h-[120px] resize-none rounded-lg p-2 focus:ring-2 focus:ring-green-400 dark:focus:ring-green-500"
              disabled={isLoading}
            />
            <div className="flex items-center gap-2">
              <Switch checked={isImportant} onCheckedChange={toggleImportance} />
              <Label htmlFor="important" className="flex items-center gap-1">
                <Star className="h-4 w-4 text-amber-500" />
                Important
              </Label>
              <Button onClick={handleSubmit} disabled={isLoading || !prompt.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>

      {/* Right Panel */}
      <div className="w-full md:w-4/12 flex flex-col gap-4">
        {/* New Chat Button */}
        <Button
          className="w-full mb-2 bg-gradient-to-r from-green-400 to-blue-500 text-white hover:from-green-500 hover:to-blue-600"
          onClick={startNewChat}
        >
          + New Chat
        </Button>

        {/* Study Tips */}
        <Card className="rounded-xl shadow-lg overflow-hidden bg-gradient-to-tr from-green-50 to-green-100 dark:from-gray-800/80 dark:to-gray-700/70 p-2">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Study Tips
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {[
              { title: 'Ask Specific Questions', text: 'Be precise for best results.' },
              { title: 'Include Context', text: 'Provide background to help AI.' },
              { title: 'Mark Important Questions', text: 'Star questions to revisit later.' },
              { title: 'Follow Up', text: 'Ask clarifying questions in the same thread.' },
            ].map((tip, i) => (
              <div key={i} className="p-2 rounded-lg bg-green-100 dark:bg-gray-700/60 shadow-sm border-l-4 border-green-400">
                <h4 className="font-semibold">{tip.title}</h4>
                <p className="text-sm">{tip.text}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* History */}
        <Card className="flex-1 rounded-xl shadow-lg overflow-hidden bg-white dark:bg-gray-800 p-2">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Clock className="h-5 w-5" />
              History
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 max-h-[350px] overflow-y-auto">
            {savedChats.length === 0 && (
              <div className="text-center text-gray-500 py-6">No previous chats</div>
            )}
            {savedChats.map((chat, idx) => (
              <div
                key={idx}
                className={`flex justify-between items-center p-2 rounded-lg cursor-pointer ${
                  activeChatIndex === idx ? 'bg-green-100 dark:bg-gray-700' : 'bg-gray-50 dark:bg-gray-800'
                }`}
                onClick={() => openChat(idx)}
              >
                <div className="truncate">
                  <div className="font-medium truncate">{chat.prompt}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">{chat.messages.length} messages • {new Date(chat.lastUpdated).toLocaleDateString()}</div>
                </div>
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" onClick={e => { e.stopPropagation(); toggleImportance(); }}>
                    {chat.important ? <BookmarkCheck className="h-4 w-4 text-amber-500" /> : <Bookmark className="h-4 w-4" />}
                  </Button>
                  <Button size="icon" variant="ghost" onClick={e => { e.stopPropagation(); deleteChat(idx); }}>
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
