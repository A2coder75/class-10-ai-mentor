
import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlannerTask } from "@/types";
import { Check, Clock, Play, Pause, RotateCcw, BookOpen, FileText, Brain, ArrowLeft, Volume2, ArrowUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";
import { generateStudyPlanner } from "@/utils/api";

// Mock data for resources by subject
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

const parsePlannerResponse = (plannerResponseStr: string) => {
  try {
    const jsonMatch = plannerResponseStr.match(/```\n([\s\S]*?)\n```/);
    if (jsonMatch && jsonMatch[1]) {
      return JSON.parse(jsonMatch[1]);
    }
  } catch (error) {
    console.error("Error parsing planner response", error);
  }
  return null;
};

const getTodaysTasks = (studyPlan: any): PlannerTask[] => {
  if (!studyPlan || !studyPlan.study_plan) return [];
  
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0]; // Format as YYYY-MM-DD
  
  for (const week of studyPlan.study_plan) {
    for (const day of week.days) {
      // Check if this day is today
      if (day.date.includes(todayStr)) {
        return day.tasks.filter((task: any) => !('break' in task));
      }
    }
  }
  
  // If no tasks for today, return tasks from the next available day
  for (const week of studyPlan.study_plan) {
    for (const day of week.days) {
      const dayDate = new Date(day.date);
      if (dayDate >= today) {
        return day.tasks.filter((task: any) => !('break' in task));
      }
    }
  }
  
  // Fallback: return tasks from the first day
  if (studyPlan.study_plan[0]?.days[0]?.tasks) {
    return studyPlan.study_plan[0].days[0].tasks.filter((task: any) => !('break' in task));
  }
  
  return [];
};

