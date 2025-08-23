
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

const COLORS = ["#8b5cf6", "#2dd4bf", "#f59e0b", "#ef4444", "#6366f1"];

const PerformancePage = () => {
  return (
    <div className="page-container pb-20">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2 text-primary">Performance Tracker</h1>
        <p className="text-muted-foreground">
          Monitor your progress over time
        </p>
      </div>

      <Tabs defaultValue="trends">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="chapters">Chapters</TabsTrigger>
          <TabsTrigger value="mistakes">Mistakes</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="mt-4">
          <Card className="overflow-hidden border-none shadow-md bg-white dark:bg-gray-800">
            <div className="h-1 bg-gradient-to-r from-purple-400 via-blue-500 to-indigo-500"></div>
            <CardHeader className="border-b border-border/10">
              <CardTitle className="text-primary">Score Trends</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={mockPerformanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.2)" />
                  <XAxis dataKey="date" stroke="#9ca3af" />
                  <YAxis domain={[0, 100]} stroke="#9ca3af" />
                  <Tooltip 
                    formatter={(value) => [`${value}%`, "Score"]} 
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      color: '#1e293b'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="score" 
                    stroke="#8b5cf6" 
                    strokeWidth={3}
                    dot={{ r: 6, fill: "#8b5cf6", strokeWidth: 2, stroke: "#fff" }}
                    activeDot={{ r: 8, fill: "#8b5cf6", strokeWidth: 2, stroke: "#fff" }}
                  />
                </LineChart>
              </ResponsiveContainer>
              
              <div className="mt-8 p-5 rounded-lg border border-primary/10 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/30 dark:to-blue-950/30 shadow-sm">
                <h3 className="text-lg font-semibold mb-3 text-primary">Score Analysis</h3>
                <p className="text-base text-gray-700 dark:text-gray-300">
                  Your scores have shown steady improvement over the past months. 
                  Keep up the excellent work! Focus on maintaining consistent study habits.
                </p>
                <div className="mt-4 flex justify-between items-center">
                  <div className="flex flex-col items-center">
                    <span className="text-2xl font-bold text-primary">85%</span>
                    <span className="text-sm text-gray-500">Highest Score</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-2xl font-bold text-primary">72%</span>
                    <span className="text-sm text-gray-500">Average Score</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-2xl font-bold text-emerald-500">+15%</span>
                    <span className="text-sm text-gray-500">Improvement</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="chapters" className="mt-4">
          <Card className="overflow-hidden border-none shadow-md bg-white dark:bg-gray-800">
            <div className="h-1 bg-gradient-to-r from-emerald-400 via-cyan-500 to-blue-500"></div>
            <CardHeader className="border-b border-border/10">
              <CardTitle className="text-primary">Chapter Performance</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <ResponsiveContainer width="100%" height={300}>
                <RechartsBarChart data={mockChapterPerformance} barGap={8}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.2)" />
                  <XAxis dataKey="chapter" stroke="#9ca3af" />
                  <YAxis domain={[0, 100]} stroke="#9ca3af" />
                  <Tooltip 
                    formatter={(value) => [`${value}%`, "Score"]} 
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      color: '#1e293b'
                    }}
                  />
                  <Bar 
                    dataKey="score" 
                    fill="#2dd4bf" 
                    radius={[4, 4, 0, 0]}
                    animationDuration={1500}
                  />
                </RechartsBarChart>
              </ResponsiveContainer>
              
              <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800/30 shadow-sm">
                  <h4 className="font-semibold text-lg text-green-700 dark:text-green-400 mb-2">Strengths</h4>
                  <ul className="list-disc pl-5 text-gray-700 dark:text-gray-300 space-y-1">
                    <li>Light (92% mastery)</li>
                    <li>Force & Motion (85% mastery)</li>
                    <li>Waves (80% mastery)</li>
                  </ul>
                </div>
                
                <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/30 shadow-sm">
                  <h4 className="font-semibold text-lg text-amber-700 dark:text-amber-400 mb-2">For Review</h4>
                  <ul className="list-disc pl-5 text-gray-700 dark:text-gray-300 space-y-1">
                    <li>Magnetism (65% mastery)</li>
                    <li>Nuclear Physics (68% mastery)</li>
                  </ul>
                </div>
                
                <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/30 shadow-sm">
                  <h4 className="font-semibold text-lg text-red-700 dark:text-red-400 mb-2">Focus Areas</h4>
                  <ul className="list-disc pl-5 text-gray-700 dark:text-gray-300 space-y-1">
                    <li>Electricity (42% mastery)</li>
                    <li>Electronics (55% mastery)</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mistakes" className="mt-4">
          <Card className="overflow-hidden border-none shadow-md bg-white dark:bg-gray-800">
            <div className="h-1 bg-gradient-to-r from-amber-400 via-orange-500 to-red-500"></div>
            <CardHeader className="border-b border-border/10">
              <CardTitle className="text-primary">Mistake Categories</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="w-full md:w-1/2">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={mockMistakeCategories}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="count"
                        nameKey="category"
                        label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        animationDuration={1200}
                        animationBegin={200}
                      >
                        {mockMistakeCategories.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={COLORS[index % COLORS.length]} 
                            stroke="#fff"
                            strokeWidth={2}
                          />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value, name) => [value, name]} 
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          border: '1px solid #e2e8f0',
                          borderRadius: '6px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                          color: '#1e293b'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="w-full md:w-1/2 p-6 rounded-lg border border-primary/10 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 shadow-sm">
                  <h3 className="text-xl font-semibold mb-4 text-primary">Error Analysis</h3>
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-medium mb-2 text-gray-800 dark:text-gray-200 flex items-center">
                        <span className="w-3 h-3 rounded-full bg-purple-500 mr-2"></span>
                        Conceptual Errors (40%)
                      </h4>
                      <p className="text-gray-700 dark:text-gray-300 ml-5">
                        Focus on understanding fundamental principles rather than memorizing formulas.
                        Try creating concept maps to visualize relationships between ideas.
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2 text-gray-800 dark:text-gray-200 flex items-center">
                        <span className="w-3 h-3 rounded-full bg-teal-500 mr-2"></span>
                        Calculation Errors (25%)
                      </h4>
                      <p className="text-gray-700 dark:text-gray-300 ml-5">
                        Practice step-by-step problem solving and double-check your work. Try using estimation to verify your answers.
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2 text-gray-800 dark:text-gray-200 flex items-center">
                        <span className="w-3 h-3 rounded-full bg-amber-500 mr-2"></span>
                        Formula Application (20%)
                      </h4>
                      <p className="text-gray-700 dark:text-gray-300 ml-5">
                        Create a formula sheet with conditions for when each formula applies, and practice identifying the right formula for each problem.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PerformancePage;
