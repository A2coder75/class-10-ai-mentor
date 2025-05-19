
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Gauge, BarChart2, PieChart, BarChartHorizontal, CircleDot } from 'lucide-react';
import PerformanceGauge from './PerformanceGauge';
import TopicPerformanceChart from './TopicPerformanceChart';
import AttemptedDonutChart from './AttemptedDonutChart';
import TimeSpentChart from './TimeSpentChart';
import ThinkingQuestionCard from './ThinkingQuestionCard';

// These are sample data structures - replace with your actual data
interface ResultsData {
  score: number;
  maxScore: number;
  topicPerformance: {
    topic: string;
    accuracy: number;
    attempted: number;
    total: number;
  }[];
  questionStats: {
    attempted: number;
    total: number;
  };
  timeSpent: {
    subject: string;
    timeSpent: number;
    recommendedTime?: number;
  }[];
  thinkingQuestions: {
    question: string;
    subject?: string;
    chapter?: string;
    answer?: string;
  }[];
}

interface EnhancedResultsProps {
  data: ResultsData;
}

const EnhancedResultsView: React.FC<EnhancedResultsProps> = ({ data }) => {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <PerformanceGauge 
          score={data.score} 
          maxScore={data.maxScore} 
          title="Overall Performance"
        />
        <AttemptedDonutChart 
          attempted={data.questionStats.attempted} 
          total={data.questionStats.total}
        />
      </div>

      <Tabs defaultValue="topics" className="w-full">
        <TabsList className="w-full grid grid-cols-3 mb-6">
          <TabsTrigger value="topics" className="flex items-center gap-2">
            <BarChart2 className="h-4 w-4" /> 
            Topic Performance
          </TabsTrigger>
          <TabsTrigger value="time" className="flex items-center gap-2">
            <BarChartHorizontal className="h-4 w-4" /> 
            Time Analysis
          </TabsTrigger>
          <TabsTrigger value="thinking" className="flex items-center gap-2">
            <CircleDot className="h-4 w-4" /> 
            Thinking Questions
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="topics">
          <TopicPerformanceChart 
            data={data.topicPerformance} 
            chartType="bar"
          />
        </TabsContent>
        
        <TabsContent value="time">
          <TimeSpentChart 
            data={data.timeSpent}
          />
        </TabsContent>
        
        <TabsContent value="thinking" className="space-y-6">
          {data.thinkingQuestions.length > 0 ? (
            data.thinkingQuestions.map((question, index) => (
              <ThinkingQuestionCard
                key={index}
                question={question.question}
                subject={question.subject}
                chapter={question.chapter}
                answer={question.answer}
              />
            ))
          ) : (
            <Card className="border-none shadow-md rounded-xl overflow-hidden bg-white dark:bg-gray-900">
              <CardContent className="p-8 text-center">
                <CircleDot className="h-12 w-12 text-amber-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Thinking Questions</h3>
                <p className="text-muted-foreground">
                  This test doesn't contain any thinking questions or challenges.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedResultsView;
