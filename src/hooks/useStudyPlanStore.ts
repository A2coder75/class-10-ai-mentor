
import { useState, useEffect, useMemo } from 'react';
import { savePlannerData, getTodaysTasks, normalizeSubjectName } from '@/utils/studyPlannerStorage';
import { toast } from '@/components/ui/use-toast';

export interface TaskStatus {
  [key: string]: boolean; // taskId -> completed
}

export function useStudyPlanStore() {
  const [studyPlan, setStudyPlan] = useState<any | null>(null);
  const [taskStatus, setTaskStatus] = useState<TaskStatus>({});
  const [loading, setLoading] = useState(true);
  
  // Load study plan from storage on initial render
  useEffect(() => {
    console.log('useStudyPlanStore: Loading study plan from storage...');
    try {
      const storedPlanStr = localStorage.getItem('studyPlan');
      console.log('Raw stored plan string:', storedPlanStr);
      
      if (storedPlanStr && storedPlanStr !== 'undefined' && storedPlanStr !== 'null') {
        const storedPlan = JSON.parse(storedPlanStr);
        console.log("Successfully loaded stored study plan:", storedPlan);
        
        // Validate the plan structure
        if (storedPlan && typeof storedPlan === 'object') {
          setStudyPlan(storedPlan);
          
          // Ensure proper week numbering
          if (storedPlan.study_plan && Array.isArray(storedPlan.study_plan)) {
            const fixedPlan = {...storedPlan};
            let hasChanges = false;
            
            fixedPlan.study_plan.forEach((week: any, index: number) => {
              if (week.week_number !== index) {
                week.week_number = index;
                hasChanges = true;
              }
            });
            
            if (hasChanges) {
              console.log('Fixed week numbering, saving updated plan');
              savePlannerData(fixedPlan);
              setStudyPlan(fixedPlan);
            }
          }
          
          // Initialize task statuses from the stored plan
          const initialStatuses: TaskStatus = {};
          if (storedPlan.study_plan && Array.isArray(storedPlan.study_plan)) {
            storedPlan.study_plan.forEach((week: any, weekIndex: number) => {
              if (week.days && Array.isArray(week.days)) {
                week.days.forEach((day: any, dayIndex: number) => {
                  if (day.tasks && Array.isArray(day.tasks)) {
                    day.tasks.forEach((task: any, taskIndex: number) => {
                      if (task && typeof task === 'object' && !('break' in task)) {
                        const taskId = `${weekIndex}-${dayIndex}-${taskIndex}`;
                        initialStatuses[taskId] = task.status === 'completed';
                      }
                    });
                  }
                });
              }
            });
          }
          setTaskStatus(initialStatuses);
          console.log('Initialized task statuses:', initialStatuses);
        } else {
          console.warn('Invalid plan structure, resetting');
          localStorage.removeItem('studyPlan');
        }
      } else {
        console.log('No valid study plan found in storage');
      }
    } catch (error) {
      console.error('Error loading study plan:', error);
      localStorage.removeItem('studyPlan'); // Clear corrupted data
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Get today's tasks from the study plan
  const todaysTasks = useMemo(() => {
    if (!studyPlan) return [];
    
    const { todaysTasks } = getTodaysTasks();
    return todaysTasks;
  }, [studyPlan]);
  
  // Check if a study plan exists
  const hasPlan = !!studyPlan;
  
  // Toggle task status (completed or pending)
  const toggleTaskStatus = (weekIndex: number, dayIndex: number, taskIndex: number) => {
    if (!studyPlan) return;
    
    const taskId = `${weekIndex}-${dayIndex}-${taskIndex}`;
    const isCompleted = !taskStatus[taskId];
    
    // Update local state
    setTaskStatus(prev => ({
      ...prev,
      [taskId]: isCompleted
    }));
    
    // Update study plan
    const updatedPlan = { ...studyPlan };
    if (updatedPlan.study_plan?.[weekIndex]?.days?.[dayIndex]?.tasks?.[taskIndex]) {
      const task = updatedPlan.study_plan[weekIndex].days[dayIndex].tasks[taskIndex];
      if (!('break' in task)) {
        task.status = isCompleted ? 'completed' : 'pending';
      }
    }
    
    // Save updated plan to storage
    savePlannerData(updatedPlan);
    setStudyPlan(updatedPlan);
    
    // Show toast notification
    toast({
      title: isCompleted ? "Task completed" : "Task marked as pending",
      description: `${isCompleted ? "✅" : "🔄"} ${updatedPlan.study_plan[weekIndex].days[dayIndex].tasks[taskIndex].subject}: ${updatedPlan.study_plan[weekIndex].days[dayIndex].tasks[taskIndex].chapter}`,
    });
  };
  
  // Add a custom task to today's schedule
  const addTaskToToday = (subject: string, chapter: string, taskType: string, estimatedTime: number) => {
    if (!studyPlan) {
      // Create a new study plan if none exists
      const today = new Date().toISOString().split('T')[0];
      const newPlan = {
        target_date: "2025-06-30", // Default date
        study_plan: [
          {
            week_number: 0,
            days: [
              {
                date: today,
                tasks: []
              }
            ]
          }
        ]
      };
      setStudyPlan(newPlan);
      
      // Continue with the new plan
      addTaskToTodayImpl(newPlan, subject, chapter, taskType, estimatedTime);
      return;
    }
    
    addTaskToTodayImpl(studyPlan, subject, chapter, taskType, estimatedTime);
  };
  
  // Implementation for adding task to today
  const addTaskToTodayImpl = (currentPlan: any, subject: string, chapter: string, taskType: string, estimatedTime: number) => {
    const today = new Date().toISOString().split('T')[0];
    let todayFound = false;
    
    const updatedPlan = { ...currentPlan };
    
    // Find today's date in the study plan
    for (let weekIndex = 0; weekIndex < (updatedPlan.study_plan?.length || 0); weekIndex++) {
      const week = updatedPlan.study_plan[weekIndex];
      if (!week.days) continue;
      
      for (let dayIndex = 0; dayIndex < week.days.length; dayIndex++) {
        const day = week.days[dayIndex];
        if (!day || !day.date) continue;
        
        if (day.date === today || day.date.includes(today)) {
          // Found today, add task
          const newTask = {
            subject: normalizeSubjectName(subject),
            chapter,
            task_type: taskType,
            estimated_time: estimatedTime,
            status: 'pending'
          };
          
          if (!day.tasks) day.tasks = [];
          day.tasks.push(newTask);
          todayFound = true;
          break;
        }
      }
      
      if (todayFound) break;
    }
    
    // If today wasn't found in the plan, add it to the first week
    if (!todayFound && updatedPlan.study_plan?.length > 0) {
      const firstWeek = updatedPlan.study_plan[0];
      if (!firstWeek.days) firstWeek.days = [];
      
      // Check if first day is already today
      let firstDayIsToday = false;
      if (firstWeek.days.length > 0) {
        const firstDay = firstWeek.days[0];
        firstDayIsToday = firstDay && firstDay.date === today;
      }
      
      if (firstDayIsToday) {
        // Add to existing first day
        const newTask = {
          subject: normalizeSubjectName(subject),
          chapter,
          task_type: taskType,
          estimated_time: estimatedTime,
          status: 'pending'
        };
        
        if (!firstWeek.days[0].tasks) firstWeek.days[0].tasks = [];
        firstWeek.days[0].tasks.push(newTask);
      } else {
        // Create new day for today
        const newDay = {
          date: today,
          tasks: [{
            subject: normalizeSubjectName(subject),
            chapter,
            task_type: taskType,
            estimated_time: estimatedTime,
            status: 'pending'
          }]
        };
        
        firstWeek.days.unshift(newDay);
      }
    }
    
    // Save updated plan
    savePlannerData(updatedPlan);
    setStudyPlan(updatedPlan);
    
    toast({
      title: "Task added",
      description: `Added ${normalizeSubjectName(subject)}: ${chapter} to today's schedule`,
    });
  };
  
  // Save the entire study plan (when receiving a new plan from the AI)
  const saveNewPlan = (newPlan: any) => {
    // Fix week numbering if needed
    if (newPlan && newPlan.study_plan && Array.isArray(newPlan.study_plan)) {
      newPlan.study_plan.forEach((week: any, index: number) => {
        // Ensure week has correct week_number (should match index)
        week.week_number = index;
      });
    }
    
    console.log("Saving new plan:", newPlan);
    
    // Make sure to use the normalized function to save
    savePlannerData(newPlan);
    
    // Update local state
    setStudyPlan(newPlan);
    
    // Reset task statuses
    const initialStatuses: TaskStatus = {};
    if (newPlan.study_plan) {
      newPlan.study_plan.forEach((week: any, weekIndex: number) => {
        if (week.days) {
          week.days.forEach((day: any, dayIndex: number) => {
            if (day.tasks) {
              day.tasks.forEach((task: any, taskIndex: number) => {
                if (task && !('break' in task)) {
                  const taskId = `${weekIndex}-${dayIndex}-${taskIndex}`;
                  initialStatuses[taskId] = task.status === 'completed';
                }
              });
            }
          });
        }
      });
    }
    setTaskStatus(initialStatuses);
    
    toast({
      title: "Study plan saved",
      description: "Your study plan has been updated and saved",
    });
  };
  
  return {
    studyPlan,
    taskStatus,
    loading,
    hasPlan,
    todaysTasks,
    toggleTaskStatus,
    addTaskToToday,
    saveNewPlan
  };
}

export default useStudyPlanStore;
