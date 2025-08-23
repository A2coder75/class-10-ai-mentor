"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send } from "lucide-react";
import { motion } from "framer-motion";

// Message type
interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function DoubtsPage() {
  const [chats, setChats] = useState<Message[][]>([[]]); // multiple chat sessions
  const [activeChatIndex, setActiveChatIndex] = useState(0);
  const [input, setInput] = useState("");

  const activeChat = chats[activeChatIndex] || [];

  const sendMessage = () => {
    if (!input.trim()) return;

    const newMessage: Message = { role: "user", content: input };
    const updatedChats = [...chats];
    updatedChats[activeChatIndex] = [...activeChat, newMessage];

    // Fake assistant reply
    const reply: Message = {
      role: "assistant",
      content: "This is a generated reply for: " + input,
    };

    updatedChats[activeChatIndex].push(reply);
    setChats(updatedChats);
    setInput("");
  };

  const startNewChat = () => {
    setChats([...chats, []]);
    setActiveChatIndex(chats.length);
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 p-4 md:p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Chat Box */}
      <div className="flex-1 flex flex-col gap-4 sticky top-0 h-screen">
        <Card className="flex flex-col flex-1 rounded-xl shadow-lg overflow-hidden bg-white dark:bg-gray-800 h-full">
          {/* Banner line */}
          <div className="h-1 w-full bg-gradient-to-r from-green-400 to-green-600"></div>

          <CardHeader>
            <CardTitle className="text-3xl md:text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-500 drop-shadow-lg">
              AI Doubt Solver
            </CardTitle>
          </CardHeader>

          {/* Messages → scrollable */}
          <CardContent className="flex-1 overflow-y-auto px-3 space-y-3">
            {activeChat.map((msg, idx) => {
              const isUser = msg.role === "user";
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`p-3 rounded-xl max-w-[75%] ${
                      isUser
                        ? "bg-green-500 text-white"
                        : "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    }`}
                  >
                    {msg.content}
                  </div>
                </motion.div>
              );
            })}
          </CardContent>

          {/* Input bar */}
          <div className="p-3 border-t flex gap-2 bg-gray-50 dark:bg-gray-800">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your doubt..."
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <Button onClick={sendMessage} className="bg-green-500 hover:bg-green-600">
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      </div>

      {/* Side Panel */}
      <div className="w-full md:w-80 flex flex-col gap-4">
        <Card className="rounded-xl shadow-md bg-white dark:bg-gray-800">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Chats</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {chats.map((_, idx) => (
              <Button
                key={idx}
                onClick={() => setActiveChatIndex(idx)}
                variant={idx === activeChatIndex ? "default" : "outline"}
              >
                Chat {idx + 1}
              </Button>
            ))}
            <Button onClick={startNewChat} className="bg-blue-500 hover:bg-blue-600">
              + New Chat
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
