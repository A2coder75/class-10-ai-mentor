
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlannerTask, PlannerBreak } from "@/types";
import { BookOpen, Clock, Calendar, CheckCircle, MoreHorizontal } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Checkbox } from "@/components/ui/checkbox";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { toast } from "@/components/ui/use-toast";
import { normalizeSubjectName } from "@/utils/studyPlannerData";
import { PlannerResponseInterface } from "@/utils/api";
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
  "Math": { 
    bg: "bg-purple-50", 
    border: "border-purple-400", 
    text: "text-purple-700",
    dark: { bg: "dark:bg-purple-900/30", border: "dark:border-purple-500" }
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

const defaultColor = { 
  bg: "bg-slate-50", 
  border: "border-slate-400", 
  text: "text-slate-700",
  dark: { bg: "dark:bg-slate-900/30", border: "dark:border-slate-500" }
};

const saveStudyPlanToStorage = (plan: any) => {
  try {
    localStorage.setItem('studyPlan', JSON.stringify(plan));
    console.log('Study plan saved to local storage');
  } catch (error) {
    console.error('Error saving study plan to localStorage:', error);
  }
};

const StudyPlanDisplay = ({ plannerResponse }: { plannerResponse?: PlannerResponseInterface }) => {
  const [studyPlan, setStudyPlan] = useState<any | null>(null);
  const navigate = useNavigate();
  const [taskStatus, setTaskStatus] = useState<Record<string, boolean>>({});

  React.useEffect(() => {
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
            const parsedPlan = JSON.parse(jsonMatch[1]);
            console.log("Successfully parsed JSON from code block", parsedPlan);
            setStudyPlan(parsedPlan);
            saveStudyPlanToStorage(parsedPlan);
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
      try {
        const storedPlan = localStorage.getItem('studyPlan');
        if (storedPlan) {
          const parsedPlan = JSON.parse(storedPlan);
          console.log("Loaded study plan from localStorage", parsedPlan);
          setStudyPlan(parsedPlan);
        }
      } catch (error) {
        console.error("Error loading study plan from localStorage:", error);
      }
    }
  }, [plannerResponse]);

  const onDragEnd = (result: any) => {
    if (!result.destination) return;
    
    const { source, destination } = result;
    
    const [weekIndex, dayIndex] = result.draggableId.split('-').map(Number);
    
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
    
    setTaskStatus(prev => ({
      ...prev,
      [taskId]: newStatus
    }));

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
      title: newStatus ? "Task completed!" : "Task marked as incomplete",
      description: newStatus ? "Great job keeping up with your study schedule!" : "Task has been reset.",
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
        return <Badge className="bg-indigo-500 hover:bg-indigo-600 text-white">{taskType}</Badge>;
      case 'revision':
        return <Badge variant="outline" className="border-amber-500 text-amber-600 dark:text-amber-400 font-medium">{taskType}</Badge>;
      case 'practice':
        return <Badge variant="outline" className="border-green-500 text-green-600 dark:text-green-400 font-medium">{taskType}</Badge>;
      default:
        return <Badge variant="secondary">{taskType}</Badge>;
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
      <Card className="border shadow-lg rounded-xl bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
        <CardHeader className="border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-t-xl">
          <CardTitle>Your Study Planner</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-16">
          <div className="mb-8">
            <div className="w-24 h-24 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-6">
              <Calendar className="w-12 h-12 text-slate-400" />
            </div>
            <p className="text-muted-foreground text-lg font-medium">No study plan has been generated yet</p>
            <p className="text-muted-foreground mt-2">Create a personalized study plan to optimize your learning journey</p>
          </div>
          <Button 
            onClick={() => navigate('/syllabus')}
            className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-medium px-6 py-2 rounded-full shadow-md hover:shadow-lg transition-all"
          >
            Create Your Study Plan
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!studyPlan.study_plan || studyPlan.study_plan.length === 0) {
    console.log("Study plan exists but has no data:", studyPlan);
    return (
      <Card className="border shadow-lg rounded-xl overflow-hidden">
        <CardHeader className="border-b bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20">
          <CardTitle>Study Planner</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-16">
          <div className="mb-6">
            <AlertCircle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
            <p className="text-muted-foreground text-lg font-medium">
              Your study plan appears to be empty
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Please try regenerating it to get your personalized study schedule
            </p>
          </div>
          <Button 
            onClick={() => navigate('/syllabus')}
            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-medium px-6 py-2 rounded-full shadow-md hover:shadow-lg transition-all"
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
      <Card className="border-primary/10 overflow-hidden shadow-xl rounded-2xl bg-white dark:bg-slate-900">
        {/* Modern header with gradient */}
        <CardHeader className="pb-6 pt-8 px-8 bg-gradient-to-r from-indigo-500/5 to-blue-500/5 dark:from-indigo-500/10 dark:to-blue-500/10 border-b border-slate-100 dark:border-slate-800 relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-blue-500/10 to-purple-500/10 rounded-full filter blur-3xl -mr-32 -mt-32 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-purple-500/10 to-indigo-500/10 rounded-full filter blur-3xl -ml-32 -mb-32 pointer-events-none"></div>
          
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 relative z-10">
            <div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-600 dark:from-indigo-400 dark:to-blue-400">
                Your Personalized Study Plan
              </span>
              <p className="text-sm text-muted-foreground font-normal mt-1.5 flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-indigo-500" /> 
                Target Exam Date: <span className="font-medium text-foreground">{studyPlan?.target_date}</span>
              </p>
            </div>
            <Button 
              onClick={handleStudyToday}
              className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all group"
            >
              <BookOpen className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" /> Study Today
            </Button>
          </div>
        </CardHeader>
        
        {/* Sleek body with modern tabs */}
        <CardContent className="pt-6 px-6">
          <Tabs defaultValue={`week-1`} className="w-full">
            {/* Modern tab list with subtle highlights */}
            <TabsList className="w-full mb-8 overflow-x-auto flex-nowrap grid grid-cols-3 sm:grid-cols-6 gap-1 bg-slate-100/80 dark:bg-slate-800/50 p-1 rounded-xl">
              {studyPlan.study_plan.map((week: any) => (
                <TabsTrigger 
                  key={week.week_number} 
                  value={`week-${week.week_number}`} 
                  className="text-sm px-3 font-medium"
                >
                  Week {week.week_number}
                </TabsTrigger>
              ))}
            </TabsList>
            
            <DragDropContext onDragEnd={onDragEnd}>
              {studyPlan?.study_plan.map((week: any) => (
                <TabsContent 
                  key={week.week_number} 
                  value={`week-${week.week_number}`} 
                  className="fade-in space-y-6"
                >
                  {week.days.map((day: any, dayIndex: number) => (
                    <Card 
                      key={dayIndex} 
                      className={`mb-6 overflow-hidden border rounded-xl shadow-md hover:shadow-lg transition-all ${
                        isToday(day.date) ? 'border-primary ring-2 ring-primary/20' : 'border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {/* Day header with date, styled based on if it's today */}
                      <CardHeader className={`py-4 px-5 border-b ${
                        isToday(day.date) 
                          ? 'bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/40 dark:to-blue-900/40'
                          : 'bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800'
                      }`}>
                        <div className="flex items-center justify-between">
                          <div className="font-medium text-lg flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-indigo-500" />
                            {formatDate(day.date)}
                            {isToday(day.date) && (
                              <Badge variant="default" className="ml-2 bg-indigo-600 hover:bg-indigo-700">Today</Badge>
                            )}
                          </div>
                          <div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => addBreak(week.week_number, dayIndex)}>
                                  Add break
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => {
                                  const allCompleted = day.tasks
                                    .filter((t: any) => !('break' in t))
                                    .every((_: any, i: number) => taskStatus[`${week.week_number}-${dayIndex}-${i}`]);
                                    
                                  day.tasks.forEach((_: any, i: number) => {
                                    if (!('break' in day.tasks[i])) {
                                      toggleTaskStatus(week.week_number, dayIndex, i);
                                    }
                                  });
                                }}>
                                  {day.tasks.filter((t: any) => !('break' in t)).every((_: any, i: number) => 
                                    taskStatus[`${week.week_number}-${dayIndex}-${i}`]
                                  ) ? 'Mark all as incomplete' : 'Mark all as complete'}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </CardHeader>
                      
                      {/* Tasks table with modern styling */}
                      <CardContent className="p-0">
                        <Table>
                          <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
                            <TableRow>
                              <TableHead className="font-medium pl-4" style={{ width: "35%" }}>Subject & Chapter</TableHead>
                              <TableHead className="font-medium" style={{ width: "15%" }}>Type</TableHead>
                              <TableHead className="font-medium" style={{ width: "15%" }}>Duration</TableHead>
                              <TableHead className="font-medium text-right pr-4 w-[100px]">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            <Droppable droppableId={`${week.week_number}-${dayIndex}`}>
                              {(provided) => (
                                <React.Fragment
                                  ref={provided.innerRef}
                                  {...provided.droppableProps}
                                >
                                  {day.tasks.map((task: any, taskIndex: number) => {
                                    const taskId = `${week.week_number}-${dayIndex}-${taskIndex}`;
                                    const isComplete = taskStatus[taskId] || task.status === 'completed';
                                    
                                    if ('break' in task) {
                                      return (
                                        <TableRow key={`break-${taskIndex}`} className="bg-gray-50 dark:bg-gray-900/20 h-12 hover:bg-gray-100 dark:hover:bg-gray-800/40">
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
                                              className="h-7 px-2 text-xs text-destructive-foreground hover:text-destructive"
                                              onClick={() => removeTask(week.week_number, dayIndex, taskIndex)}
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
                                            className={`${colorScheme.bg} ${colorScheme.dark.bg} border-l-4 ${colorScheme.border} ${colorScheme.dark.border} hover:bg-opacity-80 cursor-move ${
                                              isComplete ? "opacity-60" : ""
                                            }`}
                                          >
                                            <TableCell className={`font-medium ${colorScheme.text}`}>
                                              <div className="flex items-center gap-2">
                                                <Checkbox
                                                  checked={isComplete}
                                                  onCheckedChange={() => toggleTaskStatus(week.week_number, dayIndex, taskIndex)}
                                                  className="bg-white dark:bg-gray-800 data-[state=checked]:bg-primary data-[state=checked]:text-white h-5 w-5 rounded-sm"
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
                                                className="h-7 px-2 text-xs text-destructive-foreground hover:text-destructive"
                                                onClick={() => removeTask(week.week_number, dayIndex, taskIndex)}
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
                                </React.Fragment>
                              )}
                            </Droppable>
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  ))}
                  
                  {/* Subject color legend */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 mt-6 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 shadow-sm">
                    <h4 className="col-span-full text-sm font-medium mb-1 text-slate-500">Subject Color Legend</h4>
                    {Object.entries(subjectColors)
                      .filter(([key]) => key !== "break")
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
