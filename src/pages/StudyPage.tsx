import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Brain } from "lucide-react";
import { useNavigate } from "react-router-dom";
import useStudyPlanStore from "@/hooks/useStudyPlanStore";
import { normalizeSubjectName } from "@/utils/studyPlannerStorage";

const StudyPage = () => {
  const navigate = useNavigate();
  const { todaysTasks, loading, hasPlan } = useStudyPlanStore();

  const incompleteTasks = todaysTasks?.filter(task => task.status !== "completed") || [];
  const nextTask = incompleteTasks[0] || null;
  const completedCount = todaysTasks?.filter(task => task.status === "completed").length || 0;
  const progressPercentage = todaysTasks?.length ? (completedCount / todaysTasks.length) * 100 : 0;

  const getSubjectColor = (subject: string) => {
    const colorMap: Record<string, string> = {
      Physics: "border-blue-400",
      Math: "border-purple-400",
      Chemistry: "border-green-400",
    };
    return colorMap[normalizeSubjectName(subject)] || "border-slate-400";
  };

  const startFocusMode = (task: any) => {
    if (!task) return;
    navigate("/study-mode", { state: { task } });
  };

  if (loading) return <div className="flex justify-center items-center min-h-[70vh]"><BookOpen className="w-16 h-16 animate-spin text-blue-500" /></div>;

  if (!hasPlan || !todaysTasks?.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-4 bg-gray-50 dark:bg-gray-900 p-6 rounded-lg shadow-md">
        <BookOpen className="w-20 h-20 text-muted-foreground" />
        <p>No study tasks for today.</p>
        <Button onClick={() => navigate("/syllabus")} className="bg-gradient-to-r from-purple-600 to-blue-500">
          Create Study Plan
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen p-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Panel */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Tasks */}
          <Card className="p-6 bg-white dark:bg-gray-800 shadow-lg rounded-xl hover:shadow-2xl transition-all">
            <CardHeader>
              <CardTitle className="text-xl font-bold">Today's Tasks</CardTitle>
              <CardDescription>Complete these tasks to stay on track</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 mt-4">
              {todaysTasks.map((task, index) => (
                <div
                  key={index}
                  className={`p-4 border-l-4 rounded-lg bg-gray-50 dark:bg-gray-900 transition-shadow hover:shadow-md ${getSubjectColor(task.subject)} ${
                    task.status === "completed" ? "opacity-60" : ""
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold text-lg">{normalizeSubjectName(task.subject)}</h3>
                      <p className="text-muted-foreground">{task.chapter}</p>
                      <Badge className="mt-1">{task.task_type}</Badge>
                    </div>
                    <Checkbox checked={task.status === "completed"} />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Study Resources */}
          <Card className="p-6 bg-white dark:bg-gray-800 shadow-lg rounded-xl hover:shadow-2xl transition-all">
            <CardHeader>
              <CardTitle className="text-xl font-bold">Study Resources</CardTitle>
              <CardDescription>Materials to help you with today's topics</CardDescription>
            </CardHeader>
            <CardContent className="mt-4">
              <Tabs defaultValue={normalizeSubjectName(todaysTasks[0]?.subject) || "Physics"}>
                <TabsList className="mb-4">
                  {Array.from(new Set(todaysTasks.map(task => normalizeSubjectName(task.subject)))).map(subject => (
                    <TabsTrigger key={subject} value={subject}>{subject}</TabsTrigger>
                  ))}
                </TabsList>
                {Array.from(new Set(todaysTasks.map(task => normalizeSubjectName(task.subject)))).map(subject => (
                  <TabsContent key={subject} value={subject} className="text-center py-8 text-muted-foreground">
                    <BookOpen className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="font-medium">Resources for {subject}</p>
                    <p className="text-sm">Practice problems and reading materials coming soon</p>
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Right Panel */}
        <div className="space-y-6">
          {/* Next Task + Start Focus */}
          {nextTask && (
            <Card className="p-6 bg-white dark:bg-gray-800 shadow-lg rounded-xl hover:shadow-2xl transition-all">
              <CardHeader>
                <CardTitle className="text-xl font-bold">Next Task</CardTitle>
              </CardHeader>
              <CardContent className="mt-2 space-y-4">
                <div className={`p-3 rounded-md border-l-4 bg-gray-50 dark:bg-gray-900 ${getSubjectColor(nextTask.subject)}`}>
                  <h3 className="font-semibold">{normalizeSubjectName(nextTask.subject)}</h3>
                  <p className="text-muted-foreground">{nextTask.chapter}</p>
                  <Badge>{nextTask.task_type}</Badge>
                </div>
                <Button
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 transition-all"
                  onClick={() => startFocusMode(nextTask)}
                >
                  <Brain className="mr-2 h-4 w-4" /> Start Focus Mode
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Study Tips */}
          <Card className="p-6 bg-white dark:bg-gray-800 shadow-lg rounded-xl hover:shadow-2xl transition-all">
            <CardHeader>
              <CardTitle className="text-xl font-bold">Study Tips</CardTitle>
            </CardHeader>
            <CardContent className="mt-2 text-sm text-muted-foreground space-y-1">
              <ul className="list-disc pl-5">
                <li>Focus on one concept at a time</li>
                <li>Take notes with diagrams & key points</li>
                <li>Solve problems without looking at answers</li>
                <li>Review after completing each task</li>
                <li>Create flashcards for formulas & definitions</li>
              </ul>
            </CardContent>
          </Card>

          {/* Mini Progress */}
          <Card className="p-6 bg-white dark:bg-gray-800 shadow-lg rounded-xl hover:shadow-2xl transition-all">
            <CardHeader>
              <CardTitle className="text-xl font-bold">Progress</CardTitle>
            </CardHeader>
            <CardContent className="mt-2 text-center">
              <Progress value={progressPercentage} className="h-3 rounded-full" />
              <p className="text-sm mt-2">{completedCount} of {todaysTasks.length} tasks completed</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StudyPage;
