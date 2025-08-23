import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/components/ui/use-toast";
import { PlannerTask } from "@/types";
import { normalizeSubjectName, saveCustomTasks, loadCustomTasks, CustomTask } from "@/utils/studyPlannerStorage";
import useStudyPlanStore from "@/hooks/useStudyPlanStore";
import { BookOpen, Brain, Clock, Trash2, Play } from "lucide-react";
import { v4 as uuidv4 } from "uuid";

const StudyPage = () => {
  const navigate = useNavigate();
  const { todaysTasks, hasPlan, toggleTaskStatus, studyPlan, loading } = useStudyPlanStore();
  const [customTasks, setCustomTasks] = useState<CustomTask[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDuration, setNewTaskDuration] = useState(25);

  useEffect(() => {
    const saved = loadCustomTasks();
    setCustomTasks(saved);
  }, []);

  const toggleTaskCompletion = (index: number) => {
    if (!todaysTasks) return;
    toggleTaskStatus(0, 0, index);
    toast({ title: "Task status updated!" });
  };

  const addCustomTask = () => {
    if (!newTaskTitle.trim()) return;
    const newTask: CustomTask = {
      id: uuidv4(),
      title: newTaskTitle,
      duration: newTaskDuration,
      completed: false,
      createdAt: new Date().toISOString(),
    };
    const updated = [...customTasks, newTask];
    setCustomTasks(updated);
    saveCustomTasks(updated);
    setNewTaskTitle("");
    setNewTaskDuration(25);
    toast({ title: "Custom task added!" });
  };

  const toggleCustomTaskCompletion = (taskId: string) => {
    const updated = customTasks.map((task) =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    );
    setCustomTasks(updated);
    saveCustomTasks(updated);
  };

  const deleteCustomTask = (taskId: string) => {
    const updated = customTasks.filter((task) => task.id !== taskId);
    setCustomTasks(updated);
    saveCustomTasks(updated);
    toast({ title: "Custom task deleted!" });
  };

  const handleStartFocusMode = (task: PlannerTask | CustomTask) => {
    navigate("/study-mode", { state: { task } });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[70vh]">
        <div className="text-center text-lg font-medium text-gray-500">Loading tasks...</div>
      </div>
    );
  }

  if (!hasPlan || !todaysTasks || todaysTasks.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[70vh]">
        <Card className="max-w-md w-full p-6 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 shadow-xl rounded-2xl">
          <CardHeader>
            <CardTitle className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-500">
              No Study Schedule
            </CardTitle>
            <CardDescription>Plan your tasks to get started!</CardDescription>
          </CardHeader>
          <CardContent className="text-center py-6">
            <BookOpen className="mx-auto w-16 h-16 text-gray-400 mb-4" />
            <Button
              className="w-full bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600"
              onClick={() => navigate("/syllabus")}
            >
              Create Study Plan
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const completedCount = todaysTasks.filter((t) => t.status === "completed").length;

  return (
    <div className="p-6 space-y-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Big Heading with gradient and top spacing */}
      <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-500 mt-4">
        Today's Study Dashboard
      </h1>
      <div className="h-1 w-24 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full mb-6"></div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tasks Card */}
          <Card className="shadow-xl rounded-2xl">
            <CardHeader className="bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20 rounded-t-2xl">
              <CardTitle className="text-xl font-bold">Today's Tasks</CardTitle>
              <CardDescription>Complete these to stay on track</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              {todaysTasks.map((task, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between p-4 rounded-xl border-l-4 border-purple-500 bg-white dark:bg-gray-800`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-gradient-to-r from-purple-500 to-blue-500 text-white">
                        {task.task_type}
                      </Badge>
                      <span className="text-sm text-gray-500">{task.time} min</span>
                    </div>
                    <h3 className="font-semibold">{normalizeSubjectName(task.subject)}</h3>
                    <p className="text-gray-400">{task.chapter}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={task.status === "completed"}
                      onCheckedChange={() => toggleTaskCompletion(index)}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStartFocusMode(task)}
                    >
                      Start Focus
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Custom Tasks */}
          <Card className="shadow-xl rounded-2xl">
            <CardHeader className="bg-gradient-to-r from-green-100 to-teal-100 dark:from-green-900/20 dark:to-teal-900/20 rounded-t-2xl">
              <CardTitle className="text-xl font-bold">Custom Tasks</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              {customTasks.length === 0 ? (
                <div className="text-gray-400 text-center py-6">
                  No custom tasks yet. Add some to stay organized.
                </div>
              ) : (
                customTasks.map((task) => (
                  <div
                    key={task.id}
                    className={`flex items-center justify-between p-4 rounded-xl border-l-4 ${
                      task.completed ? "border-green-500 bg-green-50 dark:bg-green-900/20 opacity-70" : "border-teal-500 bg-gray-50 dark:bg-gray-800"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={task.completed}
                        onCheckedChange={() => toggleCustomTaskCompletion(task.id)}
                      />
                      <h3 className={`${task.completed ? "line-through" : ""} font-semibold text-gray-900 dark:text-gray-100`}>
                        {task.title}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500 flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {task.duration} min
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteCustomTask(task.id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
            <CardFooter>
                <div className="flex flex-col sm:flex-row gap-2 bg-gray-100 dark:bg-gray-800 p-3 rounded-xl">
                  <input
                    type="text"
                    placeholder="Task title"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl border focus:outline-none bg-white text-gray-900 dark:bg-gray-700 dark:text-gray-100 w-full sm:w-auto"
                  />
                  <input
                    type="number"
                    value={newTaskDuration}
                    onChange={(e) => setNewTaskDuration(Number(e.target.value))}
                    className="w-full sm:w-20 px-3 py-2 rounded-xl border focus:outline-none bg-white text-gray-900 dark:bg-gray-700 dark:text-gray-100"
                  />
                  <Button
                    className="w-full sm:w-auto bg-gradient-to-r from-green-500 to-teal-500 text-white"
                    onClick={addCustomTask}
                  >
                    Add
                  </Button>
                </div>
              </CardFooter>

          </Card>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Focus Mode + Tips */}
          <Card className="shadow-xl rounded-2xl">
            <CardHeader className="bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-t-2xl">
              <CardTitle className="text-xl font-bold">Next Focus Task</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              {todaysTasks[0] && (
                <div className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
                  <h3 className="font-semibold text-lg">{normalizeSubjectName(todaysTasks[0].subject)}</h3>
                  <p className="text-gray-400">{todaysTasks[0].chapter}</p>
                  <Button
                    className="w-full mt-2 bg-gradient-to-r from-purple-600 to-blue-500 text-white"
                    onClick={() => handleStartFocusMode(todaysTasks[0])}
                  >
                    <Play className="w-4 h-4 mr-2" /> Start Focus Mode
                  </Button>
                </div>
              )}
              {/* Study Tips */}
              <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl space-y-2">
                <h4 className="font-bold text-lg">Study Tips</h4>
                <ul className="list-disc pl-5 text-gray-600 dark:text-gray-300 space-y-1 text-sm">
                  <li>Focus on one topic at a time</li>
                  <li>Take notes with diagrams</li>
                  <li>Test yourself after each task</li>
                  <li>Create flashcards for formulas</li>
                  <li>Review tasks at the end of day</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StudyPage;
