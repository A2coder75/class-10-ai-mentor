
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlannerTask, PlannerBreak } from "@/types";
import { 
  BookOpen, Clock, Calendar, CheckCircle, MoreHorizontal, 
  AlertCircle, ChevronRight, Sparkles, Star, XCircle
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Checkbox } from "@/components/ui/checkbox";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { toast } from "@/components/ui/use-toast";
import { normalizeSubjectName } from "@/utils/studyPlannerData";
import { PlannerResponseInterface } from "@/utils/api";
import { saveStudyPlanToStorage, loadStudyPlanFromStorage } from "@/utils/studyPlannerStorage";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

// Updated subject colors to match syllabus tracker colors
const subjectColors: Record<string, { bg: string, border: string, text: string, dark: { bg: string, border: string } }> = {
  "Physics": { 
    bg: "bg-blue-50", 
    border: "border-blue-400", 
    text: "text-blue-700",
    dark: { bg: "dark:bg-blue-900/30", border: "dark:border-blue-500" }
  },
  "Mathematics": { 
    bg: "bg-purple-50", 
    border: "border-purple-400", 
    text: "text-purple-700",
    dark: { bg: "dark:bg-purple-900/30", border: "dark:border-purple-500" }
  },
  "Chemistry": { 
    bg: "bg-emerald-50", 
    border: "border-emerald-400", 
    text: "text-emerald-700",
    dark: { bg: "dark:bg-emerald-900/30", border: "dark:border-emerald-500" }
  },
  "Biology": { 
    bg: "bg-rose-50", 
    border: "border-rose-400", 
    text: "text-rose-700",
    dark: { bg: "dark:bg-rose-900/30", border: "dark:border-rose-500" }
  },
  "History": { 
    bg: "bg-amber-50", 
    border: "border-amber-400", 
    text: "text-amber-700",
    dark: { bg: "dark:bg-amber-900/30", border: "dark:border-amber-500" }
  },
  "Geography": { 
    bg: "bg-teal-50", 
    border: "border-teal-400", 
    text: "text-teal-700",
    dark: { bg: "dark:bg-teal-900/30", border: "dark:border-teal-500" }
  },
  "English": { 
    bg: "bg-sky-50", 
    border: "border-sky-400", 
    text: "text-sky-700",
    dark: { bg: "dark:bg-sky-900/30", border: "dark:border-sky-500" }
  },
  "Computer Science": { 
    bg: "bg-fuchsia-50", 
    border: "border-fuchsia-400", 
    text: "text-fuchsia-700",
    dark: { bg: "dark:bg-fuchsia-900/30", border: "dark:border-fuchsia-500" }
  },
  "Economics": { 
    bg: "bg-cyan-50", 
    border: "border-cyan-400", 
    text: "text-cyan-700",
    dark: { bg: "dark:bg-cyan-900/30", border: "dark:border-cyan-500" }
  },
  "break": { 
    bg: "bg-gray-50", 
    border: "border-gray-300", 
    text: "text-gray-500",
    dark: { bg: "dark:bg-gray-800/50", border: "dark:border-gray-600" }
  }
};

// Remove the duplicate entry for "Math"
const defaultColor = { 
  bg: "bg-slate-50", 
  border: "border-slate-400", 
  text: "text-slate-700",
  dark: { bg: "dark:bg-slate-900/30", border: "dark:border-slate-500" }
};

