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
    return `${h ? h + "h " : ""}${m ? m + "m" : ""}` || "0m";
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

  // --- FIX: robust local delete that always works (and stops event from becoming a drag) ---
  const handleDelete = (e: React.MouseEvent, wIndex: number, dIndex: number, tIndex: number) => {
    e.stopPropagation();
    if (!studyPlan) return;

    const newPlan = { ...studyPlan };
    const dayTasks = [...newPlan.study_plan[wIndex].days[dIndex].tasks];
    if (tIndex < 0 || tIndex >= dayTasks.length) return;

    dayTasks.splice(tIndex, 1);
    newPlan.study_plan[wIndex].days[dIndex].tasks = dayTasks;

    // Optional tidy-up: remove trailing/leading breaks or double breaks
    const cleaned = newPlan.study_plan[wIndex].days[dIndex].tasks.filter((t: any, i: number, arr: any[]) => {
      if ("break" in t) {
        // drop break at start or end
        if (i === 0 || i === arr.length - 1) return false;
        // drop consecutive breaks
        if (i > 0 && "break" in arr[i - 1]) return false;
      }
      return true;
    });
    newPlan.study_plan[wIndex].days[dIndex].tasks = cleaned;

    saveNewPlan(newPlan);

    // If you prefer to call store removeTask and it expects indices, you can do:
    // removeTask(wIndex, dIndex, tIndex);
  };

  if (loading) return <div className="text-center text-sm text-muted-foreground">Loading planner...</div>;
  if (!studyPlan) return <div className="text-center text-sm text-muted-foreground">No study plan found</div>;

  return (
    <div className="space-y-6 w-full">
      <DragDropContext onDragEnd={onDragEnd}>
        {studyPlan.study_plan.map((week: any, wIndex: number) => (
          <div key={wIndex} className="flex flex-col w-full">
            {/* Week Label (unchanged layout, enhanced style) */}
            <h2 className="text-lg font-semibold mb-2 tracking-tight">
              <span className="bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-rose-500 bg-clip-text text-transparent drop-shadow-sm">
                Week {wIndex + 1}
              </span>
            </h2>

            {/* Days Row (layout preserved) */}
            <div className="flex gap-4 overflow-x-auto pb-2">
              {week.days.map((day: any, dIndex: number) => {
                const total = day.tasks.filter((t: any) => !("break" in t)).length;
                const completed = day.tasks.filter(
                  (t: any, i: number) => !("break" in t) && taskStatus[`${wIndex}-${dIndex}-${i}`]
                ).length;
                const pct = total ? Math.round((completed / total) * 100) : 0;

                const today = isToday(day.date);

                return (
                  <Card
                    key={dIndex}
                    className={[
                      "flex-1 flex flex-col gap-2 p-3 min-w-[250px] max-w-[300px] relative overflow-hidden",
                      "bg-gradient-to-b from-white/90 via-white to-white/90 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900",
                      "border border-slate-200/70 dark:border-slate-800/80",
                      "transition-transform duration-200 ease-out hover:-translate-y-0.5 hover:shadow-xl",
                      today ? "ring-2 ring-indigo-400/70 shadow-[0_0_40px_-10px_rgba(99,102,241,0.55)]" : "shadow-sm",
                      // subtle inner gradient glow layer
                      "before:absolute before:inset-[-1px] before:rounded-[inherit] before:bg-gradient-to-br before:from-slate-100/60 before:via-transparent before:to-transparent before:pointer-events-none",
                    ].join(" ")}
                  >
                    {/* Top accent bar (gradient) */}
                    <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500 via-cyan-500 to-emerald-500 opacity-70" />

                    {/* Day Header (layout preserved) */}
                    <CardHeader className="flex flex-col gap-1 pb-1">
                      <CardTitle className="text-sm font-semibold flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-indigo-500 drop-shadow-sm" />
                        <span className="">{formatDate(day.date, "long")}</span>
                      </CardTitle>

                      {/* Progress with a gradient track overlay (no layout change) */}
                      <div className="relative">
                        <Progress value={pct} className="h-2 rounded-full bg-slate-200 dark:bg-slate-800" />
                        <div
                          className="pointer-events-none absolute inset-0 rounded-full"
                          style={{
                            maskImage: "linear-gradient(to right, black, black)",
                            WebkitMaskImage: "linear-gradient(to right, black, black)",
                            background:
                              "linear-gradient(90deg, rgba(99,102,241,0.25), rgba(6,182,212,0.18), rgba(16,185,129,0.25))",
                          }}
                        />
                      </div>
                    </CardHeader>

                    {/* Task List (layout preserved) */}
                    <CardContent className="flex flex-col gap-2 overflow-y-auto flex-1">
                      <Droppable droppableId={`${wIndex}-${dIndex}`}>
                        {(provided) => (
                          <div ref={provided.innerRef} {...provided.droppableProps} className="flex flex-col gap-2 flex-1">
                            {day.tasks.map((task: any, tIndex: number) => {
                              const taskId = `${wIndex}-${dIndex}-${tIndex}`;
                              const isComplete = taskStatus[taskId];

                              if ("break" in task) {
                                return (
                                  <div
                                    key={taskId}
                                    className="flex items-center justify-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300 p-2 rounded-lg bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/60 dark:to-gray-800/40 border border-dashed border-gray-300 dark:border-gray-700"
                                  >
                                    <Clock className="w-3 h-3" />
                                    {task.break} min break
                                  </div>
                                );
                              }

                              const color = getSubjectColor(task.subject);

                              return (
                                <Draggable key={taskId} draggableId={taskId} index={tIndex}>
                                  {(prov, snapshot) => (
                                    <div
                                      ref={prov.innerRef}
                                      {...prov.draggableProps}
                                      {...prov.dragHandleProps}
                                      className={[
                                        "flex flex-col gap-1 p-2 rounded-lg border-l-4 bg-white dark:bg-slate-900 transition",
                                        color.border,
                                        snapshot.isDragging ? "shadow-2xl scale-[1.02]" : "shadow hover:shadow-md",
                                        isComplete ? "opacity-60 line-through" : "",
                                        // slight glow on hover
                                        "hover:ring-1 hover:ring-slate-200/60 dark:hover:ring-slate-700/60",
                                      ].join(" ")}
                                    >
                                      {/* Task Info */}
                                      <div className="flex justify-between items-start gap-1">
                                        <div className="flex flex-col gap-0.5">
                                          <span className={`font-bold text-sm ${color.text}`}>
                                            {normalizeSubjectName(task.subject)}
                                          </span>
                                          <span className="text-xs text-muted-foreground">{task.chapter}</span>
                                        </div>
                                        <Badge
                                          variant="outline"
                                          className="text-[10px] uppercase tracking-wide bg-gradient-to-r from-slate-50 to-white dark:from-slate-800/40 dark:to-slate-800/20"
                                        >
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
                                              type="button"
                                              variant="ghost"
                                              size="icon"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                navigate("/study");
                                              }}
                                              className="p-1 hover:bg-indigo-50 dark:hover:bg-indigo-900/30"
                                              title="Start studying"
                                            >
                                              <ArrowRightCircle className="w-4 h-4 text-indigo-500" />
                                            </Button>
                                          )}
                                          <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={(e) => handleDelete(e, wIndex, dIndex, tIndex)}
                                            className="p-1 hover:bg-rose-50 dark:hover:bg-rose-900/30"
                                            title="Delete task"
                                          >
                                            <Trash2 className="w-4 h-4 text-rose-500" />
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
          </div>
        ))}
      </DragDropContext>
    </div>
  );
};

export default StudyPlannerTimeline;
