
export interface Question {
  id?: string;
  question_number: string; // Make required
  section?: string;
  type: string | 'mcq' | 'descriptive' | 'fill_in_blank' | 'question' | 'subjective' | 'numerical';
  question: string;
  options?: string[];
  correct_answer?: string | string[];
  marks: number; // Make required
  question_text?: string;
  correctAnswer?: string | string[];
  image?: string;
  diagram?: string;
  explanation?: string;
  text?: string;
}

export interface GradeEvaluation {
  question_number: string;
  type: string;
  verdict: "correct" | "wrong" | "partially correct";
  marks_awarded: number;
  total_marks: number;
  mistake: string;
  correct_answer: string;
  mistake_type: string;
  feedback: string;
}

export interface TestResult {
  totalScore: number;
  maxScore: number;
  sectionScores: { [key: string]: { score: number; total: number } };
  questionResults: QuestionResult[];
  previousScore?: number; // Optional property for comparing to previous attempts
  mistakeTypes?: MistakeCategory[]; // Optional analysis of mistake types
  timeSpent?: number; // Total time spent in minutes
}

export interface QuestionResult {
  questionId: string;
  studentAnswer: string | string[];
  isCorrect: boolean;
  marks: number;
  maxMarks: number;
  feedback?: string;
  timeSpent?: number; // Time spent on this question in seconds
  mistakeType?: string; // Category of mistake if wrong
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
  questions: any[]; // Keep flexible for existing payload
}

export interface QuestionEvaluation {
  question_number: string;
  section: string;
  verdict?: "correct" | "wrong" | "partial";  // Updated to include 'partial'
  marks_awarded: number;
  total_marks: number;
  missing_or_wrong: string[];
  final_feedback?: string;
  mistake?: string | string[];
  correct_answer?: string | string[];
  mistake_type?: string | string[];
}

export interface GradeResponse {
  evaluations: QuestionEvaluation[];
}

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

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ChatHistory {
  prompt: string;
  messages: ChatMessage[];
  important: boolean;
  lastUpdated: Date;
}

export interface DoubtsRequest {
  prompt: string;
  important: boolean;
  context?: string[];
}

// Study planner interfaces
export interface Subject {
  id: string;
  name: string;
  color: string;
  totalTopics: number;
  completedTopics: number;
  topics: Topic[];
}

export interface Topic {
  id: string;
  name: string;
  status: 'completed' | 'in-progress' | 'not-started';
  subjectId: string;
}

export interface StudyPlannerFormInputs {
  studyHoursPerDay: number;
  daysPerWeek: string[];
  strengths: string[];
  weakSubjects: string[];
  targetExamDate: Date;
  preferredStudyTime: 'morning' | 'afternoon' | 'evening' | 'night';
}

export interface PlannerTask {
  subject: string;
  chapter: string;
  task_type: 'learning' | 'revision' | 'practice';
  estimated_time: number;
  status: 'pending' | 'completed';
}

export interface PlannerBreak {
  break: number;
}

export interface PlannerDay {
  date: string;
  tasks: (PlannerTask | PlannerBreak)[];
}

export interface PlannerWeek {
  week_number: number;
  days: PlannerDay[];
}

export interface StudyPlan {
  target_date: string;
  study_plan: PlannerWeek[];
}

export interface PlannerResponse {
  model: string;
  planner: string;
  tokens_used: number;
}

export interface PomodoroSettings {
  workDuration: number;
  breakDuration: number;
  longBreakDuration: number;
  sessionsBeforeLongBreak: number;
}

export interface ChartData {
  name: string;
  value: number;
  color?: string;
}

export interface ProgressChartProps {
  value: number;
  maxValue: number;
  label?: string;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "success" | "warning" | "danger" | "info" | "gradient";
  animated?: boolean;
  showValue?: boolean;
  formatValue?: (value: number) => string;
}

export interface PlannerResponseInterface {
  model: string;
  planner: string;
  tokens_used: number;
}

export interface TestResultsAnalysisProps {
  plannerResponse?: PlannerResponseInterface;
  questions?: Question[];
  answers?: { [key: string]: string | string[] };
}

export interface TestResultDashboardProps {
  totalScore: number;
  maxScore: number;
  sectionScores: { [key: string]: { score: number; total: number } };
  questionResults: QuestionResult[];
  previousScore?: number; 
}
