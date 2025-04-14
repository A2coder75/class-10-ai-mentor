export interface Question {
  id?: string;
  question_number?: string;
  section?: string;
  type: string;
  question: string;
  options?: string[];
  correct_answer?: string | string[];
  marks?: number;
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

export interface GradeRequest {
  questions: {
    section: string;
    question_number: string;
    student_answer: string;
  }[];
}

export interface GradeResponse {
  evaluations: QuestionEvaluation[];
}

// Updated QuestionEvaluation interface to match the new format
export interface QuestionEvaluation {
  question_number: string;
  section: string;
  marks_awarded: number;
  mistake?: string | string[];
  correct_answer?: string | string[];
  mistake_type?: string | string[];
  total_marks?: number; // For backward compatibility
  missing_or_wrong?: string[]; // For backward compatibility
  final_feedback?: string; // For backward compatibility
}

// Add interfaces for the doubts feature
export interface Doubt {
  prompt: string;
  important: boolean;
}

export interface AIModelResponse {
  model: string;
  answer: string;
  tokens_used: number;
}

export interface DoubtsResponse {
  response: AIModelResponse;
}
