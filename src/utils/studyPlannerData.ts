
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
    color: "#9b87f5",
    totalTopics: 5,
    completedTopics: 3,
    topics: [
      { id: "1-1", name: "Quadratic Equations", status: "completed", subjectId: "1" },
      { id: "1-2", name: "Trigonometry", status: "in-progress", subjectId: "1" },
      { id: "1-3", name: "Statistics", status: "not-started", subjectId: "1" },
      { id: "1-4", name: "Probability", status: "completed", subjectId: "1" },
      { id: "1-5", name: "Algebra", status: "completed", subjectId: "1" }
    ]
  },
  {
    id: "2",
    name: "Physics",
    color: "#0EA5E9",
    totalTopics: 4,
    completedTopics: 2,
    topics: [
      { id: "2-1", name: "Electricity", status: "completed", subjectId: "2" },
      { id: "2-2", name: "Optics", status: "completed", subjectId: "2" },
      { id: "2-3", name: "Mechanics", status: "in-progress", subjectId: "2" },
      { id: "2-4", name: "Heat", status: "not-started", subjectId: "2" }
    ]
  },
  {
    id: "3",
    name: "Chemistry",
    color: "#10B981",
    totalTopics: 4,
    completedTopics: 1,
    topics: [
      { id: "3-1", name: "Chemical Reactions", status: "completed", subjectId: "3" },
      { id: "3-2", name: "Periodic Table", status: "in-progress", subjectId: "3" },
      { id: "3-3", name: "Organic Chemistry", status: "not-started", subjectId: "3" },
      { id: "3-4", name: "Acids and Bases", status: "not-started", subjectId: "3" }
    ]
  },
  {
    id: "4",
    name: "Biology",
    color: "#F97316",
    totalTopics: 3,
    completedTopics: 0,
    topics: [
      { id: "4-1", name: "Cell Structure", status: "in-progress", subjectId: "4" },
      { id: "4-2", name: "Photosynthesis", status: "not-started", subjectId: "4" },
      { id: "4-3", name: "Human Body", status: "not-started", subjectId: "4" }
    ]
  },
  {
    id: "5",
    name: "History",
    color: "#D946EF",
    totalTopics: 3,
    completedTopics: 2,
    topics: [
      { id: "5-1", name: "Ancient Civilizations", status: "completed", subjectId: "5" },
      { id: "5-2", name: "World Wars", status: "completed", subjectId: "5" },
      { id: "5-3", name: "Industrial Revolution", status: "in-progress", subjectId: "5" }
    ]
  },
  {
    id: "6",
    name: "Geography",
    color: "#6E59A5",
    totalTopics: 3,
    completedTopics: 1,
    topics: [
      { id: "6-1", name: "Map Reading", status: "completed", subjectId: "6" },
      { id: "6-2", name: "Climate", status: "in-progress", subjectId: "6" },
      { id: "6-3", name: "Natural Resources", status: "not-started", subjectId: "6" }
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
