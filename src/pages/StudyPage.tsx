
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

// Mock today's tasks
const todaysTasks: PlannerTask[] = [
  {
    subject: "Physics",
    chapter: "Light - Reflection and Refraction",
    task_type: "learning",
    estimated_time: 90,
    status: "pending"
  },
  {
    subject: "Mathematics",
    chapter: "Quadratic Equations",
    task_type: "learning",
    estimated_time: 90,
    status: "pending"
  },
  {
    subject: "Chemistry",
    chapter: "Carbon Compounds",
    task_type: "revision",
    estimated_time: 60,
    status: "pending"
  }
];

// Mock resources
const studyResources = {
  "Physics": [
    { title: "NCERT Physics Chapter 10", url: "#" },
    { title: "Light Reflection - Practice Problems", url: "#" },
    { title: "Video: Understanding Concave Mirrors", url: "#" }
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
  const [activeTask, setActiveTask] = useState<PlannerTask | null>(todaysTasks[0]);
  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>({});
  const [timerRunning, setTimerRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [isBreak, setIsBreak] = useState(false);
  const [breakTimeLeft, setBreakTimeLeft] = useState(5 * 60); // 5 minutes in seconds
  const [showBackToTop, setShowBackToTop] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const pageRef = useRef<HTMLDivElement>(null);

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
            <CardHeader>
              <CardTitle>Today's Goals</CardTitle>
              <CardDescription>Complete these tasks to stay on track</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {todaysTasks.map((task, index) => (
                  <div
                    key={index}
                    className={`p-4 border rounded-lg transition-all ${
                      completedTasks[index] 
                        ? "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-900/30" 
                        : activeTask === task 
                          ? "border-primary/50 bg-accent/50" 
                          : ""
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center">
                          <Badge 
                            variant={task.task_type === "learning" ? "default" : "outline"}
                            className="mr-2 capitalize"
                          >
                            {task.task_type}
                          </Badge>
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
                          className="h-5 w-5"
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
            <CardHeader>
              <CardTitle>Study Resources</CardTitle>
              <CardDescription>Materials to help you with today's topics</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="Physics">
                <TabsList className="mb-4">
                  {Object.keys(studyResources).map((subject) => (
                    <TabsTrigger key={subject} value={subject}>
                      {subject}
                    </TabsTrigger>
                  ))}
                </TabsList>
                
                {Object.entries(studyResources).map(([subject, resources]) => (
                  <TabsContent key={subject} value={subject} className="space-y-3">
                    {resources.map((resource, index) => (
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
                    ))}
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
            <CardHeader>
              <CardTitle>{isBreak ? "Break Time" : "Pomodoro Timer"}</CardTitle>
              <CardDescription>
                {isBreak 
                  ? "Take a short break to refresh your mind" 
                  : "Focus for 25 minutes, then take a 5 minute break"
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
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
              <CardHeader>
                <CardTitle>Currently Studying</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="font-medium text-lg">{activeTask.subject}</div>
                  <div className="text-muted-foreground">{activeTask.chapter}</div>
                  <Badge 
                    variant={activeTask.task_type === "learning" ? "default" : "outline"}
                    className="mt-2 capitalize"
                  >
                    {activeTask.task_type}
                  </Badge>
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
          className="fixed bottom-4 right-4 z-10 rounded-full shadow-lg p-2 w-10 h-10 flex items-center justify-center"
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
