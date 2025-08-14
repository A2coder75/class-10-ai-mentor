import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle2,
  XCircle,
  PieChart as PieChartIcon,
  BarChart3,
  TrendingUp,
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
  LineChart,
  Line,
} from "recharts";

type Verdict = "correct" | "wrong";

interface Evaluation {
  question_number: string;
  section: string;
  question?: string;
  type?: string;
  verdict: Verdict;
  marks_awarded: number;
  total_marks?: number;
  mistake: string | string[];
  correct_answer: string | string[];
  mistake_type: string | string[];
  student_answer?: string | string[];
  feedback?: string | string[];
}

interface TestResultsReviewProps {
  evaluations: Evaluation[];
  testName: string;
  timeTaken?: number;
}

const capitalize = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : "");
const toArray = (v: string | string[] | undefined): string[] =>
  v == null ? [] : Array.isArray(v) ? v : [v];

const COLORS = ["#22c55e", "#ef4444", "#3b82f6", "#eab308", "#8b5cf6", "#06b6d4"];

const TestResultsReviewNew: React.FC<TestResultsReviewProps> = ({
  evaluations,
  testName,
  timeTaken,
}) => {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  // Ensure marks are numbers
  const fixedEvaluations = useMemo(() => {
    return evaluations.map((e) => ({
      ...e,
      marks_awarded: Number(e.marks_awarded ?? 0),
      total_marks: Number(e.total_marks ?? 0),
    }));
  }, [evaluations]);

  // Hardcoded max marks
  const maxMarks = 80;

  // Total marks awarded
  const totalMarks = useMemo(
    () => fixedEvaluations.reduce((sum, e) => sum + (e.marks_awarded || 0), 0),
    [fixedEvaluations]
  );

  // Percentage
  const percentage = Math.round((totalMarks / maxMarks) * 100);

  // Correct / Wrong counts
  const correctCount = useMemo(
    () => fixedEvaluations.filter((e) => e.verdict === "correct").length,
    [fixedEvaluations]
  );
  const wrongCount = fixedEvaluations.length - correctCount;

  // Performance chart
  const performanceDistribution = [
    { name: "Correct", value: correctCount, color: "#22c55e" },
    { name: "Wrong", value: wrongCount, color: "#ef4444" },
  ];

  // Marks lost by mistake type
  const marksLostByMistakeType = useMemo(() => {
    const map: Record<string, number> = {};
    fixedEvaluations.forEach((e) => {
      if (e.verdict === "wrong" && e.mistake_type) {
        toArray(e.mistake_type).forEach((type) => {
          const key = capitalize(type.trim());
          if (!key) return;
          map[key] = (map[key] || 0) + (e.total_marks || 0);
        });
      }
    });
    return Object.entries(map).map(([type, marks], i) => ({
      type,
      marks,
      fill: COLORS[i % COLORS.length],
    }));
  }, [fixedEvaluations]);

  // Score progression
  const scoreProgression = useMemo(() => {
    let runningTotal = 0;
    return fixedEvaluations.map((e) => {
      runningTotal += e.marks_awarded;
      return { question: `Q${e.question_number}`, score: runningTotal };
    });
  }, [fixedEvaluations]);

  const toggle = (q: string) => {
    const next = new Set(expanded);
    next.has(q) ? next.delete(q) : next.add(q);
    setExpanded(next);
  };

  const chartTooltipStyle = {
    backgroundColor: "#fff",
    border: "1px solid #ddd",
    borderRadius: "8px",
    color: "#333",
    padding: "8px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      {/* Header */}
      <header className="px-4 md:px-6 py-6 md:py-8">
        <div className="max-w-5xl mx-auto text-center space-y-2">
          <h1 className="text-4xl md:text-5xl font-extrabold text-foreground drop-shadow-sm">
            Test Analysis
          </h1>
          <p className="text-muted-foreground">{testName}</p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 md:px-6 space-y-8">
        {/* Score Card */}
        <section>
          <Card className="backdrop-blur-lg bg-white/70 dark:bg-gray-800/60 shadow-lg">
            <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between">
              <div className="text-center md:text-left">
                <div className="text-6xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
                  {percentage}%
                </div>
                <p className="text-muted-foreground mt-1">
                  Score • {totalMarks} / {maxMarks}
                  {timeTaken ? ` • ${timeTaken}m` : ""}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-8 text-center mt-4 md:mt-0">
                <div>
                  <div className="flex items-center justify-center gap-2">
                    <CheckCircle2 className="h-6 w-6 text-green-500" />
                    <span className="font-semibold">{correctCount}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Correct</p>
                </div>
                <div>
                  <div className="flex items-center justify-center gap-2">
                    <XCircle className="h-6 w-6 text-red-500" />
                    <span className="font-semibold">{wrongCount}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Wrong</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Charts */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Correct vs Wrong */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChartIcon className="h-5 w-5" /> Correct vs Wrong
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
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
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={chartTooltipStyle} />
                </RechartsPieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Marks lost by mistake type */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" /> Marks Lost by Mistake Type
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={marksLostByMistakeType}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
                  <XAxis dataKey="type" />
                  <YAxis />
                  <Tooltip contentStyle={chartTooltipStyle} />
                  <Bar dataKey="marks" radius={[8, 8, 0, 0]}>
                    {marksLostByMistakeType.map((entry, index) => (
                      <Cell key={index} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Score progression */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" /> Score Progression
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={scoreProgression}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
                  <XAxis dataKey="question" />
                  <YAxis />
                  <Tooltip contentStyle={chartTooltipStyle} />
                  <Line type="monotone" dataKey="score" stroke="#22c55e" strokeWidth={3} dot />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </section>

        {/* Question Analysis */}
        <section>
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Question Analysis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {fixedEvaluations.map((e) => {
                const isCorrect = e.verdict === "correct";
                const yourAnswer = toArray(e.student_answer);
                const correctAns = toArray(e.correct_answer);
                const feedback = toArray(e.feedback);

                return (
                  <div
                    key={e.question_number}
                    className={`rounded-lg border overflow-hidden transition-transform transform hover:scale-[1.01] hover:bg-gradient-to-r hover:from-emerald-50 hover:to-transparent dark:hover:from-emerald-900/20 ${
                      isCorrect ? "border-l-4 border-l-green-500" : "border-l-4 border-l-red-500"
                    }`}
                  >
                    <button
                      onClick={() => toggle(e.question_number)}
                      className="w-full text-left p-4"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-medium">Q{e.question_number}</span>
                          {e.section && <Badge variant="outline">Section {e.section}</Badge>}
                          {e.type && <Badge variant="secondary">{e.type}</Badge>}
                          <Badge
                            variant={isCorrect ? "default" : "destructive"}
                            className={`text-xs ${isCorrect ? "bg-green-500 text-white" : ""}`}
                          >
                            {isCorrect ? "Correct" : "Wrong"}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={isCorrect ? "text-green-500 font-semibold" : "text-red-500 font-semibold"}>
                            {e.marks_awarded}/{e.total_marks}
                          </span>
                          {isCorrect ? (
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-500" />
                          )}
                        </div>
                      </div>
                      {e.question && (
                        <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{e.question}</p>
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
                                    isCorrect ? "text-green-500" : "text-red-500"
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
