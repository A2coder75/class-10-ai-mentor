
// Add a section to the existing studyPlannerData.ts to normalize subjects

import { StudyPlan, Subject } from "@/types";

export const normalizeSubjectName = (subject: string): string => {
  // Convert variations of Math to a standard form
  if (subject.toLowerCase() === 'math' || 
      subject.toLowerCase() === 'mathematics' || 
      subject.toLowerCase() === 'maths') {
    return 'Mathematics';
  }
  
  // You can add more normalizations here if needed
  return subject;
};

// Mock subjects for the study planner form
export const mockSubjects: Subject[] = [
  {
    id: "1",
    name: "Mathematics",
    completedTopics: 3,
    topics: [
      { id: "1-1", name: "Quadratic Equations", status: "completed" },
      { id: "1-2", name: "Trigonometry", status: "in-progress" },
      { id: "1-3", name: "Statistics", status: "not-started" },
      { id: "1-4", name: "Probability", status: "completed" },
      { id: "1-5", name: "Algebra", status: "completed" }
    ]
  },
  {
    id: "2",
    name: "Physics",
    completedTopics: 2,
    topics: [
      { id: "2-1", name: "Electricity", status: "completed" },
      { id: "2-2", name: "Optics", status: "completed" },
      { id: "2-3", name: "Mechanics", status: "in-progress" },
      { id: "2-4", name: "Heat", status: "not-started" }
    ]
  },
  {
    id: "3",
    name: "Chemistry",
    completedTopics: 1,
    topics: [
      { id: "3-1", name: "Chemical Reactions", status: "completed" },
      { id: "3-2", name: "Periodic Table", status: "in-progress" },
      { id: "3-3", name: "Organic Chemistry", status: "not-started" },
      { id: "3-4", name: "Acids and Bases", status: "not-started" }
    ]
  },
  {
    id: "4",
    name: "Biology",
    completedTopics: 0,
    topics: [
      { id: "4-1", name: "Cell Structure", status: "in-progress" },
      { id: "4-2", name: "Photosynthesis", status: "not-started" },
      { id: "4-3", name: "Human Body", status: "not-started" }
    ]
  },
  {
    id: "5",
    name: "History",
    completedTopics: 2,
    topics: [
      { id: "5-1", name: "Ancient Civilizations", status: "completed" },
      { id: "5-2", name: "World Wars", status: "completed" },
      { id: "5-3", name: "Industrial Revolution", status: "in-progress" }
    ]
  },
  {
    id: "6",
    name: "Geography",
    completedTopics: 1,
    topics: [
      { id: "6-1", name: "Map Reading", status: "completed" },
      { id: "6-2", name: "Climate", status: "in-progress" },
      { id: "6-3", name: "Natural Resources", status: "not-started" }
    ]
  }
];

// Mock study plan for displaying in the study planner
export const mockStudyPlan: StudyPlan = {
  target_date: "2025-06-15",
  study_plan: [
    {
      week_number: 1,
      days: [
        {
          date: "2025-04-15",
          tasks: [
            {
              subject: "Physics",
              chapter: "Electricity",
              task_type: "learning",
              estimated_time: 120,
              status: "pending"
            },
            {
              break: 20
            },
            {
              subject: "Mathematics",
              chapter: "Quadratic Equations",
              task_type: "revision",
              estimated_time: 60,
              status: "pending"
            }
          ]
        },
        {
          date: "2025-04-17",
          tasks: [
            {
              subject: "Physics",
              chapter: "Electricity",
              task_type: "revision",
              estimated_time: 60,
              status: "pending"
            },
            {
              break: 20
            },
            {
              subject: "Mathematics",
              chapter: "Quadratic Equations",
              task_type: "practice",
              estimated_time: 40,
              status: "pending"
            }
          ]
        }
      ]
    }
  ]
};
