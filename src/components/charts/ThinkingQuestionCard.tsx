
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CircleDot } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';

interface ThinkingQuestionProps {
  question: string;
  subject?: string;
  chapter?: string;
  answer?: string;
  isOpen?: boolean;
}

const ThinkingQuestionCard = ({ question, subject, chapter, answer, isOpen = false }: ThinkingQuestionProps) => {
  const [open, setOpen] = React.useState(isOpen);

  return (
    <Card className="border-none shadow-md rounded-xl overflow-hidden bg-gradient-to-br from-white to-amber-50/30 dark:from-gray-900 dark:to-amber-900/10">
      <CardHeader className="pb-2 pt-4 px-4 border-b border-amber-100/50 dark:border-amber-900/20">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base text-amber-800 dark:text-amber-300 flex items-center gap-2">
            <CircleDot className="h-5 w-5 text-amber-500 animate-pulse" />
            Thinking Question
          </CardTitle>
          {subject && (
            <Badge variant="outline" className="bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800">
              {subject}
            </Badge>
          )}
        </div>
        {chapter && (
          <div className="text-sm text-amber-600/80 dark:text-amber-500/80 mt-1">
            {chapter}
          </div>
        )}
      </CardHeader>
      <CardContent className="pt-4 px-4 pb-4">
        <Collapsible open={open} onOpenChange={setOpen}>
          <div className="space-y-4">
            <div className="font-medium text-lg text-amber-900 dark:text-amber-200 leading-relaxed">
              {question}
            </div>
            
            <CollapsibleTrigger asChild>
              <Button 
                variant="outline" 
                className="w-full border-dashed border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20"
              >
                {open ? "Hide Answer" : "Reveal Answer"}
                <ChevronDown className={`h-4 w-4 ml-2 transition-transform ${open ? "transform rotate-180" : ""}`} />
              </Button>
            </CollapsibleTrigger>
            
            <CollapsibleContent className="space-y-2">
              <div className="p-4 rounded-lg bg-gradient-to-r from-amber-50 to-amber-100/50 dark:from-amber-900/10 dark:to-amber-900/20 text-amber-800 dark:text-amber-300 border border-amber-200/50 dark:border-amber-800/30">
                <div className="font-semibold mb-2">Answer:</div>
                <div className="text-amber-700 dark:text-amber-400 leading-relaxed">
                  {answer || "No answer provided for this thinking question."}
                </div>
              </div>
            </CollapsibleContent>
          </div>
        </Collapsible>
      </CardContent>
    </Card>
  );
};

export default ThinkingQuestionCard;
