
import { PlannerResponseInterface } from './api';

export const saveStudyPlanToStorage = (plan: PlannerResponseInterface | null) => {
  if (!plan) return;
  
  try {
    localStorage.setItem('studyPlan', JSON.stringify(plan));
    console.log('Study plan saved to local storage');
  } catch (error) {
    console.error('Error saving study plan to localStorage:', error);
  }
};

export const getTodaysStudyPlan = () => {
  try {
    const studyPlanJson = localStorage.getItem('studyPlan');
    if (!studyPlanJson) return null;
    
    const studyPlan = JSON.parse(studyPlanJson);
    if (!studyPlan || !studyPlan.study_plan) return null;
    
    const today = new Date();
    const formattedToday = today.toISOString().split('T')[0]; // YYYY-MM-DD format
    
    // Find today's tasks across all weeks
    for (const week of studyPlan.study_plan) {
      for (const day of week.days) {
        const dayDate = new Date(day.date);
        const formattedDayDate = dayDate.toISOString().split('T')[0];
        
        if (formattedDayDate === formattedToday) {
          return {
            date: day.date,
            tasks: day.tasks,
            weekNumber: week.week_number,
            dayIndex: studyPlan.study_plan.indexOf(week),
          };
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error getting today\'s study plan:', error);
    return null;
  }
};

export const loadStudyPlanFromStorage = (): PlannerResponseInterface | null => {
  try {
    const studyPlanJson = localStorage.getItem('studyPlan');
    if (!studyPlanJson) return null;
    
    return JSON.parse(studyPlanJson);
  } catch (error) {
    console.error('Error loading study plan from localStorage:', error);
    return null;
  }
};
