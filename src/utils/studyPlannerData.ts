
import { Subject, StudyPlan } from "@/types";

export const mockSubjects: Subject[] = [
  {
    id: "physics",
    name: "Physics",
    color: "#8b5cf6", // purple
    totalTopics: 8,
    completedTopics: 3,
    topics: [
      {
        id: "physics-1",
        name: "Force and Laws of Motion",
        status: "completed",
        subjectId: "physics"
      },
      {
        id: "physics-2",
        name: "Work, Energy and Power",
        status: "completed",
        subjectId: "physics"
      },
      {
        id: "physics-3",
        name: "Refraction of Light",
        status: "in-progress",
        subjectId: "physics"
      },
      {
        id: "physics-4",
        name: "Electricity",
        status: "completed",
        subjectId: "physics"
      },
      {
        id: "physics-5",
        name: "Magnetic Effects of Current",
        status: "not-started",
        subjectId: "physics"
      },
      {
        id: "physics-6",
        name: "Sound",
        status: "not-started",
        subjectId: "physics"
      },
      {
        id: "physics-7",
        name: "Heat",
        status: "not-started",
        subjectId: "physics"
      },
      {
        id: "physics-8",
        name: "Modern Physics",
        status: "not-started",
        subjectId: "physics"
      }
    ]
  },
  {
    id: "chemistry",
    name: "Chemistry",
    color: "#ec4899", // pink
    totalTopics: 6,
    completedTopics: 1,
    topics: [
      {
        id: "chemistry-1",
        name: "Periodic Table & Periodicity",
        status: "completed",
        subjectId: "chemistry"
      },
      {
        id: "chemistry-2",
        name: "Chemical Bonding",
        status: "in-progress",
        subjectId: "chemistry"
      },
      {
        id: "chemistry-3",
        name: "Acids, Bases and Salts",
        status: "not-started",
        subjectId: "chemistry"
      },
      {
        id: "chemistry-4",
        name: "Analytical Chemistry",
        status: "not-started",
        subjectId: "chemistry"
      },
      {
        id: "chemistry-5",
        name: "Mole Concept & Stoichiometry",
        status: "not-started",
        subjectId: "chemistry"
      },
      {
        id: "chemistry-6",
        name: "Organic Chemistry",
        status: "not-started",
        subjectId: "chemistry"
      }
    ]
  },
  {
    id: "mathematics",
    name: "Mathematics",
    color: "#0ea5e9", // sky
    totalTopics: 7,
    completedTopics: 2,
    topics: [
      {
        id: "math-1",
        name: "Number Systems",
        status: "completed",
        subjectId: "mathematics"
      },
      {
        id: "math-2",
        name: "Algebra",
        status: "completed",
        subjectId: "mathematics"
      },
      {
        id: "math-3",
        name: "Commercial Mathematics",
        status: "in-progress",
        subjectId: "mathematics"
      },
      {
        id: "math-4",
        name: "Trigonometry",
        status: "not-started",
        subjectId: "mathematics"
      },
      {
        id: "math-5",
        name: "Geometry",
        status: "not-started",
        subjectId: "mathematics"
      },
      {
        id: "math-6",
        name: "Statistics & Probability",
        status: "not-started",
        subjectId: "mathematics"
      },
      {
        id: "math-7",
        name: "Mensuration",
        status: "not-started",
        subjectId: "mathematics"
      }
    ]
  },
  {
    id: "biology",
    name: "Biology",
    color: "#10b981", // emerald
    totalTopics: 5,
    completedTopics: 0,
    topics: [
      {
        id: "bio-1",
        name: "Basic Biology",
        status: "in-progress",
        subjectId: "biology"
      },
      {
        id: "bio-2",
        name: "Plant Physiology",
        status: "not-started",
        subjectId: "biology"
      },
      {
        id: "bio-3",
        name: "Human Anatomy & Physiology",
        status: "not-started",
        subjectId: "biology"
      },
      {
        id: "bio-4",
        name: "Genetics & Evolution",
        status: "not-started",
        subjectId: "biology"
      },
      {
        id: "bio-5",
        name: "Ecology & Environment",
        status: "not-started",
        subjectId: "biology"
      }
    ]
  },
  {
    id: "english",
    name: "English",
    color: "#f97316", // orange
    totalTopics: 4,
    completedTopics: 2,
    topics: [
      {
        id: "eng-1",
        name: "Reading Comprehension",
        status: "completed",
        subjectId: "english"
      },
      {
        id: "eng-2",
        name: "Writing Skills",
        status: "completed",
        subjectId: "english"
      },
      {
        id: "eng-3",
        name: "Literature",
        status: "in-progress",
        subjectId: "english"
      },
      {
        id: "eng-4",
        name: "Grammar",
        status: "not-started",
        subjectId: "english"
      }
    ]
  }
];

