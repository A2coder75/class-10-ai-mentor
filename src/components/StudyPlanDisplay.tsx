
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
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const subjectColors: Record<string, { bg: string, border: string, text: string, dark: { bg: string, border: string } }> = {
  "Physics": { 
    bg: "bg-blue-400/30", 
    border: "border-blue-400", 
    text: "text-blue-800",
    dark: { bg: "dark:bg-blue-800/40", border: "dark:border-blue-600" }
  },
  "Math": { 
    bg: "bg-purple-400/30", 
    border: "border-purple-400", 
    text: "text-purple-800",
    dark: { bg: "dark:bg-purple-800/40", border: "dark:border-purple-600" }
  },
  "Mathematics": { 
    bg: "bg-purple-400/30", 
    border: "border-purple-400", 
    text: "text-purple-800",
    dark: { bg: "dark:bg-purple-800/40", border: "dark:border-purple-600" }
  },
  "Chemistry": { 
    bg: "bg-emerald-400/30", 
    border: "border-emerald-400", 
    text: "text-emerald-800",
    dark: { bg: "dark:bg-emerald-800/40", border: "dark:border-emerald-600" }
  },
  "Biology": { 
    bg: "bg-rose-400/30", 
    border: "border-rose-400", 
    text: "text-rose-800",
    dark: { bg: "dark:bg-rose-800/40", border: "dark:border-rose-600" }
  },
  "History": { 
    bg: "bg-amber-400/30", 
    border: "border-amber-400", 
    text: "text-amber-800",
    dark: { bg: "dark:bg-amber-800/40", border: "dark:border-amber-600" }
  },
  "Geography": { 
    bg: "bg-teal-400/30", 
    border: "border-teal-400", 
    text: "text-teal-800",
    dark: { bg: "dark:bg-teal-800/40", border: "dark:border-teal-600" }
  },
  "English": { 
    bg: "bg-sky-400/30", 
    border: "border-sky-400", 
    text: "text-sky-800",
    dark: { bg: "dark:bg-sky-800/40", border: "dark:border-sky-600" }
  },
  "Computer Science": { 
    bg: "bg-fuchsia-400/30", 
    border: "border-fuchsia-400", 
    text: "text-fuchsia-800",
    dark: { bg: "dark:bg-fuchsia-800/40", border: "dark:border-fuchsia-600" }
  },
  "Economics": { 
    bg: "bg-cyan-400/30", 
    border: "border-cyan-400", 
    text: "text-cyan-800",
    dark: { bg: "dark:bg-cyan-800/40", border: "dark:border-cyan-600" }
  },
  "break": { 
    bg: "bg-gray-200", 
    border: "border-gray-300", 
    text: "text-gray-600",
    dark: { bg: "dark:bg-gray-800/50", border: "dark:border-gray-700" }
  }
};

const defaultColor = { 
  bg: "bg-slate-400/30", 
  border: "border-slate-400", 
  text: "text-slate-800",
  dark: { bg: "dark:bg-slate-800/40", border: "dark:border-slate-600" }
};

// Store the study plan in localStorage for sync with study page
const saveStudyPlanToStorage = (plan: any) => {
  try {
    localStorage.setItem('studyPlan', JSON.stringify(plan));
    console.log('Study plan saved to local storage');
  } catch (error) {
    console.error('Error saving study plan to localStorage:', error);
  }
};

const StudyPlanDisplay = ({ plannerResponse }: { plannerResponse?: any }) => {
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
      // Try to load from localStorage if no planner response
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

    // Also update the task status in the study plan
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
      <Card className="border border-dashed border-muted">
        <CardHeader>
          <CardTitle>Study Planner</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-12">
          <div className="mb-4">
            <p className="text-muted-foreground text-lg">No study plan has been generated yet</p>
          </div>
          <Button 
            onClick={() => navigate('/syllabus')}
            className="bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600"
          >
            Create Study Plan
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!studyPlan.study_plan || studyPlan.study_plan.length === 0) {
    console.log("Study plan exists but has no data:", studyPlan);
    return (
      <Card>
        <CardHeader>
          <CardTitle>Study Planner</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-12">
          <div className="mb-4">
            <p className="text-muted-foreground text-lg">Your study plan appears to be empty. Please try regenerating it.</p>
          </div>
          <Button 
            onClick={() => navigate('/syllabus')}
            className="bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600"
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
      <Card className="border-primary/20 overflow-hidden shadow-xl rounded-xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-950">
        <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-950/40 dark:to-blue-950/40 border-b border-primary/10 pb-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-400 dark:to-blue-400">
                Personalized Study Plan
              </span>
              <p className="text-sm text-muted-foreground font-normal mt-1 flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-primary opacity-80" /> 
                Target Exam Date: <span className="font-medium">{studyPlan?.target_date}</span>
              </p>
            </div>
            <Button 
              onClick={handleStudyToday}
              className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white shadow-md"
            >
              <BookOpen className="mr-2 h-4 w-4" /> Study Today
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <Tabs defaultValue={`week-1`} className="w-full">
            <TabsList className="w-full mb-6 overflow-x-auto flex-nowrap grid grid-cols-3 sm:grid-cols-6 gap-1 bg-gray-100 dark:bg-gray-800/50 p-1 rounded-xl">
              {studyPlan.study_plan.map((week: any) => (
                <TabsTrigger key={week.week_number} value={`week-${week.week_number}`} className="text-sm px-3">
                  Week {week.week_number}
                </TabsTrigger>
              ))}
            </TabsList>
            
            <DragDropContext onDragEnd={onDragEnd}>
              {studyPlan?.study_plan.map((week: any) => (
                <TabsContent 
                  key={week.week_number} 
                  value={`week-${week.week_number}`} 
                  className="fade-in space-y-8"
                >
                  {week.days.map((day: any, dayIndex: number) => (
                    <Card 
                      key={dayIndex} 
                      className={`mb-4 overflow-hidden border rounded-xl shadow-md hover:shadow-lg transition-shadow ${
                        isToday(day.date) ? 'border-primary ring-1 ring-primary/30' : 'border-muted'
                      }`}
                    >
                      <CardHeader className={`py-3 px-4 border-b ${
                        isToday(day.date) 
                          ? 'bg-gradient-to-r from-indigo-100 to-blue-100 dark:from-indigo-900/40 dark:to-blue-900/40'
                          : 'bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900/40 dark:to-gray-800/40'
                      }`}>
                        <div className="flex items-center justify-between">
                          <div className="font-medium text-lg text-primary flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-primary opacity-80" />
                            {formatDate(day.date)}
                            {isToday(day.date) && (
                              <Badge variant="default" className="ml-2 bg-primary/90">Today</Badge>
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
                                                  className="bg-white dark:bg-gray-800 data-[state=checked]:bg-primary data-[state=checked]:text-white h-5 w-5"
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
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 mt-4">
                    {Object.entries(subjectColors)
                      .filter(([key]) => key !== "break")
                      .slice(0, 6)
                      .map(([subject, colors]) => (
                        <div 
                          key={subject} 
                          className={`px-3 py-2 rounded-md ${colors.bg} ${colors.dark.bg} border-l-4 ${colors.border} ${colors.dark.border} flex items-center justify-center ${colors.text} text-sm font-medium shadow-sm`}
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
