
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Navbar from "@/components/Navbar";
import { Send } from "lucide-react";

interface Message {
  id: string;
  text: string;
  sender: "user" | "ai";
  timestamp: Date;
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

  const handleSend = () => {
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

    // Simulate AI response
    setTimeout(() => {
      // This would be replaced with actual AI API call
      const aiResponses: Record<string, string> = {
        "what is newton's first law?": "Newton's First Law states that an object will remain at rest or in uniform motion in a straight line unless acted upon by an external force. This is also known as the law of inertia.",
        "how does a concave mirror work?": "A concave mirror has a reflective surface that curves inward. It can converge light rays to a focus point in front of the mirror. When an object is placed beyond the center of curvature, it forms a real, inverted, and diminished image. These mirrors are used in telescopes, headlights, and makeup mirrors.",
      };

      // Check for keyword matches in the input
      const lowercaseInput = inputText.toLowerCase();
      let response = "";

      // Look for key phrases
      Object.keys(aiResponses).forEach((key) => {
        if (lowercaseInput.includes(key)) {
          response = aiResponses[key];
        }
      });

      // Default response if no match
      if (!response) {
        response =
          "That's an interesting physics question! In a complete implementation, I would connect to an AI API to provide you with a detailed answer. For now, try asking about Newton's laws or concave mirrors for a sample response.";
      }

      const aiMessage: Message = {
        id: Date.now().toString(),
        text: response,
        sender: "ai",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1500);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
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
        <div className="flex-1 overflow-y-auto mb-4 space-y-4">
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
                    : "bg-muted"
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.text}</p>
                <div
                  className={`text-xs mt-1 ${
                    msg.sender === "user" ? "text-primary-foreground/70" : "text-muted-foreground"
                  }`}
                >
                  {msg.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-lg p-3 bg-muted">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.4s" }}
                  ></div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex">
          <Textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your physics question here..."
            className="flex-1 mr-2"
            rows={2}
          />
          <Button
            onClick={handleSend}
            disabled={isLoading || !inputText.trim()}
            className="self-end"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Navbar />
    </div>
  );
};

export default DoubtsPage;
