
import React, { useState, useEffect, useRef } from "react";
import { v4 as uuidv4 } from 'uuid';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { PlannerTask } from "@/types";
import { Check, Clock, Play, Pause, RotateCcw, BookOpen, FileText, Brain, ArrowLeft, Volume2, ArrowUp, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";
import { CustomTask, saveCustomTasks, loadCustomTasks, normalizeSubjectName } from "@/utils/studyPlannerStorage";
import useStudyPlanStore from "@/hooks/useStudyPlanStore";

const studyResources = {
  "Physics": [
    { title: "NCERT Physics Chapter 10", url: "#" },
    { title: "Light Reflection - Practice Problems", url: "#" },
    { title: "Video: Understanding Concave Mirrors", url: "#" }
  ],
  "Math": [
    { title: "NCERT Mathematics Chapter 4", url: "#" },
    { title: "Quadratic Equations Worksheet", url: "#" },
    { title: "Video: Solving Quadratic Equations", url: "#" }
  ],
  "Mathematics": [
    { title: "NCERT Mathematics Chapter 4", url: "#" },
    { title: "Quadratic Equations Worksheet", url: "#" },
    { title: "Video: Solving Quadratic Equations", url: "#" }
  ],
  "Chemistry": [
    { title: "NCERT Chemistry Chapter 4", url: "#" },
    { title: "Carbon Compounds - Notes", url: "#" },
    { title: "Practice Test: Organic Chemistry", url: "#" }
  ]
};

const StudyPage = () => {
  const navigate = useNavigate();
  const { studyPlan, todaysTasks, loading, hasPlan, toggleTaskStatus } = useStudyPlanStore();
  const [activeTask, setActiveTask] = useState<PlannerTask | null>(null);
  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>({});
  const [timerRunning, setTimerRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [isBreak, setIsBreak] = useState(false);
  const [breakTimeLeft, setBreakTimeLeft] = useState(5 * 60); // 5 minutes in seconds
  const [showBackToTop, setShowBackToTop] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const pageRef = useRef<HTMLDivElement>(null);
  const [customTasks, setCustomTasks] = useState<CustomTask[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDuration, setNewTaskDuration] = useState(25);

  // Load custom tasks and initialize activeTask from synced study plan
  useEffect(() => {
    if (todaysTasks && todaysTasks.length > 0 && !activeTask) {
      setActiveTask(todaysTasks[0]);
    }
    
    const savedCustomTasks = loadCustomTasks();
    setCustomTasks(savedCustomTasks);
  }, [todaysTasks, activeTask]);

  // Extract task completion status from study plan
  useEffect(() => {
    if (todaysTasks?.length && studyPlan) {
      const currentCompletionStatus: Record<string, boolean> = {};
      
      todaysTasks.forEach((task, index) => {
        currentCompletionStatus[index] = task.status === 'completed';
      });
      
      setCompletedTasks(currentCompletionStatus);
    }
  }, [todaysTasks, studyPlan]);

  const completedCount = todaysTasks ? 
    todaysTasks.filter(task => task.status === 'completed').length : 0;
  
  const progressPercentage = todaysTasks && todaysTasks.length > 0
    ? (completedCount / todaysTasks.length) * 100
    : 0;
  
  const allTasksCompleted = todaysTasks && todaysTasks.length > 0 && 
    completedCount === todaysTasks.length;

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleTimer = () => {
    setTimerRunning(!timerRunning);
  };

  const resetTimer = () => {
    setTimerRunning(false);
    setTimeLeft(25 * 60);
    setIsBreak(false);
    setBreakTimeLeft(5 * 60);
  };

  const toggleTaskCompletion = (taskIndex: number) => {
    // Find the corresponding task in the study plan and toggle its status
    if (!todaysTasks || !studyPlan) return;
    
    const task = todaysTasks[taskIndex];
    
    // Find this task in the study plan
    if (studyPlan.study_plan) {
      for (let weekIndex = 0; weekIndex < studyPlan.study_plan.length; weekIndex++) {
        const week = studyPlan.study_plan[weekIndex];
        if (!week.days) continue;
        
        for (let dayIndex = 0; dayIndex < week.days.length; dayIndex++) {
          const day = week.days[dayIndex];
          if (!day.tasks) continue;
          
          for (let tIndex = 0; tIndex < day.tasks.length; tIndex++) {
            const currentTask = day.tasks[tIndex];
            if ('break' in currentTask) continue;
            
            // Try to match task by subject, chapter, and task_type
            if (normalizeSubjectName(currentTask.subject) === normalizeSubjectName(task.subject) && 
                currentTask.chapter === task.chapter && 
                currentTask.task_type === task.task_type) {
              // Found the task, toggle its status
              toggleTaskStatus(weekIndex, dayIndex, tIndex);
              
              // Update local completedTasks state
              setCompletedTasks(prev => ({
                ...prev,
                [taskIndex]: !prev[taskIndex]
              }));
              
              if (!completedTasks[taskIndex]) {
                toast({
                  title: "Task completed! 🎉",
                  description: `Great job on completing "${task.chapter}"!`,
                });
              }
              
              return;
            }
          }
        }
      }
    }
  };

  const handleGenerateTest = () => {
    toast({
      title: "Generating test...",
      description: "Creating a personalized test based on today's topics."
    });

    setTimeout(() => {
      navigate('/test');
    }, 1500);
  };

  const handleStartStudySession = (task: PlannerTask) => {
    navigate('/study-mode', { state: { task } });
  };

  const scrollToTop = () => {
    pageRef.current?.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    const handleScroll = () => {
      if (pageRef.current) {
        setShowBackToTop(pageRef.current.scrollTop > 300);
      }
    };
    
    const currentPageRef = pageRef.current;
    if (currentPageRef) {
      currentPageRef.addEventListener('scroll', handleScroll);
    }
    
    return () => {
      if (currentPageRef) {
        currentPageRef.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);

  useEffect(() => {
    if (timerRunning) {
      timerRef.current = setInterval(() => {
        if (isBreak) {
          setBreakTimeLeft(prev => {
            if (prev <= 1) {
              setTimerRunning(false);
              setIsBreak(false);
              setTimeLeft(25 * 60);
              setBreakTimeLeft(5 * 60);
              
              const audio = new Audio("/notification.mp3");
              audio.play().catch(err => console.log("Audio playback error:", err));
              
              toast({
                title: "Break time over!",
                description: "Time to get back to studying.",
              });
              
              return 0;
            }
            return prev - 1;
          });
        } else {
          setTimeLeft(prev => {
            if (prev <= 1) {
              setTimerRunning(false);
              setIsBreak(true);
              
              const audio = new Audio("/notification.mp3");
              audio.play().catch(err => console.log("Audio playback error:", err));
              
              toast({
                title: "Time for a break!",
                description: "Take 5 minutes to rest your mind.",
              });
              
              return 0;
            }
            return prev - 1;
          });
        }
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [timerRunning, isBreak]);

  const getSubjectColor = (subject: string) => {
    const colorMap: Record<string, string> = {
      "Physics": "bg-blue-100 border-blue-300 text-blue-800 dark:bg-blue-900/30 dark:border-blue-700 dark:text-blue-300",
      "Math": "bg-purple-100 border-purple-300 text-purple-800 dark:bg-purple-900/30 dark:border-purple-700 dark:text-purple-300",
      "Mathematics": "bg-purple-100 border-purple-300 text-purple-800 dark:bg-purple-900/30 dark:border-purple-700 dark:text-purple-300",
      "Chemistry": "bg-green-100 border-green-300 text-green-800 dark:bg-green-900/30 dark:border-green-700 dark:text-green-300",
    };
    
    return colorMap[normalizeSubjectName(subject)] || "bg-slate-100 border-slate-300 text-slate-800 dark:bg-slate-800/30 dark:border-slate-700 dark:text-slate-300";
  };

  const renderTaskTypeBadge = (taskType: string) => {
    switch (taskType.toLowerCase()) {
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
        return (
          <Badge variant="outline" className="mr-2">
            {taskType}
          </Badge>
        );
    }
  };

  const addCustomTask = () => {
    if (!newTaskTitle.trim()) return;

    const newTask: CustomTask = {
      id: uuidv4(),
      title: newTaskTitle,
      duration: newTaskDuration,
      completed: false,
      createdAt: new Date().toISOString()
    };

    const updatedTasks = [...customTasks, newTask];
    setCustomTasks(updatedTasks);
    saveCustomTasks(updatedTasks);
    setNewTaskTitle('');
    setNewTaskDuration(25);
    
    toast({
      title: "Task added",
      description: "Your custom task has been added to the list.",
    });
  };

  const toggleCustomTaskCompletion = (taskId: string) => {
    const updatedTasks = customTasks.map(task =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    );
    setCustomTasks(updatedTasks);
    saveCustomTasks(updatedTasks);
  };

  const deleteCustomTask = (taskId: string) => {
    const updatedTasks = customTasks.filter(task => task.id !== taskId);
    setCustomTasks(updatedTasks);
    saveCustomTasks(updatedTasks);
    
    toast({
      title: "Task deleted",
      description: "The task has been removed from your list.",
    });
  };

  if (loading) {
    return (
      <div className="page-container pb-20 flex flex-col items-center justify-center min-h-[70vh]">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Loading Study Schedule</CardTitle>
            <CardDescription>
              Please wait while we load your study tasks...
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center py-8">
            <div className="w-20 h-20 rounded-full border-4 border-t-primary border-r-transparent border-b-primary border-l-transparent animate-spin mx-auto mb-6"></div>
            <p>This will just take a moment</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!hasPlan || !todaysTasks || todaysTasks.length === 0) {
    return (
      <div className="page-container pb-20 flex flex-col items-center justify-center min-h-[70vh]">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>No Study Schedule</CardTitle>
            <CardDescription>
              You don't have any tasks scheduled for today
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center py-4">
            <BookOpen className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <p className="mb-4">
              Create a personalized study plan to get started with your preparation
            </p>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600"
              onClick={() => navigate('/syllabus')}
            >
              Create Study Plan
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="page-container pb-20 relative" ref={pageRef}>
      <Button 
        variant="ghost" 
        className="mb-4" 
        onClick={() => navigate('/syllabus')}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Syllabus
      </Button>
      
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2 gradient-text">Today's Study Session</h1>
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground">
            Focus on completing your planned tasks for today
          </p>
          <Badge variant="outline" className="ml-2">
            {completedCount} of {todaysTasks.length} completed
          </Badge>
        </div>
        <Progress value={progressPercentage} className="h-2 mt-3" />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Study Tasks</CardTitle>
                  <CardDescription>Complete these tasks to stay on track</CardDescription>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="default">Add Custom Task</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add a Custom Study Task</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Task Title</label>
                        <Input
                          value={newTaskTitle}
                          onChange={(e) => setNewTaskTitle(e.target.value)}
                          placeholder="Enter task title..."
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Duration (minutes)</label>
                        <Input
                          type="number"
                          value={newTaskDuration}
                          onChange={(e) => setNewTaskDuration(parseInt(e.target.value) || 25)}
                          min={5}
                          max={180}
                        />
                      </div>
                      <Button onClick={addCustomTask} className="w-full">
                        Add Task
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <Tabs defaultValue="planned" className="w-full">
                <TabsList>
                  <TabsTrigger value="planned">Planned Tasks</TabsTrigger>
                  <TabsTrigger value="custom">Custom Tasks</TabsTrigger>
                </TabsList>
                
                <TabsContent value="planned">
                  <div className="space-y-4">
                    {todaysTasks.map((task, index) => (
                      <div
                        key={index}
                        className={`p-4 border rounded-lg transition-all border-l-4 ${getSubjectColor(task.subject)} ${
                          task.status === 'completed' 
                            ? "opacity-60" 
                            : activeTask === task 
                              ? "ring-2 ring-primary/60" 
                              : ""
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center">
                              {renderTaskTypeBadge(task.task_type)}
                              <span className="text-sm text-muted-foreground">
                                {task.estimated_time} minutes
                              </span>
                            </div>
                            <h3 className="font-medium text-lg">{normalizeSubjectName(task.subject)}</h3>
                            <p className="text-muted-foreground">{task.chapter}</p>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              checked={task.status === 'completed'}
                              onCheckedChange={() => toggleTaskCompletion(index)}
                              className="h-5 w-5 bg-white"
                            />
                            {task.status !== 'completed' && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleStartStudySession(task)}
                                className="ml-2"
                              >
                                Study
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="custom">
                  <div className="space-y-4">
                    {customTasks.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <p>No custom tasks added yet.</p>
                        <p className="text-sm">Click the "Add Custom Task" button to create one.</p>
                      </div>
                    ) : (
                      customTasks.map((task) => (
                        <div
                          key={task.id}
                          className={`p-4 border rounded-lg transition-all border-l-4 ${
                            task.completed 
                              ? "bg-gray-100 dark:bg-gray-800/50 opacity-60 border-green-400" 
                              : "bg-white dark:bg-gray-800 border-indigo-400"
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <Checkbox
                                  checked={task.completed}
                                  onCheckedChange={() => toggleCustomTaskCompletion(task.id)}
                                />
                                <h3 className={`font-medium text-lg ${task.completed ? "line-through" : ""}`}>
                                  {task.title}
                                </h3>
                              </div>
                              <p className="text-muted-foreground flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                {task.duration} minutes
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteCustomTask(task.id)}
                              className="text-destructive-foreground hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="bg-gradient-to-r from-violet-50 to-fuchsia-50 dark:from-violet-900/20 dark:to-fuchsia-900/20">
              <CardTitle>Study Resources</CardTitle>
              <CardDescription>Materials to help you with today's topics</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <Tabs defaultValue={normalizeSubjectName(todaysTasks[0]?.subject) || "Physics"}>
                <TabsList className="mb-4">
                  {Array.from(new Set(todaysTasks.map(task => normalizeSubjectName(task.subject)))).map((subject) => (
                    <TabsTrigger key={subject} value={subject}>
                      {subject}
                    </TabsTrigger>
                  ))}
                </TabsList>
                
                {Array.from(new Set(todaysTasks.map(task => normalizeSubjectName(task.subject)))).map((subject) => (
                  <TabsContent key={subject} value={subject} className="space-y-3">
                    {studyResources[subject as keyof typeof studyResources]?.map((resource, index) => (
                      <a 
                        key={index} 
                        href={resource.url}
                        className="flex items-center p-3 border border-l-4 border-l-blue-400 rounded-lg hover:bg-accent transition-colors"
                      >
                        {resource.title.includes("Video") ? (
                          <BookOpen className="mr-2 h-5 w-5 text-primary" />
                        ) : resource.title.includes("Practice") ? (
                          <FileText className="mr-2 h-5 w-5 text-primary" />
                        ) : (
                          <BookOpen className="mr-2 h-5 w-5 text-primary" />
                        )}
                        <span>{resource.title}</span>
                      </a>
                    )) || (
                      <div className="text-center py-4 text-muted-foreground">
                        No resources available for {subject}
                      </div>
                    )}
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
            <CardFooter>
              {allTasksCompleted && (
                <Button
                  onClick={handleGenerateTest}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600"
                >
                  <Brain className="mr-2 h-4 w-4" />
                  Generate AI Test for Today's Topics
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20">
              <CardTitle>{isBreak ? "Break Time" : "Pomodoro Timer"}</CardTitle>
              <CardDescription>
                {isBreak 
                  ? "Take a short break to refresh your mind" 
                  : "Focus for 25 minutes, then take a 5 minute break"
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center pt-6">
              <div className="w-48 h-48 rounded-full border-8 border-primary/30 flex items-center justify-center mb-6 relative">
                <div className="text-4xl font-bold">
                  {isBreak ? formatTime(breakTimeLeft) : formatTime(timeLeft)}
                </div>
                <div 
                  className="absolute inset-0 rounded-full" 
                  style={{ 
                    background: `conic-gradient(
                      var(--primary) ${isBreak 
                          ? (breakTimeLeft / (5 * 60)) * 100
                          : (timeLeft / (25 * 60)) * 100
                        }%, 
                      transparent 0%
                    )`,
                    opacity: 0.2,
                  }}
                ></div>
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={toggleTimer}
                >
                  {timerRunning ? (
                    <Pause className="h-5 w-5" />
                  ) : (
                    <Play className="h-5 w-5" />
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={resetTimer}
                >
                  <RotateCcw className="h-5 w-5" />
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {activeTask && (
            <Card>
              <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20">
                <CardTitle>Currently Studying</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className={`p-3 rounded-md border-l-4 ${getSubjectColor(activeTask.subject)}`}>
                  <div className="space-y-2">
                    <div className="font-medium text-lg">{normalizeSubjectName(activeTask.subject)}</div>
                    <div className="text-muted-foreground">{activeTask.chapter}</div>
                    
                    {renderTaskTypeBadge(activeTask.task_type)}
                  </div>
                </div>
                
                <div className="mt-4 space-y-2">
                  <div className="text-sm font-medium">Tips:</div>
                  <ul className="text-sm space-y-2 list-disc pl-5 text-muted-foreground">
                    <li>Focus on one concept at a time</li>
                    <li>Take effective notes using diagrams and key concepts</li>
                    <li>Try to solve example problems without looking at solutions</li>
                    <li>After each pomodoro session, review what you've learned</li>
                    <li>Create flashcards for important formulas and definitions</li>
                  </ul>
                </div>
                
                <Button 
                  className="w-full mt-4 bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600"
                  onClick={() => handleStartStudySession(activeTask)}
                >
                  <Play className="mr-2 h-4 w-4" />
                  Start Focus Mode
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      
      {showBackToTop && (
        <Button 
          onClick={scrollToTop}
          className="fixed bottom-20 right-4 z-10 rounded-full shadow-lg p-2 w-10 h-10 flex items-center justify-center"
          size="icon"
          variant="secondary"
        >
          <ArrowUp className="h-5 w-5" />
        </Button>
      )}
    </div>
  );
};

export default StudyPage;
