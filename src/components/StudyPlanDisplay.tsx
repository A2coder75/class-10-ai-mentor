
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlannerTask, PlannerBreak } from "@/types";
import { BookOpen, Clock, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Checkbox } from "@/components/ui/checkbox";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { toast } from "@/components/ui/use-toast";

// Color palette for different subjects - using stronger, more vibrant colors
const subjectColors: Record<string, { bg: string, border: string, text: string, dark: { bg: string, border: string } }> = {
  "Physics": { 
    bg: "bg-blue-500/20", 
    border: "border-blue-500", 
    text: "text-blue-900",
    dark: { bg: "dark:bg-blue-900/30", border: "dark:border-blue-700" }
  },
  "Math": { 
    bg: "bg-purple-500/20", 
    border: "border-purple-500", 
    text: "text-purple-900",
    dark: { bg: "dark:bg-purple-900/30", border: "dark:border-purple-700" }
  },
  "Mathematics": { 
    bg: "bg-purple-500/20", 
    border: "border-purple-500", 
    text: "text-purple-900",
    dark: { bg: "dark:bg-purple-900/30", border: "dark:border-purple-700" }
  },
  "Chemistry": { 
    bg: "bg-green-500/20", 
    border: "border-green-500", 
    text: "text-green-900",
    dark: { bg: "dark:bg-green-900/30", border: "dark:border-green-700" }
  },
  "Biology": { 
    bg: "bg-rose-500/20", 
    border: "border-rose-500", 
    text: "text-rose-900",
    dark: { bg: "dark:bg-rose-900/30", border: "dark:border-rose-700" }
  },
  "History": { 
    bg: "bg-amber-500/20", 
    border: "border-amber-500", 
    text: "text-amber-900",
    dark: { bg: "dark:bg-amber-900/30", border: "dark:border-amber-700" }
  },
  "Geography": { 
    bg: "bg-emerald-500/20", 
    border: "border-emerald-500", 
    text: "text-emerald-900",
    dark: { bg: "dark:bg-emerald-900/30", border: "dark:border-emerald-700" }
  },
  "English": { 
    bg: "bg-sky-500/20", 
    border: "border-sky-500", 
    text: "text-sky-900",
    dark: { bg: "dark:bg-sky-900/30", border: "dark:border-sky-700" }
  },
  "Computer Science": { 
    bg: "bg-fuchsia-500/20", 
    border: "border-fuchsia-500", 
    text: "text-fuchsia-900",
    dark: { bg: "dark:bg-fuchsia-900/30", border: "dark:border-fuchsia-700" }
  },
  "Economics": { 
    bg: "bg-cyan-500/20", 
    border: "border-cyan-500", 
    text: "text-cyan-900",
    dark: { bg: "dark:bg-cyan-900/30", border: "dark:border-cyan-700" }
  },
  "break": { 
    bg: "bg-gray-200", 
    border: "border-gray-300", 
    text: "text-gray-600",
    dark: { bg: "dark:bg-gray-800/50", border: "dark:border-gray-700" }
  }
};

// Type for the planner response structure
interface PlannerResponse {
  model: string;
  planner: string;
  tokens_used: number;
}

// Default color for subjects not in the palette
const defaultColor = { 
  bg: "bg-slate-500/20", 
  border: "border-slate-500", 
  text: "text-slate-800",
  dark: { bg: "dark:bg-slate-800/30", border: "dark:border-slate-700" }
};