const StudyPlanDisplay = ({ plannerResponse }: { plannerResponse?: PlannerResponseInterface }) => {
  const [studyPlan, setStudyPlan] = useState<any | null>(null);
  const navigate = useNavigate();
  const [taskStatus, setTaskStatus] = useState<Record<string, boolean>>({});

  // Load study plan from either prop or localStorage
  useEffect(() => {
    console.log("Planner response received:", plannerResponse);
    
    if (plannerResponse) {
      try {
        if (typeof plannerResponse === 'object' && plannerResponse !== null) {
          console.log("Planner is already an object");
          setStudyPlan(plannerResponse);
          saveStudyPlanToStorage(plannerResponse);
          return;
        }
        
        if (plannerResponse.planner) {
          const jsonMatch = plannerResponse.planner.match(/```\n([\s\S]*?)\n```/);
          if (jsonMatch && jsonMatch[1]) {
            try {
              const parsedPlan = JSON.parse(jsonMatch[1]);
              console.log("Successfully parsed JSON from code block", parsedPlan);
              setStudyPlan(parsedPlan);
              saveStudyPlanToStorage(parsedPlan);
            } catch (e) {
              console.error("Failed to parse JSON from code block", e);
            }
          } else {
            try {
              const parsedPlan = JSON.parse(plannerResponse.planner);
              console.log("Successfully parsed JSON directly", parsedPlan);
              setStudyPlan(parsedPlan);
              saveStudyPlanToStorage(parsedPlan);
            } catch (e) {
              console.error("Failed to parse JSON directly", e);
            }
          }
        } else if (typeof plannerResponse === 'string') {
          try {
            const parsedPlan = JSON.parse(plannerResponse);
            console.log("Successfully parsed plannerResponse string", parsedPlan);
            setStudyPlan(parsedPlan);
            saveStudyPlanToStorage(parsedPlan);
          } catch (e) {
            console.error("Failed to parse plannerResponse as string", e);
          }
        }
      } catch (error) {
        console.error("Error parsing planner response", error);
      }
    } else {
      console.log("No planner response received, checking local storage");
      const storedPlan = loadStudyPlanFromStorage();
      if (storedPlan) {
        console.log("Loaded study plan from localStorage", storedPlan);
        setStudyPlan(storedPlan);
      }
    }
  }, [plannerResponse]);

  // Load and save task completion status in local storage
  useEffect(() => {
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

  const onDragEnd = (result: any) => {
    if (!result.destination) return;
    
    const { source, destination } = result;
    
    if (source.droppableId === destination.droppableId) {
      const dayId = source.droppableId;
      const [weekIdx, dayIdx] = dayId.split('-').map(Number);
      
      const newTasks = [...studyPlan.study_plan[weekIdx].days[dayIdx].tasks];
      const [movedTask] = newTasks.splice(source.index, 1);
      newTasks.splice(destination.index, 0, movedTask);
      
      const newStudyPlan = {...studyPlan};
      newStudyPlan.study_plan[weekIdx].days[dayIdx].tasks = newTasks;
      setStudyPlan(newStudyPlan);
      saveStudyPlanToStorage(newStudyPlan);

      toast({
        title: "Task rearranged",
        description: "Your study schedule has been updated",
      });
    } else {
      const [sourceWeekIdx, sourceDayIdx] = source.droppableId.split('-').map(Number);
      const [destWeekIdx, destDayIdx] = destination.droppableId.split('-').map(Number);
      
      const newStudyPlan = {...studyPlan};
      const sourceTasks = [...newStudyPlan.study_plan[sourceWeekIdx].days[sourceDayIdx].tasks];
      const destTasks = [...newStudyPlan.study_plan[destWeekIdx].days[destDayIdx].tasks];
      
      const [movedTask] = sourceTasks.splice(source.index, 1);
      destTasks.splice(destination.index, 0, movedTask);
      
      newStudyPlan.study_plan[sourceWeekIdx].days[sourceDayIdx].tasks = sourceTasks;
      newStudyPlan.study_plan[destWeekIdx].days[destDayIdx].tasks = destTasks;
      setStudyPlan(newStudyPlan);
      saveStudyPlanToStorage(newStudyPlan);

      toast({
        title: "Task moved",
        description: "Task moved to a different day",
      });
    }
  };

  const toggleTaskStatus = (weekIndex: number, dayIndex: number, taskIndex: number) => {
    const taskId = `${weekIndex}-${dayIndex}-${taskIndex}`;
    const newStatus = !taskStatus[taskId];
    
    const newTaskStatus = {
      ...taskStatus,
      [taskId]: newStatus
    };
    
    saveTaskStatus(newTaskStatus);

    if (studyPlan) {
      const newStudyPlan = {...studyPlan};
      const task = newStudyPlan.study_plan[weekIndex].days[dayIndex].tasks[taskIndex];
      if (task && !('break' in task)) {
        task.status = newStatus ? 'completed' : 'pending';
      }
      setStudyPlan(newStudyPlan);
      saveStudyPlanToStorage(newStudyPlan);
    }

    toast({
      title: newStatus ? "Task completed! 🎉" : "Task marked as incomplete",
      description: newStatus ? "Great job keeping up with your study schedule!" : "Task has been reset.",
      variant: newStatus ? "default" : "destructive",
    });
  };

  const handleStudyToday = () => {
    navigate('/study');
  };

  const getSubjectColor = (subject: string) => {
    const normalizedSubject = normalizeSubjectName(subject);
    return subjectColors[normalizedSubject] || defaultColor;
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours > 0 ? `${hours}h ` : ''}${mins > 0 ? `${mins}m` : ''}`;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
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

  const addBreak = (weekIndex: number, dayIndex: number) => {
    if (!studyPlan) return;
    
    const newStudyPlan = {...studyPlan};
    const newBreak = { break: 20 };
    newStudyPlan.study_plan[weekIndex].days[dayIndex].tasks.push(newBreak);
    setStudyPlan(newStudyPlan);
    saveStudyPlanToStorage(newStudyPlan);
    
    toast({
      title: "Break added",
      description: "A 20-minute break has been added to your schedule",
    });
  };

  const removeTask = (weekIndex: number, dayIndex: number, taskIndex: number) => {
    if (!studyPlan) return;
    
    const newStudyPlan = {...studyPlan};
    newStudyPlan.study_plan[weekIndex].days[dayIndex].tasks.splice(taskIndex, 1);
    setStudyPlan(newStudyPlan);
    saveStudyPlanToStorage(newStudyPlan);
    
    toast({
      title: "Task removed",
      description: "The task has been removed from your schedule",
    });
  };

  const isToday = (dateStr: string) => {
    const today = new Date();
    const checkDate = new Date(dateStr);
    
    return today.getDate() === checkDate.getDate() && 
           today.getMonth() === checkDate.getMonth() && 
           today.getFullYear() === checkDate.getFullYear();
  };

  if (!studyPlan) {
    return (
      <Card className="border-none shadow-lg rounded-3xl bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
        <CardHeader className="border-b border-slate-100 dark:border-slate-800 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-t-3xl">
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
              Your Study Planner
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="text-center py-16">
          <div className="mb-8">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 flex items-center justify-center mx-auto mb-6 shadow-inner">
              <Calendar className="w-12 h-12 text-indigo-500 dark:text-indigo-400" />
            </div>
            <p className="text-xl font-medium text-gray-800 dark:text-gray-200 mb-2">No study plan yet</p>
            <p className="text-muted-foreground max-w-md mx-auto">
              Create a personalized study plan to optimize your learning journey and track your progress
            </p>
          </div>
          <Button 
            onClick={() => navigate('/syllabus')}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium px-8 py-2 rounded-full shadow-lg hover:shadow-xl transition-all"
          >
            <Sparkles className="mr-2 h-4 w-4" /> Create Your Study Plan
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!studyPlan.study_plan || studyPlan.study_plan.length === 0) {
    console.log("Study plan exists but has no data:", studyPlan);
    return (
      <Card className="border-none shadow-lg rounded-3xl overflow-hidden">
        <CardHeader className="border-b bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20">
          <CardTitle className="text-xl text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-600 dark:from-amber-400 dark:to-orange-400">
            Study Planner
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-16">
          <div className="mb-6">
            <AlertCircle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">
              Your study plan appears to be empty
            </p>
            <p className="text-sm text-muted-foreground max-w-md mx-auto mt-2">
              Please try regenerating it to get your personalized study schedule
            </p>
          </div>
          <Button 
            onClick={() => navigate('/syllabus')}
            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-medium px-8 py-2 rounded-full shadow-lg hover:shadow-xl transition-all"
          >
            Create New Study Plan
          </Button>
        </CardContent>
      </Card>
    );
  }

  console.log("Rendering study plan:", studyPlan);

  return (
    <div className="space-y-6 animate-fade-in">
      <Card className="border-none overflow-hidden shadow-2xl rounded-3xl bg-gradient-to-br from-white to-slate-50/80 dark:from-gray-900 dark:to-slate-900/80 backdrop-blur-sm">
        {/* Modern header with gradient */}
        <CardHeader className="pb-6 pt-10 px-8 bg-gradient-to-br from-indigo-600/5 via-purple-600/5 to-blue-600/5 dark:from-indigo-600/10 dark:via-purple-600/10 dark:to-blue-600/10 border-b border-indigo-100 dark:border-indigo-900/30 relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-blue-500/5 to-purple-500/5 rounded-full filter blur-3xl -mr-32 -mt-32 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-purple-500/5 to-indigo-500/5 rounded-full filter blur-3xl -ml-32 -mb-32 pointer-events-none"></div>
          
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 relative z-10">
            <div>
              <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
                Your Study Plan
              </span>
              <p className="text-sm text-muted-foreground font-normal mt-2 flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-indigo-500" /> 
                Target Exam Date: <span className="font-medium text-foreground">{studyPlan?.target_date}</span>
              </p>
            </div>
            <Button 
              onClick={handleStudyToday}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all group rounded-full px-6"
            >
              <BookOpen className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" /> Study Today
            </Button>
          </div>
        </CardHeader>
        
        {/* Sleek body with modern tabs */}
        <CardContent className="pt-6 px-6">
          <Tabs defaultValue={`week-0`} className="w-full">
            {/* Modern tab list with subtle highlights */}
            <TabsList className="w-full mb-8 overflow-x-auto flex-nowrap grid grid-cols-3 sm:grid-cols-6 gap-1 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 p-1.5 rounded-full">
              {studyPlan.study_plan.map((week: any, index: number) => (
                <TabsTrigger 
                  key={week.week_number} 
                  value={`week-${index}`} 
                  className="rounded-full text-sm px-5 py-2.5 font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-500 data-[state=active]:text-white data-[state=active]:shadow-md"
                >
                  Week {week.week_number}
                </TabsTrigger>
              ))}
            </TabsList>
            
            <DragDropContext onDragEnd={onDragEnd}>
              {studyPlan?.study_plan.map((week: any, weekIndex: number) => (
                <TabsContent 
                  key={weekIndex} 
                  value={`week-${weekIndex}`} 
                  className="fade-in space-y-6"
                >
                  {week.days.map((day: any, dayIndex: number) => (
                    <Card 
                      key={dayIndex} 
                      className={`mb-6 overflow-hidden border-none rounded-2xl shadow-md hover:shadow-lg transition-all ${
                        isToday(day.date) ? 'ring-2 ring-indigo-500/20 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 dark:from-indigo-900/10 dark:to-purple-900/10' : 'bg-white dark:bg-gray-900/50'
                      }`}
                    >
                      {/* Day header with date, styled based on if it's today */}
                      <CardHeader className={`py-4 px-5 border-b ${
                        isToday(day.date) 
                          ? 'bg-gradient-to-r from-indigo-400/10 to-purple-400/10 dark:from-indigo-500/20 dark:to-purple-500/20 border-indigo-200 dark:border-indigo-800/30'
                          : 'bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-900/50 dark:to-slate-800/50 border-gray-100 dark:border-gray-800/30'
                      }`}>
                        <div className="flex items-center justify-between">
                          <div className="font-medium text-lg flex items-center gap-2">
                            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                              isToday(day.date)
                                ? 'bg-gradient-to-br from-indigo-500 to-purple-500 text-white shadow-md'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                            }`}>
                              <Calendar className="h-5 w-5" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                {formatDate(day.date)}
                                {isToday(day.date) && (
                                  <Badge className="bg-gradient-to-r from-indigo-500 to-purple-500 border-none text-white">Today</Badge>
                                )}
                              </div>
                              {day.tasks.length > 0 && (
                                <div className="text-xs text-muted-foreground mt-0.5">
                                  {day.tasks.filter((t: any) => !('break' in t)).length} tasks
                                </div>
                              )}
                            </div>
                          </div>
                          <div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-56 rounded-xl overflow-hidden border-none shadow-lg bg-white dark:bg-gray-900">
                                <DropdownMenuItem onClick={() => addBreak(weekIndex, dayIndex)} className="cursor-pointer flex gap-2 py-2.5">
                                  <Clock className="h-4 w-4 text-indigo-500" />
                                  <span>Add break</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => {
                                    const allCompleted = day.tasks
                                      .filter((t: any) => !('break' in t))
                                      .every((_: any, i: number) => taskStatus[`${weekIndex}-${dayIndex}-${i}`]);
                                      
                                    const newTaskStatus = {...taskStatus};
                                    
                                    day.tasks.forEach((task: any, i: number) => {
                                      if (!('break' in task)) {
                                        newTaskStatus[`${weekIndex}-${dayIndex}-${i}`] = !allCompleted;
                                      }
                                    });
                                    
                                    saveTaskStatus(newTaskStatus);
                                    
                                    // Update task status in study plan
                                    const newStudyPlan = {...studyPlan};
                                    day.tasks.forEach((task: any, i: number) => {
                                      if (!('break' in task)) {
                                        task.status = !allCompleted ? 'completed' : 'pending';
                                      }
                                    });
                                    setStudyPlan(newStudyPlan);
                                    saveStudyPlanToStorage(newStudyPlan);
                                    
                                    toast({
                                      title: !allCompleted ? "All tasks completed! 🎉" : "All tasks marked as incomplete",
                                      description: !allCompleted ? "Great job finishing all your tasks!" : "Tasks have been reset.",
                                    });
                                  }}
                                  className="cursor-pointer flex gap-2 py-2.5"
                                >
                                  {day.tasks.filter((t: any) => !('break' in t)).every((_: any, i: number) => 
                                    taskStatus[`${weekIndex}-${dayIndex}-${i}`]
                                  ) ? (
                                    <>
                                      <XCircle className="h-4 w-4 text-red-500" />
                                      <span>Mark all as incomplete</span>
                                    </>
                                  ) : (
                                    <>
                                      <CheckCircle className="h-4 w-4 text-green-500" />
                                      <span>Mark all as complete</span>
                                    </>
                                  )}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </CardHeader>
                      
                      {/* Tasks table with modern styling */}
                      <CardContent className="p-0">
                        <div className="max-h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-indigo-200 dark:scrollbar-thumb-indigo-900 scrollbar-track-transparent">
                          <Table>
                            <TableHeader className="bg-slate-50 dark:bg-slate-900/50 sticky top-0 z-10">
                              <TableRow>
                                <TableHead className="font-medium pl-4" style={{ width: "35%" }}>Subject & Chapter</TableHead>
                                <TableHead className="font-medium" style={{ width: "15%" }}>Type</TableHead>
                                <TableHead className="font-medium" style={{ width: "15%" }}>Duration</TableHead>
                                <TableHead className="font-medium text-right pr-4 w-[100px]">Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              <Droppable droppableId={`${weekIndex}-${dayIndex}`}>
                                {(provided) => (
                                  <React.Fragment
                                    ref={provided.innerRef}
                                    {...provided.droppableProps}
                                  >
                                    {day.tasks.map((task: any, taskIndex: number) => {
                                      const taskId = `${weekIndex}-${dayIndex}-${taskIndex}`;
                                      const isComplete = taskStatus[taskId] || task.status === 'completed';
                                      
                                      if ('break' in task) {
                                        return (
                                          <TableRow 
                                            key={`break-${taskIndex}`} 
                                            className="bg-gradient-to-r from-gray-50 to-gray-50 dark:from-gray-900/20 dark:to-gray-900/20 h-12 hover:from-gray-100 hover:to-gray-100 dark:hover:from-gray-900/30 dark:hover:to-gray-900/30"
                                          >
                                            <TableCell colSpan={3} className="text-center text-sm text-gray-500">
                                              <div className="flex items-center justify-center">
                                                <Clock className="w-4 h-4 mr-2 text-gray-400" />
                                                <span>{task.break} minute break</span>
                                              </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                              <Button 
                                                variant="ghost" 
                                                size="sm" 
                                                className="h-7 px-2 text-xs text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full"
                                                onClick={() => removeTask(weekIndex, dayIndex, taskIndex)}
                                              >
                                                Remove
                                              </Button>
                                            </TableCell>
                                          </TableRow>
                                        );
                                      }
                                      
                                      const colorScheme = getSubjectColor(task.subject);
                                      
                                      return (
                                        <Draggable 
                                          key={taskId} 
                                          draggableId={taskId} 
                                          index={taskIndex}
                                        >
                                          {(provided) => (
                                            <TableRow 
                                              ref={provided.innerRef}
                                              {...provided.draggableProps}
                                              {...provided.dragHandleProps}
                                              className={`${
                                                isComplete 
                                                  ? "bg-gradient-to-r from-gray-50/80 to-gray-50/80 dark:from-gray-900/10 dark:to-gray-900/10 opacity-70" 
                                                  : `${colorScheme.bg} ${colorScheme.dark.bg}`
                                              } border-l-4 ${colorScheme.border} ${colorScheme.dark.border} hover:bg-opacity-90 cursor-move transition-all`}
                                            >
                                              <TableCell className={`font-medium ${colorScheme.text}`}>
                                                <div className="flex items-center gap-2">
                                                  <Checkbox
                                                    checked={isComplete}
                                                    onCheckedChange={() => toggleTaskStatus(weekIndex, dayIndex, taskIndex)}
                                                    className={`${
                                                      isComplete 
                                                        ? "bg-indigo-500 text-white border-transparent" 
                                                        : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                                                    } h-5 w-5 rounded-md transition-all duration-200 data-[state=checked]:animate-pulse`}
                                                  />
                                                  <div>
                                                    <div className={`font-bold ${isComplete ? "line-through opacity-70" : ""}`}>
                                                      {task.subject}
                                                    </div>
                                                    <div className={`text-sm text-muted-foreground ${isComplete ? "line-through opacity-70" : ""}`}>
                                                      {task.chapter}
                                                    </div>
                                                  </div>
                                                </div>
                                              </TableCell>
                                              <TableCell>
                                                {renderTaskBadge(task.task_type)}
                                              </TableCell>
                                              <TableCell>
                                                <Tooltip>
                                                  <TooltipTrigger asChild>
                                                    <div className="flex items-center gap-1.5">
                                                      <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                                                      <span>{formatTime(task.estimated_time)}</span>
                                                    </div>
                                                  </TooltipTrigger>
                                                  <TooltipContent>
                                                    Estimated time: {formatTime(task.estimated_time)}
                                                  </TooltipContent>
                                                </Tooltip>
                                              </TableCell>
                                              <TableCell className="text-right">
                                                <Button 
                                                  variant="ghost" 
                                                  size="sm" 
                                                  className="h-7 px-2 text-xs text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full"
                                                  onClick={() => removeTask(weekIndex, dayIndex, taskIndex)}
                                                >
                                                  Remove
                                                </Button>
                                              </TableCell>
                                            </TableRow>
                                          )}
                                        </Draggable>
                                      );
                                    })}
                                    {provided.placeholder}
                                    {day.tasks.length === 0 && (
                                      <TableRow>
                                        <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                          <div className="flex flex-col items-center justify-center">
                                            <Calendar className="h-8 w-8 mb-2 text-gray-300 dark:text-gray-600" />
                                            <p>No tasks scheduled for this day</p>
                                            <Button 
                                              variant="outline" 
                                              size="sm" 
                                              className="mt-2"
                                              onClick={() => navigate('/syllabus')}
                                            >
                                              Plan your day
                                            </Button>
                                          </div>
                                        </TableCell>
                                      </TableRow>
                                    )}
                                  </React.Fragment>
                                )}
                              </Droppable>
                            </TableBody>
                          </Table>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  
                  {/* Subject color legend */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 mt-6 p-5 rounded-xl bg-gradient-to-br from-white to-gray-50 dark:from-slate-900 dark:to-gray-900/50 border border-indigo-100/50 dark:border-indigo-900/20 shadow-sm">
                    <h4 className="col-span-full text-sm font-medium mb-1 text-gray-500">Subject Color Guide</h4>
                    {Object.entries(subjectColors)
                      .filter(([key]) => key !== "break" && key !== "Math")
                      .slice(0, 6)
                      .map(([subject, colors]) => (
                        <div 
                          key={subject} 
                          className={`px-3 py-2 rounded-lg ${colors.bg} ${colors.dark.bg} border-l-4 ${colors.border} ${colors.dark.border} flex items-center justify-center ${colors.text} text-sm font-medium shadow-sm`}
                        >
                          {subject}
                        </div>
                      ))}
                  </div>
                </TabsContent>
              ))}
            </DragDropContext>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudyPlanDisplay;
