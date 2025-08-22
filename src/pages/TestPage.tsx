import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
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
  Keyboard, Save, SkipForward
} from "lucide-react";
import { cn } from "@/lib/utils";

// ✅ Shared API utilities
import { fetchQuestionsFromAPI, gradeQuestions } from "../utils/api";

// ====== Config ======
const FILENAME = "physics/IcseX2024PhysicsBoard";

type FieldType = "mcq" | "numerical" | "long_answer";

type FieldItem = {
  question_number: string;
  type: FieldType;
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

// ====== Small helpers ======
const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

const getQuestionText = (f: FieldItem) =>
  f.question || f.question_text || f.text || `Question ${f.question_number}`;

// ====== Answer Inputs ======
function MCQEntry({
  field,
  value,
  onChange,
}: {
  field: FieldItem;
  value: string;
  onChange: (v: string) => void;
}) {
  const labels = ["A", "B", "C", "D"];
  
  // Always show 4 options regardless of whether they have text
  const displayOptions = Array.from({ length: 4 }, (_, idx) => {
    return field.options && field.options[idx] ? field.options[idx] : "";
  });
  
  return (
    <div className="space-y-3">
      {displayOptions.map((option, idx) => (
        <Button
          key={idx}
          variant={value === labels[idx] ? "default" : "outline"}
          className={cn(
            "w-full justify-start text-left h-auto py-3 px-4 transition-all duration-200 rounded-xl",
            value === labels[idx]
              ? "bg-primary text-primary-foreground shadow-lg scale-[1.01]"
              : "hover:shadow-md hover:scale-[1.005]"
          )}
          onClick={() => onChange(labels[idx])}
        >
          <span
            className={cn(
              "font-bold mr-3 px-2 py-1 rounded text-xs",
              value === labels[idx] ? "bg-primary-foreground text-primary" : "bg-muted text-muted-foreground"
            )}
          >
            {labels[idx]}
          </span>
          <span className="flex-1">{option || `Option ${labels[idx]}`}</span>
        </Button>
      ))}
    </div>
  );
}

function NumericalEntry({
  value,
  onChange,
  inputRef,
}: {
  value: string;
  onChange: (v: string) => void;
  inputRef: React.RefObject<HTMLInputElement>;
}) {
  return (
    <Input
      ref={inputRef}
      type="text"
      inputMode="decimal"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Enter your numerical answer…"
      className="text-lg h-12 transition-all duration-200 focus:shadow-lg rounded-xl"
    />
  );
}

function LongAnswerEntry({
  value,
  onChange,
  inputRef,
}: {
  value: string;
  onChange: (v: string) => void;
  inputRef: React.RefObject<HTMLTextAreaElement>;
}) {
  return (
    <Textarea
      ref={inputRef}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Write your detailed answer here…"
      className="min-h-[140px] text-base transition-all duration-200 focus:shadow-lg rounded-xl resize-none"
    />
  );
}

// ====== Right Panel (isolated re-renders) ======
function RightPanel({
  fields,
  currentIndex,
  setCurrentIndex,
  answers,
  setCurrentAnswer,
  onSaveNext,
  onPrev,
  onNext,
  onSkip,
  onSubmit,
  grading,
  gradingProgress,
}: {
  fields: FieldItem[];
  currentIndex: number;
  setCurrentIndex: (i: number) => void;
  answers: Record<string, string>;
  setCurrentAnswer: (v: string) => void;
  onSaveNext: () => void;
  onPrev: () => void;
  onNext: () => void;
  onSkip: () => void;
  onSubmit: () => void;
  grading: boolean;
  gradingProgress: number;
}) {
  // ⏱ Keep timer local so only this panel re-renders
  const [timeSpent, setTimeSpent] = useState(0);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  useEffect(() => {
    const id = setInterval(() => setTimeSpent((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  // Listen to custom event to update "last saved" without re-rendering whole page
  useEffect(() => {
    const handler = (e: any) => setLastSaved(new Date(e.detail));
    window.addEventListener("answers-saved", handler as EventListener);
    return () => window.removeEventListener("answers-saved", handler as EventListener);
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
    () => fieldsWithUser.filter((f) => f.user_answer && f.user_answer.trim() !== ""),
    [fieldsWithUser]
  );

  const progressPct = useMemo(() => {
    if (fields.length === 0) return 0;
    return Math.round((attempted.length / fields.length) * 100);
  }, [attempted.length, fields.length]);

  const field = fieldsWithUser[currentIndex] || null;

  if (!fields.length || !field) {
    return (
      <Card className="sticky top-4 h-fit glass-card">
        <CardContent className="p-8 text-center space-y-4">
          <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
          <div>
            <h3 className="text-lg font-semibold">No Questions Found</h3>
            <p className="text-sm text-muted-foreground">Unable to load test questions.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const val = answers[field.question_number] || "";

  return (
    <div className="space-y-4">
      {/* Progress */}
      <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-primary/20 shadow-xl rounded-2xl">
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
                <div className="text-xs text-green-600 dark:text-green-400">✓ Auto-saved</div>
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

      {/* Current Question */}
      <Card className="glass-card motion-fade-in">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="font-mono rounded-lg">
                Q{field.question_number}
              </Badge>
              <Badge variant="secondary" className="rounded-lg">
                {field.marks} mark{field.marks !== 1 ? "s" : ""}
              </Badge>
              <Badge variant="outline" className="uppercase text-xs rounded-lg">
                {field.type}
              </Badge>
            </div>
            <div className="text-sm text-muted-foreground">
              {currentIndex + 1} of {fields.length}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="bg-muted/30 rounded-xl p-4 border">
            <h3 className="font-medium text-base leading-relaxed">
              {getQuestionText(field)}
            </h3>
          </div>

          {/* Answer Input */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-muted-foreground">Your Answer:</label>

            {field.type === "mcq" && (
              <MCQEntry
                field={field}
                value={val}
                onChange={setCurrentAnswer}
              />
            )}

            {field.type === "numerical" && (
              <NumericalEntry
                value={val}
                onChange={setCurrentAnswer}
                inputRef={React.createRef<HTMLInputElement>()}
              />
            )}

            {field.type === "long_answer" && (
              <LongAnswerEntry
                value={val}
                onChange={setCurrentAnswer}
                inputRef={React.createRef<HTMLTextAreaElement>()}
              />
            )}
          </div>

          {/* Shortcuts */}
          <div className="text-xs text-muted-foreground bg-muted/20 rounded p-2 flex items-center gap-2">
            <Keyboard className="h-3 w-3" />
            <span>Tips: Use ← → to navigate, Enter to save & next</span>
            {field.type === "mcq" && <span>• A/B/C/D for options</span>}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <Card className="glass-card">
        <CardContent className="p-4">
          <div className="flex flex-col gap-3">
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onPrev}
                disabled={currentIndex === 0}
                className="flex-1 flex items-center justify-center gap-1 rounded-lg"
              >
                <ChevronLeft className="h-4 w-4" />
                Prev
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onSkip}
                disabled={currentIndex === fields.length - 1}
                className="flex-1 flex items-center justify-center gap-1 rounded-lg"
              >
                Skip
                <SkipForward className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex gap-2">
              <Button
                variant="default"
                size="sm"
                onClick={onSaveNext}
                disabled={currentIndex === fields.length - 1}
                className="flex-1 flex items-center justify-center gap-1 rounded-lg"
              >
                <Save className="h-4 w-4" />
                Save & Next
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onNext}
                disabled={currentIndex === fields.length - 1}
                className="flex-1 flex items-center justify-center gap-1 rounded-lg"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <Button
            onClick={onSubmit}
            disabled={grading}
            className="w-full mt-4 h-11 fancy-cta"
          >
            {grading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Grading… {gradingProgress}%
              </>
            ) : (
              <>
                <BarChart3 className="mr-2 h-4 w-4" />
                Submit Test
              </>
            )}
          </Button>
        </CardContent>
      </Card>

    </div>
  );
}

// ====== Main Page ======
export default function TestPage() {
  const navigate = useNavigate();

  const [pdfUrl, setPdfUrl] = useState<string>("");
  const [fields, setFields] = useState<FieldItem[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [grading, setGrading] = useState(false);
  const [gradingProgress, setGradingProgress] = useState(0);

  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  // Load saved answers once
  useEffect(() => {
    const saved = localStorage.getItem("testAnswers");
    if (saved) {
      try {
        setAnswers(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load saved answers:", e);
      }
    }
  }, []);

  // Debounced autosave (fixes constant re-render vibe)
  useEffect(() => {
    if (Object.keys(answers).length === 0) return;
    const t = setTimeout(() => {
      localStorage.setItem("testAnswers", JSON.stringify(answers));
      // Tell RightPanel that we saved (so it can show ✓)
      window.dispatchEvent(new CustomEvent("answers-saved", { detail: Date.now() }));
    }, 1200);
    return () => clearTimeout(t);
  }, [answers]);

  // Fetch fields + PDF
  useEffect(() => {
    const loadQuestions = async () => {
      setLoadingQuestions(true);
      try {
        const { fields, pdfUrl } = await fetchQuestionsFromAPI(FILENAME);

        // 🔧 Normalize to our canonical types. You said field type is long_answer.
        const normalized: FieldItem[] = fields.map((f: any) => {
          // keep mcq & numerical, force long answers to "long_answer"
          const rawType = (f.type || "").toLowerCase();
          const t: FieldType =
            rawType === "mcq" ? "mcq" :
            rawType === "numerical" ? "numerical" :
            "long_answer";

          return {
            question_number: String(f.question_number || `${Math.random()}`),
            type: t,
            marks: Number(f.marks ?? 1),
            correct_answer: f.correct_answer ?? "",
            question: f.question || f.question_text || f.text || "",
            options: f.options,
            user_answer: f.user_answer || "",
          };
        });

        setFields(normalized);
        setPdfUrl(pdfUrl);

        toast({
          title: "Test loaded 🎉",
          description: `Ready to answer ${normalized.length} questions`,
        });
      } catch (e) {
        console.error(e);
        
        // Add error handling UI here
        const errorMsg = e instanceof Error ? e.message : "Unknown error";
        toast({
          title: "Loading failed",
          description: errorMsg.includes('timeout') || errorMsg.includes('AbortError') 
            ? "Connection timeout - using demo data" 
            : "Could not fetch test files from server.",
          variant: "default",
        });
      } finally {
        setLoadingQuestions(false);
      }
    };
    loadQuestions();
  }, []);

  // Keyboard shortcuts
  const currentField = fields[currentIndex];
  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault();
          goPrev();
          break;
        case "ArrowRight":
          e.preventDefault();
          goNext();
          break;
        case "Enter":
          e.preventDefault();
          handleSaveNext();
          break;
        case "a":
        case "A":
        case "b":
        case "B":
        case "c":
        case "C":
        case "d":
        case "D":
          if (currentField?.type === "mcq" && currentField?.options) {
            e.preventDefault();
            const map = { a: 0, b: 1, c: 2, d: 3 } as const;
            const idx = map[e.key.toLowerCase() as "a" | "b" | "c" | "d"];
            const opt = currentField.options[idx];
            if (opt) setCurrentAnswer(opt);
          }
          break;
      }
    };
    document.addEventListener("keydown", handleKeydown);
    return () => document.removeEventListener("keydown", handleKeydown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, fields]);

  const setCurrentAnswer = useCallback((value: string) => {
    const f = fields[currentIndex];
    if (!f) return;
    setAnswers((prev) => ({ ...prev, [f.question_number]: value }));
  }, [fields, currentIndex]);

  const goPrev = () => setCurrentIndex((i) => Math.max(0, i - 1));
  const goNext = () => setCurrentIndex((i) => Math.min(fields.length - 1, i + 1));
  const handleSkip = () => goNext();

  const handleSaveNext = () => {
    if (currentField && inputRef.current) inputRef.current.blur();
    toast({ title: "Answer saved ✓", description: `Question ${currentField?.question_number} saved` });
    goNext();
  };

  const handleSubmit = async () => {
    const attempted = fields
      .map((f) => ({ ...f, user_answer: answers[f.question_number] ?? f.user_answer ?? "" }))
      .filter((f) => f.user_answer && f.user_answer.trim() !== "");

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

      const progressInterval = setInterval(() => {
        setGradingProgress((p) => Math.min(p + 10, 90));
      }, 180);

      const result = await gradeQuestions({ questions: questionsToGrade });

      clearInterval(progressInterval);
      setGradingProgress(100);

      const resultsData = {
        evaluations: result.evaluations,
        total_marks_awarded: result.evaluations.reduce((sum: number, e: any) => sum + e.marks_awarded, 0),
        total_marks_possible: result.evaluations.reduce((sum: number, e: any) => sum + e.total_marks, 0),
      };

      localStorage.setItem("lastEvaluations", JSON.stringify(resultsData));
      localStorage.removeItem("testAnswers");

      toast({ title: "Test completed! 🎉", description: "Redirecting to results..." });
      setTimeout(() => navigate("/test/results", { state: resultsData }), 1200);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-primary/5">
      {/* Hero Header */}
      <div className="animated-hero border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white drop-shadow-sm">
                Physics Practice Test
              </h1>
              <p className="text-white/80">ICSE Class X Board Examination</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-white/90">
                <CheckCircle2 className="h-4 w-4" />
                <span>
                  {Object.values(answers).filter((v) => v && v.trim() !== "").length} completed
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main */}
     // ... (previous code remains the same)

{/* Main */}
<div className="max-w-7xl mx-auto p-4">
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
    {/* Left Column - PDF Viewer and Navigation */}
    <div className="lg:col-span-2 space-y-6">
      {/* PDF Viewer */}
      <Card className="h-[calc(70vh-100px)] overflow-hidden shadow-2xl rounded-2xl border-0 glass-pane">
        <CardHeader className="pb-4 bg-gradient-to-r from-primary/10 to-transparent">
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
                <p className="text-sm text-muted-foreground">Loading PDF…</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Navigation Panel - Now positioned below PDF */}
      <Card className="glass-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-primary" />
            Quick Navigation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-8 md:grid-cols-12 lg:grid-cols-16 gap-2">
            {fields.map((f, idx) => (
              <Button
                key={f.question_number}
                variant={
                  idx === currentIndex
                    ? "default"
                    : answers[f.question_number]
                      ? "secondary"
                      : "outline"
                }
                size="sm"
                className={cn(
                  "h-10 text-xs transition-all duration-200 rounded-lg",
                  idx === currentIndex && "shadow-lg scale-110 ring-2 ring-primary/50",
                  answers[f.question_number] &&
                    idx !== currentIndex &&
                    "bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700"
                )}
                onClick={() => setCurrentIndex(idx)}
              >
                {f.question_number}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>

    {/* Right Column - Side Panel */}
    <div className="lg:col-span-1">
      {loadingQuestions ? (
        <Card className="sticky top-4 h-fit glass-card">
          <CardContent className="p-8 text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            <p className="text-sm text-muted-foreground">Loading questions…</p>
          </CardContent>
        </Card>
      ) : (
        <RightPanel
          fields={fields}
          currentIndex={currentIndex}
          setCurrentIndex={setCurrentIndex}
          answers={answers}
          setCurrentAnswer={setCurrentAnswer}
          onSaveNext={handleSaveNext}
          onPrev={goPrev}
          onNext={goNext}
          onSkip={handleSkip}
          onSubmit={handleSubmit}
          grading={grading}
          gradingProgress={gradingProgress}
        />
      )}
    </div>
  </div>
</div>
      </div>
  );
}
