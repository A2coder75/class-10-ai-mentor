import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Clock, FileText } from 'lucide-react';
import Navbar from '@/components/Navbar';

const TestHomePage = () => {
  const navigate = useNavigate();

  const subjects = [
    {
      id: 'physics',
      name: 'Physics',
      color: 'from-blue-500 to-cyan-500',
      textColor: 'text-blue-700',
      bgColor: 'bg-blue-50 dark:bg-blue-950/20',
      borderColor: 'border-blue-200 dark:border-blue-900/30',
      chapters: 12,
      papers: 8
    },
    {
      id: 'chemistry',
      name: 'Chemistry',
      color: 'from-green-500 to-emerald-500',
      textColor: 'text-green-700',
      bgColor: 'bg-green-50 dark:bg-green-950/20',
      borderColor: 'border-green-200 dark:border-green-900/30',
      chapters: 10,
      papers: 6
    },
    {
      id: 'biology',
      name: 'Biology',
      color: 'from-emerald-500 to-teal-500',
      textColor: 'text-emerald-700',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/20',
      borderColor: 'border-emerald-200 dark:border-emerald-900/30',
      chapters: 15,
      papers: 7
    },
    {
      id: 'mathematics',
      name: 'Mathematics',
      color: 'from-purple-500 to-indigo-500',
      textColor: 'text-purple-700',
      bgColor: 'bg-purple-50 dark:bg-purple-950/20',
      borderColor: 'border-purple-200 dark:border-purple-900/30',
      chapters: 20,
      papers: 10
    },
    {
      id: 'english-literature',
      name: 'English Literature',
      color: 'from-pink-500 to-rose-500',
      textColor: 'text-pink-700',
      bgColor: 'bg-pink-50 dark:bg-pink-950/20',
      borderColor: 'border-pink-200 dark:border-pink-900/30',
      chapters: 11,
      papers: 5
    },
    {
      id: 'english-language',
      name: 'English Language',
      color: 'from-orange-500 to-amber-500',
      textColor: 'text-orange-700',
      bgColor: 'bg-orange-50 dark:bg-orange-950/20',
      borderColor: 'border-orange-200 dark:border-orange-900/30',
      chapters: 4,
      papers: 4
    },
    {
      id: 'history-civics',
      name: 'History & Civics',
      color: 'from-red-500 to-pink-500',
      textColor: 'text-red-700',
      bgColor: 'bg-red-50 dark:bg-red-950/20',
      borderColor: 'border-red-200 dark:border-red-900/30',
      chapters: 16,
      papers: 6
    },
    {
      id: 'geography',
      name: 'Geography',
      color: 'from-cyan-500 to-blue-500',
      textColor: 'text-cyan-700',
      bgColor: 'bg-cyan-50 dark:bg-cyan-950/20',
      borderColor: 'border-cyan-200 dark:border-cyan-900/30',
      chapters: 14,
      papers: 5
    },
    {
      id: 'commercial-studies',
      name: 'Commercial Studies',
      color: 'from-violet-500 to-purple-500',
      textColor: 'text-violet-700',
      bgColor: 'bg-violet-50 dark:bg-violet-950/20',
      borderColor: 'border-violet-200 dark:border-violet-900/30',
      chapters: 12,
      papers: 4
    }
  ];

  const handleSubjectClick = (subjectId: string) => {
    // For now, navigate to the existing test page
    // TODO: Create subject-specific test pages
    navigate('/test');
  };

  return (
    <div className="page-container pb-20">
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center gap-4 mb-6">
          <img 
            src="/logo_2_transparent.png" 
            alt="Studia Logo" 
            className="h-20 w-auto object-contain"
          />
          <h1 className="text-3xl md:text-4xl font-bold gradient-text">
            Practice Tests
          </h1>
        </div>
        <p className="text-lg text-muted-foreground">
          Choose a subject to start practicing with past year papers
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subjects.map((subject) => (
          <Card 
            key={subject.id}
            className={`card-hover cursor-pointer ${subject.bgColor} ${subject.borderColor} transition-all duration-300 hover:scale-105`}
            onClick={() => handleSubjectClick(subject.id)}
          >
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${subject.color} flex items-center justify-center mb-3`}>
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <Badge variant="secondary" className="text-xs">
                  {subject.papers} Papers
                </Badge>
              </div>
              <CardTitle className={`text-lg font-semibold ${subject.textColor}`}>
                {subject.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  <span>{subject.chapters} Chapters</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>3 hrs duration</span>
                </div>
                <div className={`w-full h-2 rounded-full bg-gradient-to-r ${subject.color} opacity-70`}></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-12 text-center">
        <Card className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-purple-200 dark:border-purple-900/30">
          <CardContent className="p-8">
            <h3 className="text-xl font-semibold mb-4">Mixed Practice Test</h3>
            <p className="text-muted-foreground mb-6">
              Take a comprehensive test covering all subjects
            </p>
            <button 
              onClick={() => navigate('/test')}
              className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white rounded-lg font-medium transition-all duration-300 hover:scale-105"
            >
              Start Mixed Test
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TestHomePage;
