import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle2, XCircle, PieChart as PieChartIcon, BarChart3 } from 'lucide-react';
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
  CartesianGrid
} from 'recharts';

// Minimal, student-focused test analysis UI

type Verdict = 'correct' | 'wrong';

interface Evaluation {
  question_number: string;
  section: string;
  question?: string; // question text
  type?: string; // question type
  verdict: Verdict;
  marks_awarded: number;
  mistake: string | string[];
  correct_answer: string | string[];
  mistake_type: string | string[];
  feedback?: string | string[];
  // Optional: include if available in your data
  student_answer?: string | string[];
}

interface TestResultsReviewProps {
  evaluations: Evaluation[];
  testName: string;
  timeTaken?: number;
}

const capitalize = (s: string) => s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
const toArray = (v: string | string[] | undefined): string[] => v == null ? [] : (Array.isArray(v) ? v : [v]);

const TestResultsReviewNew: React.FC<TestResultsReviewProps> = ({ evaluations, testName, timeTaken }) => {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const totalMarks = useMemo(() => evaluations.reduce((sum, e) => sum + (e.marks_awarded || 0), 0), [evaluations]);
  const maxMarks = Math.max(evaluations.length, 1);
  const percentage = Math.round((totalMarks / maxMarks) * 100);

  const correctCount = useMemo(() => evaluations.filter(e => e.verdict === 'correct').length, [evaluations]);
  const wrongCount = useMemo(() => evaluations.filter(e => e.verdict === 'wrong').length, [evaluations]);

  const performanceDistribution = [
    { name: 'Correct', value: correctCount, color: 'hsl(var(--chart-1))' },
    { name: 'Wrong', value: wrongCount, color: 'hsl(var(--chart-2))' }
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
                  <p className="text-muted-foreground mt-1">Score • {totalMarks} / {maxMarks}{timeTaken ? ` • ${timeTaken}m` : ''}</p>
                </div>
                <div className="grid grid-cols-2 gap-6 text-center">
                  <div>
                    <div className="flex items-center justify-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                      <span className="font-semibold text-foreground">{correctCount}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Correct</p>
                  </div>
                  <div>
                    <div className="flex items-center justify-center gap-2">
                      <XCircle className="h-5 w-5 text-destructive" />
                      <span className="font-semibold text-foreground">{wrongCount}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Wrong</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Charts */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <Card>
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
                    outerRadius={100}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                    labelLine={false}
                  >
                    {performanceDistribution.map((d, i) => (
                      <Cell key={i} fill={d.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: 6,
                      color: 'hsl(var(--foreground))'
                    }}
                  />
                </RechartsPieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" /> Mistake Types (Wrong only)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {mistakeTypeData.length === 0 ? (
                <p className="text-sm text-muted-foreground">No mistakes to analyze.</p>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={mistakeTypeData} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                    <XAxis dataKey="type" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis allowDecimals={false} stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: 6,
                        color: 'hsl(var(--foreground))'
                      }}
                    />
                    <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </section>

        {/* Question-by-question analysis */}
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
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`font-semibold ${isCorrect ? 'text-primary' : 'text-destructive'}`}>{e.marks_awarded}/1</span>
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

                          {!isCorrect && toArray(e.mistake).length > 0 && (
                            <>
                              <Separator />
                              <div>
                                <h4 className="font-medium mb-2">Mistake</h4>
                                <div className="p-3 rounded-lg border text-sm bg-background">
                                  {toArray(e.mistake).join('. ')}
                                </div>
                              </div>
                            </>
                          )}

                          {toArray(e.mistake_type).length > 0 && (
                            <>
                              <Separator />
                              <div>
                                <h4 className="font-medium mb-2">Mistake Type</h4>
                                <div className="flex flex-wrap gap-2">
                                  {toArray(e.mistake_type).map((t, i) => (
                                    <Badge key={i} variant="secondary">{capitalize(t)}</Badge>
                                  ))}
                                </div>
                              </div>
                            </>
                          )}
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
