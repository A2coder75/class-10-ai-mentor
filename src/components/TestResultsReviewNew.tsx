import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle2, XCircle } from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';

type Verdict = 'correct' | 'wrong';

interface Evaluation {
  question_number: string;
  section: string;
  question?: string;
  type?: string;
  verdict: Verdict;
  marks_awarded: number;
  total_marks: number;
  mistake: string | string[];
  correct_answer: string | string[];
  mistake_type: string | string[];
  feedback?: string | string[];
  student_answer?: string | string[];
}

interface TestResultsReviewProps {
  evaluations: Evaluation[];
  testName: string;
  timeTaken?: number;
  total_marks_awarded?: number;
  total_marks_possible?: number;
}

const capitalize = (s: string) => s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
const toArray = (v: string | string[] | undefined): string[] => v == null ? [] : (Array.isArray(v) ? v : [v]);

const COLORS = ['#22c55e', '#ef4444'];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border border-border rounded-lg px-3 py-2 shadow-md">
        <p className="text-sm font-medium text-foreground">{payload[0].name}: {payload[0].value}</p>
      </div>
    );
  }
  return null;
};

const TestResultsReviewNew: React.FC<TestResultsReviewProps> = ({
  evaluations,
  testName,
  timeTaken,
  total_marks_awarded,
  total_marks_possible
}) => {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const totalMarks = total_marks_awarded ?? evaluations.reduce((sum, e) => sum + (e.marks_awarded || 0), 0);
  const maxMarks = total_marks_possible ?? evaluations.reduce((sum, e) => sum + (e.total_marks || 0), 0);
  const percentage = Math.round((totalMarks / Math.max(maxMarks, 1)) * 100);

  const correctCount = useMemo(() => evaluations.filter(e => e.verdict === 'correct').length, [evaluations]);
  const wrongCount = evaluations.length - correctCount;

  const performanceDistribution = [
    { name: 'Correct', value: correctCount, color: COLORS[0] },
    { name: 'Wrong', value: wrongCount, color: COLORS[1] }
  ];

  const marksData = [
    { name: 'Marks Gained', value: totalMarks, fill: COLORS[0] },
    { name: 'Marks Lost', value: maxMarks - totalMarks, fill: COLORS[1] }
  ];

  const mistakeTypeMap = useMemo(() => {
    const map: Record<string, number> = {};
    evaluations.forEach(e => {
      if (e.verdict !== 'wrong' || !e.mistake_type) return;
      toArray(e.mistake_type).forEach(t => {
        const key = t.trim();
        if (!key) return;
        map[key] = (map[key] || 0) + 1;
      });
    });
    return map;
  }, [evaluations]);

  const mistakeTypeData = Object.entries(mistakeTypeMap).map(([type, count]) => ({
    type: capitalize(type),
    count
  }));

  const toggle = (q: string) => {
    const next = new Set(expanded);
    next.has(q) ? next.delete(q) : next.add(q);
    setExpanded(next);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="px-4 md:px-6 py-6 md:py-8">
        <div className="max-w-5xl mx-auto text-center space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">Test Analysis</h1>
          <p className="text-muted-foreground">{testName}</p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 md:px-6 space-y-6 md:space-y-8">
        {/* Overall Score */}
        <section>
          <Card className="border">
            <CardContent className="p-6 md:p-8">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="text-center md:text-left">
                  <div className="text-6xl font-bold text-primary">{percentage}%</div>
                  <p className="text-muted-foreground mt-1">
                    Score • {totalMarks} / {maxMarks}{timeTaken ? ` • ${timeTaken}m` : ''}
                  </p>
                </div>
                <ResponsiveContainer width={160} height={160}>
                  <PieChart>
                    <Pie
                      data={performanceDistribution}
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {performanceDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Marks breakdown */}
        <section>
          <Card>
            <CardHeader>
              <CardTitle>Marks Gained vs Lost</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={marksData} layout="vertical" barCategoryGap="20%">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                  <XAxis type="number" domain={[0, maxMarks]} stroke="hsl(var(--muted-foreground))" />
                  <YAxis type="category" dataKey="name" stroke="hsl(var(--muted-foreground))" />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" radius={[4, 4, 4, 4]}>
                    {marksData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </section>

        {/* Mistake type analysis */}
        {mistakeTypeData.length > 0 && (
          <section>
            <Card>
              <CardHeader>
                <CardTitle>Mistake Types</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={mistakeTypeData} layout="vertical" barCategoryGap="15%">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                    <XAxis type="number" allowDecimals={false} stroke="hsl(var(--muted-foreground))" />
                    <YAxis type="category" dataKey="type" stroke="hsl(var(--muted-foreground))" width={100} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="count" fill="#06b6d4" radius={[4, 4, 4, 4]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </section>
        )}

        {/* Question-by-question */}
        <section>
          <Card>
            <CardHeader>
              <CardTitle>Question Analysis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {evaluations.map((e) => {
                const isCorrect = e.verdict === 'correct';
                const yourAnswer = toArray(e.student_answer);
                const correctAns = toArray(e.correct_answer);
                const feedback = toArray(e.feedback);

                return (
                  <div key={e.question_number} className="rounded-lg border overflow-hidden">
                    <button
                      type="button"
                      onClick={() => toggle(e.question_number)}
                      className={`w-full text-left p-4 hover:bg-muted/50 transition-colors border-l-4 ${
                        isCorrect ? 'border-l-primary' : 'border-l-destructive'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-medium">Q{e.question_number}</span>
                          {e.section && <Badge variant="outline" className="text-xs">Section {e.section}</Badge>}
                          {e.type && <Badge variant="secondary" className="text-xs">{e.type}</Badge>}
                          <Badge variant={isCorrect ? "default" : "destructive"}>
                            {isCorrect ? 'Correct' : 'Wrong'}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`font-semibold ${isCorrect ? 'text-primary' : 'text-destructive'}`}>
                            {e.marks_awarded}/{e.total_marks}
                          </span>
                          {isCorrect ? <CheckCircle2 className="h-5 w-5 text-primary" /> : <XCircle className="h-5 w-5 text-destructive" />}
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
                            <div>
                              <h4 className="font-medium mb-1">Question</h4>
                              <p className="text-sm text-foreground leading-relaxed">{e.question}</p>
                            </div>
                          )}

                          <Separator />

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <h4 className="font-medium mb-2">Your Answer</h4>
                              {yourAnswer.length > 0 ? (
                                <div className={`p-3 rounded-lg border text-sm ${isCorrect ? 'text-primary' : 'text-destructive'}`}>
                                  {yourAnswer.join(', ')}
                                </div>
                              ) : (
                                <p className="text-sm text-muted-foreground">Not provided</p>
                              )}
                            </div>

                            {!isCorrect && (
                              <div>
                                <h4 className="font-medium mb-2">Correct Answer</h4>
                                <div className="p-3 rounded-lg border text-sm">
                                  {correctAns.join(', ')}
                                </div>
                              </div>
                            )}

                            {feedback.length > 0 && (
                              <div>
                                <h4 className="font-medium mb-2">Feedback</h4>
                                <div className="p-3 rounded-lg border text-sm bg-background">
                                  {feedback.join(' ')}
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
