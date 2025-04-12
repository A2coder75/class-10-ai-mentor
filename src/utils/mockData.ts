
import { Question, ChapterInfo, PaperInfo, PerformanceData, ChapterPerformance, MistakeCategory } from "../types";

export const mockQuestions: Question[] = [
  {
    id: "q1",
    text: "Which of the following is a vector quantity?",
    type: "mcq",
    options: ["Mass", "Speed", "Velocity", "Time"],
    correctAnswer: "Velocity",
    marks: 1
  },
  {
    id: "q2",
    text: "The SI unit of electric current is:",
    type: "mcq",
    options: ["Volt", "Ampere", "Coulomb", "Ohm"],
    correctAnswer: "Ampere",
    marks: 1
  },
  {
    id: "q3",
    text: "A car accelerates uniformly from rest to 20 m/s in 5 seconds. Calculate the acceleration and the distance traveled.",
    type: "subjective",
    correctAnswer: "Acceleration = 4 m/s², Distance = 50 m",
    marks: 4,
    explanation: "Using v = u + at, 20 = 0 + a×5, so a = 4 m/s². Using s = ut + ½at², s = 0×5 + ½×4×5² = 50 m."
  },
  {
    id: "q4",
    text: "Define the principle of conservation of energy and give one example.",
    type: "subjective",
    correctAnswer: "Energy can neither be created nor destroyed, only converted from one form to another. Example: When a ball falls, potential energy converts to kinetic energy.",
    marks: 3
  },
  {
    id: "q5",
    text: "Which lens is used to correct myopia (nearsightedness)?",
    type: "mcq",
    options: ["Convex lens", "Concave lens", "Bifocal lens", "Cylindrical lens"],
    correctAnswer: "Concave lens",
    marks: 1
  }
];

export const mockChapters: ChapterInfo[] = [
  {
    id: "ch1",
    title: "Force and Laws of Motion",
    description: "Newton's laws of motion and their applications",
    topics: ["Newton's First Law", "Newton's Second Law", "Newton's Third Law", "Law of Conservation of Momentum"],
    completed: true
  },
  {
    id: "ch2",
    title: "Electricity",
    description: "Electric current and circuits",
    topics: ["Electric Current", "Potential Difference", "Ohm's Law", "Resistors in Series and Parallel", "Heating Effect of Current"],
    completed: false
  },
  {
    id: "ch3",
    title: "Light - Reflection and Refraction",
    description: "Properties of light and optical phenomena",
    topics: ["Reflection of Light", "Spherical Mirrors", "Refraction of Light", "Lenses", "Power of a Lens"],
    completed: false
  },
  {
    id: "ch4",
    title: "Magnetic Effects of Current",
    description: "Magnetism and electromagnetic effects",
    topics: ["Magnetic Field", "Magnetic Field due to Current", "Force on Current-Carrying Conductor", "Electromagnetic Induction", "Electric Motor and Generator"],
    completed: false
  }
];

export const mockPapers: PaperInfo[] = [
  {
    id: "p1",
    year: "2024",
    title: "ICSE Physics 2024"
  },
  {
    id: "p2",
    year: "2023",
    title: "ICSE Physics 2023"
  },
  {
    id: "p3",
    year: "2022",
    title: "ICSE Physics 2022"
  },
  {
    id: "p4",
    year: "2021",
    title: "ICSE Physics 2021"
  }
];

export const mockPerformanceData: PerformanceData[] = [
  { date: "Jan 10", score: 25, maxScore: 40 },
  { date: "Jan 17", score: 28, maxScore: 40 },
  { date: "Jan 24", score: 30, maxScore: 40 },
  { date: "Jan 31", score: 34, maxScore: 40 },
  { date: "Feb 7", score: 36, maxScore: 40 }
];

export const mockChapterPerformance: ChapterPerformance[] = [
  { chapter: "Force & Motion", score: 85, total: 100 },
  { chapter: "Electricity", score: 70, total: 100 },
  { chapter: "Light", score: 90, total: 100 },
  { chapter: "Magnetism", score: 75, total: 100 }
];

export const mockMistakeCategories: MistakeCategory[] = [
  { category: "Conceptual", count: 12 },
  { category: "Calculation", count: 8 },
  { category: "Unit Errors", count: 5 },
  { category: "Formula Application", count: 7 }
];
