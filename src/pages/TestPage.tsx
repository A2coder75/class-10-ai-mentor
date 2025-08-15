import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { PdfScrollViewer } from "@/components/PdfScrollViewer";
import {
  Loader2, ChevronLeft, ChevronRight, CheckCircle2, 
  FileText, Target, BarChart3, Clock, Lightbulb,
  Keyboard, Save, SkipForward, ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";

// ✅ Use shared API utilities
import { fetchQuestionsFromAPI, gradeQuestions } from "../utils/api";

const FILENAME = "physics/IcseX2024PhysicsBoard";

type FieldType = "mcq" | "numerical" | "descriptive" | "long_answer";

type FieldItem = {
  question_number: string;
  type: FieldType | string;
  marks: number;
  correct_answer: string;
  user_answer?: string;
  question?: string;
  question_text?: string;
  text?: string;
  options?: string[];
};

type GradeEvaluation = {
  question_number: string;
  type?: string;
  verdict?: "correct" | "wrong" | "partially correct";
  marks_awarded: number;
  total_marks: number;
  mistake?: string[] | string;
  correct_answer?: string[] | string;
  mistake_type?: string[] | string;
  feedback?: string | string[];
};

export default function TestPage() {
  const navigate = useNavigate();
  const [pdfUrl, setPdfUrl] = useState<string>("");
  const [fields, setFields] = useState<FieldItem[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [grading, setGrading] = useState(false);
  const [gradingProgress, setGradingProgress] = useState(0);
  const [evaluations, setEvaluations] = useState<GradeEvaluation[] | null>(null);
  const [timeSpent, setTimeSpent] = useState(0);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const pdfPaneRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  // Timer for time tracking
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeSpent(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Autosave functionality
  useEffect(() => {
    const saved = localStorage.getItem('testAnswers');
    if (saved) {
      try {
        setAnswers(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load saved answers:', e);
      }
    }
  }, []);

  useEffect(() => {
    if (Object.keys(answers).length > 0) {
      localStorage.setItem('testAnswers', JSON.stringify(answers));
      setLastSaved(new Date());
    }
  }, [answers]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return; // Don't interfere with typing
      }

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          goPrev();
          break;
        case 'ArrowRight':
          e.preventDefault();
          goNext();
          break;
        case 'Enter':
          e.preventDefault();
          handleSaveNext();
          break;
        case 'a':
        case 'A':
          if (currentField?.type === 'mcq' && currentField?.options) {
            e.preventDefault();
            setCurrentAnswer(currentField.options[0] || '');
          }
          break;
        case 'b':
        case 'B':
          if (currentField?.type === 'mcq' && currentField?.options) {
            e.preventDefault();
            setCurrentAnswer(currentField.options[1] || '');
          }
          break;
        case 'c':
        case 'C':
          if (currentField?.type === 'mcq' && currentField?.options) {
            e.preventDefault();
            setCurrentAnswer(currentField.options[2] || '');
          }
          break;
        case 'd':
        case 'D':
          if (currentField?.type === 'mcq' && currentField?.options) {
            e.preventDefault();
            setCurrentAnswer(currentField.options[3] || '');
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeydown);
    return () => document.removeEventListener('keydown', handleKeydown);
  }, [currentIndex, fields]);

  // Fetch fields + PDF from API utils
  useEffect(() => {
    const loadQuestions = async () => {
      setLoadingQuestions(true);
      try {
        const { fields, pdfUrl } = await fetchQuestionsFromAPI(FILENAME);

        const normalized: FieldItem[] = fields.map((f: any) => ({
          question_number: f.question_number || `${Math.random()}`,
          type: f.type === "long_answer" || f.type === "descriptive" ? "descriptive" : (f.type as FieldType),
          marks: f.marks || 1,
          correct_answer: f.correct_answer || '',
          question: f.question || f.question_text || f.text || '',
          options: f.options,
          user_answer: f.user_answer || ''
        }));

        setFields(normalized);
        setPdfUrl(pdfUrl);

        toast({
          title: "Test loaded successfully! 🎉",
          description: `Ready to answer ${normalized.length} questions`,
        });
      } catch (e) {
        console.error(e);
        toast({
          title: "Failed to load test",
          description: "Could not fetch test files from server.",
          variant: "destructive",
        });
      } finally {
        setLoadingQuestions(false);
      }
    };
    loadQuestions();
  }, []);

  const fieldsWithUser = useMemo(
    () =>
      fields.map((f) => ({
        ...f,
        user_answer: answers[f.question_number] ?? f.user_answer ?? "",
      })),
    [fields, answers]
  );

  const attempted = useMemo(
    () =>
      fieldsWithUser.filter((f) => f.user_answer && f.user_answer.trim() !== ""),
    [fieldsWithUser]
  );

  const progressPct = useMemo(() => {
    if (fields.length === 0) return 0;
    return Math.round((attempted.length / fields.length) * 100);
  }, [attempted.length, fields.length]);

  const currentField = useMemo(() => {
    return fieldsWithUser[currentIndex] || null;
  }, [fieldsWithUser, currentIndex]);

  const setCurrentAnswer = (value: string) => {
    if (!currentField) return;
    setAnswers((prev) => ({
      ...prev,
      [currentField.question_number]: value,
    }));
  };

  const goPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const goNext = () => {
    if (currentIndex < fields.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleSkip = () => {
    goNext();
  };

  const handleSaveNext = () => {
    if (currentField && inputRef.current) {
      inputRef.current.blur(); // Save any pending input
    }
    
    toast({
      title: "Answer saved ✓",
      description: `Question ${currentField?.question_number} saved`,
    });
    
    goNext();
  };

  const handleSubmit = async () => {
    if (attempted.length === 0) {
      toast({
        title: "No answers to submit",
        description: "Please answer at least one question before submitting.",
        variant: "destructive",
      });
      return;
    }

    setGrading(true);
    setGradingProgress(0);

    try {
      const questionsToGrade = attempted.map((f) => ({
        question_number: f.question_number,
        type: f.type,
        marks: f.marks,
        correct_answer: f.correct_answer,
        user_answer: f.user_answer!,
      }));

      // Progress simulation
      const progressInterval = setInterval(() => {
        setGradingProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      const result = await gradeQuestions({ questions: questionsToGrade });
      
      clearInterval(progressInterval);
      setGradingProgress(100);

      // Map result to expected format
      const mappedEvaluations = result.evaluations.map((e: any) => ({
        ...e,
        verdict: e.verdict === 'partial' ? 'partially correct' : e.verdict
      }));

      setEvaluations(mappedEvaluations);
      
      // Store in localStorage and navigate to results
      const resultsData = {
        evaluations: result.evaluations, // Keep original format for results page
        total_marks_awarded: result.evaluations.reduce((sum: number, e: any) => sum + e.marks_awarded, 0),
        total_marks_possible: result.evaluations.reduce((sum: number, e: any) => sum + e.total_marks, 0)
      };
      
      localStorage.setItem('lastEvaluations', JSON.stringify(resultsData));
      localStorage.removeItem('testAnswers'); // Clear saved answers
      
      toast({
        title: "Test completed! 🎉",
        description: "Redirecting to results...",
      });

      setTimeout(() => {
        navigate('/test/results', { state: resultsData });
      }, 1500);

    } catch (error) {
      console.error("Grading failed:", error);
      toast({
        title: "Grading failed",
        description: "Please try again or contact support.",
        variant: "destructive",
      });
      setGrading(false);
      setGradingProgress(0);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getQuestionText = (field: FieldItem) => {
    return field.question || field.question_text || field.text || `Question ${field.question_number}`;
  };

  // Input Components
  const MCQEntry = ({ field }: { field: FieldItem }) => {
    if (!field.options || field.options.length === 0) {
      return <div className="text-sm text-muted-foreground">No options available</div>;
    }

    const labels = ['A', 'B', 'C', 'D'];
    
    return (
      <div className="space-y-3">
        {field.options.map((option, idx) => (
          <Button
            key={idx}
            variant={answers[field.question_number] === option ? "default" : "outline"}
            className={cn(
              "w-full justify-start text-left h-auto py-3 px-4 transition-all duration-200",
              answers[field.question_number] === option 
                ? "bg-primary text-primary-foreground shadow-lg scale-[1.02]" 
                : "hover:shadow-md hover:scale-[1.01]"
            )}
            onClick={() => setCurrentAnswer(option)}
          >
            <span className={cn(
              "font-bold mr-3 px-2 py-1 rounded text-xs",
              answers[field.question_number] === option 
                ? "bg-primary-foreground text-primary" 
                : "bg-muted text-muted-foreground"
            )}>
              {labels[idx]}
            </span>
            <span className="flex-1">{option}</span>
          </Button>
        ))}
      </div>
    );
  };

  const NumericalEntry = ({ field }: { field: FieldItem }) => (
    <Input
      ref={inputRef as React.RefObject<HTMLInputElement>}
      type="text"
      inputMode="decimal"
      value={answers[field.question_number] || ""}
      onChange={(e) => setCurrentAnswer(e.target.value)}
      placeholder="Enter your numerical answer..."
      className="text-lg h-12 transition-all duration-200 focus:shadow-lg"
      autoFocus
    />
  );

  const DescriptiveEntry = ({ field }: { field: FieldItem }) => (
    <Textarea
      ref={inputRef as React.RefObject<HTMLTextAreaElement>}
      value={answers[field.question_number] || ""}
      onChange={(e) => setCurrentAnswer(e.target.value)}
      placeholder="Write your detailed answer here..."
      className="min-h-[120px] text-base transition-all duration-200 focus:shadow-lg resize-none"
      autoFocus
    />
  );

  // Right Panel Component
  const RightTile = () => {
    if (loadingQuestions) {
      return (
        <Card className="sticky top-4 h-fit glass-morphism">
          <CardContent className="p-8 text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            <p className="text-sm text-muted-foreground">Loading questions...</p>
          </CardContent>
        </Card>
      );
    }

    if (fields.length === 0) {
      return (
        <Card className="sticky top-4 h-fit glass-morphism">
          <CardContent className="p-8 text-center space-y-4">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
            <div>
              <h3 className="text-lg font-semibold">No Questions Found</h3>
              <p className="text-sm text-muted-foreground">
                Unable to load test questions. Please try refreshing.
              </p>
            </div>
          </CardContent>
        </Card>
      );
    }

    const field = currentField;
    if (!field) return null;

    return (
      <div className="space-y-4">
        {/* Progress Header */}
        <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-primary/20">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Test Progress</CardTitle>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {formatTime(timeSpent)}
                </div>
                {lastSaved && (
                  <div className="text-xs text-green-600 dark:text-green-400">
                    ✓ Auto-saved
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{attempted.length} of {fields.length} answered</span>
                <span>{progressPct}%</span>
              </div>
              <Progress value={progressPct} className="h-2" />
            </div>
          </CardHeader>
        </Card>

        {/* Question Navigator */}
        <Card className="glass-morphism">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-primary" />
              Quick Navigator
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-6 gap-2">
              {fields.map((f, idx) => (
                <Button
                  key={f.question_number}
                  variant={
                    idx === currentIndex ? "default" : 
                    answers[f.question_number] ? "secondary" : "outline"
                  }
                  size="sm"
                  className={cn(
                    "h-8 text-xs transition-all duration-200",
                    idx === currentIndex && "shadow-lg scale-110",
                    answers[f.question_number] && idx !== currentIndex && "bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700"
                  )}
                  onClick={() => setCurrentIndex(idx)}
                >
                  {f.question_number}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Current Question */}
        <Card className="glass-morphism animate-fade-in">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="font-mono">
                  Q{field.question_number}
                </Badge>
                <Badge variant="secondary">
                  {field.marks} mark{field.marks !== 1 ? 's' : ''}
                </Badge>
                <Badge variant="outline" className="uppercase text-xs">
                  {field.type}
                </Badge>
              </div>
              <div className="text-sm text-muted-foreground">
                {currentIndex + 1} of {fields.length}
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6 animate-scale-in">
            {/* Question Text */}
            <div className="bg-muted/30 rounded-lg p-4 border">
              <h3 className="font-medium text-base leading-relaxed">
                {getQuestionText(field)}
              </h3>
            </div>

            {/* Answer Input */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-muted-foreground">Your Answer:</label>
              
              {field.type === "mcq" && <MCQEntry field={field} />}
              {field.type === "numerical" && <NumericalEntry field={field} />}
              {(field.type === "descriptive" || field.type === "long_answer") && <DescriptiveEntry field={field} />}
            </div>

            {/* Keyboard Shortcuts Hint */}
            <div className="text-xs text-muted-foreground bg-muted/20 rounded p-2 flex items-center gap-2">
              <Keyboard className="h-3 w-3" />
              <span>Tips: Use ← → arrows to navigate, Enter to save & next</span>
              {field.type === "mcq" && <span>• A/B/C/D for options</span>}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <Card className="glass-morphism">
          <CardContent className="p-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goPrev}
                  disabled={currentIndex === 0}
                  className="flex items-center gap-1"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Prev
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSkip}
                  disabled={currentIndex === fields.length - 1}
                  className="flex items-center gap-1"
                >
                  Skip
                  <SkipForward className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleSaveNext}
                  disabled={currentIndex === fields.length - 1}
                  className="flex items-center gap-1"
                >
                  <Save className="h-4 w-4" />
                  Save & Next
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goNext}
                  disabled={currentIndex === fields.length - 1}
                  className="flex items-center gap-1"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {/* Submit Button */}
            <Button
              onClick={handleSubmit}
              disabled={grading || attempted.length === 0}
              className="w-full mt-4 h-11 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {grading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Grading... {gradingProgress}%
                </>
              ) : (
                <>
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Submit Test ({attempted.length} answers)
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-primary/5">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/20 via-primary/10 to-transparent border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Physics Practice Test
              </h1>
              <p className="text-muted-foreground">ICSE Class X Board Examination</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>{attempted.length} completed</span>
              </div>
              <Badge variant="outline" className="font-mono">
                Time: {formatTime(timeSpent)}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* PDF Viewer */}
          <div className="lg:col-span-2">
            <Card className="h-[calc(100vh-200px)] overflow-hidden shadow-xl">
              <CardHeader className="pb-4 bg-gradient-to-r from-primary/5 to-transparent">
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Question Paper
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 h-full">
                {pdfUrl ? (
                  <PdfScrollViewer url={pdfUrl} className="h-full" />
                ) : (
                  <div className="flex items-center justify-center h-full bg-muted/20">
                    <div className="text-center space-y-2">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                      <p className="text-sm text-muted-foreground">Loading PDF...</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Answer Panel */}
          <div className="lg:col-span-1">
            <RightTile />
          </div>
        </div>
      </div>
    </div>
  );
}