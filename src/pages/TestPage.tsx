// ===============================
// File: src/pages/TestPage.tsx
// Insanely aesthetic, fully functional, with fixes:
// - PDF text layer/OCR hidden (via PdfScrollViewer props)
// - Quick Navigator moved below question
// - MCQ/Numerical/Descriptive inputs rendered reliably (robust normalization)
// - No 1s reloads; heavy panes memoized; no polling
// - Gorgeous gradients, glass, motion animations
// ===============================

import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
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

// -------- Helper aesthetic wrappers --------
const GlassCard: React.FC<React.ComponentProps<typeof Card>> = ({ className, children, ...rest }) => (
  <Card
    className={cn(
      "backdrop-blur-xl bg-white/5 dark:bg-white/5 border-white/20 shadow-[0_8px_30px_rgb(0,0,0,0.12)]",
      "rounded-2xl",
      className
    )}
    {...rest}
  >
    {children}
  </Card>
);

// Keep heavy panes from re-rendering on timer ticks
const PdfPane = React.memo(function PdfPane({ url }: { url: string }) {
  return (
    <GlassCard className="h-[calc(100vh-200px)] overflow-hidden">
      <CardHeader className="pb-4 bg-gradient-to-r from-primary/10 to-transparent">
        <CardTitle className="text-lg flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          Question Paper
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 h-full">
        {url ? (
          <PdfScrollViewer
            url={url}
            className="h-full"
            // IMPORTANT: hide text/OCR+annotations
            renderTextLayer={false}
            renderAnnotationLayer={false}
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-muted/20">
            <div className="text-center space-y-2">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
              <p className="text-sm text-muted-foreground">Loading PDF...</p>
            </div>
          </div>
        )}
      </CardContent>
    </GlassCard>
  );
});