export const mockStudyPlan: StudyPlan = {
  target_date: "2025-04-30",
  study_plan: [
    {
      week_number: 1,
      days: [
        {
          date: "2025-04-13",
          tasks: [
            {
              subject: "Physics",
              chapter: "Light",
              task_type: "learning",
              estimated_time: 90,
              status: "pending"
            },
            {
              break: 20
            },
            {
              subject: "Mathematics",
              chapter: "Quadratic Equations",
              task_type: "learning",
              estimated_time: 90,
              status: "pending"
            }
          ]
        },
        {
          date: "2025-04-14",
          tasks: [
            {
              subject: "Chemistry",
              chapter: "Mole Concept",
              task_type: "learning",
              estimated_time: 90,
              status: "pending"
            },
            {
              break: 20
            },
            {
              subject: "Physics",
              chapter: "Machines",
              task_type: "revision",
              estimated_time: 60,
              status: "pending"
            }
          ]
        },
        {
          date: "2025-04-15",
          tasks: [
            {
              subject: "Mathematics",
              chapter: "Quadratic Equations",
              task_type: "revision",
              estimated_time: 60,
              status: "pending"
            },
            {
              break: 20
            },
            {
              subject: "Chemistry",
              chapter: "Stoichiometry",
              task_type: "learning",
              estimated_time: 90,
              status: "pending"
            }
          ]
        },
        {
          date: "2025-04-16",
          tasks: [
            {
              subject: "Physics",
              chapter: "GST",
              task_type: "revision",
              estimated_time: 60,
              status: "pending"
            },
            {
              break: 20
            },
            {
              subject: "Chemistry",
              chapter: "Stoichiometry",
              task_type: "revision",
              estimated_time: 60,
              status: "pending"
            }
          ]
        }
      ]
    },
    {
      week_number: 2,
      days: [
        {
          date: "2025-04-20",
          tasks: [
            {
              subject: "Physics",
              chapter: "Light",
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
              task_type: "revision",
              estimated_time: 60,
              status: "pending"
            }
          ]
        },
        {
          date: "2025-04-21",
          tasks: [
            {
              subject: "Chemistry",
              chapter: "Mole Concept",
              task_type: "revision",
              estimated_time: 60,
              status: "pending"
            },
            {
              break: 20
            },
            {
              subject: "Physics",
              chapter: "Machines",
              task_type: "revision",
              estimated_time: 60,
              status: "pending"
            }
          ]
        },
        {
          date: "2025-04-22",
          tasks: [
            {
              subject: "Mathematics",
              chapter: "Quadratic Equations",
              task_type: "revision",
              estimated_time: 60,
              status: "pending"
            },
            {
              break: 20
            },
            {
              subject: "Chemistry",
              chapter: "Stoichiometry",
              task_type: "revision",
              estimated_time: 60,
              status: "pending"
            }
          ]
        },
        {
          date: "2025-04-23",
          tasks: [
            {
              subject: "Physics",
              chapter: "GST",
              task_type: "revision",
              estimated_time: 60,
              status: "pending"
            },
            {
              break: 20
            },
            {
              subject: "Chemistry",
              chapter: "Mole Concept",
              task_type: "revision",
              estimated_time: 60,
              status: "pending"
            }
          ]
        }
      ]
    }
  ]
};
