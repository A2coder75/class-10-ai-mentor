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
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  // Total marks (fixed at 80 max)
  const totalMarks = useMemo(
    () => evaluations.reduce((sum, e) => sum + (e.marks_awarded || 0), 0),
    [evaluations]
  );
  const maxMarks = 80;
  const percentage = Math.round((totalMarks / maxMarks) * 100);

  // Correct / Wrong count
  const correctCount = useMemo(
    () => evaluations.filter((e) => e.verdict === "correct").length,
    [evaluations]
  );
  const wrongCount = useMemo(
    () => evaluations.filter((e) => e.verdict === "wrong").length,
    [evaluations]
  );

  const performanceDistribution = [
    { name: "Correct", value: correctCount, color: "#22c55e" },
    { name: "Wrong", value: wrongCount, color: "#ef4444" },
  ];

  // Marks by section
  const marksBySection = useMemo(() => {
    const map: Record<string, number> = {};
    evaluations.forEach((e) => {
      map[e.section] = (map[e.section] || 0) + e.marks_awarded;
    });
    return Object.entries(map).map(([section, marks], i) => ({
      section,
      marks,
      fill: COLORS[i % COLORS.length],
    }));
  }, [evaluations]);

  // Marks by type
  const marksByType = useMemo(() => {
    const map: Record<string, number> = {};
    evaluations.forEach((e) => {
      if (!e.type) return;
      map[e.type] = (map[e.type] || 0) + e.marks_awarded;
    });
    return Object.entries(map).map(([type, marks], i) => ({
      type: capitalize(type),
      marks,
      fill: COLORS[(i + 2) % COLORS.length],
    }));
  }, [evaluations]);

  // Mistake type chart data
  const mistakeTypeMap = useMemo(() => {
    const map: Record<string, number> = {};
    evaluations.forEach((e) => {
      if (e.verdict !== "wrong" || !e.mistake_type) return;
      toArray(e.mistake_type).forEach((t) => {
        const key = t.trim();
        if (!key) return;
        map[key] = (map[key] || 0) + 1;
      });
    });
    return map;
  }, [evaluations]);

  const mistakeTypeData = Object.entries(mistakeTypeMap).map(([type, count], index) => ({
    type: capitalize(type),
    count,
    fill: COLORS[(index + 3) % COLORS.length],
  }));

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
      <header className="px-4 md:px-6 py-6 md:py-8">
        <div className="max-w-5xl mx-auto text-center space-y-2">
          <h1 className="text-4xl md:text-5xl font-extrabold text-foreground drop-shadow-sm">
            Test Analysis
          </h1>
          <p className="text-muted-foreground">{testName}</p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 md:px-6 space-y-8">
        {/* Score card */}
        <section>
          <Card className="backdrop-blur-lg bg-white/70 dark:bg-gray-800/60 shadow-lg">
            <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between">
              <div className="text-center md:text-left">
                <div className="text-6xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent animate-pulse">
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
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Correct vs Wrong */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChartIcon className="h-5 w-5" /> Correct vs Wrong
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
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={chartTooltipStyle} />
                </RechartsPieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Mistake Types */}
          <Card className="shadow-lg">
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

          {/* Marks by Section */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LayoutGrid className="h-5 w-5" /> Marks by Section
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={marksBySection}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
                  <XAxis dataKey="section" />
                  <YAxis />
                  <Tooltip contentStyle={chartTooltipStyle} />
                  <Bar dataKey="marks" radius={[6, 6, 0, 0]}>
                    {marksBySection.map((entry, index) => (
                      <Cell key={index} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Marks by Type */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" /> Marks by Question Type
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={marksByType}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
                  <XAxis dataKey="type" />
                  <YAxis />
                  <Tooltip contentStyle={chartTooltipStyle} />
                  <Bar dataKey="marks" radius={[6, 6, 0, 0]}>
                    {marksByType.map((entry, index) => (
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
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Question Analysis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {evaluations.map((e) => {
                const isCorrect = e.verdict === "correct";
                const yourAnswer = toArray(e.student_answer);
                const correctAns = toArray(e.correct_answer);
                const feedback = toArray(e.feedback);

                return (
                  <div
                    key={e.question_number}
                    className={`rounded-lg border overflow-hidden ${
                      isCorrect ? "border-l-4 border-l-green-500" : "border-l-4 border-l-red-500"
                    }`}
                  >
                    <button
                      onClick={() => toggle(e.question_number)}
                      className="w-full text-left p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
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
                            {e.marks_awarded}/{e.total_marks ?? 0}
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
