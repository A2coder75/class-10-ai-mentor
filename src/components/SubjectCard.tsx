
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Clock, X, ChevronDown, ChevronRight } from "lucide-react";
import { Subject, Topic } from "@/types";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface SubjectCardProps {
  subject: Subject;
  updateTopicStatus: (subjectId: string, topicId: string, status: Topic['status']) => void;
}

const SubjectCard: React.FC<SubjectCardProps> = ({ subject, updateTopicStatus }) => {
  const [expanded, setExpanded] = useState(false);
  const progressPercentage = subject.totalTopics > 0
    ? (subject.completedTopics / subject.totalTopics) * 100
    : 0;

  const getStatusIcon = (status: Topic['status']) => {
    switch (status) {
      case 'completed':
        return <Check className="h-4 w-4 text-green-500" />;
      case 'in-progress':
        return <Clock className="h-4 w-4 text-amber-500" />;
      case 'not-started':
        return <X className="h-4 w-4 text-gray-400" />;
    }
  };

  const handleStatusChange = (topicId: string) => {
    const topic = subject.topics.find(t => t.id === topicId);
    if (!topic) return;

    const nextStatus: Record<Topic['status'], Topic['status']> = {
      'not-started': 'in-progress',
      'in-progress': 'completed',
      'completed': 'not-started'
    };

    updateTopicStatus(subject.id, topicId, nextStatus[topic.status]);
  };

  return (
    <Card className={cn(
      "hover-card overflow-hidden transition-all duration-300",
      expanded ? "border-2" : "",
      subject.completedTopics === subject.totalTopics ? "border-green-200" : ""
    )}
    style={{
      borderLeftWidth: '4px',
      borderLeftColor: subject.color
    }}>
      <CardHeader className="pb-2">
        <CardTitle 
          className="flex items-center justify-between cursor-pointer"
          onClick={() => setExpanded(!expanded)}
        >
          <div className="flex items-center gap-2">
            <span style={{ color: subject.color }}>{subject.name}</span>
            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
              {subject.completedTopics}/{subject.totalTopics} topics
            </span>
          </div>
          {expanded ? 
            <ChevronDown className="w-5 h-5 text-muted-foreground" /> : 
            <ChevronRight className="w-5 h-5 text-muted-foreground" />}
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <Progress
          value={progressPercentage}
          className="h-2 mb-4"
          indicatorClassName={cn(
            subject.completedTopics === subject.totalTopics ? "bg-green-500" : ""
          )}
        />
        
        {expanded && (
          <ul className="space-y-2 pt-2 border-t animate-accordion-down">
            {subject.topics.map((topic) => (
              <li 
                key={topic.id}
                className="flex items-center justify-between p-2 rounded-md hover:bg-accent/50 cursor-pointer"
                onClick={() => handleStatusChange(topic.id)}
              >
                <span className="text-sm">{topic.name}</span>
                <div className={cn(
                  "p-1.5 rounded-full transition-colors",
                  topic.status === 'completed' ? "bg-green-100" : 
                  topic.status === 'in-progress' ? "bg-amber-100" : 
                  "bg-gray-100"
                )}>
                  {getStatusIcon(topic.status)}
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};

export default SubjectCard;
