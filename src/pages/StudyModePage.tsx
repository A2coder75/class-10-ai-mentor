
import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { PlannerTask } from "@/types";
import { Play, Pause, RotateCcw, ArrowLeft, Volume2 } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";

// Mock data for resources by subject
const studyResources: Record<string, { title: string; url: string }[]> = {
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

// Motivation quotes for studying
const motivationalQuotes = [
  "The expert in anything was once a beginner.",
  "Don't watch the clock; do what it does. Keep going.",
  "The secret of getting ahead is getting started.",
  "You don't have to be great to start, but you have to start to be great.",
  "Success is the sum of small efforts, repeated day in and day out.",
  "The difference between try and triumph is just a little umph!",
  "Believe you can and you're halfway there.",
  "It always seems impossible until it's done.",
  "The only way to learn mathematics is to do mathematics.",
  "In the middle of difficulty lies opportunity."
];

const StudyModePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const task = location.state?.task as PlannerTask;
  
  const [timerRunning, setTimerRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(task?.estimated_time ? task.estimated_time * 60 : 25 * 60); // in seconds
  const [originalTime] = useState(timeLeft);
  const [quote, setQuote] = useState("");
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Set a random motivational quote
    setQuote(motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]);
    
    // Create audio element for notifications
    audioRef.current = new Audio("/notification.mp3");
    
    // Clean up on unmount
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Timer control functions
  const toggleTimer = () => {
    setTimerRunning(!timerRunning);
    
    if (!timerRunning) {
      toast({
        title: "Focus time started",
        description: `Stay focused on ${task?.chapter} for the next ${formatTime(timeLeft)}`,
      });
    }
  };

  const resetTimer = () => {
    setTimerRunning(false);
    setTimeLeft(originalTime);
    toast({
      title: "Timer reset",
      description: "Ready to start fresh",
    });
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  const getProgressPercentage = (): number => {
    return ((originalTime - timeLeft) / originalTime) * 100;
  };

  // Handle timer effect
  useEffect(() => {
    if (timerRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            // Time's up
            setTimerRunning(false);
            
            // Play notification sound
            if (audioRef.current) {
              audioRef.current.play().catch(err => console.error("Audio playback error:", err));
            }
            
            toast({
              title: "Time's up!",
              description: "Great job completing your study session.",
            });
            
            // Navigate back to study page after a brief delay
            setTimeout(() => navigate('/study'), 3000);
            
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
  }, [timerRunning, navigate]);

  // Helper function to render task type badge
  const renderTaskTypeBadge = (taskType: 'learning' | 'revision' | 'practice') => {
    if (taskType === "learning") {
      return <Badge className="bg-primary hover:bg-primary/90">{taskType}</Badge>;
    } else if (taskType === "revision") {
      return <Badge variant="outline" className="border-amber-500 text-amber-600 dark:text-amber-400">{taskType}</Badge>;
    } else if (taskType === "practice") {
      return <Badge variant="outline" className="border-green-500 text-green-600 dark:text-green-400">{taskType}</Badge>;
    }
    return null;
  };

  // If no task is provided, return to study page
  if (!task) {
    useEffect(() => {
      navigate('/study');
    }, [navigate]);
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 p-6">
      <Button 
        variant="ghost" 
        className="mb-6" 
        onClick={() => navigate('/study')}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Study Page
      </Button>
      
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold gradient-text bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
            Focus Mode
          </h1>
          <p className="text-muted-foreground">
            Deep concentration on {task.subject} - {task.chapter}
          </p>
        </div>
        
        {/* Timer */}
        <Card className="bg-white dark:bg-slate-900 border-none shadow-lg rounded-xl overflow-hidden">
          <CardContent className="pt-6 pb-8 px-8">
            <div className="flex flex-col items-center">
              <div className="w-64 h-64 rounded-full border-8 border-primary/10 flex flex-col items-center justify-center mb-8 relative">
                <div className="absolute inset-0 rounded-full" 
                  style={{ 
                    background: `conic-gradient(
                      var(--primary) ${getProgressPercentage()}%, 
                      transparent 0%
                    )`,
                    opacity: 0.15,
                  }}
                ></div>
                
                <span className="text-6xl font-bold mb-2">
                  {formatTime(timeLeft)}
                </span>
                
                <div className="text-xl text-muted-foreground">
                  {renderTaskTypeBadge(task.task_type)}
                </div>
              </div>
              
              <div className="flex gap-4 mb-6">
                <Button
                  size="lg"
                  onClick={toggleTimer}
                  className={`px-8 ${!timerRunning ? 'bg-gradient-to-r from-purple-600 to-blue-500' : 'bg-amber-500'}`}
                >
                  {timerRunning ? (
                    <><Pause className="mr-2 h-5 w-5" /> Pause</>
                  ) : (
                    <><Play className="mr-2 h-5 w-5" /> Start</>
                  )}
                </Button>
                
                <Button
                  variant="outline"
                  size="lg"
                  onClick={resetTimer}
                >
                  <RotateCcw className="mr-2 h-5 w-5" />
                  Reset
                </Button>
              </div>
              
              <Progress value={getProgressPercentage()} className="h-2 w-full" />
            </div>
          </CardContent>
        </Card>
        
        {/* Study Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-none shadow-md">
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <Volume2 className="mr-2 h-5 w-5 text-primary" />
                Motivation
              </h2>
              <div className="bg-primary/5 p-6 rounded-lg border border-primary/10 italic text-center text-lg">
                "{quote}"
              </div>
              
              <div className="mt-6">
                <h3 className="font-medium mb-2">Current Focus:</h3>
                <div className="bg-primary/5 p-4 rounded-lg">
                  <div className="font-semibold text-lg">{task.subject}</div>
                  <div className="text-muted-foreground">{task.chapter}</div>
                  <div className="mt-2">{renderTaskTypeBadge(task.task_type)}</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-none shadow-md">
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold mb-4">Study Resources</h2>
              <div className="space-y-3">
                {studyResources[task.subject as keyof typeof studyResources]?.map((resource, index) => (
                  <a 
                    key={index} 
                    href={resource.url}
                    className="flex items-center p-3 border rounded-lg hover:bg-accent transition-colors block"
                  >
                    <span>{resource.title}</span>
                  </a>
                )) || (
                  <div className="text-center py-4 text-muted-foreground">
                    No resources available for {task.subject}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Study Tips */}
        <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-none shadow-md">
          <CardContent className="pt-6">
            <h2 className="text-xl font-semibold mb-4">Study Tips</h2>
            <ul className="space-y-2 list-disc pl-5 text-muted-foreground">
              <li>Focus on one concept at a time</li>
              <li>Take effective notes using diagrams and key concepts</li>
              <li>Try to solve example problems without looking at solutions</li>
              <li>After each pomodoro session, review what you've learned</li>
              <li>Create flashcards for important formulas and definitions</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudyModePage;
