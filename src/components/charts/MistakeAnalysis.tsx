
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MistakeCategory } from '@/types';
import { CircleAlert, CircleX, CornerLeftDown, CornerRightDown, AlignJustify, Glasses } from 'lucide-react';

interface MistakeAnalysisProps {
  mistakes: MistakeCategory[];
}

const MistakeAnalysis: React.FC<MistakeAnalysisProps> = ({ mistakes }) => {
  // Sort mistakes by count (highest first)
  const sortedMistakes = [...mistakes].sort((a, b) => b.count - a.count);

  const getMistakeIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'calculation error':
        return <CircleX className="h-4 w-4 text-red-500" />;
      case 'conceptual error':
        return <CircleAlert className="h-4 w-4 text-amber-500" />;
      case 'misread question':
        return <Glasses className="h-4 w-4 text-blue-500" />;
      case 'incomplete answer':
        return <CornerLeftDown className="h-4 w-4 text-purple-500" />;
      case 'wrong formula':
        return <CornerRightDown className="h-4 w-4 text-emerald-500" />;
      default:
        return <AlignJustify className="h-4 w-4 text-gray-500" />;
    }
  };

  const getMistakeColor = (category: string): string => {
    switch (category.toLowerCase()) {
      case 'calculation error':
        return 'text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/20';
      case 'conceptual error':
        return 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20';
      case 'misread question':
        return 'text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20';
      case 'incomplete answer':
        return 'text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20';
      case 'wrong formula':
        return 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20';
      default:
        return 'text-gray-700 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-rose-50 to-pink-50 dark:from-rose-900/30 dark:to-pink-900/30">
        <CardTitle className="text-lg font-semibold">Common Mistakes</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {sortedMistakes.length === 0 ? (
          <div className="text-center p-8 text-muted-foreground">
            <div className="mx-auto rounded-full w-12 h-12 flex items-center justify-center bg-green-50 dark:bg-green-900/20 mb-3">
              <CircleAlert className="h-6 w-6 text-green-500" />
            </div>
            <p>No common mistakes identified</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {sortedMistakes.map((mistake, index) => (
              <li key={index} className="flex items-center gap-4">
                <div className="w-full flex items-center">
                  <div className={`flex items-center justify-center rounded-l-md p-3 ${getMistakeColor(mistake.category)}`}>
                    {getMistakeIcon(mistake.category)}
                  </div>
                  <div className="flex-grow flex items-center justify-between rounded-r-md border border-l-0 px-4 py-2">
                    <span className="font-medium">{mistake.category}</span>
                    <Badge variant="outline" className="ml-2">
                      {mistake.count} {mistake.count === 1 ? 'occurrence' : 'occurrences'}
                    </Badge>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};

export default MistakeAnalysis;
