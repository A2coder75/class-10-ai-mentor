
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Lightbulb } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface ChatInputProps {
  onSubmit: (content: string, isImportant: boolean) => void;
  isLoading: boolean;
  defaultImportant?: boolean;
  disableImportantToggle?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ 
  onSubmit, 
  isLoading, 
  defaultImportant = false,
  disableImportantToggle = false
}) => {
  const [content, setContent] = useState("");
  const [isImportant, setIsImportant] = useState(defaultImportant);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim()) {
      onSubmit(content.trim(), isImportant);
      setContent("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Textarea
        placeholder="Type your doubt or follow-up question here..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="min-h-[100px] resize-none focus-visible:ring-primary"
        disabled={isLoading}
      />
      
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-2">
          <Switch
            id="important-mode"
            checked={isImportant}
            onCheckedChange={setIsImportant}
            disabled={disableImportantToggle}
          />
          <Label htmlFor="important-mode" className="flex items-center cursor-pointer">
            <Lightbulb className="mr-1 h-4 w-4 text-yellow-500" />
            Important doubt
          </Label>
        </div>
        
        <Button 
          type="submit"
          disabled={!content.trim() || isLoading}
          className="ml-auto"
        >
          {isLoading ? (
            <>Processing...</>
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" />
              Submit
            </>
          )}
        </Button>
      </div>
    </form>
  );
};

export default ChatInput;
