import React, { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { PlannerTask } from "@/types";
import { ArrowLeft, Brain, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";
import { CustomTask, saveCustomTasks, loadCustomTasks, normalizeSubjectName } from "@/utils/studyPlannerStorage";
import useStudyPlanStore from "@/hooks/useStudyPlanStore";

const StudyPage = () => {
  const navigate = useNavigate();
  const { studyPlan, todaysTasks, loading, hasPlan, toggleTaskStatus } = useStudyPlanStore();
  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>({});
  const [customTasks, setCustomTasks] = useState<CustomTask[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDuration, setNewTaskDuration] = useState(25);

  useEffect(() => {
    const savedCustomTasks = loadCustomTasks();
    setCustomTasks(savedCustomTasks);

    if (todaysTasks?.length) {
      const currentCompletionStatus: Record<string, boolean> = {};
      todaysTasks.forEach((task, index) => currentCompletionStatus[index] = task.status === "completed");
      setCompletedTasks(currentCompletionStatus);
    }
  }, [todaysTasks]);

  const completedCount = todaysTasks?.filter(t => t.status === "completed").length || 0;
  const progressPercentage = todaysTasks?.length ? (completedCount / todaysTasks.length) * 100 : 0;
  const allTasksCompleted = todaysTasks?.length && completedCount === todaysTasks.length;

  const getSubjectColor = (subject: string) => {
    const colorMap: Record<string, string> = {
      "Physics": "bg-blue-100 border-blue-300 text-blue-800 dark:bg-blue-900/30 dark:border-blue-700 dark:text-blue-300",
      "Math": "bg-purple-100 border-purple-300 text-purple-800 dark:bg-purple-900/30 dark:border-purple-700 dark:text-purple-300",
      "Mathematics": "bg-purple-100 border-purple-300 text-purple-800 dark:bg-purple-900/30 dark:border-purple-700 dark:text-purple-300",
      "Chemistry": "bg-green-100 border-green-300 text-green-800 dark:bg-green-900/30 dark:border-green-700 dark:text-green-300",
    };
    return colorMap[normalizeSubjectName(subject)] || "bg-slate-100 border-slate-300 text-slate-800 dark:bg-slate-800/30 dark:border-slate-700 dark:text-slate-300";
  };

  const renderTaskTypeBadge = (taskType: string) => {
    switch (taskType.toLowerCase()) {
      case "learning": return <Badge className="mr-2 bg-primary hover:bg-primary/90">{taskType}</Badge>;
      case "revision": return <Badge variant="outline" className="mr-2 border-amber-500 text-amber-600 dark:text-amber-400">{taskType}</Badge>;
      case "practice": return <Badge variant="outline" className="mr-2 border-green-500 text-green-600 dark:text-green-400">{taskType}</Badge>;
      default: return <Badge variant="outline" className="mr-2">{taskType}</Badge>;
    }
  };

  const toggleTaskCompletion = (taskIndex: number) => {
    if (!todaysTasks || !studyPlan) return;
    const task = todaysTasks[taskIndex];

    if (studyPlan.study_plan) {
      for (let weekIndex = 0; weekIndex < studyPlan.study_plan.length; weekIndex++) {
        const week = studyPlan.study_plan[weekIndex];
        if (!week.days) continue;

        for (let dayIndex = 0; dayIndex < week.days.length; dayIndex++) {
          const day = week.days[dayIndex];
          if (!day.tasks) continue;

          for (let tIndex = 0; tIndex < day.tasks.length; tIndex++) {
            const currentTask = day.tasks[tIndex];
            if ('break' in currentTask) continue;

            if (normalizeSubjectName(currentTask.subject) === normalizeSubjectName(task.subject) &&
                currentTask.chapter === task.chapter &&
                currentTask.task_type === task.task_type) {
              toggleTaskStatus(weekIndex, dayIndex, tIndex);

              setCompletedTasks(prev => ({ ...prev, [taskIndex]: !prev[taskIndex] }));
              if (!completedTasks[taskIndex]) {
                toast({ title: "Task completed! 🎉", description: `Great job on completing "${task.chapter}"!` });
              }
              return;
            }
          }
        }
      }
    }
  };

  const addCustomTask = () => {
    if (!newTaskTitle.trim()) return;
    const newTask: CustomTask = { id: uuidv4(), title: newTaskTitle, duration: newTaskDuration, completed: false, createdAt: new Date().toISOString() };
    const updatedTasks = [...customTasks, newTask];
    setCustomTasks(updatedTasks);
    saveCustomTasks(updatedTasks);
    setNewTaskTitle('');
    setNewTaskDuration(25);
    toast({ title: "Task added", description: "Your custom task has been added." });
  };

  const toggleCustomTaskCompletion = (taskId: string) => {
    const updatedTasks = customTasks.map(task => task.id === taskId ? { ...task, completed: !task.completed } : task);
    setCustomTasks(updatedTasks);
    saveCustomTasks(updatedTasks);
  };

  const deleteCustomTask = (taskId: string) => {
    const updatedTasks = customTasks.filter(task => task.id !== taskId);
    setCustomTasks(updatedTasks);
    saveCustomTasks(updatedTasks);
    toast({ title: "Task deleted", description: "The task has been removed." });
  };

  const handleStartFocus = (task: PlannerTask) => {
    navigate("/study-mode", { state: { task } });
  };

  if (loading) return <div className="flex justify-center items-center min-h-[60vh]">Loading...</div>;
  if (!hasPlan || !todaysTasks?.length) return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <Card className="max-w-md w-full text-center">
        <CardHeader><CardTitle>No Study Schedule</CardTitle></CardHeader>
        <CardContent>Create a study plan to get started.</CardContent>
        <CardFooter><Button onClick={() => navigate("/syllabus")}>Create Study Plan</Button></CardFooter>
      </Card>
    </div>
  );

  return (
    <div className="page-container pb-20">
      <Button variant="ghost" className="mb-4" onClick={() => navigate("/syllabus")}>
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Syllabus
      </Button>

      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2 gradient-text">Today's Study Session</h1>
        <div className="flex items-center justify-between mb-2">
          <p className="text-muted-foreground">Complete your planned tasks for today</p>
          <Badge variant="outline">{completedCount} of {todaysTasks.length} completed</Badge>
        </div>
        <Progress value={progressPercentage} className="h-2 rounded-full" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20">
            <CardTitle>Study Tasks</CardTitle>
            <CardDescription>Planned and custom tasks</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <Tabs defaultValue="planned">
              <TabsList>
                <TabsTrigger value="planned">Planned Tasks</TabsTrigger>
                <TabsTrigger value="custom">Custom Tasks</TabsTrigger>
              </TabsList>

              <TabsContent value="planned">
                <div className="space-y-4 mt-4">
                  {todaysTasks.map((task, idx) => (
                    <div key={idx} className={`p-4 border-l-4 rounded-md flex justify-between items-center ${getSubjectColor(task.subject)} ${task.status==="completed"?"opacity-60":""}`}>
                      <div>
                        <div className="flex items-center gap-2">{renderTaskTypeBadge(task.task_type)}<span className="text-sm text-muted-foreground">{task.estimated_time} mins</span></div>
                        <div className="font-medium text-lg">{normalizeSubjectName(task.subject)}</div>
                        <div className="text-muted-foreground">{task.chapter}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox checked={task.status==="completed"} onCheckedChange={()=>toggleTaskCompletion(idx)} />
                        <Button variant="outline" size="sm" onClick={()=>handleStartFocus(task)}>Start Focus Mode</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="custom">
                <div className="space-y-4 mt-4">
                  {customTasks.length===0 ? <p className="text-center text-muted-foreground">No custom tasks. Add one!</p> : customTasks.map(task => (
                    <div key={task.id} className={`p-4 border-l-4 rounded-md flex justify-between items-center ${task.completed ? "opacity-60 border-green-400" : "border-indigo-400"}`}>
                      <div className="flex items-center gap-2">
                        <Checkbox checked={task.completed} onCheckedChange={()=>toggleCustomTaskCompletion(task.id)} />
                        <span className={`${task.completed?"line-through":""} font-medium`}>{task.title} ({task.duration} mins)</span>
                      </div>
                      <Button variant="ghost" size="icon" onClick={()=>deleteCustomTask(task.id)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="w-full">Add Custom Task</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add a Custom Task</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <Input placeholder="Task Title" value={newTaskTitle} onChange={(e)=>setNewTaskTitle(e.target.value)} />
                  <Input type="number" placeholder="Duration (mins)" value={newTaskDuration} onChange={(e)=>setNewTaskDuration(parseInt(e.target.value)||25)} min={5} max={180} />
                  <Button onClick={addCustomTask} className="w-full">Add Task</Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardFooter>
        </Card>

        {allTasksCompleted && (
          <Card>
            <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
              <CardTitle>AI Test</CardTitle>
              <CardDescription>Generate a personalized test for today's topics</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600" onClick={()=>navigate('/test')}>
                <Brain className="mr-2 h-4 w-4" /> Generate AI Test
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default StudyPage;
