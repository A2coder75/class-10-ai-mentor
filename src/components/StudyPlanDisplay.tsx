import React from "react";
import { useNavigate } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Calendar, Clock, ArrowRightCircle, Trash2 } from "lucide-react";
import useStudyPlanStore from "@/hooks/useStudyPlanStore";
import { normalizeSubjectName, formatDate } from "@/utils/studyPlannerStorage";

const subjectColors: Record<string, { bg: string; border: string; text: string; dark: { bg: string; border: string } }> = {
  Physics: { bg: "bg-blue-50", border: "border-blue-400", text: "text-blue-700", dark: { bg: "dark:bg-blue-900/30", border: "dark:border-blue-500" } },
  Mathematics: { bg: "bg-purple-50", border: "border-purple-400", text: "text-purple-700", dark: { bg: "dark:bg-purple-900/30", border: "dark:border-purple-500" } },
  Chemistry: { bg: "bg-emerald-50", border: "border-emerald-400", text: "text-emerald-700", dark: { bg: "dark:bg-emerald-900/30", border: "dark:border-emerald-500" } },
  Biology: { bg: "bg-orange-50", border: "border-orange-400", text: "text-orange-700", dark: { bg: "dark:bg-orange-900/30", border: "dark:border-orange-500" } },
  English: { bg: "bg-sky-50", border: "border-sky-400", text: "text-sky-700", dark: { bg: "dark:bg-sky-900/30", border: "dark:border-sky-500" } },
  "Computer Science": { bg: "bg-violet-50", border: "border-violet-400", text: "text-violet-700", dark: { bg: "dark:bg-violet-900/30", border: "dark:border-violet-500" } },
  Economics: { bg: "bg-cyan-50", border: "border-cyan-400", text: "text-cyan-700", dark: { bg: "dark:bg-cyan-900/30", border: "dark:border-cyan-500" } },
  break: { bg: "bg-gray-50", border: "border-gray-300", text: "text-gray-500", dark: { bg: "dark:bg-gray-800/50", border: "dark:border-gray-600" } },
};
const defaultColor = { bg: "bg-slate-50", border: "border-slate-400", text: "text-slate-700", dark: { bg: "dark:bg-slate-900/30", border: "dark:border-slate-500" } };

