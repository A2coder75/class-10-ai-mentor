
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlannerTask, PlannerBreak } from "@/types";
import { BookOpen, CheckCircle, Clock, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { mockStudyPlan } from "@/utils/studyPlannerData";
import { Checkbox } from "@/components/ui/checkbox";

const StudyPlanDisplay = () => {
  const [studyPlan] = useState(mockStudyPlan);
  const navigate = useNavigate();

  const [taskStatus, setTaskStatus] = useState<Record<string, boolean>>({});

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

  const renderTask = (item: PlannerTask | PlannerBreak) => {
    if ('break' in item) {
      return (
        <div className="flex items-center justify-center p-2 bg-accent/50 rounded-md">
          <Clock className="w-4 h-4 mr-2 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            {item.break} minute break
          </span>
        </div>
      );
    }
    
    return (
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <Badge variant={item.task_type === 'learning' ? "default" : "outline"} className="capitalize">
            {item.task_type}
          </Badge>
          <span className="text-xs text-muted-foreground">{item.estimated_time} min</span>
        </div>
        <div className="font-medium">{item.subject}</div>
        <div className="text-sm text-muted-foreground">{item.chapter}</div>
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
            
            {studyPlan.study_plan.map((week) => (
              <TabsContent 
                key={week.week_number} 
                value={`week-${week.week_number}`} 
                className="fade-in"
              >
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[100px]">Date</TableHead>
                        <TableHead>Tasks</TableHead>
                        <TableHead className="text-right w-[100px]">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {week.days.map((day, dayIndex) => (
                        <TableRow key={dayIndex}>
                          <TableCell className="font-medium">
                            {new Date(day.date).toLocaleDateString('en-US', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </TableCell>
                          <TableCell>
                            <div className="space-y-3">
                              {day.tasks.map((task, taskIndex) => (
                                <div 
                                  key={taskIndex} 
                                  className={`p-3 rounded-lg ${
                                    'break' in task 
                                      ? 'bg-accent/30' 
                                      : taskStatus[`${week.week_number}-${dayIndex}-${taskIndex}`] 
                                        ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900/30' 
                                        : 'bg-card border'
                                  }`}
                                >
                                  {renderTask(task)}
                                </div>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            {day.tasks.filter(task => !('break' in task)).map((task, taskIndex) => (
                              !('break' in task) && (
                                <div key={taskIndex} className="mb-3 last:mb-0 flex justify-end">
                                  <Checkbox
                                    checked={!!taskStatus[`${week.week_number}-${dayIndex}-${taskIndex}`]}
                                    onCheckedChange={() => toggleTaskStatus(week.week_number, dayIndex, taskIndex)}
                                  />
                                </div>
                              )
                            ))}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudyPlanDisplay;
