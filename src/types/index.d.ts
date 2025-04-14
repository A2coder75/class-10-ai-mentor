
export interface Question {
  id?: string;
  question_number?: string;
  section?: string;
  type: 'mcq' | 'descriptive' | 'fill_in_blank' | 'question' | 'subjective' | 'numerical';
  question: string;
  options?: string[];
  correct_answer?: string | string[];
  marks?: number;
  question_text?: string;
  correctAnswer?: string | string[];
  image?: string;
  diagram?: string;
  explanation?: string;
  text?: string;
}

export interface TestResult {
  totalScore: number;
  maxScore: number;
  sectionScores: { [key: string]: { score: number; total: number } };
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

export interface GradeRequest {
  questions: {
    section: string;
    question_number: string;
    student_answer: string;
  }[];
}

export interface QuestionEvaluation {
  question_number: string;
  section: string;
  marks_awarded: number;
  total_marks?: number;
  missing_or_wrong: string[];
  final_feedback: string;
  mistake?: string | string[];
  correct_answer?: string | string[];
  mistake_type?: string | string[];
}

export interface GradeResponse {
  evaluations: QuestionEvaluation[];
}

// Updated interfaces for the doubts feature with chat support
export interface Doubt {
  prompt: string;
  important: boolean;
  context?: Message[];
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

export interface AIModelResponse {
  model: string;
  answer: string;
  tokens_used: number;
}

export interface DoubtsResponse {
  response: AIModelResponse;
}

export interface ChatHistory {
  id: string;
  title: string;
  messages: Message[];
  important: boolean;
  lastUpdated: string;
}

