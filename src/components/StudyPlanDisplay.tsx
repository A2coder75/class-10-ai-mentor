
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlannerTask, PlannerBreak } from "@/types";
import { BookOpen, Clock, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { mockStudyPlan } from "@/utils/studyPlannerData";
import { Checkbox } from "@/components/ui/checkbox";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

// Color palette for different subjects
const subjectColors: Record<string, { bg: string, border: string, text: string }> = {
  "Physics": { bg: "bg-blue-100", border: "border-blue-300", text: "text-blue-800" },
  "Mathematics": { bg: "bg-purple-100", border: "border-purple-300", text: "text-purple-800" },
  "Chemistry": { bg: "bg-green-100", border: "border-green-300", text: "text-green-800" },
  "Biology": { bg: "bg-rose-100", border: "border-rose-300", text: "text-rose-800" },
  "History": { bg: "bg-amber-100", border: "border-amber-300", text: "text-amber-800" },
  "Geography": { bg: "bg-emerald-100", border: "border-emerald-300", text: "text-emerald-800" },
  "English": { bg: "bg-sky-100", border: "border-sky-300", text: "text-sky-800" },
  "Computer Science": { bg: "bg-fuchsia-100", border: "border-fuchsia-300", text: "text-fuchsia-800" },
  "Economics": { bg: "bg-cyan-100", border: "border-cyan-300", text: "text-cyan-800" },
  "break": { bg: "bg-gray-100", border: "border-gray-300", text: "text-gray-500" },
};

// Default color for subjects not in the palette
const defaultColor = { bg: "bg-slate-100", border: "border-slate-300", text: "text-slate-800" };

const StudyPlanDisplay = () => {
  const [studyPlan, setStudyPlan] = useState(mockStudyPlan);
  const navigate = useNavigate();
  const [taskStatus, setTaskStatus] = useState<Record<string, boolean>>({});

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
    }
  };

  const toggleTaskStatus = (weekIndex: number, dayIndex: number, taskIndex: number) => {
    const taskId = `${weekIndex}-${dayIndex}-${taskIndex}`;
    setTaskStatus(prev => ({
      ...prev,
      [taskId]: !prev[taskId]
    }));
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

  const renderTask = (item: PlannerTask | PlannerBreak, isCompleted: boolean = false) => {
    if ('break' in item) {
      return (
        <div className="flex items-center justify-center p-2 bg-gray-100 rounded-md border border-gray-200">
          <Clock className="w-4 h-4 mr-2 text-gray-500" />
          <span className="text-sm text-gray-500">
            {item.break} minute break
          </span>
        </div>
      );
    }
    
    const colorScheme = getSubjectColor(item.subject);
    
    return (
      <div className={`p-2 rounded-md ${colorScheme.bg} ${colorScheme.border} border transition-all ${
        isCompleted ? "opacity-60" : ""
      }`}>
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <Badge variant={item.task_type === 'learning' ? "default" : "outline"} className="capitalize">
              {item.task_type}
            </Badge>
            <span className={`text-xs ${colorScheme.text}`}>{formatTime(item.estimated_time)}</span>
          </div>
          <div className={`font-medium ${colorScheme.text}`}>{item.subject}</div>
          <div className="text-sm text-muted-foreground line-clamp-1">{item.chapter}</div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div>
              <span className="text-lg">Study Plan Overview</span>
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
        <CardContent>
          <Tabs defaultValue="week-1" className="w-full">
            <TabsList className="w-full mb-4 overflow-x-auto flex-nowrap">
              {studyPlan.study_plan.map((week) => (
                <TabsTrigger key={week.week_number} value={`week-${week.week_number}`}>
                  Week {week.week_number}
                </TabsTrigger>
              ))}
            </TabsList>
            
            <DragDropContext onDragEnd={onDragEnd}>
              {studyPlan.study_plan.map((week) => (
                <TabsContent 
                  key={week.week_number} 
                  value={`week-${week.week_number}`} 
                  className="fade-in"
                >
                  <div className="overflow-x-auto">
                    <Table className="border border-separate rounded-md overflow-hidden">
                      <TableHeader className="bg-gradient-to-r from-purple-100 to-blue-100">
                        <TableRow>
                          <TableHead className="w-[120px] font-bold text-primary">Day</TableHead>
                          <TableHead className="font-bold text-primary">Schedule</TableHead>
                          <TableHead className="text-right w-[80px] font-bold text-primary">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {week.days.map((day, dayIndex) => (
                          <TableRow key={dayIndex} className={dayIndex % 2 === 0 ? "bg-gray-50/50" : ""}>
                            <TableCell className="font-medium border-r">
                              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 -m-4 p-4 h-full flex flex-col justify-center">
                                <div className="font-bold text-primary">
                                  {new Date(day.date).toLocaleDateString('en-US', {
                                    weekday: 'long',
                                  })}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {new Date(day.date).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric'
                                  })}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Droppable droppableId={`${week.week_number}-${dayIndex}`}>
                                {(provided) => (
                                  <div 
                                    className="space-y-3" 
                                    {...provided.droppableProps}
                                    ref={provided.innerRef}
                                  >
                                    {day.tasks.map((task, taskIndex) => (
                                      <Draggable 
                                        key={taskIndex} 
                                        draggableId={`${week.week_number}-${dayIndex}-${taskIndex}`} 
                                        index={taskIndex}
                                        // Only make regular tasks draggable, not breaks
                                        isDragDisabled={'break' in task}
                                      >
                                        {(provided) => (
                                          <div
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            {...provided.dragHandleProps}
                                            className={`cursor-move`}
                                          >
                                            {renderTask(task, taskStatus[`${week.week_number}-${dayIndex}-${taskIndex}`])}
                                          </div>
                                        )}
                                      </Draggable>
                                    ))}
                                    {provided.placeholder}
                                  </div>
                                )}
                              </Droppable>
                            </TableCell>
                            <TableCell className="text-right">
                              {day.tasks.filter(task => !('break' in task)).map((task, taskIndex) => (
                                !('break' in task) && (
                                  <div key={taskIndex} className="mb-4 last:mb-0 flex justify-end">
                                    <div className="relative">
                                      <Checkbox
                                        checked={!!taskStatus[`${week.week_number}-${dayIndex}-${taskIndex}`]}
                                        onCheckedChange={() => toggleTaskStatus(week.week_number, dayIndex, taskIndex)}
                                        className="bg-white"
                                      />
                                    </div>
                                  </div>
                                )
                              ))}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  
                  <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                    {Object.entries(subjectColors)
                      .filter(([key]) => key !== "break")
                      .map(([subject, colors]) => (
                        <div 
                          key={subject} 
                          className={`px-3 py-1.5 rounded-md text-sm ${colors.bg} ${colors.border} border flex items-center justify-center ${colors.text}`}
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
