
import React from "react";
import { ChatHistory as ChatHistoryType } from "@/types";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardFooter 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, Star, Trash2, ArrowRightCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

interface ChatHistoryItemProps {
  chat: ChatHistoryType;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  isActive?: boolean;
}

const ChatHistoryItem: React.FC<ChatHistoryItemProps> = ({ 
  chat, 
  onSelect, 
  onDelete,
  isActive = false 
}) => {
  // Get first few characters from the first user message
  const previewText = chat.messages.find(m => m.role === 'user')?.content.substring(0, 50) + "...";
  
  return (
    <Card 
      className={cn(
        "mb-3 hover:border-primary/50 transition-all cursor-pointer group", 
        isActive ? "border-primary bg-primary/5" : ""
      )}
      onClick={() => onSelect(chat.id)}
    >
      <CardHeader className="py-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-base flex items-center">
              <MessageSquare className="h-4 w-4 mr-2 text-primary/70" />
              {chat.title || "Untitled Chat"}
              {chat.important && (
                <Star className="h-4 w-4 ml-2 text-yellow-500 fill-yellow-500" />
              )}
            </CardTitle>
            <CardDescription className="text-xs mt-1">
              {formatDistanceToNow(new Date(chat.lastUpdated), { addSuffix: true })}
            </CardDescription>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8" 
            onClick={(e) => {
              e.stopPropagation();
              onDelete(chat.id);
            }}
          >
            <Trash2 className="h-4 w-4 text-muted-foreground" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="py-0">
        <p className="text-xs text-muted-foreground line-clamp-2">{previewText}</p>
      </CardContent>
      <CardFooter className="py-2 flex justify-end">
        <Button variant="ghost" size="sm" className="h-7 text-xs">
          <ArrowRightCircle className="h-3.5 w-3.5 mr-1" />
          Open
        </Button>
      </CardFooter>
    </Card>
  );
};

interface ChatHistoryListProps {
  chats: ChatHistoryType[];
  onSelectChat: (id: string) => void;
  onDeleteChat: (id: string) => void;
  activeChat?: string;
}

const ChatHistoryList: React.FC<ChatHistoryListProps> = ({ 
  chats, 
  onSelectChat, 
  onDeleteChat,
  activeChat
}) => {
  return (
    <div className="space-y-1 overflow-y-auto max-h-[calc(100vh-300px)] pr-2">
      {chats.length === 0 ? (
        <div className="text-center p-4 text-muted-foreground">
          <p>No previous conversations</p>
          <p className="text-sm mt-1">Start a new chat to ask questions</p>
        </div>
      ) : (
        chats
          .sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime())
          .map((chat) => (
            <ChatHistoryItem 
              key={chat.id} 
              chat={chat} 
              onSelect={onSelectChat} 
              onDelete={onDeleteChat} 
              isActive={activeChat === chat.id}
            />
          ))
      )}
    </div>
  );
};

export default ChatHistoryList;
