
import React, { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Check, ChevronDown, ChevronRight, X, Clock } from "lucide-react";
import { Subject, Topic } from "@/types";

interface SubjectCardProps {
  subject: Subject;
  updateTopicStatus: (subjectId: string, topicId: string, status: Topic["status"]) => void;
}

const SubjectCard = ({ subject, updateTopicStatus }: SubjectCardProps) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const progressPercentage = Math.round((subject.completedTopics / subject.topics.length) * 100);

  const getStatusIcon = (status: Topic["status"]) => {
    switch (status) {
      case "completed":
        return <Check className="h-4 w-4 text-green-500" />;
      case "in-progress":
        return <Clock className="h-4 w-4 text-amber-500" />;
      case "not-started":
        return <X className="h-4 w-4 text-gray-400" />;
      default:
        return null;
    }
  };

  const getNextStatus = (currentStatus: Topic["status"]): Topic["status"] => {
    const statuses: Topic["status"][] = ["not-started", "in-progress", "completed"];
    const currentIndex = statuses.indexOf(currentStatus);
    return statuses[(currentIndex + 1) % statuses.length];
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
      <Card className={`overflow-hidden transition-all duration-300 hover:shadow-md ${isOpen ? 'shadow-md' : ''}`}>
        <CardHeader className="p-3">
          <CollapsibleTrigger className="flex items-center justify-between w-full text-left">
            <div className="flex items-center gap-2">
              <div
                className={`w-3 h-3 rounded-full`}
                style={{ backgroundColor: subject.color }}
              />
              <h3 className="font-medium">{subject.name}</h3>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">
                {subject.completedTopics}/{subject.topics.length}
              </span>
              {isOpen ? (
                <ChevronDown className="h-5 w-5 text-muted-foreground shrink-0" />
              ) : (
                <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
              )}
            </div>
          </CollapsibleTrigger>
          <Progress
            value={progressPercentage}
            className={`h-2 mt-2 ${
              progressPercentage === 100
                ? "bg-green-100 dark:bg-green-950"
                : "bg-muted"
            }`}
            indicatorClassName={
              progressPercentage === 100
                ? "bg-green-500"
                : progressPercentage > 50
                ? "bg-amber-500"
                : "bg-primary"
            }
          />
        </CardHeader>
        <CollapsibleContent className="transition-all duration-300 ease-in-out">
          <CardContent className="pt-0 pb-3 px-3">
            <ul className="space-y-1 animate-fade-in">
              {subject.topics.map((topic) => (
                <li
                  key={topic.id}
                  className={`flex items-center justify-between p-2 rounded-md cursor-pointer text-sm hover:bg-muted transition-colors ${
                    topic.status === "completed"
                      ? "bg-green-50 dark:bg-green-950/20"
                      : topic.status === "in-progress"
                      ? "bg-amber-50 dark:bg-amber-950/20"
                      : ""
                  }`}
                  onClick={() =>
                    updateTopicStatus(
                      subject.id,
                      topic.id,
                      getNextStatus(topic.status)
                    )
                  }
                >
                  <span>{topic.name}</span>
                  <div className="flex items-center gap-1">
                    {getStatusIcon(topic.status)}
                    <span
                      className={`text-xs ${
                        topic.status === "completed"
                          ? "text-green-600 dark:text-green-400"
                          : topic.status === "in-progress"
                          ? "text-amber-600 dark:text-amber-400"
                          : "text-gray-500"
                      }`}
                    >
                      {topic.status === "completed"
                        ? "Done"
                        : topic.status === "in-progress"
                        ? "In Progress"
                        : "Not Started"}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};

export default SubjectCard;