const StudyPlannerTimeline = () => {
  const { studyPlan, taskStatus, toggleTaskStatus, saveNewPlan, removeTask, loading } = useStudyPlanStore();
  const navigate = useNavigate();

  const getSubjectColor = (subject: string) => subjectColors[normalizeSubjectName(subject)] || defaultColor;

  const formatTime = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h ? h + "h " : ""}${m ? m + "m" : ""}`;
  };

  const isToday = (dateStr: string) => {
    const today = new Date();
    const d = new Date(dateStr);
    return today.toDateString() === d.toDateString();
  };

  const onDragEnd = (result: any) => {
    if (!result.destination || !studyPlan) return;
    const { source, destination } = result;
    const [srcWeek, srcDay] = source.droppableId.split("-").map(Number);
    const [dstWeek, dstDay] = destination.droppableId.split("-").map(Number);

    const newPlan = { ...studyPlan };
    const sourceTasks = [...newPlan.study_plan[srcWeek].days[srcDay].tasks];
    const destTasks = [...newPlan.study_plan[dstWeek].days[dstDay].tasks];
    const [moved] = sourceTasks.splice(source.index, 1);
    destTasks.splice(destination.index, 0, moved);

    newPlan.study_plan[srcWeek].days[srcDay].tasks = sourceTasks;
    newPlan.study_plan[dstWeek].days[dstDay].tasks = destTasks;
    saveNewPlan(newPlan);
  };

  if (loading) return <div>Loading planner...</div>;
  if (!studyPlan) return <div>No study plan found</div>;

  return (
    <div className="space-y-6">
      {/* Week Tabs */}
      <div className="flex gap-3 overflow-x-auto pb-2">
        {studyPlan.study_plan.map((week: any, wIndex: number) => (
          <button
            key={wIndex}
            className="px-5 py-2 min-w-[120px] bg-indigo-50 dark:bg-indigo-900/20 rounded-xl font-semibold text-center hover:bg-indigo-100 dark:hover:bg-indigo-800 transition"
          >
            Week {wIndex + 1}
          </button>
        ))}
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        {studyPlan.study_plan.map((week: any, wIndex: number) => (
          <div key={wIndex} className="grid grid-cols-7 gap-4 overflow-x-auto">
            {week.days.map((day: any, dIndex: number) => {
              const total = day.tasks.filter((t: any) => !("break" in t)).length;
              const completed = day.tasks.filter((t: any, i: number) => !("break" in t) && taskStatus[`${wIndex}-${dIndex}-${i}`]).length;
              const pct = total ? Math.round((completed / total) * 100) : 0;

              return (
                <Card
                  key={dIndex}
                  className={`flex flex-col gap-3 p-4 min-h-[300px] ${
                    isToday(day.date) ? "ring-2 ring-indigo-400" : ""
                  }`}
                >
                  {/* Day Header */}
                  <CardHeader className="flex flex-col gap-2 pb-2">
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-indigo-500" />
                      {formatDate(day.date, "long")}
                    </CardTitle>
                    <Progress value={pct} className="h-3 rounded-full" />
                  </CardHeader>

                  {/* Task List */}
                  <CardContent className="flex flex-col gap-3 overflow-y-auto max-h-[400px]">
                    <Droppable droppableId={`${wIndex}-${dIndex}`}>
                      {(provided) => (
                        <div ref={provided.innerRef} {...provided.droppableProps} className="flex flex-col gap-3">
                          {day.tasks.map((task: any, tIndex: number) => {
                            const taskId = `${wIndex}-${dIndex}-${tIndex}`;
                            const isComplete = taskStatus[taskId];

                            if ("break" in task) {
                              return (
                                <div
                                  key={taskId}
                                  className="flex items-center justify-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300 p-2 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700"
                                >
                                  <Clock className="w-4 h-4" />
                                  {task.break} min break
                                </div>
                              );
                            }

                            const color = getSubjectColor(task.subject);

                            return (
                              <Draggable key={taskId} draggableId={taskId} index={tIndex}>
                                {(prov) => (
                                  <div
                                    ref={prov.innerRef}
                                    {...prov.draggableProps}
                                    {...prov.dragHandleProps}
                                    className={`flex flex-col gap-2 p-3 rounded-lg border-l-4 ${color.border} bg-white dark:bg-slate-900 shadow hover:shadow-md transition ${
                                      isComplete ? "opacity-60 line-through" : ""
                                    }`}
                                  >
                                    {/* Task Info */}
                                    <div className="flex justify-between items-start gap-2">
                                      <div className="flex flex-col gap-1">
                                        <span className={`font-bold ${color.text}`}>{normalizeSubjectName(task.subject)}</span>
                                        <span className="text-sm text-muted-foreground">{task.chapter}</span>
                                      </div>
                                      <Badge variant="outline" className="text-xs mt-1">
                                        {task.task_type}
                                      </Badge>
                                    </div>

                                    {/* Time & Actions */}
                                    <div className="flex justify-between items-center text-xs text-muted-foreground mt-1">
                                      <span className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" /> {formatTime(task.estimated_time)}
                                      </span>
                                      <div className="flex gap-1">
                                        {isToday(day.date) && !isComplete && (
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => navigate("/study")}
                                            className="p-1"
                                          >
                                            <ArrowRightCircle className="w-5 h-5 text-indigo-500" />
                                          </Button>
                                        )}
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          onClick={() => removeTask(wIndex, dIndex, tIndex)}
                                          className="p-1 text-red-500 hover:text-red-600"
                                        >
                                          <Trash2 className="w-5 h-5" />
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </Draggable>
                            );
                          })}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ))}
      </DragDropContext>
    </div>
  );
};

export default StudyPlannerTimeline;
