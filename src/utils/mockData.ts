
import { Question, ChapterInfo, PaperInfo, PerformanceData, ChapterPerformance, MistakeCategory } from "../types";

export const mockQuestions: Question[] = [
  {
    "section": "A",
    "question_number": "1(xiv)",
    "question_text": "The graph given below shows heat energy supplied against change in temperature when no energy is lost to the surrounding. The slope of this graph will give\nheat energy\n(0, 0)\nchange in temperature",
    "question": "The graph given below shows heat energy supplied against change in temperature when no energy is lost to the surrounding. The slope of this graph will give...",
    "type": "mcq",
    "options": [
      "Specific heat capacity",
      "Latent heat of fusion",
      "Latent heat of vaporization",
      "Heat capacity"
    ],
    "diagram": "https://huggingface.co/datasets/A2coder75/diagrams/resolve/main/1(xiv).png"
  },
  {
    "section": "A",
    "question_number": "1(xv)",
    "question_text": "A block of glass is pushed into the path of the light as shown below. Then the converging point X will",
    "question": "A block of glass is pushed into the path of the light as shown below. Then the converging point X will...",
    "type": "mcq",
    "options": [
      "Move away from the slab",
      "Move towards the slab",
      "Not shift",
      "Move towards the left side of the lens"
    ],
    "diagram": "https://huggingface.co/datasets/A2coder75/diagrams/resolve/main/1(xv).png"
  },
  {
    "section": "A",
    "question_number": "2(i)(a)",
    "question_text": "In the following atoms, which one is a radioisotope? Give one use of this isotope. O¹⁶, C¹⁴, N¹⁴, He⁴",
    "question": "In the following atoms, which one is a radioisotope? Give one use of this isotope. O¹⁶, C¹⁴, N¹⁴, He⁴",
    "type": "descriptive"
  },
  {
    "section": "A",
    "question_number": "2(i)(b)",
    "question_text": "Name the class of the lever shown in the picture below:",
    "question": "Name the class of the lever shown in the picture below:",
    "type": "descriptive",
    "diagram": "https://huggingface.co/datasets/A2coder75/diagrams/resolve/main/2(i)(b).png"
  },
  {
    "section": "A",
    "question_number": "2(ii)(a)",
    "question_text": "When a stone tied to a string is rotated in a horizontal plane, the tension in the string provides ______ force necessary for circular motion.",
    "question": "When a stone tied to a string is rotated in a horizontal plane, the tension in the string provides ______ force necessary for circular motion.",
    "type": "fill_in_blank"
  },
  {
    "section": "B",
    "question_number": "3",
    "question_text": "Motion",
    "question": "Motion",
    "type": "question"
  },
  {
    "section": "B",
    "question_number": "3(a)",
    "question_text": "Define the term uniform acceleration.",
    "question": "Define the term uniform acceleration.",
    "type": "descriptive"
  },
  {
    "section": "B",
    "question_number": "3(b)",
    "question_text": "A body is thrown vertically upward with an initial velocity of 49 m s⁻¹. Calculate:",
    "question": "A body is thrown vertically upward with an initial velocity of 49 m s⁻¹. Calculate:",
    "type": "question"
  },
  {
    "section": "B",
    "question_number": "3(b)(i)",
    "question_text": "Time taken to reach the highest point.",
    "question": "Time taken to reach the highest point.",
    "type": "descriptive",
    "diagram": "https://huggingface.co/datasets/A2coder75/diagrams/resolve/main/3(b).png"
  },
  {
    "id": "q2",
    "text": "The SI unit of electric current is:",
    "question": "The SI unit of electric current is:",
    "type": "mcq",
    "options": ["Volt", "Ampere", "Coulomb", "Ohm"],
    "correctAnswer": "Ampere",
    "marks": 1
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
