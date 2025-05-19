import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { PlayCircle, PauseCircle, Coffee } from "lucide-react";
import BreakTimer from "@/components/BreakTimer";
import CompactTaskList from "@/components/CompactTaskList";
import TodaysStudyPlan from "@/components/TodaysStudyPlan";
import { getTodaysStudyPlan } from "@/utils/studyPlannerStorage";
import { PlannerDay } from "@/types";

const StudyPage = () => {
  const [studyActive, setStudyActive] = useState(false);
  const [breakActive, setBreakActive] = useState(false);
  const [studyMinutes, setStudyMinutes] = useState(25);
  const [breakMinutes, setBreakMinutes] = useState(5);
  const [showTimer, setShowTimer] = useState(false);
  const [days, setDays] = useState<PlannerDay[]>([]);
  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // Load task status from local storage
    try {
      const savedStatus = localStorage.getItem('taskStatus');
      if (savedStatus) {
        setCompletedTasks(JSON.parse(savedStatus));
      }

      // Get today's plan
      const todayPlan = getTodaysStudyPlan();
      if (todayPlan) {
        setDays([todayPlan]);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    }
  }, []);

  const toggleStudy = () => {
    setStudyActive(!studyActive);
    if (breakActive) {
      setBreakActive(false);
    }
  };

  const toggleBreak = () => {
    setBreakActive(!breakActive);
    if (studyActive) {
      setStudyActive(false);
    }
  };

  const startFocusSession = () => {
    setStudyActive(true);
    setBreakActive(false);
    setShowTimer(true);
  };

  const onTaskComplete = (date: string, taskIndex: number) => {
    const taskId = `${date}-${taskIndex}`;
    setCompletedTasks(prev => {
      const newStatus = {
        ...prev,
        [taskId]: !prev[taskId]
      };
      
      // Save to local storage
      try {
        localStorage.setItem('taskStatus', JSON.stringify(newStatus));
      } catch (error) {
        console.error("Error saving task status:", error);
      }
      
      return newStatus;
    });
  };

  return (
    <div className="page-container pb-20">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-600 dark:from-indigo-400 dark:to-blue-400">
          Study Mode
        </h1>
        <p className="text-muted-foreground">
          Focus on your studies with minimal distractions
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Study Timer Card */}
          <Card className="border-none shadow-lg overflow-hidden bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800">
            <div className="h-1 bg-gradient-to-r from-indigo-500 to-blue-500"></div>
            <CardHeader className="border-b border-slate-100 dark:border-slate-800">
              <CardTitle className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-600 dark:from-indigo-400 dark:to-blue-400">
                Focus Timer
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 flex flex-col items-center justify-center">
              <div className="w-full max-w-md">
                <Tabs
                  defaultValue={showTimer ? "timer" : "setup"}
                  className="w-full"
                >
                  <TabsList className="grid w-full grid-cols-2 mb-8 rounded-full bg-slate-100 dark:bg-slate-800/50 p-1">
                    <TabsTrigger
                      value="setup"
                      className="rounded-full data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-sm"
                      onClick={() => setShowTimer(false)}
                    >
                      Setup
                    </TabsTrigger>
                    <TabsTrigger
                      value="timer"
                      className="rounded-full data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-sm"
                      onClick={() => setShowTimer(true)}
                    >
                      Timer
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="setup" className="space-y-6">
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium mb-1 block text-slate-700 dark:text-slate-300">
                          Study Duration (minutes)
                        </label>
                        <div className="grid grid-cols-4 gap-2">
                          {[15, 25, 30, 45].map((mins) => (
                            <Button
                              key={mins}
                              type="button"
                              variant={studyMinutes === mins ? "default" : "outline"}
                              onClick={() => setStudyMinutes(mins)}
                              className={`
                                ${studyMinutes === mins 
                                  ? "bg-gradient-to-r from-indigo-500 to-blue-500 border-none text-white" 
                                  : ""
                                } font-medium
                              `}
                            >
                              {mins}m
                            </Button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-1 block text-slate-700 dark:text-slate-300">
                          Break Duration (minutes)
                        </label>
                        <div className="grid grid-cols-4 gap-2">
                          {[5, 10, 15, 20].map((mins) => (
                            <Button
                              key={mins}
                              type="button"
                              variant={breakMinutes === mins ? "default" : "outline"}
                              onClick={() => setBreakMinutes(mins)}
                              className={`
                                ${breakMinutes === mins 
                                  ? "bg-gradient-to-r from-emerald-500 to-teal-500 border-none text-white" 
                                  : ""
                                } font-medium
                              `}
                            >
                              {mins}m
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <Button
                      className="w-full rounded-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 shadow-md"
                      onClick={startFocusSession}
                    >
                      <PlayCircle className="mr-2 h-4 w-4" /> Start Focus Session
                    </Button>
                  </TabsContent>

                  <TabsContent value="timer" className="space-y-6">
                    <div className="flex flex-col items-center space-y-6">
                      <div className="w-64 h-64 rounded-full border-8 border-slate-100 dark:border-slate-800 flex items-center justify-center relative">
                        <div className="text-center">
                          <span className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-600 dark:from-indigo-400 dark:to-blue-400">
                            {studyActive ? studyMinutes : breakActive ? breakMinutes : "--"}
                          </span>
                          <p className="text-slate-600 dark:text-slate-400 mt-2">minutes</p>
                        </div>
                        
                        {/* Progress circle - abstracting this for simplicity */}
                        <svg className="absolute top-0 left-0 w-64 h-64 -rotate-90">
                          <circle 
                            className="text-slate-200 dark:text-slate-700" 
                            strokeWidth="12" 
                            stroke="currentColor" 
                            fill="transparent" 
                            r="105" 
                            cx="128" 
                            cy="128" 
                          />
                          <circle 
                            className={`${studyActive ? "text-indigo-500" : "text-emerald-500"}`}
                            strokeWidth="12" 
                            strokeDasharray={`${(studyActive ? 20 : 40) * 6.6} 660`}
                            strokeLinecap="round" 
                            stroke="currentColor" 
                            fill="transparent" 
                            r="105" 
                            cx="128" 
                            cy="128" 
                          />
                        </svg>
                      </div>

                      <div className="flex gap-4">
                        <Button
                          variant="outline"
                          className={`${
                            studyActive ? "bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-900/20 dark:border-indigo-700/30 dark:text-indigo-400" : ""
                          } border-2 rounded-full flex-1 px-8`}
                          onClick={toggleStudy}
                        >
                          {studyActive ? <PauseCircle className="mr-2 h-4 w-4" /> : <PlayCircle className="mr-2 h-4 w-4" />}
                          {studyActive ? "Pause" : "Study"}
                        </Button>
                        <Button
                          variant="outline"
                          className={`${
                            breakActive ? "bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-900/20 dark:border-emerald-700/30 dark:text-emerald-400" : ""
                          } border-2 rounded-full flex-1 px-8`}
                          onClick={toggleBreak}
                        >
                          {breakActive ? <PauseCircle className="mr-2 h-4 w-4" /> : <Coffee className="mr-2 h-4 w-4" />}
                          {breakActive ? "Pause" : "Break"}
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </CardContent>
          </Card>

          {/* Study Tasks */}
          <CompactTaskList 
            days={days}
            completedTasks={completedTasks}
            onTaskComplete={onTaskComplete}
          />
        </div>

        <div className="space-y-6">
          {/* Today's Study Plan from Planner */}
          <TodaysStudyPlan />

          {/* Break Timer */}
          <BreakTimer />
        </div>
      </div>

      <Navbar />
    </div>
  );
};

export default StudyPage;
