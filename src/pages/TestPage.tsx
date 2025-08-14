import React, { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { Loader2, ChevronLeft, ChevronRight, CheckCircle2, FileText, Target, BarChart3 } from "lucide-react";

const API_BASE_URL = "https://ai-companion-server.onrender.com";
const FILENAME = "physics/IcseX2024PhysicsBoard";

type FieldType = "mcq" | "numerical" | "descriptive" | "long_answer";

type FieldItem = {
  question_number: string;
  type: FieldType | string; // tolerate "descriptive" or "long_answer"
  marks: number;
  correct_answer: string; // letter for mcq; number string for numerical; sentence(s) for descriptive
  user_answer?: string;
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

type GradeResponse = {
  evaluations: GradeEvaluation[];
  total_marks_awarded?: number;
  total_marks_possible?: number;
};

export default function TestPage() {
  const [pdfUrl, setPdfUrl] = useState<string>("");
  const [fields, setFields] = useState<FieldItem[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [grading, setGrading] = useState(false);
  const [gradingProgress, setGradingProgress] = useState(0);
  const [evaluations, setEvaluations] = useState<GradeEvaluation[] | null>(null);

  const pdfPaneRef = useRef<HTMLDivElement>(null);

  // Fetch fields + pdf_url from backend (POST /questions with filename)
  useEffect(() => {
    const fetchQuestions = async () => {
      setLoadingQuestions(true);
      try {
        const res = await fetch(`${API_BASE_URL}/questions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ filename: FILENAME }),
        });
        if (!res.ok) throw new Error(`API ${res.status}`);
        const data = await res.json();
        if (!data?.fields || !data?.pdf_url) {
          throw new Error("Invalid questions API response");
        }
        // Normalize types (accept long_answer or descriptive)
        const normalized: FieldItem[] = (data.fields as FieldItem[]).map((f) => ({
          ...f,
          type:
            f.type === "long_answer" || f.type === "descriptive"
              ? "descriptive"
              : (f.type as FieldType),
        }));
        setFields(normalized);
        setPdfUrl(data.pdf_url);
        toast({
          title: "Loaded test paper",
          description: `Fetched ${normalized.length} entries`,
        });
      } catch (e) {
        console.error(e);
        toast({
          title: "Failed to load",
          description: "Could not fetch test files from server.",
          variant: "destructive",
        });
      } finally {
        setLoadingQuestions(false);
      }
    };
    fetchQuestions();
  }, []);

  // Keep fields in sync with answers (mirror user_answer)
  const fieldsWithUser = useMemo(() => {
    return fields.map((f) => ({
      ...f,
      user_answer: answers[f.question_number] ?? f.user_answer ?? "",
    }));
  }, [fields, answers]);

  const attempted = useMemo(
    () =>
      fieldsWithUser.filter(
        (f) => typeof f.user_answer === "string" && f.user_answer.trim().length > 0
      ),
    [fieldsWithUser]
  );

  const progressPct = fields.length
    ? Math.round((attempted.length / fields.length) * 100)
    : 0;

  const current = fieldsWithUser[currentIndex];

  const setCurrentAnswer = (value: string) => {
    if (!current) return;
    setAnswers((prev) => ({ ...prev, [current.question_number]: value }));
  };

  const goPrev = () => setCurrentIndex((i) => Math.max(0, i - 1));
  const goNext = () => setCurrentIndex((i) => Math.min(fieldsWithUser.length - 1, i + 1));

  const handleSkip = () => goNext();

  const handleSaveNext = () => {
    if (!current) return;
    // ensures user_answer is set
    setAnswers((prev) => ({ ...prev, [current.question_number]: prev[current.question_number] ?? "" }));
    goNext();
  };

  const handleSubmit = async () => {
    if (attempted.length === 0) {
      toast({
        title: "No answers",
        description: "Please attempt at least one question.",
        variant: "destructive",
      });
      return;
    }

    setGrading(true);
    setGradingProgress(0);

    // Smooth fake progress to 90%
    const timer = setInterval(() => {
      setGradingProgress((p) => (p >= 90 ? 90 : p + 8));
    }, 250);

    try {
      const payload = attempted.map(({ question_number, type, marks, correct_answer, user_answer }) => ({
        question_number,
        type,
        marks,
        correct_answer,
        user_answer: user_answer ?? "",
      }));

      const res = await fetch(`${API_BASE_URL}/grade_batch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(`Grader ${res.status}: ${t || "No details"}`);
      }
      const data: GradeResponse = await res.json();
      setEvaluations(data.evaluations || []);
      setGradingProgress(100);
      toast({
        title: "Graded successfully",
        description: `Attempted ${attempted.length} / ${fields.length}`,
      });
    } catch (e: any) {
      console.error(e);
      toast({
        title: "Grading error",
        description: e?.message || "Unknown error",
        variant: "destructive",
      });
    } finally {
      clearInterval(timer);
      setTimeout(() => setGrading(false), 400);
    }
  };

  // --- UI helpers for the right tile ---
  const MCQEntry = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => {
    // We don’t have options text; accept A/B/C/D buttons + free letter input
    const letters = ["a", "b", "c", "d"];
    return (
      <div className="space-y-3">
        <div className="grid grid-cols-4 gap-2">
          {letters.map((l) => (
            <Button
              key={l}
              type="button"
              variant={value === l ? "default" : "outline"}
              className="rounded-2xl"
              onClick={() => onChange(l)}
              aria-pressed={value === l}
            >
              {l.toUpperCase()}
            </Button>
          ))}
        </div>
        <div className="text-xs text-muted-foreground">
          Don’t see options? Enter the option letter (a/b/c/d).
        </div>
      </div>
    );
  };

  const NumericalEntry = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
    <div className="space-y-2">
      <Input
        inputMode="decimal"
        placeholder="Enter your numerical answer (e.g., 42, 3.14, etc.)"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-2xl"
      />
      <div className="text-xs text-muted-foreground">Include units only if required by the question.</div>
    </div>
  );

  const DescriptiveEntry = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
    <Textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Type your answer here..."
      className="min-h-[140px] rounded-2xl"
    />
  );

  const RightTile = () => {
    if (loadingQuestions) {
      return (
        <Card className="border-primary/20 shadow-lg">
          <CardContent className="p-6 flex items-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Loading test…</span>
          </CardContent>
        </Card>
      );
    }
    if (!current) {
      return (
        <Card className="border-primary/20 shadow-lg">
          <CardContent className="p-6">No questions available.</CardContent>
        </Card>
      );
    }

    const val = answers[current.question_number] ?? current.user_answer ?? "";

    return (
      <Card className="border-primary/20 shadow-xl backdrop-blur bg-white/70 dark:bg-gray-900/60">
        <CardContent className="p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-primary/80 tracking-wide">Practice Test</div>
            <div className="text-xs text-muted-foreground">
              {currentIndex + 1} / {fieldsWithUser.length}
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-2xl font-bold tracking-tight">{current.question_number}</div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Target className="h-4 w-4" />
              <span>{current.marks} mark{current.marks === 1 ? "" : "s"}</span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">
              Answer Input
            </div>

            {current.type === "mcq" && <MCQEntry value={val} onChange={setCurrentAnswer} />}
            {current.type === "numerical" && <NumericalEntry value={val} onChange={setCurrentAnswer} />}
            {current.type === "descriptive" && <DescriptiveEntry value={val} onChange={setCurrentAnswer} />}

            {/* Safety: allow long_answer synonym */}
            {current.type === "long_answer" && <DescriptiveEntry value={val} onChange={setCurrentAnswer} />}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Attempted: {attempted.length}</span>
              <span>Total: {fields.length}</span>
            </div>
            <Progress value={progressPct} className="h-2 bg-primary/15" />
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2">
            <Button variant="outline" className="rounded-2xl" onClick={goPrev} disabled={currentIndex === 0}>
              <ChevronLeft className="h-4 w-4 mr-1" />
              Prev
            </Button>
            <Button variant="secondary" className="rounded-2xl" onClick={handleSkip}>
              Skip
            </Button>
            <Button className="rounded-2xl" onClick={handleSaveNext}>
              Save & Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>

          <div className="pt-2">
            <Button
              onClick={handleSubmit}
              disabled={grading || attempted.length === 0}
              className="w-full rounded-2xl"
            >
              {grading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Grading… {gradingProgress}%
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Submit Attempted ({attempted.length})
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  const ResultsPanel = () => {
    if (!evaluations) return null;
    const totalAwarded = evaluations.reduce((s, e) => s + (e.marks_awarded || 0), 0);
    const totalPossible = evaluations.reduce((s, e) => s + (e.total_marks || 0), 0);

    return (
      <Card className="border-primary/20 shadow-xl">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            <div className="text-lg font-semibold">Results</div>
          </div>
          <div className="text-sm text-muted-foreground">
            Score: <span className="font-semibold text-foreground">{totalAwarded}/{totalPossible}</span>
          </div>
          <div className="space-y-3">
            {evaluations.map((e) => (
              <div
                key={e.question_number}
                className="rounded-xl border p-3 bg-white/70 dark:bg-gray-900/60"
              >
                <div className="flex items-center justify-between">
                  <div className="font-medium">{e.question_number}</div>
                  <div
                    className={`text-xs px-2 py-1 rounded-full ${
                      e.verdict === "correct"
                        ? "bg-emerald-100 text-emerald-700"
                        : e.verdict === "partially correct"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-rose-100 text-rose-700"
                    }`}
                  >
                    {e.verdict ?? (e.marks_awarded > 0 ? "partially correct" : "wrong")}
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  Marks: {e.marks_awarded} / {e.total_marks}
                </div>
                {e.feedback && (
                  <div className="mt-2 text-sm">
                    <span className="text-muted-foreground">Feedback:</span>{" "}
                    {Array.isArray(e.feedback) ? e.feedback.join(" ") : e.feedback}
                  </div>
                )}
                {e.mistake && (
                  <div className="mt-1 text-xs text-muted-foreground">
                    {Array.isArray(e.mistake) ? e.mistake.join(" • ") : e.mistake}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="px-4 md:px-8 pt-6 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight">Practice Test</h1>
          </div>
          <div className="text-sm text-muted-foreground">
            Filename: <span className="font-medium">{FILENAME}</span>
          </div>
        </div>
      </div>

      {/* Dual Pane */}
      <div className="px-4 md:px-8 pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-6">
          {/* Left: PDF viewer (scrollable) */}
          <div
            ref={pdfPaneRef}
            className="rounded-2xl border shadow-sm overflow-hidden bg-white/80 dark:bg-gray-900/60"
          >
            <div className="h-[78vh] md:h-[82vh] overflow-y-auto">
              {loadingQuestions ? (
                <div className="h-full flex items-center justify-center">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Loading PDF…</span>
                  </div>
                </div>
              ) : pdfUrl ? (
                <iframe
                  src={pdfUrl}
                  className="w-full h-full"
                  title="Question Paper"
                />
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  PDF not available
                </div>
              )}
            </div>
          </div>

          {/* Right: Sticky question tile + results */}
          <div className="space-y-6">
            <div className="sticky top-4">
              <RightTile />
            </div>

            {evaluations && <ResultsPanel />}
          </div>
        </div>
      </div>
    </div>
  );
}
