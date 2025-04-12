
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mockChapterPerformance, mockMistakeCategories, mockPerformanceData } from "../utils/mockData";
import { 
  BarChart as RechartsBarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042"];

const PerformancePage = () => {
  return (
    <div className="page-container pb-20">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Performance Tracker</h1>
        <p className="text-muted-foreground">
          Monitor your progress over time
        </p>
      </div>

      <Tabs defaultValue="trends">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="chapters">Chapters</TabsTrigger>
          <TabsTrigger value="mistakes">Mistakes</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Score Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={mockPerformanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip formatter={(value) => [`${value}%`, "Score"]} />
                  <Line 
                    type="monotone" 
                    dataKey="score" 
                    stroke="#8884d8" 
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
              
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <h3 className="font-medium mb-2">Score Analysis</h3>
                <p className="text-sm text-muted-foreground">
                  Your scores have been steadily improving. Keep up the good work!
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="chapters" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Chapter Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsBarChart data={mockChapterPerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="chapter" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip formatter={(value) => [`${value}%`, "Score"]} />
                  <Bar dataKey="score" fill="#8884d8" />
                </RechartsBarChart>
              </ResponsiveContainer>
              
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <h3 className="font-medium mb-2">Chapter Insights</h3>
                <p className="text-sm text-muted-foreground">
                  You're excelling in Light and Force & Motion. Consider focusing more on Electricity to improve.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mistakes" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Mistake Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={mockMistakeCategories}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="count"
                    nameKey="category"
                    label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {mockMistakeCategories.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name) => [value, name]} />
                </PieChart>
              </ResponsiveContainer>
              
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <h3 className="font-medium mb-2">Error Analysis</h3>
                <p className="text-sm text-muted-foreground">
                  Most of your errors are conceptual. Focus on understanding the fundamental principles rather than memorizing formulas.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Navbar />
    </div>
  );
};

export default PerformancePage;