const StudyPlanDisplay = ({ plannerResponse }: { plannerResponse?: PlannerResponse }) => {
  const [studyPlan, setStudyPlan] = useState<any | null>(null);
  const navigate = useNavigate();
  const [taskStatus, setTaskStatus] = useState<Record<string, boolean>>({});

  // Parse the planner string into a JSON object when the component mounts or when plannerResponse changes
  React.useEffect(() => {
    if (plannerResponse && plannerResponse.planner) {
      try {
        // Extract the JSON part from the planner string
        const jsonMatch = plannerResponse.planner.match(/```\n([\s\S]*?)\n```/);
        if (jsonMatch && jsonMatch[1]) {
          const parsedPlan = JSON.parse(jsonMatch[1]);
          setStudyPlan(parsedPlan);
        } else {
          console.error("Could not extract JSON from planner response");
        }
      } catch (error) {
        console.error("Error parsing planner response", error);
      }
    }
  }, [plannerResponse]);

  // Handle drag end event
  const onDragEnd = (result: any) => {
    if (!result.destination) return;
    
    const { source, destination } = result;
    
    // Extract identifiers from draggableId
    const [weekIndex, dayIndex] = result.draggableId.split('-').map(Number);
    
    if (source.droppableId === destination.droppableId) {
      // Same day reordering
      const dayId = source.droppableId;
      const [weekIdx, dayIdx] = dayId.split('-').map(Number);
      
      const newTasks = [...studyPlan.study_plan[weekIdx].days[dayIdx].tasks];
      const [movedTask] = newTasks.splice(source.index, 1);
      newTasks.splice(destination.index, 0, movedTask);
      
      const newStudyPlan = {...studyPlan};
      newStudyPlan.study_plan[weekIdx].days[dayIdx].tasks = newTasks;
      setStudyPlan(newStudyPlan);

      toast({
        title: "Task rearranged",
        description: "Your study schedule has been updated",
      });
    } else {
      // Moving between days
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

      toast({
        title: "Task moved",
        description: "Task moved to a different day",
      });
    }
  };

  const toggleTaskStatus = (weekIndex: number, dayIndex: number, taskIndex: number) => {
    const taskId = `${weekIndex}-${dayIndex}-${taskIndex}`;
    setTaskStatus(prev => ({
      ...prev,
      [taskId]: !prev[taskId]
    }));

    toast({
      title: !taskStatus[taskId] ? "Task completed!" : "Task marked as incomplete",
      description: !taskStatus[taskId] ? "Great job keeping up with your study schedule!" : "Task has been reset.",
    });
  };

  const handleStudyToday = () => {
    navigate('/study');
  };

  const getSubjectColor = (subject: string) => {
    return subjectColors[subject] || defaultColor;
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
        return <Badge className="bg-primary hover:bg-primary/90">{taskType}</Badge>;
      case 'revision':
        return <Badge variant="outline" className="border-amber-500 text-amber-600 dark:text-amber-400">{taskType}</Badge>;
      case 'practice':
        return <Badge variant="outline" className="border-green-500 text-green-600 dark:text-green-400">{taskType}</Badge>;
      default:
        return <Badge variant="secondary">{taskType}</Badge>;
    }
  };

  if (!studyPlan) {
    return (
      <Card>
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

  return (
    <div className="space-y-6">
      <Card className="border-primary/20 overflow-hidden shadow-md">
        <CardHeader className="bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20 border-b border-primary/10">
          <CardTitle className="flex items-center justify-between">
            <div>
              <span className="text-lg font-bold">Study Plan</span>
              <p className="text-sm text-muted-foreground font-normal mt-1">
                Target Exam Date: {studyPlan.target_date}
              </p>
            </div>
            <Button 
              onClick={handleStudyToday}
              className="bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600"
            >
              <BookOpen className="mr-2 h-4 w-4" /> Study Today
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <Tabs defaultValue={`week-1`} className="w-full">
            <TabsList className="w-full mb-6 overflow-x-auto flex-nowrap grid grid-cols-3 sm:grid-cols-6 gap-1">
              {studyPlan.study_plan.map((week: any) => (
                <TabsTrigger key={week.week_number} value={`week-${week.week_number}`} className="text-sm px-3">
                  Week {week.week_number}
                </TabsTrigger>
              ))}
            </TabsList>
            
            <DragDropContext onDragEnd={onDragEnd}>
              {studyPlan.study_plan.map((week: any) => (
                <TabsContent 
                  key={week.week_number} 
                  value={`week-${week.week_number}`} 
                  className="fade-in space-y-8"
                >
                  {week.days.map((day: any, dayIndex: number) => (
                    <Card key={dayIndex} className="mb-4 overflow-hidden border border-muted rounded-xl shadow-sm">
                      <CardHeader className="bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 py-3 px-4 border-b">
                        <div className="font-medium text-lg text-primary">
                          {formatDate(day.date)}
                        </div>
                      </CardHeader>
                      <CardContent className="p-0">
                        <Table>
                          <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
                            <TableRow>
                              <TableHead className="font-medium pl-4" style={{ width: "35%" }}>Subject & Chapter</TableHead>
                              <TableHead className="font-medium" style={{ width: "15%" }}>Type</TableHead>
                              <TableHead className="font-medium" style={{ width: "15%" }}>Duration</TableHead>
                              <TableHead className="font-medium text-right pr-4" style={{ width: "20%" }}>Status</TableHead>
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
                                    const isComplete = !!taskStatus[taskId];
                                    
                                    if ('break' in task) {
                                      return (
                                        <TableRow key={`break-${taskIndex}`} className="bg-gray-50 dark:bg-gray-900/20 h-12">
                                          <TableCell colSpan={4} className="text-center text-sm text-gray-500">
                                            <div className="flex items-center justify-center">
                                              <Clock className="w-4 h-4 mr-2 text-gray-400" />
                                              <span>{task.break} minute break</span>
                                            </div>
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
                                              <div>
                                                <div className="font-bold">{task.subject}</div>
                                                <div className="text-sm text-muted-foreground">{task.chapter}</div>
                                              </div>
                                            </TableCell>
                                            <TableCell>
                                              {renderTaskBadge(task.task_type)}
                                            </TableCell>
                                            <TableCell>
                                              {formatTime(task.estimated_time)}
                                            </TableCell>
                                            <TableCell className="text-right">
                                              <div className="flex items-center justify-end">
                                                <Checkbox
                                                  checked={isComplete}
                                                  onCheckedChange={() => toggleTaskStatus(week.week_number, dayIndex, taskIndex)}
                                                  className="bg-white"
                                                />
                                              </div>
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
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-4">
                    {Object.entries(subjectColors)
                      .filter(([key]) => key !== "break")
                      .slice(0, 6)
                      .map(([subject, colors]) => (
                        <div 
                          key={subject} 
                          className={`px-3 py-2 rounded-md ${colors.bg} ${colors.dark.bg} border-l-4 ${colors.border} ${colors.dark.border} flex items-center justify-center ${colors.text}`}
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
