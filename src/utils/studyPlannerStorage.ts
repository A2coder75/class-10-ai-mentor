
export interface CustomTask {
  id: string;
  title: string;
  duration: number;
  completed: boolean;
  createdAt: string;
}

export function savePlannerData(data: any) {
  try {
    localStorage.setItem('studyPlan', JSON.stringify(data));
    console.log('Study plan saved to storage:', data);
  } catch (error) {
    console.error('Error saving study plan:', error);
  }
}

export function getTodaysTasks() {
  try {
    // Get the stored study plan
    const storedPlan = localStorage.getItem('studyPlan');
    if (!storedPlan) {
      console.info('No study plan found in storage');
      return { todaysTasks: [], planExists: false };
    }

    const plan = JSON.parse(storedPlan);
    console.info('Getting today\'s tasks from:', plan);

    // Handle different formats of the study plan
    let studyPlanArray = null;
    
    if (plan.study_plan && Array.isArray(plan.study_plan)) {
      studyPlanArray = plan.study_plan;
    } else if (Array.isArray(plan)) {
      studyPlanArray = plan;
    } else {
      console.info('Invalid plan format - no study_plan array found');
      return { todaysTasks: [], planExists: true };
    }

    if (!studyPlanArray.length) {
      console.info('Study plan array is empty');
      return { todaysTasks: [], planExists: true };
    }

    // Get today's date in the same format as in the plan
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    console.info('Today\'s date string:', todayStr);

    // Look for today's tasks in any week
    let todaysTasks = [];
    let foundDay = null;

    // First try to find an exact match for today's date
    for (const week of studyPlanArray) {
      if (!week.days || !Array.isArray(week.days)) continue;
      
      for (const day of week.days) {
        if (!day) continue;
        
        const dayDate = day.date ? String(day.date) : null;
        if (dayDate && (dayDate.includes(todayStr) || dayDate === todayStr)) {
          foundDay = day;
          console.info('Found exact match for today:', foundDay);
          break;
        }
      }
      if (foundDay) break;
    }

    // If no exact match, find the closest upcoming day
    if (!foundDay) {
      let closestDay = null;
      let closestDiff = Infinity;

      for (const week of studyPlanArray) {
        if (!week.days || !Array.isArray(week.days)) continue;
        
        for (const day of week.days) {
          if (!day || !day.date) continue;
          
          const dayDate = new Date(day.date);
          if (isNaN(dayDate.getTime())) continue;
          
          // Only consider future dates
          const diff = dayDate.getTime() - today.getTime();
          if (diff >= 0 && diff < closestDiff) {
            closestDiff = diff;
            closestDay = day;
          }
        }
      }

      if (closestDay) {
        foundDay = closestDay;
        console.info('No exact match for today, using closest upcoming day:', foundDay);
      }
    }

    // If still no day found, just use the first day from the plan
    if (!foundDay && studyPlanArray.length > 0 && studyPlanArray[0].days && studyPlanArray[0].days.length > 0) {
      foundDay = studyPlanArray[0].days[0];
      console.info('No suitable day found, using first day of plan:', foundDay);
    }

    // Extract study tasks (excluding breaks)
    if (foundDay && foundDay.tasks && Array.isArray(foundDay.tasks)) {
      todaysTasks = foundDay.tasks.filter((task) => task && !('break' in task));
      console.info('Today\'s tasks:', todaysTasks);
    }

    return { todaysTasks, planExists: true };
  } catch (error) {
    console.error('Error getting today\'s tasks:', error);
    return { todaysTasks: [], planExists: false };
  }
}

export function loadCustomTasks(): CustomTask[] {
  try {
    const tasks = localStorage.getItem('customTasks');
    return tasks ? JSON.parse(tasks) : [];
  } catch (error) {
    console.error('Error loading custom tasks:', error);
    return [];
  }
}

export function saveCustomTasks(tasks: CustomTask[]) {
  try {
    localStorage.setItem('customTasks', JSON.stringify(tasks));
  } catch (error) {
    console.error('Error saving custom tasks:', error);
  }
}
