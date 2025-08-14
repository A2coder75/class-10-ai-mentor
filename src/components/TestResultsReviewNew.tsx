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
                <div className="text-6xl font-bold bg-gradient-
