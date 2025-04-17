
import React from "react";
import { PlannerDay, PlannerTask } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface CompactTaskListProps {
  days: PlannerDay[];
  completedTasks: Record<string, boolean>;
  onTaskComplete: (date: string, taskIndex: number) => void;
}

const CompactTaskList: React.FC<CompactTaskListProps> = ({
  days,
  completedTasks,
  onTaskComplete
}) => {
  const navigate = useNavigate();
  
  const getSubjectColor = (subject: string) => {
    const colorMap: Record<string, string> = {
      "Physics": "bg-blue-100 border-blue-300 text-blue-800 dark:bg-blue-900/30 dark:border-blue-700 dark:text-blue-300",
      "Math": "bg-purple-100 border-purple-300 text-purple-800 dark:bg-purple-900/30 dark:border-purple-700 dark:text-purple-300",
      "Mathematics": "bg-purple-100 border-purple-300 text-purple-800 dark:bg-purple-900/30 dark:border-purple-700 dark:text-purple-300",
      "Chemistry": "bg-green-100 border-green-300 text-green-800 dark:bg-green-900/30 dark:border-green-700 dark:text-green-300",
    };
    
    return colorMap[subject] || "bg-slate-100 border-slate-300 text-slate-800 dark:bg-slate-800/30 dark:border-slate-700 dark:text-slate-300";
  };
  
  const renderTaskTypeBadge = (taskType: 'learning' | 'revision' | 'practice') => {
    switch (taskType) {
      case "learning":
        return (
          <Badge className="mr-2 bg-primary hover:bg-primary/90">
            {taskType}
          </Badge>
        );
      case "revision":
        return (
          <Badge variant="outline" className="mr-2 border-amber-500 text-amber-600 dark:text-amber-400">
            {taskType}
          </Badge>
        );
      case "practice":
        return (
          <Badge variant="outline" className="mr-2 border-green-500 text-green-600 dark:text-green-400">
            {taskType}
          </Badge>
        );
      default:
        return null;
    }
  };
  
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };
  
  const handleStartStudySession = (task: PlannerTask) => {
    navigate('/study-mode', { state: { task } });
  };
  
  return (
    <div className="space-y-6">
      {days.map((day, dayIndex) => {
        // Filter out break objects
        const tasks = day.tasks.filter(item => !('break' in item)) as PlannerTask[];
        
        return (
          <div key={dayIndex} className="animate-fade-in">
            <div className="flex items-center gap-2 mb-3">
              <h3 className="text-md font-medium">{formatDate(day.date)}</h3>
              <Badge variant="secondary" className="ml-auto">
                {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
              </Badge>
            </div>
            
            <div className="space-y-3">
              {tasks.map((task, taskIndex) => {
                const taskKey = `${day.date}-${taskIndex}`;
                const isCompleted = completedTasks[taskKey] || false;
                
                return (
                  <div 
                    key={taskIndex}
                    className={`flex items-center justify-between p-3 rounded-lg border transition-all ${getSubjectColor(task.subject)} ${
                      isCompleted ? 'opacity-70' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Checkbox 
                        checked={isCompleted}
                        onCheckedChange={() => onTaskComplete(day.date, taskIndex)}
                        className="h-5 w-5 bg-white dark:bg-gray-700 rounded"
                      />
                      <div>
                        <div className="flex items-center gap-2 text-sm mb-1">
                          {renderTaskTypeBadge(task.task_type)}
                          <span>{task.estimated_time} min</span>
                        </div>
                        <div className="font-medium">{task.subject}: {task.chapter}</div>
                      </div>
                    </div>
                    
                    {!isCompleted && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleStartStudySession(task)}
                        className="ml-2"
                      >
                        Study
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CompactTaskList;
