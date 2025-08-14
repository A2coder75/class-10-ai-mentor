import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle2,
  XCircle,
  PieChart as PieChartIcon,
  BarChart3,
  LayoutGrid,
  AlertTriangle
} from "lucide-react";
import {
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

type Verdict = "correct" | "wrong" | "partially correct";

interface Evaluation {
  question_number: string;
  section: string;
  question?: string;
  type?: string;
  verdict: Verdict;
  marks_awarded: number | string;
  total_marks?: number | string;
  mistake: string | string[];
  correct_answer: string | string[];
  mistake_type: string | string[];
  student_answer?: string | string[];
  feedback?: string | string[];
}

interface TestResultsReviewProps {
  evaluations: Evaluation[];
  total_marks_awarded?: number;
  total_marks_possible?: number;
  testName: string;
  timeTaken?: number;
}

const capitalize = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : "");
const toArray = (v: string | string[] | undefined): string[] =>
  v == null ? [] : Array.isArray(v) ? v : [v];

const COLORS = ["#22c55e", "#ef4444", "#3b82f6", "#eab308", "#8b5cf6", "#06b6d4"];

const TestResultsReviewNew: React.FC<TestResultsReviewProps> = ({
  evaluations,
  total_marks_awarded,
  total_marks_possible,
  testName,
  timeTaken,
}) => {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  // 🔹 Parse marks as numbers
  const parsedEvals = useMemo(
    () =>
      evaluations.map((e) => ({
        ...e,
        marks_awarded: Number(e.marks_awarded ?? 0),
        total_marks: Number(e.total_marks ?? 0),
      })),
    [evaluations]
  );

  // 🔹 Total marks calc (hardcoded max 80)
  const maxMarks = 80;
  const totalMarks =
    typeof total_marks_awarded === "number"
      ? total_marks_awarded
      : parsedEvals.reduce((sum, e) => sum + e.marks_awarded, 0);
  const percentage = Math.round((totalMarks / maxMarks) * 100);

  // 🔹 Correct / Wrong / Partial count
  const correctCount = parsedEvals.filter((e) => e.verdict === "correct").length;
  const wrongCount = parsedEvals.filter((e) => e.verdict === "wrong").length;
  const partialCount = parsedEvals.filter((e) => e.verdict === "partially correct").length;

  // 🔹 Charts Data
  const performanceDistribution = [
    { name: "Correct", value: correctCount, color: "#22c55e" },
    { name: "Partial", value: partialCount, color: "#facc15" },
    { name: "Wrong", value: wrongCount, color: "#ef4444" },
  ];

  const marksBySection = useMemo(() => {
    const map: Record<string, number> = {};
    parsedEvals.forEach((e) => {
      map[e.section] = (map[e.section] || 0) + e.marks_awarded;
    });
    return Object.entries(map).map(([section, marks], i) => ({
      section,
      marks,
      fill: COLORS[i % COLORS.length],
    }));
  }, [parsedEvals]);

  const marksByType = useMemo(() => {
    const map: Record<string, number> = {};
    parsedEvals.forEach((e) => {
      if (!e.type) return;
      map[e.type] = (map[e.type] || 0) + e.marks_awarded;
    });
    return Object.entries(map).map(([type, marks], i) => ({
      type: capitalize(type),
      marks,
      fill: COLORS[(i + 2) % COLORS.length],
    }));
  }, [parsedEvals]);

  const mistakeTypeData = useMemo(() => {
    const map: Record<string, number> = {};
    parsedEvals.forEach((e) => {
      if (e.verdict === "correct") return;
      toArray(e.mistake_type).forEach((t) => {
        const key = t.trim();
        if (!key) return;
        map[key] = (map[key] || 0) + 1;
      });
    });
    return Object.entries(map).map(([type, count], i) => ({
      type: capitalize(type),
      count,
      fill: COLORS[(i + 3) % COLORS.length],
    }));
  }, [parsedEvals]);

  const marksLostByMistakeType = useMemo(() => {
    const map: Record<string, number> = {};
    parsedEvals.forEach((e) => {
      if (e.verdict === "correct") return;
      const lost = (e.total_marks || 0) - (e.marks_awarded || 0);
      toArray(e.mistake_type).forEach((t) => {
        const key = t.trim();
        if (!key) return;
        map[key] = (map[key] || 0) + lost;
      });
    });
    return Object.entries(map).map(([type, marksLost], i) => ({
      type: capitalize(type),
      marksLost,
      fill: COLORS[(i + 4) % COLORS.length],
    }));
  }, [parsedEvals]);

  const toggle = (q: string) => {
    const next = new Set(expanded);
    next.has(q) ? next.delete(q) : next.add(q);
    setExpanded(next);
  };

  const chartTooltipStyle = {
    backgroundColor: "#fff",
    border: "1px solid #ddd",
    borderRadius: "8px",
    padding: "8px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-900 dark:to-gray-950">
      {/* HEADER */}
      <header className="px-4 md:px-6 py-6 md:py-8 bg-emerald-500 text-white shadow-md">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold drop-shadow-lg">
            Test Analysis
          </h1>
          <p className="opacity-90">{testName}</p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 md:px-6 space-y-8">
        {/* SCORE CARD */}
        <section>
          <Card className="shadow-lg">
            <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between">
              <div className="text-center md:text-left">
                <div className="text-6xl font-bold bg-gradient-to-r from-emerald-400 to-green-600 bg-clip-text text-transparent">
                  {percentage}%
                </div>
                <p className="text-muted-foreground mt-1">
                  Score • {totalMarks} / {maxMarks}
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* CHARTS */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Correct vs Wrong */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChartIcon className="h-5 w-5" /> Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <RechartsPieChart>
                  <Pie
                    data={performanceDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {performanceDistribution.map((entry, index) => (
                      <Cell key={index} fill={entry.color} style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.2))" }} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={chartTooltipStyle} />
                </RechartsPieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Mistake Types */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" /> Mistake Types
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={mistakeTypeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
                  <XAxis dataKey="type" />
                  <YAxis allowDecimals={false} />
                  <Tooltip contentStyle={chartTooltipStyle} />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {mistakeTypeData.map((entry, index) => (
                      <Cell key={index} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </section>

        {/* Marks Lost by Mistake Type */}
        <section>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" /> Marks Lost by Mistake Type
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={marksLostByMistakeType}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
                  <XAxis dataKey="type" />
                  <YAxis />
                  <Tooltip contentStyle={chartTooltipStyle} />
                  <Bar dataKey="marksLost" radius={[6, 6, 0, 0]}>
                    {marksLostByMistakeType.map((entry, index) => (
                      <Cell key={index} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </section>

        {/* Question Analysis */}
        <section>
          <Card>
            <CardHeader>
              <CardTitle>Question Analysis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {parsedEvals.map((e) => {
                const isCorrect = e.verdict === "correct";
                const isPartial = e.verdict === "partially correct";
                const yourAnswer = toArray(e.student_answer);
                const correctAns = toArray(e.correct_answer);
                const feedback = toArray(e.feedback);
                const mistakes = toArray(e.mistake_type);

                return (
                  <div
                    key={e.question_number}
                    className={`rounded-lg border overflow-hidden ${
                      isCorrect
                        ? "border-l-4 border-l-green-500"
                        : isPartial
                        ? "border-l-4 border-l-yellow-500"
                        : "border-l-4 border-l-red-500"
                    }`}
                  >
                    <button
                      onClick={() => toggle(e.question_number)}
                      className="w-full text-left p-4 hover:bg-emerald-50 dark:hover:bg-emerald-900 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-medium">Q{e.question_number}</span>
                          {e.section && <Badge variant="outline">Section {e.section}</Badge>}
                          {e.type && <Badge variant="secondary">{e.type}</Badge>}
                          {mistakes.map((m, idx) => (
                            <Badge key={idx} variant="outline" className="bg-red-100 text-red-700">
                              {capitalize(m)}
                            </Badge>
                          ))}
                          <Badge
                            className={`text-xs ${
                              isCorrect
                                ? "bg-green-500 text-white"
                                : isPartial
                                ? "bg-yellow-500 text-black"
                                : "bg-red-500 text-white"
                            }`}
                          >
                            {isCorrect ? "Correct" : isPartial ? "Partial" : "Wrong"}
                          </Badge>
                        </div>
                        <div className="font-semibold">
                          {e.total_marks > 0
                            ? `${e.marks_awarded}/${e.total_marks}`
                            : `${e.marks_awarded}`}
                        </div>
                      </div>
                      {e.question && (
                        <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                          {e.question}
                        </p>
                      )}
                    </button>

                    {expanded.has(e.question_number) && (
                      <div className="border-t bg-muted/25">
                        <div className="p-4 space-y-4">
                          {e.question && (
                            <>
                              <h4 className="font-medium mb-1">Question</h4>
                              <p className="text-sm">{e.question}</p>
                              <Separator />
                            </>
                          )}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <h4 className="font-medium mb-2">Your Answer</h4>
                              {yourAnswer.length > 0 ? (
                                <div
                                  className={`p-3 rounded-lg border text-sm ${
                                    isCorrect
                                      ? "text-green-500"
                                      : isPartial
                                      ? "text-yellow-600"
                                      : "text-red-500"
                                  }`}
                                >
                                  {yourAnswer.join(", ")}
                                </div>
                              ) : (
                                <p className="text-sm text-muted-foreground">Not provided</p>
                              )}
                            </div>
                            {!isCorrect && (
                              <div>
                                <h4 className="font-medium mb-2">Correct Answer</h4>
                                <div className="p-3 rounded-lg border text-sm">
                                  {correctAns.join(", ")}
                                </div>
                              </div>
                            )}
                            {feedback.length > 0 && (
                              <div>
                                <h4 className="font-medium mb-2">Feedback</h4>
                                <div className="p-3 rounded-lg border text-sm bg-background">
                                  {feedback.join(" ")}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
};

export default TestResultsReviewNew;
