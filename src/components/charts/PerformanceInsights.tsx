import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, TrendingDown, Target, Clock, 
  AlertTriangle, CheckCircle, Brain, Award
} from "lucide-react";

interface Question {
  id: number;
  question: string;
  studentAnswer: string;
  correctAnswer: string;
  marks: number;
  maxMarks: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  type: 'MCQ' | 'Short Answer' | 'Long Answer';
  topic: string;
  mistakes?: string[];
  feedback?: string;
}

interface PerformanceInsightsProps {
  questions: Question[];
  totalMarks: number;
  maxMarks: number;
  timeTaken: number;
}

const PerformanceInsights: React.FC<PerformanceInsightsProps> = ({
  questions,
  totalMarks,
  maxMarks,
  timeTaken
}) => {
  const accuracyRate = Math.round((totalMarks / maxMarks) * 100);
  const avgTimePerQuestion = Math.round(timeTaken / questions.length);
  
  // Analyze performance patterns
  const difficultyAnalysis = {
    easy: questions.filter(q => q.difficulty === 'Easy'),
    medium: questions.filter(q => q.difficulty === 'Medium'),
    hard: questions.filter(q => q.difficulty === 'Hard')
  };

  const typeAnalysis = {
    mcq: questions.filter(q => q.type === 'MCQ'),
    short: questions.filter(q => q.type === 'Short Answer'),
    long: questions.filter(q => q.type === 'Long Answer')
  };

  // Calculate accuracy by difficulty
  const getAccuracyByDifficulty = (qs: Question[]) => {
    if (qs.length === 0) return 0;
    const marks = qs.reduce((sum, q) => sum + q.marks, 0);
    const maxMarks = qs.reduce((sum, q) => sum + q.maxMarks, 0);
    return Math.round((marks / maxMarks) * 100);
  };

  // Identify weak areas
  const topics = [...new Set(questions.map(q => q.topic))];
  const weakAreas = topics
    .map(topic => {
      const topicQuestions = questions.filter(q => q.topic === topic);
      const topicMarks = topicQuestions.reduce((sum, q) => sum + q.marks, 0);
      const topicMaxMarks = topicQuestions.reduce((sum, q) => sum + q.maxMarks, 0);
      const accuracy = topicMaxMarks > 0 ? (topicMarks / topicMaxMarks) * 100 : 0;
      return { topic, accuracy, questions: topicQuestions.length };
    })
    .filter(area => area.accuracy < 70)
    .sort((a, b) => a.accuracy - b.accuracy)
    .slice(0, 3);

  // Identify strong areas
  const strongAreas = topics
    .map(topic => {
      const topicQuestions = questions.filter(q => q.topic === topic);
      const topicMarks = topicQuestions.reduce((sum, q) => sum + q.marks, 0);
      const topicMaxMarks = topicQuestions.reduce((sum, q) => sum + q.maxMarks, 0);
      const accuracy = topicMaxMarks > 0 ? (topicMarks / topicMaxMarks) * 100 : 0;
      return { topic, accuracy, questions: topicQuestions.length };
    })
    .filter(area => area.accuracy >= 80)
    .sort((a, b) => b.accuracy - a.accuracy)
    .slice(0, 3);

  // Common mistake patterns
  const allMistakes = questions.flatMap(q => q.mistakes || []);
  const mistakeFrequency = allMistakes.reduce((acc, mistake) => {
    acc[mistake] = (acc[mistake] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const topMistakes = Object.entries(mistakeFrequency)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Performance Summary */}
      <Card className="md:col-span-2 lg:col-span-3">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Performance Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="text-3xl font-bold text-blue-600">{accuracyRate}%</div>
              <div className="text-sm text-muted-foreground">Overall Score</div>
            </div>
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="text-3xl font-bold text-green-600">{avgTimePerQuestion}min</div>
              <div className="text-sm text-muted-foreground">Avg Time</div>
            </div>
            <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div className="text-3xl font-bold text-purple-600">{questions.length}</div>
              <div className="text-sm text-muted-foreground">Questions</div>
            </div>
            <div className="text-center p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
              <div className="text-3xl font-bold text-amber-600">
                {getAccuracyByDifficulty(difficultyAnalysis.hard)}%
              </div>
              <div className="text-sm text-muted-foreground">Hard Questions</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Difficulty Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Difficulty Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm">Easy ({difficultyAnalysis.easy.length})</span>
                <span className="text-sm font-medium">{getAccuracyByDifficulty(difficultyAnalysis.easy)}%</span>
              </div>
              <Progress value={getAccuracyByDifficulty(difficultyAnalysis.easy)} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm">Medium ({difficultyAnalysis.medium.length})</span>
                <span className="text-sm font-medium">{getAccuracyByDifficulty(difficultyAnalysis.medium)}%</span>
              </div>
              <Progress value={getAccuracyByDifficulty(difficultyAnalysis.medium)} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm">Hard ({difficultyAnalysis.hard.length})</span>
                <span className="text-sm font-medium">{getAccuracyByDifficulty(difficultyAnalysis.hard)}%</span>
              </div>
              <Progress value={getAccuracyByDifficulty(difficultyAnalysis.hard)} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Question Type Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Question Types
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm">MCQ ({typeAnalysis.mcq.length})</span>
                <span className="text-sm font-medium">{getAccuracyByDifficulty(typeAnalysis.mcq)}%</span>
              </div>
              <Progress value={getAccuracyByDifficulty(typeAnalysis.mcq)} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm">Short Answer ({typeAnalysis.short.length})</span>
                <span className="text-sm font-medium">{getAccuracyByDifficulty(typeAnalysis.short)}%</span>
              </div>
              <Progress value={getAccuracyByDifficulty(typeAnalysis.short)} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm">Long Answer ({typeAnalysis.long.length})</span>
                <span className="text-sm font-medium">{getAccuracyByDifficulty(typeAnalysis.long)}%</span>
              </div>
              <Progress value={getAccuracyByDifficulty(typeAnalysis.long)} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Strengths */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-green-500" />
            Your Strengths
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {strongAreas.length > 0 ? (
              strongAreas.map((area, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-900/20 rounded">
                  <span className="text-sm font-medium">{area.topic}</span>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    {Math.round(area.accuracy)}%
                  </Badge>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">Keep practicing to build your strengths!</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Areas for Improvement */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Areas for Improvement
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {weakAreas.length > 0 ? (
              <>
                <div className="grid gap-3">
                  {weakAreas.map((area, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-900/20 rounded">
                      <div>
                        <span className="font-medium">{area.topic}</span>
                        <span className="text-sm text-muted-foreground ml-2">({area.questions} questions)</span>
                      </div>
                      <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                        {Math.round(area.accuracy)}%
                      </Badge>
                    </div>
                  ))}
                </div>
                
                {topMistakes.length > 0 && (
                  <div className="pt-4 border-t">
                    <h4 className="font-medium mb-3">Common Mistakes:</h4>
                    <div className="space-y-2">
                      {topMistakes.map(([mistake, count], index) => (
                        <div key={index} className="flex items-center justify-between text-sm">
                          <span>{mistake}</span>
                          <Badge variant="outline">{count}x</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-4">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
                <p className="text-sm font-medium">Great job! No major weak areas identified.</p>
                <p className="text-xs text-muted-foreground">Keep up the excellent work!</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PerformanceInsights;