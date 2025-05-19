
import React from 'react';
import { QuestionResult, MistakeCategory, ChapterPerformance } from '@/types';
import OverallScore from './charts/OverallScore';
import RadarPerformanceChart from './charts/RadarPerformanceChart';
import DonutChart from './charts/DonutChart';
import StackedBarChart from './charts/StackedBarChart';
import MistakeAnalysis from './charts/MistakeAnalysis';
import { normalizeSubjectName } from '@/utils/studyPlannerStorage';

interface TestResultsDashboardProps {
  totalScore: number;
  maxScore: number;
  sectionScores: { [key: string]: { score: number; total: number } };
  questionResults: QuestionResult[];
  previousScore?: number;
}

const TestResultsDashboard: React.FC<TestResultsDashboardProps> = ({
  totalScore,
  maxScore,
  sectionScores,
  questionResults,
  previousScore
}) => {
  // Process chapter performances
  const chapterPerformances: ChapterPerformance[] = Object.entries(sectionScores).map(
    ([chapter, scores]) => ({
      chapter: normalizeSubjectName(chapter),
      score: scores.score,
      total: scores.total
    })
  );

  // Question type breakdown
  const questionTypeMap: { [key: string]: { correct: number; total: number } } = {};
  questionResults.forEach(question => {
    const type = question.questionId.includes('mcq') 
      ? 'Multiple Choice' 
      : question.questionId.includes('fill') 
        ? 'Fill in the Blank' 
        : 'Descriptive';
    
    if (!questionTypeMap[type]) {
      questionTypeMap[type] = { correct: 0, total: 0 };
    }
    
    questionTypeMap[type].total += 1;
    if (question.isCorrect) {
      questionTypeMap[type].correct += 1;
    }
  });
  
  const questionTypeData = Object.entries(questionTypeMap).map(([type, data]) => ({
    name: type,
    value: data.total,
    color: type === 'Multiple Choice' 
      ? '#8884d8' 
      : type === 'Fill in the Blank' 
        ? '#82ca9d' 
        : '#ffc658',
    accuracy: Math.round((data.correct / data.total) * 100)
  }));

  // Attempted vs Unattempted
  const attemptedCount = questionResults.filter(q => q.studentAnswer && q.studentAnswer.length > 0).length;
  const unattemptedCount = questionResults.length - attemptedCount;
  
  const attemptData = [
    { name: 'Attempted', value: attemptedCount, color: '#4CAF50' },
    { name: 'Skipped', value: unattemptedCount, color: '#FFA726' }
  ];

  // Common mistakes analysis
  const mistakeMap: { [key: string]: number } = {};
  questionResults.forEach(question => {
    if (!question.isCorrect && question.feedback) {
      let mistakeType = 'Other';
      
      if (question.feedback.includes('calculation')) {
        mistakeType = 'Calculation Error';
      } else if (question.feedback.includes('concept') || question.feedback.includes('understand')) {
        mistakeType = 'Conceptual Error';
      } else if (question.feedback.includes('misread') || question.feedback.includes('misunderstood')) {
        mistakeType = 'Misread Question';
      } else if (question.feedback.includes('incomplete') || question.feedback.includes('missing')) {
        mistakeType = 'Incomplete Answer';
      } else if (question.feedback.includes('formula') || question.feedback.includes('equation')) {
        mistakeType = 'Wrong Formula';
      }
      
      mistakeMap[mistakeType] = (mistakeMap[mistakeType] || 0) + 1;
    }
  });
  
  const commonMistakes: MistakeCategory[] = Object.entries(mistakeMap).map(
    ([category, count]) => ({ category, count })
  );

  // Subject performance data for the stacked bar chart
  const subjectTimeData = [
    {
      name: 'Mathematics',
      Easy: 15,
      Medium: 30,
      Hard: 20
    },
    {
      name: 'Physics',
      Easy: 10,
      Medium: 20,
      Hard: 25
    },
    {
      name: 'Chemistry',
      Easy: 12,
      Medium: 18,
      Hard: 15
    },
    {
      name: 'Biology',
      Easy: 8,
      Medium: 22,
      Hard: 10
    }
  ];
  
  const difficultyCategoryColors = ['#82ca9d', '#8884d8', '#ff7c43'];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-6">
        <OverallScore 
          score={totalScore} 
          maxScore={maxScore} 
          previousScore={previousScore}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <RadarPerformanceChart data={chapterPerformances} />
        
        <DonutChart 
          data={questionTypeData}
          title="Question Type Breakdown"
          description="Performance by question format"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StackedBarChart 
          data={subjectTimeData}
          keys={['Easy', 'Medium', 'Hard']}
          colors={difficultyCategoryColors}
          title="Time Spent by Subject & Difficulty"
          yAxisUnit="min"
        />
        
        <DonutChart 
          data={attemptData}
          title="Attempted vs Skipped Questions"
          innerRadius={50}
          outerRadius={90}
        />
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        <MistakeAnalysis mistakes={commonMistakes} />
      </div>
    </div>
  );
};

export default TestResultsDashboard;
