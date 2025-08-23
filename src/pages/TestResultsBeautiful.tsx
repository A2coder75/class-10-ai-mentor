import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

type ResultsPageProps = {
  resultsData: {
    total: number;
    correct: number;
    wrong: number;
    skipped: number;
  } | null;
};

export default function ResultsPage({ resultsData }: ResultsPageProps) {
  const navigate = useNavigate();

  // Debug safety
  if (!resultsData) {
    console.log("⚠️ No resultsData received");
    return <div className="p-6 text-center">Loading results...</div>;
  }

  const { total, correct, wrong, skipped } = resultsData;
  const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;

  // Color helper for progress bar
  const getBarColor = (percent: number) => {
    if (percent >= 75) return "bg-green-500";
    if (percent >= 40) return "bg-yellow-400";
    return "bg-red-500";
  };

  const pieData = [
    { name: "Correct", value: correct, color: "#22c55e" }, // green
    { name: "Wrong", value: wrong, color: "#ef4444" }, // red
    { name: "Skipped", value: skipped, color: "#a855f7" }, // purple
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Banner Section */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-6 shadow-md">
        <div className="flex items-center gap-4">
          <Button
            onClick={() => navigate(-1)}
            className="bg-white/20 hover:bg-white/30 text-white rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold">Test Results</h1>
        </div>
        <p className="mt-2 opacity-90">
          You attempted {total} questions. Here’s your performance breakdown.
        </p>
        {/* Custom Progress Bar */}
        <div className="w-1/2 mx-auto h-4 bg-white/30 rounded mt-4">
          <div
            className={`h-4 rounded ${getBarColor(percentage)}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <p className="mt-2 text-center font-semibold">{percentage}% Score</p>
      </div>

      {/* Content Grid */}
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Stats Card */}
        <Card className="shadow-lg rounded-2xl">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Total Questions: {total}</p>
            <p className="text-green-600 font-medium">Correct: {correct}</p>
            <p className="text-red-600 font-medium">Wrong: {wrong}</p>
            <p className="text-purple-600 font-medium">Skipped: {skipped}</p>
          </CardContent>
        </Card>

        {/* Pie Chart Card */}
        <Card className="shadow-lg rounded-2xl col-span-1 md:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Performance Chart</CardTitle>
          </CardHeader>
          <CardContent>
            <PieChart width={400} height={250}>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={90}
                label={({ name, value }) => `${name}: ${value}`}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
