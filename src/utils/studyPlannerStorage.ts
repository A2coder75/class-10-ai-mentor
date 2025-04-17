
import { PlannerWeek, StudyPlan } from "@/types";

const PLANNER_STORAGE_KEY = "study_planner_data";
const COMPLETED_TASKS_KEY = "completed_study_tasks";

export const savePlannerData = (plannerData: StudyPlan): void => {
  try {
    localStorage.setItem(PLANNER_STORAGE_KEY, JSON.stringify(plannerData));
    console.log("Planner data saved successfully");
  } catch (error) {
    console.error("Failed to save planner data:", error);
  }
};

export const getPlannerData = (): StudyPlan | null => {
  try {
    const storedData = localStorage.getItem(PLANNER_STORAGE_KEY);
    if (!storedData) return null;
    
    return JSON.parse(storedData) as StudyPlan;
  } catch (error) {
    console.error("Failed to retrieve planner data:", error);
    return null;
  }
};

// Save a task's completion status
export const saveTaskCompletion = (date: string, taskIndex: number, isCompleted: boolean): void => {
  try {
    const completedTasksStr = localStorage.getItem(COMPLETED_TASKS_KEY);
    let completedTasks: Record<string, number[]> = {};
    
    if (completedTasksStr) {
      completedTasks = JSON.parse(completedTasksStr);
    }
    
    if (isCompleted) {
      // Add to completed tasks
      if (!completedTasks[date]) {
        completedTasks[date] = [];
      }
      
      if (!completedTasks[date].includes(taskIndex)) {
        completedTasks[date].push(taskIndex);
      }
    } else {
      // Remove from completed tasks
      if (completedTasks[date]) {
        completedTasks[date] = completedTasks[date].filter(idx => idx !== taskIndex);
        
        if (completedTasks[date].length === 0) {
          delete completedTasks[date];
        }
      }
    }
    
    localStorage.setItem(COMPLETED_TASKS_KEY, JSON.stringify(completedTasks));
    
    // Also update the study planner data to reflect the completion status
    syncCompletionWithPlannerData(date, taskIndex, isCompleted);
  } catch (error) {
    console.error("Failed to save task completion status:", error);
  }
};

// Sync completion status with the planner data
const syncCompletionWithPlannerData = (date: string, taskIndex: number, isCompleted: boolean): void => {
  try {
    const plannerData = getPlannerData();
    if (!plannerData) return;

    let foundTask = false;
    
    plannerData.study_plan.forEach(week => {
      week.days.forEach(day => {
        if (day.date === date && day.tasks[taskIndex]) {
          if ('break' in day.tasks[taskIndex]) return; // Skip breaks
          
          day.tasks[taskIndex].status = isCompleted ? 'completed' : 'pending';
          foundTask = true;
        }
      });
    });
    
    if (foundTask) {
      savePlannerData(plannerData);
    }
  } catch (error) {
    console.error("Failed to sync completion with planner data:", error);
  }
};

// Get all completed tasks
export const getCompletedTasks = (): Record<string, number[]> => {
  try {
    const completedTasksStr = localStorage.getItem(COMPLETED_TASKS_KEY);
    
    if (!completedTasksStr) {
      return {};
    }
    
    return JSON.parse(completedTasksStr);
  } catch (error) {
    console.error("Failed to retrieve completed tasks:", error);
    return {};
  }
};

// Check if a specific task is completed
export const isTaskCompleted = (date: string, taskIndex: number): boolean => {
  try {
    const completedTasks = getCompletedTasks();
    return completedTasks[date]?.includes(taskIndex) || false;
  } catch (error) {
    console.error("Failed to check task completion status:", error);
    return false;
  }
};

// Get today's tasks
export const getTodaysTasks = (): any[] => {
  try {
    const plannerData = getPlannerData();
    if (!plannerData) return [];
    
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0]; // YYYY-MM-DD format
    
    for (const week of plannerData.study_plan) {
      for (const day of week.days) {
        // Check if this is today's plan (comparing only the date part)
        if (day.date.split('T')[0] === todayStr) {
          return day.tasks;
        }
      }
    }
    
    // If no exact match for today, return the closest upcoming day's tasks
    let closestDay = null;
    let minDiff = Infinity;
    
    for (const week of plannerData.study_plan) {
      for (const day of week.days) {
        const dayDate = new Date(day.date);
        const diff = dayDate.getTime() - today.getTime();
        
        // Only consider future days
        if (diff >= 0 && diff < minDiff) {
          minDiff = diff;
          closestDay = day;
        }
      }
    }
    
    return closestDay ? closestDay.tasks : [];
  } catch (error) {
    console.error("Failed to get today's tasks:", error);
    return [];
  }
};
