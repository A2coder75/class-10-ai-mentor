
// Add a section to the existing studyPlannerData.ts to normalize subjects

import { StudyPlan, Subject } from "@/types";

export const normalizeSubjectName = (subject: string): string => {
  if (!subject) return "";
  
  const subjectLower = subject.toLowerCase().trim();
  
  // Normalize Math variations
  if (['math', 'mathematics', 'maths'].includes(subjectLower)) {
    return "Mathematics";
  }
  
  // Normalize Science subjects
  if (['physics', 'phy'].includes(subjectLower)) {
    return "Physics";
  }
  
  if (['chemistry', 'chem'].includes(subjectLower)) {
    return "Chemistry";
  }
  
  if (['biology', 'bio'].includes(subjectLower)) {
    return "Biology";
  }
  
  // Normalize Humanities subjects
  if (['history', 'hist'].includes(subjectLower)) {
    return "History";
  }
  
  if (['geography', 'geo'].includes(subjectLower)) {
    return "Geography";
  }
  
  if (['english', 'eng', 'english language'].includes(subjectLower)) {
    return "English";
  }
  
  if (['computer science', 'cs', 'programming', 'compsci'].includes(subjectLower)) {
    return "Computer Science";
  }
  
  if (['economics', 'econ'].includes(subjectLower)) {
    return "Economics";
  }
  
  // If no match, capitalize first letter of each word
  return subject.split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

// Mock subjects for the study planner form with updated Class 10 ICSE syllabus
export const mockSubjects: Subject[] = [
  {
    id: "1",
    name: "Physics",
    color: "#0EA5E9",
    totalTopics: 12,
    completedTopics: 3,
    topics: [
      { id: "1-1", name: "Force", status: "completed", subjectId: "1" },
      { id: "1-2", name: "Work, Energy and Power", status: "completed", subjectId: "1" },
      { id: "1-3", name: "Machines", status: "completed", subjectId: "1" },
      { id: "1-4", name: "Refraction of Light at Plane Surfaces", status: "in-progress", subjectId: "1" },
      { id: "1-5", name: "Refraction of Light through a Lens", status: "not-started", subjectId: "1" },
      { id: "1-6", name: "Spectrum", status: "not-started", subjectId: "1" },
      { id: "1-7", name: "Sound", status: "not-started", subjectId: "1" },
      { id: "1-8", name: "Current Electricity", status: "not-started", subjectId: "1" },
      { id: "1-9", name: "Household Circuits", status: "not-started", subjectId: "1" },
      { id: "1-10", name: "Electro-magnetism", status: "not-started", subjectId: "1" },
      { id: "1-11", name: "Calorimetry", status: "not-started", subjectId: "1" },
      { id: "1-12", name: "Radioactivity", status: "not-started", subjectId: "1" }
    ]
  },
  {
    id: "2",
    name: "Chemistry",
    color: "#10B981",
    totalTopics: 10,
    completedTopics: 2,
    topics: [
      { id: "2-1", name: "Periodic Properties & Variation of Properties", status: "completed", subjectId: "2" },
      { id: "2-2", name: "Chemical Bonding", status: "completed", subjectId: "2" },
      { id: "2-3", name: "Study of Acids, Bases and Salts", status: "in-progress", subjectId: "2" },
      { id: "2-4", name: "Analytical Chemistry", status: "not-started", subjectId: "2" },
      { id: "2-5", name: "Mole Concept and Stoichiometry", status: "not-started", subjectId: "2" },
      { id: "2-6", name: "Study of Compounds: HCl, NH₃, HNO₃, H₂SO₄", status: "not-started", subjectId: "2" },
      { id: "2-7", name: "Electrolysis", status: "not-started", subjectId: "2" },
      { id: "2-8", name: "Metallurgy", status: "not-started", subjectId: "2" },
      { id: "2-9", name: "Organic Chemistry", status: "not-started", subjectId: "2" }
    ]
  },
  {
    id: "3",
    name: "Biology",
    color: "#16A34A",
    totalTopics: 15,
    completedTopics: 1,
    topics: [
      { id: "3-1", name: "Structure of Chromosomes, Cell Cycle and Cell Division", status: "completed", subjectId: "3" },
      { id: "3-2", name: "Genetics – Some Basic Fundamentals", status: "in-progress", subjectId: "3" },
      { id: "3-3", name: "Absorption by Roots – The Processes Involved", status: "not-started", subjectId: "3" },
      { id: "3-4", name: "Transpiration", status: "not-started", subjectId: "3" },
      { id: "3-5", name: "Photosynthesis", status: "not-started", subjectId: "3" },
      { id: "3-6", name: "Chemical Coordination in Plants", status: "not-started", subjectId: "3" },
      { id: "3-7", name: "Circulatory System", status: "not-started", subjectId: "3" },
      { id: "3-8", name: "The Excretory System", status: "not-started", subjectId: "3" },
      { id: "3-9", name: "The Nervous System", status: "not-started", subjectId: "3" },
      { id: "3-10", name: "Sense Organs", status: "not-started", subjectId: "3" },
      { id: "3-11", name: "The Endocrine System", status: "not-started", subjectId: "3" },
      { id: "3-12", name: "The Reproductive System", status: "not-started", subjectId: "3" },
      { id: "3-13", name: "Human Evolution", status: "not-started", subjectId: "3" },
      { id: "3-14", name: "Population", status: "not-started", subjectId: "3" },
      { id: "3-15", name: "Pollution", status: "not-started", subjectId: "3" }
    ]
  },
  {
    id: "4",
    name: "Mathematics",
    color: "#9B87F5",
    totalTopics: 20,
    completedTopics: 4,
    topics: [
      { id: "4-1", name: "Banking", status: "completed", subjectId: "4" },
      { id: "4-2", name: "GST", status: "completed", subjectId: "4" },
      { id: "4-3", name: "Linear Inequations", status: "completed", subjectId: "4" },
      { id: "4-4", name: "Quadratic Equations", status: "completed", subjectId: "4" },
      { id: "4-5", name: "Ratio and Proportion", status: "in-progress", subjectId: "4" },
      { id: "4-6", name: "Factorization – Factor and Remainder Theorem", status: "not-started", subjectId: "4" },
      { id: "4-7", name: "Matrices", status: "not-started", subjectId: "4" },
      { id: "4-8", name: "Arithmetic and Geometric Progression", status: "not-started", subjectId: "4" },
      { id: "4-9", name: "Similar Triangles", status: "not-started", subjectId: "4" },
      { id: "4-10", name: "Coordinate Geometry", status: "not-started", subjectId: "4" },
      { id: "4-11", name: "Reflection", status: "not-started", subjectId: "4" },
      { id: "4-12", name: "Shares and Dividends", status: "not-started", subjectId: "4" },
      { id: "4-13", name: "Probability", status: "not-started", subjectId: "4" },
      { id: "4-14", name: "Trigonometric Identities and Tables", status: "not-started", subjectId: "4" },
      { id: "4-15", name: "Heights and Distances", status: "not-started", subjectId: "4" },
      { id: "4-16", name: "Three Dimensional Solids", status: "not-started", subjectId: "4" },
      { id: "4-17", name: "Arithmetic Mean, Median, Mode and Quartiles", status: "not-started", subjectId: "4" },
      { id: "4-18", name: "Histogram and Ogive", status: "not-started", subjectId: "4" },
      { id: "4-19", name: "Circles and Construction", status: "not-started", subjectId: "4" },
      { id: "4-20", name: "Loci", status: "not-started", subjectId: "4" }
    ]
  },
  {
    id: "5",
    name: "English Literature",
    color: "#D946EF",
    totalTopics: 11,
    completedTopics: 2,
    topics: [
      { id: "5-1", name: "Julius Caesar (Act 3 Scene i – Act 5 Scene v)", status: "completed", subjectId: "5" },
      { id: "5-2", name: "The Glove and the Lions – Leigh Hunt", status: "completed", subjectId: "5" },
      { id: "5-3", name: "Haunted Houses – H.W. Longfellow", status: "in-progress", subjectId: "5" },
      { id: "5-4", name: "When Great Trees Fall – Maya Angelou", status: "not-started", subjectId: "5" },
      { id: "5-5", name: "With the Photographer – Stephen Leacock", status: "not-started", subjectId: "5" },
      { id: "5-6", name: "The Elevator – William Sleator", status: "not-started", subjectId: "5" },
      { id: "5-7", name: "The Girl Who Can – Ama Ata Aidoo", status: "not-started", subjectId: "5" },
      { id: "5-8", name: "The Power of Music – Sukumar Ray", status: "not-started", subjectId: "5" },
      { id: "5-9", name: "A Considerable Speck – Robert Frost", status: "not-started", subjectId: "5" },
      { id: "5-10", name: "The Pedestrian – Ray Bradbury", status: "not-started", subjectId: "5" },
      { id: "5-11", name: "The Last Lesson – Alphonse Daudet", status: "not-started", subjectId: "5" }
    ]
  },
  {
    id: "6",
    name: "English Language",
    color: "#F97316",
    totalTopics: 4,
    completedTopics: 1,
    topics: [
      { id: "6-1", name: "Composition Writing", status: "completed", subjectId: "6" },
      { id: "6-2", name: "Letter Writing, Notice & Email Writing", status: "in-progress", subjectId: "6" },
      { id: "6-3", name: "Comprehension & Summary Writing", status: "not-started", subjectId: "6" },
      { id: "6-4", name: "Grammar", status: "not-started", subjectId: "6" }
    ]
  },
  {
    id: "7",
    name: "History & Civics",
    color: "#EF4444",
    totalTopics: 16,
    completedTopics: 3,
    topics: [
      { id: "7-1", name: "The Union Parliament", status: "completed", subjectId: "7" },
      { id: "7-2", name: "The President and the Vice President", status: "completed", subjectId: "7" },
      { id: "7-3", name: "Prime Minister and Council of Ministers", status: "completed", subjectId: "7" },
      { id: "7-4", name: "The Supreme Court", status: "in-progress", subjectId: "7" },
      { id: "7-5", name: "The High Court and Subordinate Courts", status: "not-started", subjectId: "7" },
      { id: "7-6", name: "The First War of Independence, 1857", status: "not-started", subjectId: "7" },
      { id: "7-7", name: "Growth of Nationalism", status: "not-started", subjectId: "7" },
      { id: "7-8", name: "First Phase of the Indian National Movement", status: "not-started", subjectId: "7" },
      { id: "7-9", name: "The Muslim League", status: "not-started", subjectId: "7" },
      { id: "7-10", name: "Mahatma Gandhi and the National Movement", status: "not-started", subjectId: "7" },
      { id: "7-11", name: "Quit India Movement", status: "not-started", subjectId: "7" },
      { id: "7-12", name: "Forward Bloc and the INA", status: "not-started", subjectId: "7" },
      { id: "7-13", name: "Independence and Partition of India", status: "not-started", subjectId: "7" },
      { id: "7-14", name: "The First World War", status: "not-started", subjectId: "7" },
      { id: "7-15", name: "Rise of Dictatorships", status: "not-started", subjectId: "7" },
      { id: "7-16", name: "The Second World War", status: "not-started", subjectId: "7" }
    ]
  },
  {
    id: "8",
    name: "Geography",
    color: "#06B6D4",
    totalTopics: 14,
    completedTopics: 2,
    topics: [
      { id: "8-1", name: "Map Study: Interpretation of Topographical Maps", status: "completed", subjectId: "8" },
      { id: "8-2", name: "Maps of India: Rivers, Water bodies, Soil Distribution", status: "completed", subjectId: "8" },
      { id: "8-3", name: "Climate", status: "in-progress", subjectId: "8" },
      { id: "8-4", name: "Soil Resources", status: "not-started", subjectId: "8" },
      { id: "8-5", name: "Natural Vegetation", status: "not-started", subjectId: "8" },
      { id: "8-6", name: "Water Resources", status: "not-started", subjectId: "8" },
      { id: "8-7", name: "Mineral and Energy Resources", status: "not-started", subjectId: "8" },
      { id: "8-8", name: "Manufacturing Industries: Mineral-based", status: "not-started", subjectId: "8" },
      { id: "8-9", name: "Transport", status: "not-started", subjectId: "8" },
      { id: "8-10", name: "Manufacturing Industries: Agro-based", status: "not-started", subjectId: "8" },
      { id: "8-11", name: "Agriculture in India – I", status: "not-started", subjectId: "8" },
      { id: "8-12", name: "Agriculture in India – II", status: "not-started", subjectId: "8" },
      { id: "8-13", name: "Waste Management – I", status: "not-started", subjectId: "8" },
      { id: "8-14", name: "Waste Management – II", status: "not-started", subjectId: "8" }
    ]
  },
  {
    id: "9",
    name: "Commercial Studies",
    color: "#8B5CF6",
    totalTopics: 12,
    completedTopics: 1,
    topics: [
      { id: "9-1", name: "Stakeholders in Commercial Organisation", status: "completed", subjectId: "9" },
      { id: "9-2", name: "Marketing and Sales", status: "in-progress", subjectId: "9" },
      { id: "9-3", name: "Advertising and Sales Promotion", status: "not-started", subjectId: "9" },
      { id: "9-4", name: "Consumer Protection", status: "not-started", subjectId: "9" },
      { id: "9-5", name: "E-Commerce", status: "not-started", subjectId: "9" },
      { id: "9-6", name: "Capital and Revenue Expenditure/Income", status: "not-started", subjectId: "9" },
      { id: "9-7", name: "Final Accounts of Sole Proprietorship", status: "not-started", subjectId: "9" },
      { id: "9-8", name: "Fundamental Concepts of Costs", status: "not-started", subjectId: "9" },
      { id: "9-9", name: "Budgeting", status: "not-started", subjectId: "9" },
      { id: "9-10", name: "Sources of Finance", status: "not-started", subjectId: "9" },
      { id: "9-11", name: "Recruitment, Selection and Training", status: "not-started", subjectId: "9" },
      { id: "9-12", name: "Logistics and Insurance", status: "not-started", subjectId: "9" }
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
