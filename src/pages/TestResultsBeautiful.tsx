import React, { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Trophy, Target, Brain, BookOpen, Clock, Download, RotateCcw, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Evaluation {
  question_number: string;
  type: string;
  verdict: 'correct' | 'incorrect' | 'partial';
  marks_awarded: number;
  total_marks: number;
  mistake?: string;
  correct_answer?: string;
  mistake_type?: string;
  feedback?: string;
}

interface ResultsData {
  evaluations: Evaluation[];
  total_marks_awarded: number;
  total_marks_possible: number;
}

export default function TestResultsBeautiful() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get results from navigation state or localStorage
  const resultsData: ResultsData | null = useMemo(() => {
    if (location.state?.evaluations) {
      return location.state;
    }
    
    const stored = localStorage.getItem('lastEvaluations');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return null;
      }
    }
    
    return null;
  }, [location.state]);

  // Calculate metrics
  const metrics = useMemo(() => {
    if (!resultsData) return null;
    
    const { evaluations, total_marks_awarded, total_marks_possible } = resultsData;
    const percentage = (total_marks_awarded / 80) * 100;
    const scoreOutOf80 = total_marks_awarded;
    
    const correct = evaluations.filter(e => e.verdict === 'correct').length;
    const incorrect = evaluations.filter(e => e.verdict === 'incorrect').length;
    const partial = evaluations.filter(e => e.verdict === 'partial').length;
    
    const mistakeTypes = evaluations
      .filter(e => e.mistake_type)
      .reduce((acc, e) => {
        const type = e.mistake_type || 'Other';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
    
    return {
      totalAwarded: total_marks_awarded,
      totalPossible: total_marks_possible,
      percentage: Math.round(percentage),
      scoreOutOf80: Math.round(scoreOutOf80),
      correct,
      incorrect,
      partial,
      total: evaluations.length,
      mistakeTypes,
      evaluations
    };
  }, [resultsData]);

  if (!resultsData || !metrics) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-primary/5 flex items-center justify-center p-4">
        <Card className="w-full max-w-md glass-morphism">
          <CardContent className="p-8 text-center space-y-4">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto" />
            <h3 className="text-lg font-semibold">No Results Found</h3>
            <p className="text-sm text-muted-foreground">
              No test results available to display. Please take a test first.
            </p>
            <Button onClick={() => navigate('/test')} className="w-full">
              Take a Test
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const pieData = [
    { name: 'Correct', value: metrics.correct, color: '#22c55e' }, // green-500
    { name: 'Incorrect', value: metrics.incorrect, color: '#ef4444' }, // red-500
    { name: 'Partial', value: metrics.partial, color: '#f59e0b' } // amber-500
  ].filter(d => d.value > 0);


  const mistakeData = Object.entries(metrics.mistakeTypes).map(([type, count]) => ({
    type,
    count
  }));

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600 dark:text-green-400';
    if (percentage >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getScoreGradient = (percentage: number) => {
    if (percentage >= 80) return 'from-green-500 to-emerald-600';
    if (percentage >= 60) return 'from-yellow-500 to-orange-600';
    return 'from-red-500 to-rose-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-primary/5">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-primary/20 via-primary/10 to-transparent">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-12">
          <div className="text-center space-y-6">
            <div className="inline-flex items-center gap-2 bg-background/50 backdrop-blur-sm px-4 py-2 rounded-full border">
              <Trophy className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">Test Results</span>
            </div>
            
            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                {metrics.scoreOutOf80}<span className="text-2xl md:text-4xl">/80</span>
              </h1>
              <div className={cn("text-xl md:text-2xl font-semibold", getScoreColor(metrics.percentage))}>
                {metrics.percentage}% ({metrics.totalAwarded}/{metrics.totalPossible} marks)
              </div>
              <div className="max-w-md mx-auto">
                <Progress 
                  value={metrics.percentage} 
                  className="h-3 bg-muted"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-4 space-y-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="glass-morphism hover-card">
            <CardContent className="p-6 text-center">
              <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{metrics.correct}</div>
              <div className="text-sm text-muted-foreground">Correct</div>
            </CardContent>
          </Card>
          
          <Card className="glass-morphism hover-card">
            <CardContent className="p-6 text-center">
              <XCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">{metrics.incorrect}</div>
              <div className="text-sm text-muted-foreground">Incorrect</div>
            </CardContent>
          </Card>
          
          <Card className="glass-morphism hover-card">
            <CardContent className="p-6 text-center">
              <AlertCircle className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{metrics.partial}</div>
              <div className="text-sm text-muted-foreground">Partial</div>
            </CardContent>
          </Card>
          
          <Card className="glass-morphism hover-card">
            <CardContent className="p-6 text-center">
              <Target className="h-8 w-8 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold">{metrics.total}</div>
              <div className="text-sm text-muted-foreground">Total Questions</div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Performance Distribution */}
          <Card className="glass-morphism">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                Performance Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Mistake Analysis */}
          {mistakeData.length > 0 && (
            <Card className="glass-morphism">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  Mistake Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={mistakeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="type" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Detailed Results */}
        <Card className="glass-morphism">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Detailed Question Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="space-y-2">
              {metrics.evaluations.map((evaluation, index) => (
                <AccordionItem 
                  key={evaluation.question_number} 
                  value={`question-${index}`}
                  className="border rounded-lg px-4"
                >
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center justify-between w-full pr-4">
                      <div className="flex items-center gap-3">
                        <Badge variant={
                          evaluation.verdict === 'correct' ? 'default' : 
                          evaluation.verdict === 'partial' ? 'secondary' : 'destructive'
                        }>
                          Q{evaluation.question_number}
                        </Badge>
                        <span className="text-sm font-medium">{evaluation.type.toUpperCase()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          {evaluation.marks_awarded}/{evaluation.total_marks}
                        </span>
                        {evaluation.verdict === 'correct' ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : evaluation.verdict === 'partial' ? (
                          <AlertCircle className="h-4 w-4 text-yellow-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-4 space-y-3">
                    {evaluation.correct_answer && (
                      <div>
                        <div className="text-sm font-medium text-green-600 dark:text-green-400 mb-1">
                          Correct Answer:
                        </div>
                        <div className="text-sm bg-green-50 dark:bg-green-950/30 p-2 rounded border">
                          {evaluation.correct_answer}
                        </div>
                      </div>
                    )}
                    
                    {evaluation.mistake && (
                      <div>
                        <div className="text-sm font-medium text-red-600 dark:text-red-400 mb-1">
                          Mistake:
                        </div>
                        <div className="text-sm bg-red-50 dark:bg-red-950/30 p-2 rounded border">
                          {evaluation.mistake}
                        </div>
                      </div>
                    )}
                    
                    {evaluation.feedback && (
                      <div>
                        <div className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-1">
                          Feedback:
                        </div>
                        <div className="text-sm bg-blue-50 dark:bg-blue-950/30 p-2 rounded border">
                          {evaluation.feedback}
                        </div>
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            onClick={() => navigate('/test')}
            className="flex items-center gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
          >
            <RotateCcw className="h-4 w-4" />
            Retake Test
          </Button>
          
          <Button 
            variant="outline"
            onClick={() => window.print()}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Download Results
          </Button>
        </div>
      </div>
    </div>
  );
}