const StudyPage = () => {
  const navigate = useNavigate();
  const [plannerData, setPlannerData] = useState<any>(null);
  const [todaysTasks, setTodaysTasks] = useState<PlannerTask[]>([]);
  const [activeTask, setActiveTask] = useState<PlannerTask | null>(null);
  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>({});
  const [timerRunning, setTimerRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [isBreak, setIsBreak] = useState(false);
  const [breakTimeLeft, setBreakTimeLeft] = useState(5 * 60); // 5 minutes in seconds
  const [showBackToTop, setShowBackToTop] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const pageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchStudyPlan = async () => {
      try {
        // In a real app, you'd fetch this from an API or local storage
        const response = await generateStudyPlanner({} as any); // Use mock data in dev
        if (response) {
          const parsedPlan = parsePlannerResponse(response.planner);
          setPlannerData(parsedPlan);
          
          if (parsedPlan) {
            const tasks = getTodaysTasks(parsedPlan);
            setTodaysTasks(tasks);
            if (tasks.length > 0) {
              setActiveTask(tasks[0]);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching study plan:", error);
        toast({
          title: "Error loading study plan",
          description: "Could not load your study plan. Please try again later.",
          variant: "destructive"
        });
      }
    };

    fetchStudyPlan();
  }, []);

  // Calculate progress
  const completedCount = Object.values(completedTasks).filter(Boolean).length;
  const progressPercentage = todaysTasks.length > 0
    ? (completedCount / todaysTasks.length) * 100
    : 0;
  const allTasksCompleted = completedCount === todaysTasks.length && todaysTasks.length > 0;

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
    setCompletedTasks(prev => ({
      ...prev,
      [taskIndex]: !prev[taskIndex]
    }));

    if (!completedTasks[taskIndex]) {
      toast({
        title: "Task completed! 🎉",
        description: `Great job on completing "${todaysTasks[taskIndex].chapter}"!`,
      });
    }
  };

  const handleGenerateTest = () => {
    toast({
      title: "Generating test...",
      description: "Creating a personalized test based on today's topics."
    });

    // In a real app, this would make an API call to generate a test
    setTimeout(() => {
      navigate('/test');
    }, 1500);
  };
  
  const scrollToTop = () => {
    pageRef.current?.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  // Handle scroll event to show/hide back to top button
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

  // Timer effect
  useEffect(() => {
    if (timerRunning) {
      timerRef.current = setInterval(() => {
        if (isBreak) {
          setBreakTimeLeft(prev => {
            if (prev <= 1) {
              // Break is over
              setTimerRunning(false);
              setIsBreak(false);
              setTimeLeft(25 * 60);
              setBreakTimeLeft(5 * 60);
              
              // Play notification
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
              // Work period is over
              setTimerRunning(false);
              setIsBreak(true);
              
              // Play notification
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

  // Helper function to get appropriate color for a subject
  const getSubjectColor = (subject: string) => {
    const colorMap: Record<string, string> = {
      "Physics": "bg-blue-100 border-blue-300 text-blue-800 dark:bg-blue-900/30 dark:border-blue-700 dark:text-blue-300",
      "Math": "bg-purple-100 border-purple-300 text-purple-800 dark:bg-purple-900/30 dark:border-purple-700 dark:text-purple-300",
      "Chemistry": "bg-green-100 border-green-300 text-green-800 dark:bg-green-900/30 dark:border-green-700 dark:text-green-300",
    };
    
    return colorMap[subject] || "bg-slate-100 border-slate-300 text-slate-800 dark:bg-slate-800/30 dark:border-slate-700 dark:text-slate-300";
  };

  // Helper function to render a badge based on task type
  const renderTaskTypeBadge = (taskType: 'learning' | 'revision' | 'practice') => {
    if (taskType === "learning") {
      return (
        <Badge className="mr-2 bg-primary hover:bg-primary/90">
          {taskType}
        </Badge>
      );
    } else if (taskType === "revision") {
      return (
        <Badge variant="outline" className="mr-2 border-amber-500 text-amber-600 dark:text-amber-400">
          {taskType}
        </Badge>
      );
    } else if (taskType === "practice") {
      return (
        <Badge variant="outline" className="mr-2 border-green-500 text-green-600 dark:text-green-400">
          {taskType}
        </Badge>
      );
    }
    return null;
  };

  if (todaysTasks.length === 0) {
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
              <CardTitle>Today's Goals</CardTitle>
              <CardDescription>Complete these tasks to stay on track</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {todaysTasks.map((task, index) => (
                  <div
                    key={index}
                    className={`p-4 border rounded-lg transition-all ${getSubjectColor(task.subject)} ${
                      completedTasks[index] 
                        ? "opacity-60" 
                        : activeTask === task 
                          ? "ring-2 ring-primary/60 dark:ring-primary/40" 
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
                        <h3 className="font-medium text-lg">{task.subject}</h3>
                        <p className="text-muted-foreground">{task.chapter}</p>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          checked={!!completedTasks[index]}
                          onCheckedChange={() => toggleTaskCompletion(index)}
                          className="h-5 w-5 bg-white"
                        />
                        {!completedTasks[index] && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setActiveTask(task)}
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
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="bg-gradient-to-r from-violet-50 to-fuchsia-50 dark:from-violet-900/20 dark:to-fuchsia-900/20">
              <CardTitle>Study Resources</CardTitle>
              <CardDescription>Materials to help you with today's topics</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <Tabs defaultValue={todaysTasks[0]?.subject || "Physics"}>
                <TabsList className="mb-4">
                  {Array.from(new Set(todaysTasks.map(task => task.subject))).map((subject) => (
                    <TabsTrigger key={subject} value={subject}>
                      {subject}
                    </TabsTrigger>
                  ))}
                </TabsList>
                
                {Array.from(new Set(todaysTasks.map(task => task.subject))).map((subject) => (
                  <TabsContent key={subject} value={subject} className="space-y-3">
                    {studyResources[subject as keyof typeof studyResources]?.map((resource, index) => (
                      <a 
                        key={index} 
                        href={resource.url}
                        className="flex items-center p-3 border rounded-lg hover:bg-accent transition-colors"
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
                <div className={`p-3 rounded-md ${getSubjectColor(activeTask.subject)}`}>
                  <div className="space-y-2">
                    <div className="font-medium text-lg">{activeTask.subject}</div>
                    <div className="text-muted-foreground">{activeTask.chapter}</div>
                    
                    {renderTaskTypeBadge(activeTask.task_type)}
                  </div>
                </div>
                
                <div className="mt-4 space-y-2">
                  <div className="text-sm font-medium">Tips:</div>
                  <ul className="text-sm space-y-2 list-disc pl-5 text-muted-foreground">
                    <li>Take effective notes using diagrams and key concepts</li>
                    <li>Try to solve example problems without looking at solutions</li>
                    <li>Create flashcards for important formulas and definitions</li>
                  </ul>
                </div>
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