export default function TestPage() {
  const navigate = useNavigate();
  const [pdfUrl, setPdfUrl] = useState<string>("");
  const [fields, setFields] = useState<FieldItem[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [grading, setGrading] = useState(false);
  const [gradingProgress, setGradingProgress] = useState(0);
  const [timeSpent, setTimeSpent] = useState(0);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  // Timer (lightweight). We won't tie heavy panes to this re-render.
  useEffect(() => {
    const id = setInterval(() => setTimeSpent((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, []);

  // Load autosave once
  useEffect(() => {
    const saved = localStorage.getItem("testAnswers");
    if (saved) {
      try { setAnswers(JSON.parse(saved)); } catch (e) { console.error(e); }
    }
  }, []);

  // Persist autosave
  useEffect(() => {
    if (Object.keys(answers).length > 0) {
      localStorage.setItem("testAnswers", JSON.stringify(answers));
      setLastSaved(new Date());
    }
  }, [answers]);

  // Fetch fields + PDF
  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoadingQuestions(true);
      try {
        const { fields, pdfUrl } = await fetchQuestionsFromAPI(FILENAME);
        const normalized: FieldItem[] = (fields || []).map((f: any, i: number) => {
          const t = String(f.type || "").toLowerCase();
          const mapped: FieldType = (t === "long_answer" || t === "descriptive")
            ? "descriptive"
            : (t === "mcq" || t === "numerical" ? t : "descriptive");
          return {
            question_number: f.question_number || String(i + 1),
            type: mapped,
            marks: Number(f.marks ?? 1),
            correct_answer: f.correct_answer ?? "",
            question: f.question || f.question_text || f.text || "",
            options: Array.isArray(f.options) ? f.options.filter(Boolean) : [],
            user_answer: f.user_answer || "",
          } as FieldItem;
        });
        if (mounted) {
          setFields(normalized);
          setPdfUrl(pdfUrl);
          toast({
            title: "Test loaded successfully! 🎉",
            description: `Ready to answer ${normalized.length} questions`,
          });
        }
      } catch (e) {
        console.error(e);
        toast({ title: "Failed to load test", description: "Could not fetch test files from server.", variant: "destructive" });
      } finally {
        mounted && setLoadingQuestions(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Keyboard shortcuts
  const currentField = useMemo(() => fields[currentIndex] || null, [fields, currentIndex]);

  const setCurrentAnswer = useCallback((val: string) => {
    if (!currentField) return;
    setAnswers((prev) => ({ ...prev, [currentField.question_number]: val }));
  }, [currentField]);

  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (!currentField) return;
      switch (e.key) {
        case "ArrowLeft": e.preventDefault(); setCurrentIndex((i) => Math.max(0, i - 1)); break;
        case "ArrowRight": e.preventDefault(); setCurrentIndex((i) => Math.min(fields.length - 1, i + 1)); break;
        case "Enter": e.preventDefault(); handleSaveNext(); break;
        case "a": case "A": if (currentField.type === "mcq" && currentField.options?.[0]) { e.preventDefault(); setCurrentAnswer(currentField.options[0]); } break;
        case "b": case "B": if (currentField.type === "mcq" && currentField.options?.[1]) { e.preventDefault(); setCurrentAnswer(currentField.options[1]); } break;
        case "c": case "C": if (currentField.type === "mcq" && currentField.options?.[2]) { e.preventDefault(); setCurrentAnswer(currentField.options[2]); } break;
        case "d": case "D": if (currentField.type === "mcq" && currentField.options?.[3]) { e.preventDefault(); setCurrentAnswer(currentField.options[3]); } break;
      }
    };
    document.addEventListener("keydown", handle);
    return () => document.removeEventListener("keydown", handle);
  }, [fields.length, currentField, setCurrentAnswer]);

  const fieldsWithUser = useMemo(() => fields.map((f) => ({ ...f, user_answer: answers[f.question_number] ?? f.user_answer ?? "" })), [fields, answers]);
  const attempted = useMemo(() => fieldsWithUser.filter((f) => f.user_answer && f.user_answer.trim() !== ""), [fieldsWithUser]);
  const progressPct = useMemo(() => fields.length ? Math.round((attempted.length / fields.length) * 100) : 0, [attempted.length, fields.length]);

  const goPrev = () => setCurrentIndex((i) => Math.max(0, i - 1));
  const goNext = () => setCurrentIndex((i) => Math.min(fields.length - 1, i + 1));
  const handleSkip = () => goNext();

  const handleSaveNext = () => {
    if (currentField && inputRef.current) inputRef.current.blur();
    toast({ title: "Answer saved ✓", description: `Question ${currentField?.question_number} saved` });
    goNext();
  };

  const handleSubmit = async () => {
    if (attempted.length === 0) {
      toast({ title: "No answers to submit", description: "Please answer at least one question before submitting.", variant: "destructive" });
      return;
    }
    setGrading(true); setGradingProgress(0);
    try {
      const questionsToGrade = attempted.map((f) => ({ question_number: f.question_number, type: f.type, marks: f.marks, correct_answer: f.correct_answer, user_answer: f.user_answer! }));
      const id = setInterval(() => setGradingProgress((p) => Math.min(p + 10, 90)), 200);
      const result = await gradeQuestions({ questions: questionsToGrade });
      clearInterval(id); setGradingProgress(100);
      const resultsData = {
        evaluations: result.evaluations,
        total_marks_awarded: result.evaluations.reduce((sum: number, e: any) => sum + e.marks_awarded, 0),
        total_marks_possible: result.evaluations.reduce((sum: number, e: any) => sum + e.total_marks, 0),
      };
      localStorage.setItem("lastEvaluations", JSON.stringify(resultsData));
      localStorage.removeItem("testAnswers");
      toast({ title: "Test completed! 🎉", description: "Redirecting to results..." });
      setTimeout(() => navigate("/test/results", { state: resultsData }), 1200);
    } catch (err) {
      console.error(err);
      toast({ title: "Grading failed", description: "Please try again or contact support.", variant: "destructive" });
      setGrading(false); setGradingProgress(0);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60); const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getQuestionText = (f: FieldItem) => f.question || f.question_text || f.text || `Question ${f.question_number}`;

  const MCQEntry = ({ field }: { field: FieldItem }) => {
    const opts = field.options || [];
    if (!opts.length) return <div className="text-sm text-muted-foreground">No options available</div>;
    const labels = ["A", "B", "C", "D", "E", "F"];
    return (
      <div className="space-y-3">
        {opts.map((option, idx) => (
          <Button
            key={idx}
            variant={answers[field.question_number] === option ? "default" : "outline"}
            className={cn(
              "w-full justify-start text-left h-auto py-3 px-4 transition-all duration-300 rounded-xl",
              answers[field.question_number] === option
                ? "bg-primary text-primary-foreground shadow-xl scale-[1.02]"
                : "hover:shadow-lg hover:scale-[1.01]"
            )}
            onClick={() => setCurrentAnswer(option)}
          >
            <span className={cn(
              "font-bold mr-3 px-2 py-1 rounded text-xs",
              answers[field.question_number] === option ? "bg-primary-foreground text-primary" : "bg-muted text-muted-foreground"
            )}>
              {labels[idx] || String.fromCharCode(65 + idx)}
            </span>
            <span className="flex-1 leading-relaxed">{option}</span>
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
      className="min-h-[140px] text-base transition-all duration-200 focus:shadow-lg resize-y"
      autoFocus
    />
  );

  const RightTile = () => {
    if (loadingQuestions) {
      return (
        <GlassCard className="sticky top-4 h-fit">
          <CardContent className="p-8 text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            <p className="text-sm text-muted-foreground">Loading questions...</p>
          </CardContent>
        </GlassCard>
      );
    }

    if (!fields.length) {
      return (
        <GlassCard className="sticky top-4 h-fit">
          <CardContent className="p-8 text-center space-y-4">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
            <div>
              <h3 className="text-lg font-semibold">No Questions Found</h3>
              <p className="text-sm text-muted-foreground">Unable to load test questions. Please try refreshing.</p>
            </div>
          </CardContent>
        </GlassCard>
      );
    }

    const field = currentField!;

    return (
      <div className="space-y-4">
        {/* Progress Header */}
        <GlassCard className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-primary/20">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Test Progress</CardTitle>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-1"><Clock className="h-4 w-4" />{formatTime(timeSpent)}</div>
                {lastSaved && (<div className="text-xs text-green-600 dark:text-green-400">✓ Auto-saved</div>)}
              </div>
            </div>
            <div className="space-y-2 mt-2">
              <div className="flex justify-between text-sm"><span>{attempted.length} of {fields.length} answered</span><span>{progressPct}%</span></div>
              <Progress value={progressPct} className="h-2" />
            </div>
          </CardHeader>
        </GlassCard>

        {/* Current Question */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
          <GlassCard className="">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="font-mono">Q{field.question_number}</Badge>
                  <Badge variant="secondary">{field.marks} mark{field.marks !== 1 ? "s" : ""}</Badge>
                  <Badge variant="outline" className="uppercase text-xs">{field.type}</Badge>
                </div>
                <div className="text-sm text-muted-foreground">{currentIndex + 1} of {fields.length}</div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-muted/30 rounded-lg p-4 border">
                <h3 className="font-medium text-base leading-relaxed">{getQuestionText(field)}</h3>
              </div>
              <div className="space-y-3">
                <label className="text-sm font-medium text-muted-foreground">Your Answer:</label>
                {field.type === "mcq" && <MCQEntry field={field} />}
                {field.type === "numerical" && <NumericalEntry field={field} />}
                {(field.type === "descriptive" || field.type === "long_answer") && <DescriptiveEntry field={field} />}
              </div>
              <div className="text-xs text-muted-foreground bg-muted/20 rounded p-2 flex items-center gap-2">
                <Keyboard className="h-3 w-3" />
                <span>Tips: Use ← → arrows to navigate, Enter to save & next</span>
                {field.type === "mcq" && <span>• A/B/C/D for options</span>}
              </div>
            </CardContent>
          </GlassCard>
        </motion.div>

        {/* Quick Navigator (moved BELOW) */}
        <GlassCard className="">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2"><Lightbulb className="h-4 w-4 text-primary" />Quick Navigator</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-6 gap-2">
              {fields.map((f, idx) => (
                <Button
                  key={f.question_number}
                  variant={idx === currentIndex ? "default" : (answers[f.question_number] ? "secondary" : "outline")}
                  size="sm"
                  className={cn(
                    "h-8 text-xs transition-all duration-200 rounded-lg",
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
        </GlassCard>

        {/* Action Buttons */}
        <GlassCard>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" onClick={goPrev} disabled={currentIndex === 0} className="flex items-center gap-1">
                  <ChevronLeft className="h-4 w-4" />Prev
                </Button>
                <Button variant="outline" size="sm" onClick={handleSkip} disabled={currentIndex === fields.length - 1} className="flex items-center gap-1">
                  Skip<SkipForward className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="default" size="sm" onClick={handleSaveNext} disabled={currentIndex === fields.length - 1} className="flex items-center gap-1">
                  <Save className="h-4 w-4" />Save & Next
                </Button>
                <Button variant="outline" size="sm" onClick={goNext} disabled={currentIndex === fields.length - 1} className="flex items-center gap-1">
                  Next<ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <Button
              onClick={handleSubmit}
              disabled={grading || attempted.length === 0}
              className="w-full mt-4 h-11 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl"
            >
              {grading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Grading... {gradingProgress}%</>) : (<><BarChart3 className="mr-2 h-4 w-4" />Submit Test ({attempted.length} answers)</>)}
            </Button>
          </CardContent>
        </GlassCard>
      </div>
    );
  };

  return (
    <div className="min-h-screen relative">
      {/* Animated gradient background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 via-fuchsia-500/20 to-cyan-400/20" />
        <motion.div
          className="absolute -top-40 -right-20 h-96 w-96 rounded-full blur-3xl"
          style={{ background: "radial-gradient(closest-side, rgba(99,102,241,0.35), transparent)" }}
          animate={{ y: [0, 20, 0], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-32 -left-10 h-80 w-80 rounded-full blur-3xl"
          style={{ background: "radial-gradient(closest-side, rgba(236,72,153,0.3), transparent)" }}
          animate={{ y: [0, -18, 0], opacity: [0.5, 0.85, 0.5] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Header */}
      <div className="bg-gradient-to-r from-primary/20 via-primary/10 to-transparent border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">Physics Practice Test</h1>
              <p className="text-muted-foreground">ICSE Class X Board Examination</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm"><CheckCircle2 className="h-4 w-4 text-green-500" /><span>{attempted.length} completed</span></div>
              <Badge variant="outline" className="font-mono">Time: {formatTime(timeSpent)}</Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="max-w-7xl mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <PdfPane url={pdfUrl} />
          </div>
          <div className="lg:col-span-1">
            <RightTile />
          </div>
        </div>
      </div>
    </div>
  );
}


// ===============================
// File: src/components/PdfScrollViewer.tsx
// Drop-in replacement that hides OCR/text layers & annotations by default,
// and renders a smooth, scrollable multi-page PDF.
// Uses react-pdf. Ensure you have these deps installed:
//   npm i react-pdf pdfjs-dist
//   // And in your app entry, configure workerSrc if needed.
// ===============================

import React, { useEffect, useMemo, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";

// If you haven't configured globally, uncomment and set workerSrc:
// pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface PdfScrollViewerProps {
  url: string;
  className?: string;
  renderTextLayer?: boolean;          // default false
  renderAnnotationLayer?: boolean;    // default false
}

export const PdfScrollViewer: React.FC<PdfScrollViewerProps> = ({ url, className, renderTextLayer = false, renderAnnotationLayer = false }) => {
  const [numPages, setNumPages] = useState<number>(0);

  // Avoid re-creating options
  const options = useMemo(() => ({
    cMapUrl: undefined,
    cMapPacked: true,
  }), []);

  useEffect(() => { setNumPages(0); }, [url]);

  return (
    <div className={cn("w-full h-full overflow-auto px-4 py-6 space-y-6 bg-background", className)}>
      <Document
        file={url}
        options={options as any}
        onLoadSuccess={({ numPages }) => setNumPages(numPages)}
        onLoadError={(e) => console.error("PDF load error", e)}
        loading={<div className="p-8 text-center text-sm text-muted-foreground">Loading PDF…</div>}
        error={<div className="p-8 text-center text-sm text-destructive">Failed to load PDF</div>}
      >
        {Array.from({ length: numPages }, (_, i) => (
          <div key={i} className="mx-auto max-w-4xl rounded-xl overflow-hidden shadow-md bg-white">
            <Page
              pageNumber={i + 1}
              renderTextLayer={renderTextLayer}
              renderAnnotationLayer={renderAnnotationLayer}
              width={800}
            />
          </div>
        ))}
      </Document>
    </div>
  );
};

// tiny cn helper if not globally available here
function cn(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(" ");
}
