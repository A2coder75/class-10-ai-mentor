
import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PlannerTask } from "@/types";
import { Check, Clock, Play, Pause, RotateCcw, BookOpen, FileText, Brain, ArrowLeft, Volume2, Coffee, Info, ChartBar, ScrollText } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const motivationalQuotes = [
  "The expert in anything was once a beginner.",
  "The secret of getting ahead is getting started.",
  "Don't watch the clock; do what it does. Keep going.",
  "Success is the sum of small efforts, repeated day in and day out.",
  "The harder you work for something, the greater you'll feel when you achieve it.",
  "Learning is not attained by chance. It must be sought with ardor and attended to with diligence.",
  "Education is the passport to the future, for tomorrow belongs to those who prepare for it today.",
  "The beautiful thing about learning is that no one can take it away from you.",
  "The more that you read, the more things you will know. The more that you learn, the more places you'll go.",
  "Study the past if you would define the future."
];

const StudyModePage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = location;
  const task = state?.task as PlannerTask;
  const { toast } = useToast();
  
  const [timerRunning, setTimerRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [totalSessionTime, setTotalSessionTime] = useState(task?.estimated_time ? task.estimated_time * 60 : 60 * 60); // Default 1 hour if no task
  const [elapsedSessionTime, setElapsedSessionTime] = useState(0);
  const [currentQuote, setCurrentQuote] = useState(motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const sessionTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [activeTab, setActiveTab] = useState('focus');
  
  useEffect(() => {
    // Change quote every 30 seconds
    const quoteInterval = setInterval(() => {
      setCurrentQuote(motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]);
    }, 30000);
    
    return () => {
      clearInterval(quoteInterval);
      if (timerRef.current) clearInterval(timerRef.current);
      if (sessionTimerRef.current) clearInterval(sessionTimerRef.current);
    };
  }, []);
  
  useEffect(() => {
    // Start session timer
    sessionTimerRef.current = setInterval(() => {
      setElapsedSessionTime(prev => {
        const newElapsed = prev + 1;
        if (newElapsed >= totalSessionTime) {
          clearInterval(sessionTimerRef.current!);
          toast({
            title: "Study session complete!",
            description: `You've completed your ${task?.estimated_time || 60} minute study session.`,
          });
          setTimeout(() => navigate("/study"), 2000);
        }
        return newElapsed;
      });
    }, 1000);
    
    return () => {
      if (sessionTimerRef.current) clearInterval(sessionTimerRef.current);
    };
  }, [task, totalSessionTime, navigate, toast]);
  
  useEffect(() => {
    if (timerRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setTimerRunning(false);
            clearInterval(timerRef.current!);
            
            // Play notification sound
            const audio = new Audio("/notification.mp3");
            audio.play().catch(err => console.log("Audio playback error:", err));
            
            // Navigate to relaxation mode
            toast({
              title: "Pomodoro timer complete!",
              description: "Time for a break. Starting relaxation mode...",
            });
            
            setTimeout(() => navigate("/relaxation-mode"), 1500);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [timerRunning, navigate, toast]);
  
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
  };
  
  const handleBackToStudy = () => {
    navigate("/study");
  };
  
  const getSubjectColor = (subject: string) => {
    const colorMap: Record<string, string> = {
      "Physics": "bg-blue-100 border-blue-300 text-blue-700 dark:bg-blue-900/30 dark:border-blue-700 dark:text-blue-300",
      "Math": "bg-purple-100 border-purple-300 text-purple-700 dark:bg-purple-900/30 dark:border-purple-700 dark:text-purple-300",
      "Mathematics": "bg-purple-100 border-purple-300 text-purple-700 dark:bg-purple-900/30 dark:border-purple-700 dark:text-purple-300",
      "Chemistry": "bg-green-100 border-green-300 text-green-700 dark:bg-green-900/30 dark:border-green-700 dark:text-green-300",
    };
    
    return colorMap[subject] || "bg-slate-100 border-slate-300 text-slate-700 dark:bg-slate-800/30 dark:border-slate-700 dark:text-slate-300";
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
  
  const sessionProgress = Math.min(100, (elapsedSessionTime / totalSessionTime) * 100);

  return (
    <div className="flex flex-col min-h-screen p-4 bg-gradient-to-b from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20">
      <div className="mb-6 flex justify-between items-center">
        <Button variant="ghost" onClick={handleBackToStudy} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Study Page</span>
        </Button>
        
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <div className="text-sm text-muted-foreground">
            Session: <span className="font-mono">{formatTime(elapsedSessionTime)}</span> / 
            <span className="font-mono">{formatTime(totalSessionTime)}</span>
          </div>
        </div>
      </div>
      
      <div className="flex-1 flex flex-col items-center justify-start max-w-5xl mx-auto w-full">
        <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 text-transparent bg-clip-text">
          Focus Mode
        </h1>
        <p className="text-muted-foreground text-center mb-8">
          Stay focused and complete your study task efficiently
        </p>
        
        {task && (
          <div className={`w-full p-4 rounded-lg mb-8 border-2 ${getSubjectColor(task.subject)} animate-fade-in`}>
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3">
              <div>
                <div className="flex items-center mb-2">
                  {task.task_type && renderTaskTypeBadge(task.task_type)}
                  <span className="text-sm text-muted-foreground">
                    {task.estimated_time} minutes
                  </span>
                </div>
                <h2 className="text-xl font-bold">{task.subject}</h2>
                <p className="text-lg">{task.chapter}</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Main Study Mode Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full mb-6 overflow-x-auto flex-nowrap grid grid-cols-3 gap-1 bg-gray-100 dark:bg-gray-800/50 p-1 rounded-xl">
            <TabsTrigger value="focus" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>Focus Timer</span>
            </TabsTrigger>
            <TabsTrigger value="resources" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              <span>Resources</span>
            </TabsTrigger>
            <TabsTrigger value="tips" className="flex items-center gap-2">
              <Info className="h-4 w-4" />
              <span>Study Tips</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="focus" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
              <div className="lg:col-span-2">
                <Card className="shadow-xl animate-fade-in border-primary/10 overflow-hidden">
                  <div className="h-1.5 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500"></div>
                  <CardHeader>
                    <CardTitle className="text-2xl">Pomodoro Timer</CardTitle>
                    <CardDescription>
                      Focus for 25 minutes, then take a 5 minute break
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center">
                    <div className="w-64 h-64 rounded-full border-8 border-primary/30 flex items-center justify-center mb-6 relative">
                      <div className="text-5xl font-bold">
                        {formatTime(timeLeft)}
                      </div>
                      <div 
                        className="absolute inset-0 rounded-full" 
                        style={{ 
                          background: `conic-gradient(
                            var(--primary) ${(timeLeft / (25 * 60)) * 100}%, 
                            transparent 0%
                          )`,
                          opacity: 0.2,
                        }}
                      ></div>
                    </div>
                    
                    <div className="flex gap-4">
                      <Button
                        variant="default"
                        size="lg"
                        onClick={toggleTimer}
                        className="w-32"
                      >
                        {timerRunning ? (
                          <>
                            <Pause className="mr-2 h-5 w-5" />
                            Pause
                          </>
                        ) : (
                          <>
                            <Play className="mr-2 h-5 w-5" />
                            Start
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="lg"
                        onClick={resetTimer}
                        className="w-32"
                      >
                        <RotateCcw className="mr-2 h-5 w-5" />
                        Reset
                      </Button>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between border-t p-4 bg-muted/20">
                    <div className="text-sm text-muted-foreground">
                      Total session progress:
                    </div>
                    <div className="w-1/2">
                      <Progress value={sessionProgress} className="h-2" />
                    </div>
                  </CardFooter>
                </Card>
              </div>
              
              <div className="space-y-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-border/50 shadow-md animate-fade-in">
                  <div className="flex items-center mb-4">
                    <Volume2 className="h-5 w-5 mr-2 text-primary" />
                    <h3 className="text-lg font-medium">Today's Motivation</h3>
                  </div>
                  <blockquote className="italic text-muted-foreground border-l-4 border-primary/30 pl-4 my-4">
                    "{currentQuote}"
                  </blockquote>
                </div>
                
                <Card className="shadow-lg animate-fade-in border-primary/10 overflow-hidden">
                  <div className="h-1.5 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500"></div>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Coffee className="h-5 w-5" />
                      After This Session
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      When your Pomodoro timer completes, you'll enter relaxation mode for a 5-minute break.
                    </p>
                    <Button 
                      className="w-full bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600"
                      onClick={() => navigate("/relaxation-mode")}
                    >
                      Skip to Break
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="resources" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ScrollText className="h-5 w-5 text-primary" />
                  Study Resources
                </CardTitle>
                <CardDescription>
                  Materials to help with {task?.subject || "your studies"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <a href="#" className="block p-3 bg-muted/50 hover:bg-muted rounded-md transition-colors flex items-center">
                    <FileText className="h-4 w-4 mr-3 text-primary" />
                    <span>{task?.subject} Notes</span>
                  </a>
                  <a href="#" className="block p-3 bg-muted/50 hover:bg-muted rounded-md transition-colors flex items-center">
                    <BookOpen className="h-4 w-4 mr-3 text-primary" />
                    <span>Practice Problems</span>
                  </a>
                  <a href="#" className="block p-3 bg-muted/50 hover:bg-muted rounded-md transition-colors flex items-center">
                    <Play className="h-4 w-4 mr-3 text-primary" />
                    <span>Video Explanation</span>
                  </a>
                </div>
                
                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-3">Related Topics</h3>
                  <div className="flex flex-wrap gap-2">
                    {task?.subject && [
                      "Introduction", "Key Concepts", "Examples", "Advanced Topics", "Applications"
                    ].map(topic => (
                      <Badge key={topic} variant="outline" className="cursor-pointer hover:bg-muted">
                        {topic}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ChartBar className="h-5 w-5 text-amber-500" />
                  Progress in {task?.subject || "this subject"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Chapter Completion</span>
                      <span>60%</span>
                    </div>
                    <Progress value={60} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Practice Questions</span>
                      <span>42%</span>
                    </div>
                    <Progress value={42} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Quiz Scores</span>
                      <span>78%</span>
                    </div>
                    <Progress value={78} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tips" className="space-y-4">
            <div className="p-6 rounded-lg bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-200 dark:border-indigo-900/50 shadow-md animate-fade-in">
              <h3 className="text-lg font-medium flex items-center mb-4">
                <Brain className="h-5 w-5 mr-2 text-indigo-600 dark:text-indigo-400" />
                Focus Techniques
              </h3>
              <ul className="space-y-4">
                <li className="pl-6 relative before:content-['•'] before:absolute before:left-0 before:text-primary">
                  <span className="font-medium">Pomodoro Technique</span>
                  <p className="text-sm text-muted-foreground mt-1">
                    Work for 25 minutes, then take a 5-minute break. After 4 cycles, take a longer 15-30 minute break.
                  </p>
                </li>
                <li className="pl-6 relative before:content-['•'] before:absolute before:left-0 before:text-primary">
                  <span className="font-medium">Active Recall</span>
                  <p className="text-sm text-muted-foreground mt-1">
                    Test yourself on what you've learned instead of passively re-reading material.
                  </p>
                </li>
                <li className="pl-6 relative before:content-['•'] before:absolute before:left-0 before:text-primary">
                  <span className="font-medium">Spaced Repetition</span>
                  <p className="text-sm text-muted-foreground mt-1">
                    Review material at increasing intervals to strengthen memory retention.
                  </p>
                </li>
                <li className="pl-6 relative before:content-['•'] before:absolute before:left-0 before:text-primary">
                  <span className="font-medium">Feynman Technique</span>
                  <p className="text-sm text-muted-foreground mt-1">
                    Explain concepts in simple terms as if teaching someone else to identify gaps in understanding.
                  </p>
                </li>
              </ul>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Effective Study Environment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-primary/10 rounded-md">
                  <h4 className="font-medium mb-1">Minimize Distractions</h4>
                  <p className="text-sm text-muted-foreground">
                    Turn off notifications, put your phone away, and use apps that block distracting websites.
                  </p>
                </div>

                <div className="p-3 bg-amber-500/10 rounded-md">
                  <h4 className="font-medium mb-1">Optimize Your Space</h4>
                  <p className="text-sm text-muted-foreground">
                    Find a quiet, well-lit area with a comfortable chair and clean desk.
                  </p>
                </div>

                <div className="p-3 bg-blue-500/10 rounded-md">
                  <h4 className="font-medium mb-1">Stay Hydrated</h4>
                  <p className="text-sm text-muted-foreground">
                    Keep water nearby and take short breaks to stretch and move around.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default StudyModePage;
