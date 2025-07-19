export interface CustomTask {
  id: string;
  title: string;
  duration: number;
  completed: boolean;
  createdAt: string;
}

// Normalize subject names to ensure consistency across app
export function normalizeSubjectName(subject: string): string {
  if (!subject) return "";
  
  const subjectLower = subject.toLowerCase().trim();
  
  // Normalize Math variations
  if (['math', 'mathematics', 'maths', 'math.', 'maths.', 'mathematics.'].includes(subjectLower)) {
    return "Mathematics";
  }
  
  // Normalize Science subjects
  if (['physics', 'phy', 'phy.', 'physics.'].includes(subjectLower)) {
    return "Physics";
  }
  
  if (['chemistry', 'chem', 'chem.', 'chemistry.'].includes(subjectLower)) {
    return "Chemistry";
  }
  
  if (['biology', 'bio', 'bio.', 'biology.'].includes(subjectLower)) {
    return "Biology";
  }
  
  // Normalize Humanities subjects
  if (['history', 'hist', 'hist.', 'history.'].includes(subjectLower)) {
    return "History";
  }
  
  if (['geography', 'geo', 'geo.', 'geography.'].includes(subjectLower)) {
    return "Geography";
  }
  
  if (['english', 'eng', 'eng.', 'english language', 'english.'].includes(subjectLower)) {
    return "English";
  }
  
  if (['computer science', 'cs', 'programming', 'compsci', 'comp sci', 'computer.', 'computer studies'].includes(subjectLower)) {
    return "Computer Science";
  }
  
  if (['economics', 'econ', 'econ.', 'economics.'].includes(subjectLower)) {
    return "Economics";
  }
  
  // If no match, capitalize first letter of each word
  return subject.split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

export function savePlannerData(data: any) {
  try {
    // Ensure proper week numbering before saving
    if (data && data.study_plan) {
      data.study_plan.forEach((week: any, index: number) => {
        week.week_number = index; // Make sure week numbering is correct
        
        if (week.days) {
          week.days.forEach((day: any) => {
            if (day.tasks) {
              day.tasks.forEach((task: any) => {
                if (task && task.subject) {
                  task.subject = normalizeSubjectName(task.subject);
                }
              });
            }
          });
        }
      });
    }
    
    const stringifiedData = JSON.stringify(data);
    localStorage.setItem('studyPlan', stringifiedData);
    console.log('Study plan saved to storage successfully');
    
    // Force browser to persist the data immediately
    setTimeout(() => {
      const loadTest = localStorage.getItem('studyPlan');
      if (!loadTest) {
        console.error('Failed to save plan - verification failed');
        // Try saving again
        localStorage.setItem('studyPlan', stringifiedData);
      } else {
        console.log('Study plan verified in storage');
      }
    }, 100);
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
      const tasks = foundDay.tasks.filter((task) => task && !('break' in task));
      // Normalize subject names in the tasks
      todaysTasks = tasks.map(task => ({
        ...task,
        subject: task.subject ? normalizeSubjectName(task.subject) : task.subject
      }));
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

// New utility functions for task status sync between pages
export function updateTaskStatus(weekNumber: number, dayIndex: number, taskIndex: number, completed: boolean) {
  try {
    const storedPlan = localStorage.getItem('studyPlan');
    if (!storedPlan) return false;
    
    const plan = JSON.parse(storedPlan);
    if (!plan.study_plan || !plan.study_plan[weekNumber]?.days?.[dayIndex]?.tasks?.[taskIndex]) {
      return false;
    }
    
    const task = plan.study_plan[weekNumber].days[dayIndex].tasks[taskIndex];
    if ('break' in task) return false;
    
    task.status = completed ? 'completed' : 'pending';
    localStorage.setItem('studyPlan', JSON.stringify(plan));
    return true;
  } catch (error) {
    console.error('Error updating task status:', error);
    return false;
  }
}

export function getTaskStatusById(taskId: string): boolean | null {
  try {
    const [weekNumber, dayIndex, taskIndex] = taskId.split('-').map(Number);
    const storedPlan = localStorage.getItem('studyPlan');
    if (!storedPlan) return null;
    
    const plan = JSON.parse(storedPlan);
    if (!plan.study_plan || !plan.study_plan[weekNumber]?.days?.[dayIndex]?.tasks?.[taskIndex]) {
      return null;
    }
    
    const task = plan.study_plan[weekNumber].days[dayIndex].tasks[taskIndex];
    if ('break' in task) return null;
    
    return task.status === 'completed';
  } catch (error) {
    console.error('Error getting task status:', error);
    return null;
  }
}

// Task timeline generation - helps with visualization
export function getDateRange(startDate: Date, days: number): string[] {
  const dates = [];
  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    dates.push(date.toISOString().split('T')[0]);
  }
  return dates;
}

// Utility function to format dates in a user-friendly way
export function formatDate(dateStr: string, format: 'short' | 'full' = 'full'): string {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  
  if (format === 'short') {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short', day: 'numeric'
    }).format(date);
  }
  
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long', month: 'short', day: 'numeric', year: 'numeric'
  }).format(date);
}

// Get week dates for displaying in the UI
export function getWeekDateRange(week: any): string {
  if (!week?.days?.length) return '';
  
  // Find first and last day with valid dates
  const days = week.days.filter((day: any) => day?.date);
  if (!days.length) return '';
  
  const firstDay = new Date(days[0].date);
  const lastDay = new Date(days[days.length - 1].date);
  
  if (isNaN(firstDay.getTime()) || isNaN(lastDay.getTime())) return '';
  
  const firstFormat = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(firstDay);
  const lastFormat = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(lastDay);
  
  return `${firstFormat} – ${lastFormat}`;
}
