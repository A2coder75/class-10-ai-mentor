import React, { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import {
  Loader2, ChevronLeft, ChevronRight,
  CheckCircle2, FileText, Target, BarChart3
} from "lucide-react";

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
  const [pdfUrl, setPdfUrl] = useState<string>("");
  const [fields, setFields] = useState<FieldItem[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [grading, setGrading] = useState(false);
  const [gradingProgress, setGradingProgress] = useState(0);
  const [evaluations, setEvaluations] = useState<GradeEvaluation[] | null>(null);

  const pdfPaneRef = useRef<HTMLDivElement>(null);

  // Fetch fields + PDF from API utils
  useEffect(() => {
    const loadQuestions = async () => {
      setLoadingQuestions(true);
      try {
        const { fields, pdfUrl } = await fetchQuestionsFromAPI(FILENAME);

        const normalized: FieldItem[] = fields.map((f) => ({
          ...f,
          type:
            f.type === "long_answer" || f.type === "descriptive"
              ? "descriptive"
              : (f.type as FieldType),
        }));

        setFields(normalized);
        setPdfUrl(pdfUrl);

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
    setAnswers((prev) => ({
      ...prev,
      [current.question_number]: prev[current.question_number] ?? "",
    }));
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

    const timer = setInterval(() => {
      setGradingProgress((p) => (p >= 90 ? 90 : p + 8));
    }, 250);

    try {
      const payload = {
        questions: attempted.map((q) => ({
          question_number: q.question_number,
          type: q.type,
          marks: q.marks,
          correct_answer: q.correct_answer,
          user_answer: q.user_answer ?? "",
        })),
      };

      const data = await gradeQuestions(payload);
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

  const MCQEntry = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => {
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
      <div className="text-xs text-muted-foreground">Include units only if required.</div>
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
            {current.type === "mcq" && <MCQEntry value={val} onChange={setCurrentAnswer} />}
            {current.type === "numerical" && <NumericalEntry value={val} onChange={setCurrentAnswer} />}
            {current.type === "descriptive" && <DescriptiveEntry value={val} onChange={setCurrentAnswer} />}
            {current.type === "long_answer" && <DescriptiveEntry value={val} onChange={setCurrentAnswer} />}
          </div>

          <div className="space-y-2">
            <Progress value={progressPct} className="h-2 bg-primary/15" />
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2">
            <Button variant="outline" className="rounded-2xl" onClick={goPrev} disabled={currentIndex === 0}>
              <ChevronLeft className="h-4 w-4 mr-1" /> Prev
            </Button>
            <Button variant="secondary" className="rounded-2xl" onClick={handleSkip}>Skip</Button>
            <Button className="rounded-2xl" onClick={handleSaveNext}>
              Save & Next <ChevronRight className="h-4 w-4 ml-1" />
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
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen">
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

      <div className="px-4 md:px-8 pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-6">
          <div
            ref={pdfPaneRef}
            className="rounded-2xl border shadow-sm overflow-hidden bg-white/80 dark:bg-gray-900/60"
          >
            <div className="h-[78vh] md:h-[82vh] overflow-y-auto">
              {loadingQuestions ? (
                <div className="h-full flex items-center justify-center">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Loading PDF…</span>
                </div>
              ) : pdfUrl ? (
                <iframe src={pdfUrl} className="w-full h-full" title="Question Paper" />
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  PDF not available
                </div>
              )}
            </div>
          </div>

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
