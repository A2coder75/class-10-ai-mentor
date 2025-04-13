
export interface Question {
  id?: string;
  section?: string;
  question_number?: string;
  question_text?: string;
  type?: 'mcq' | 'descriptive' | 'fill_in_blank' | 'question' | 'subjective';
  options?: string[];
  correctAnswer?: string | string[];
  marks?: number;
  image?: string;
  diagram?: string;
  explanation?: string;
  text?: string;
}

export interface TestResult {
  totalScore: number;
  maxScore: number;
  sectionScores: {
    [key: string]: {
      score: number;
      total: number;
    }
  };
  questionResults: QuestionResult[];
}

export interface QuestionResult {
  questionId: string;
  studentAnswer: string | string[];
  isCorrect: boolean;
  marks: number;
  maxMarks: number;
  feedback?: string;
}

export interface ChapterInfo {
  id: string;
  title: string;
  description: string;
  topics: string[];
  completed?: boolean;
}

export interface PaperInfo {
  id: string;
  year: string;
  title: string;
  downloadUrl?: string;
}

export interface PerformanceData {
  date: string;
  score: number;
  maxScore: number;
}

export interface ChapterPerformance {
  chapter: string;
  score: number;
  total: number;
}

export interface MistakeCategory {
  category: string;
  count: number;
}
