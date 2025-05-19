
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Clock, Calendar, CheckCircle } from 'lucide-react';
import { getTodaysStudyPlan, saveStudyPlanToStorage } from '@/utils/studyPlannerStorage';
import { toast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';

const TaskStatus = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  IN_PROGRESS: 'in_progress'
};

interface Task {
  subject: string;
  chapter: string;
  task_type: string;
  estimated_time: number;
  status?: string;
}

interface BreakTask {
  break: number;
}

const TodaysStudyPlan = () => {
  const [todaysPlan, setTodaysPlan] = useState<{ date: string; tasks: (Task | BreakTask)[]; weekNumber: number; dayIndex: number } | null>(null);
  const [taskStatus, setTaskStatus] = useState<Record<string, boolean>>({});
  const navigate = useNavigate();

  useEffect(() => {
    const plan = getTodaysStudyPlan();
    setTodaysPlan(plan);

    // Load task status from local storage
    try {
      const savedStatus = localStorage.getItem('taskStatus');
      if (savedStatus) {
        setTaskStatus(JSON.parse(savedStatus));
      }
    } catch (error) {
      console.error("Error loading task status from localStorage:", error);
    }
  }, []);

  const saveTaskStatus = (newStatus: Record<string, boolean>) => {
    setTaskStatus(newStatus);
    try {
      localStorage.setItem('taskStatus', JSON.stringify(newStatus));
    } catch (error) {
      console.error("Error saving task status to localStorage:", error);
    }
  };

  const toggleTaskStatus = (taskIndex: number) => {
    if (!todaysPlan) return;
    
    const { weekNumber, dayIndex } = todaysPlan;
    const taskId = `${weekNumber}-${dayIndex}-${taskIndex}`;
    const newStatus = !taskStatus[taskId];
    
    const newTaskStatus = {
      ...taskStatus,
      [taskId]: newStatus
    };
    
    saveTaskStatus(newTaskStatus);
    
    // Update the task status in the plan
    const studyPlan = JSON.parse(localStorage.getItem('studyPlan') || '{}');
    if (studyPlan && studyPlan.study_plan) {
      try {
        const task = studyPlan.study_plan[weekNumber].days[dayIndex].tasks[taskIndex];
        if (task && !('break' in task)) {
          task.status = newStatus ? 'completed' : 'pending';
        }
        saveStudyPlanToStorage(studyPlan);
        
        // Update our local state
        const updatedTasks = [...todaysPlan.tasks];
        if (!('break' in updatedTasks[taskIndex])) {
          (updatedTasks[taskIndex] as Task).status = newStatus ? 'completed' : 'pending';
        }
        setTodaysPlan({
          ...todaysPlan,
          tasks: updatedTasks
        });
        
        toast({
          title: newStatus ? "Task completed! 🎉" : "Task marked as incomplete",
          description: newStatus ? "Great job keeping up with your study schedule!" : "Task has been reset.",
          variant: newStatus ? "default" : "destructive",
        });
      } catch (error) {
        console.error("Error updating task status:", error);
      }
    }
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours > 0 ? `${hours}h ` : ''}${mins > 0 ? `${mins}m` : ''}`;
  };

  const renderTaskBadge = (taskType: string) => {
    switch (taskType.toLowerCase()) {
      case 'learning':
        return (
          <Badge className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white border-none shadow-sm">
            {taskType}
          </Badge>
        );
      case 'revision':
        return (
          <Badge className="bg-gradient-to-r from-amber-400 to-orange-500 text-white border-none shadow-sm">
            {taskType}
          </Badge>
        );
      case 'practice':
        return (
          <Badge className="bg-gradient-to-r from-emerald-400 to-teal-500 text-white border-none shadow-sm">
            {taskType}
          </Badge>
        );
      default:
        return <Badge className="bg-gradient-to-r from-sky-400 to-blue-500 text-white border-none shadow-sm">{taskType}</Badge>;
    }
  };

  // Calculate progress
  const completedCount = todaysPlan?.tasks.filter((task, index) => {
    if ('break' in task) return false;
    const { weekNumber, dayIndex } = todaysPlan;
    const taskId = `${weekNumber}-${dayIndex}-${index}`;
    return taskStatus[taskId] || (task as Task).status === TaskStatus.COMPLETED;
  }).length || 0;
  
  const totalTasks = todaysPlan?.tasks.filter(task => !('break' in task)).length || 0;
  const progress = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

  if (!todaysPlan || todaysPlan.tasks.length === 0) {
    return (
      <Card className="border-none shadow-lg rounded-xl overflow-hidden bg-white dark:bg-gray-900/50">
        <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border-b border-indigo-100 dark:border-indigo-900/30">
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5 text-indigo-500" />
            Today's Study Plan
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 text-center">
          <div className="py-8">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium mb-2">No tasks for today</h3>
            <p className="text-muted-foreground mb-4">
              You don't have any study tasks scheduled for today.
            </p>
            <Button 
              onClick={() => navigate('/syllabus')}
              variant="outline" 
              className="mt-2"
            >
              View your study plan
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-none shadow-lg rounded-xl overflow-hidden bg-white dark:bg-gray-900/50">
      <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border-b border-indigo-100 dark:border-indigo-900/30">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5 text-indigo-500" />
            Today's Study Plan
          </CardTitle>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => navigate('/syllabus')}
            className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
          >
            View Full Plan
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="mb-4">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-sm font-medium">Progress</span>
            <span className="text-sm font-medium">{completedCount}/{totalTasks} completed</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
        
        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
          {todaysPlan.tasks.map((task, index) => {
            // Handle break
            if ('break' in task) {
              return (
                <div key={`break-${index}`} className="flex items-center p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mr-3">
                    <Clock className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                      {task.break} minute break
                    </p>
                  </div>
                </div>
              );
            }
            
            // Handle regular task
            const typedTask = task as Task;
            const { weekNumber, dayIndex } = todaysPlan;
            const taskId = `${weekNumber}-${dayIndex}-${index}`;
            const isCompleted = taskStatus[taskId] || typedTask.status === TaskStatus.COMPLETED;
            
            return (
              <div 
                key={`task-${index}`} 
                className={`p-3 border ${isCompleted 
                  ? 'border-green-200 dark:border-green-900/30 bg-green-50 dark:bg-green-900/10' 
                  : 'border-indigo-100 dark:border-indigo-900/30 bg-white dark:bg-gray-900/50'} 
                rounded-lg shadow-sm hover:shadow transition-all`}
              >
                <div className="flex items-center">
                  <Checkbox
                    checked={isCompleted}
                    onCheckedChange={() => toggleTaskStatus(index)}
                    className={`${
                      isCompleted 
                        ? "bg-green-500 text-white border-transparent" 
                        : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                    } h-5 w-5 rounded-md mr-3 transition-all`}
                  />
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className={`font-medium ${isCompleted ? 'line-through text-gray-500 dark:text-gray-400' : ''}`}>
                        {typedTask.subject}
                      </h4>
                      <div className="flex items-center gap-2">
                        {renderTaskBadge(typedTask.task_type)}
                      </div>
                    </div>
                    <p className={`text-sm text-gray-600 dark:text-gray-400 mb-1 ${isCompleted ? 'line-through opacity-75' : ''}`}>
                      {typedTask.chapter}
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatTime(typedTask.estimated_time)}
                      </div>
                      {isCompleted && (
                        <div className="flex items-center text-green-600 dark:text-green-400">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Completed
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {progress === 100 && (
          <div className="mt-4 p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200 dark:border-green-900/30 text-center">
            <h4 className="font-medium text-green-800 dark:text-green-400 flex items-center justify-center gap-2">
              <CheckCircle className="h-5 w-5" />
              All tasks completed!
            </h4>
            <p className="text-sm text-green-700 dark:text-green-300 mt-1">
              Great job completing your study plan for today!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TodaysStudyPlan;
