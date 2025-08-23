import React, { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { ArrowLeft } from "lucide-react";

// Mock fetch or prop
// const resultsData = ...

export default function ResultsPage({ resultsData }: { resultsData: any }) {
  const { subject } = useParams<{ subject: string }>();
  const navigate = useNavigate();

  // Calculate metrics
  const metrics = useMemo(() => {
    if (!resultsData) return null;

    const { evaluations, total_marks_awarded } = resultsData;

    const ABSOLUTE_TOTAL = 80; // ✅ fixed total marks
    const percentage = (total_marks_awarded / ABSOLUTE_TOTAL) * 100;

    const correct = evaluations.filter((e: any) => e.verdict === "correct").length;
    const incorrect = evaluations.filter((e: any) => e.verdict === "incorrect").length;
    const partial = evaluations.filter((e: any) => e.verdict === "partial").length;

    const mistakeTypes = evaluations
      .filter((e: any) => e.mistake_type)
      .reduce((acc: Record<string, number>, e: any) => {
        const type = e.mistake_type || "Other";
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {});

    return {
      totalAwarded: total_marks_awarded,
      totalPossible: ABSOLUTE_TOTAL,
      percentage: Math.round(percentage),
      correct,
      incorrect,
      partial,
      total: evaluations.length,
      mistakeTypes,
      evaluations,
    };
  }, [resultsData]);

  if (!metrics) {
    return <div className="p-6">Loading...</div>;
  }

  // Pie Chart Data (explicit colors)
  const pieData = [
    { name: "Correct", value: metrics.correct, color: "#22c55e" },   // green
    { name: "Incorrect", value: metrics.incorrect, color: "#ef4444" }, // red
    { name: "Partial", value: metrics.partial, color: "#facc15" },    // yellow
  ].filter((d) => d.value > 0);

  // Dynamic score color
  const getScoreColor = (percentage: number) => {
    if (percentage >= 75) return "text-green-500";
    if (percentage >= 40) return "text-yellow-500";
    return "text-red-500";
  };

  const getBarColor = (percentage: number) => {
    if (percentage >= 75) return "bg-green-500";
    if (percentage >= 40) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="p-6 space-y-6">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back</span>
      </button>

      {/* Hero Section */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
          {metrics.totalAwarded}
          <span className="text-2xl md:text-4xl">/80</span>
        </h1>
        <div
          className={`text-xl md:text-2xl font-semibold ${getScoreColor(
            metrics.percentage
          )}`}
        >
          {metrics.percentage}% ({metrics.totalAwarded}/80 marks)
        </div>
        <Progress
          value={metrics.percentage}
          className={`h-3 w-1/2 mx-auto mt-2 ${getBarColor(metrics.percentage)}`}
        />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Pie Chart */}
        <Card className="shadow-xl rounded-2xl">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold mb-4">Answer Distribution</h2>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label
                >
                  {pieData.map((entry, idx) => (
                    <Cell key={`cell-${idx}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Mistake Types */}
        <Card className="shadow-xl rounded-2xl">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold mb-4">Mistake Types</h2>
            <ul className="space-y-2">
              {Object.entries(metrics.mistakeTypes).map(([type, count]) => (
                <li key={type} className="flex justify-between">
                  <span>{type}</span>
                  <span className="font-semibold">{count}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card className="shadow-xl rounded-2xl">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold mb-4">Quick Stats</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Correct</span>
                <span className="font-semibold text-green-500">
                  {metrics.correct}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Incorrect</span>
                <span className="font-semibold text-red-500">
                  {metrics.incorrect}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Partial</span>
                <span className="font-semibold text-yellow-500">
                  {metrics.partial}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Total Questions</span>
                <span className="font-semibold">{metrics.total}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
