
import React, { useState } from "react";
import { Question, QuestionEvaluation } from "../types";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { CheckCircle2, XCircle, HelpCircle, MessageCircle, Star, Info } from "lucide-react";

interface QuestionCardProps {
  question: Question;
  onAnswerChange: (questionId: string, answer: string | string[]) => void;
  studentAnswer?: string | string[];
  showResults?: boolean;
  evaluation?: QuestionEvaluation;
}

const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  onAnswerChange,
  studentAnswer = "",
  showResults = false,
  evaluation,
}) => {
  const [answer, setAnswer] = useState<string | string[]>(studentAnswer);

  const handleMCQChange = (value: string) => {
    setAnswer(value);
    onAnswerChange(question.id || question.question_number || "", value);
  };

  const handleSubjectiveChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setAnswer(e.target.value);
    onAnswerChange(question.id || question.question_number || "", e.target.value);
  };

  const isCorrect = evaluation ? evaluation.marks_awarded === evaluation.total_marks : false;
  
  const cardClasses = `transition-all duration-300 animate-fade-in hover:shadow-lg 
    ${showResults ? (isCorrect ? 'shadow-green-400/20 dark:shadow-green-400/10' : 
    'shadow-red-400/20 dark:shadow-red-400/10') : 'hover:shadow-primary/20 dark:hover:shadow-primary/10'}`;

  const glowClasses = `absolute inset-0 -z-10 bg-gradient-to-r rounded-lg opacity-30 blur-xl transition-opacity 
    ${showResults ? (isCorrect ? 'from-green-200 to-green-300 dark:from-green-900 dark:to-green-800' : 
    'from-red-200 to-red-300 dark:from-red-900 dark:to-red-800') : 
    'from-primary/30 to-blue-400/30 dark:from-primary/20 dark:to-blue-700/20'} 
    group-hover:opacity-70`;

  return (
    <Card className={`mb-6 overflow-hidden border-none shadow-md relative group ${cardClasses}`}>
      <div className={glowClasses}></div>
      <div className="h-1 bg-gradient-to-r from-purple-400 via-blue-500 to-indigo-500"></div>
      <CardContent className="pt-6 px-6 relative z-10">
        <div className="flex justify-between mb-3">
          <div className="flex space-x-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
              {question.type === "mcq" ? "Multiple Choice" : 
               question.type === "descriptive" ? "Descriptive" : 
               question.type === "fill_in_blank" ? "Fill in Blank" : 
               question.type === "numerical" ? "Numerical" : 
               "Subjective"}
            </span>
            {question.section && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary/80 text-secondary-foreground">
                Section {question.section}
              </span>
            )}
          </div>
          {question.marks && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-foreground">
              <Star className="w-3 h-3 mr-1" />
              {question.marks} {question.marks === 1 ? "mark" : "marks"}
            </span>
          )}
        </div>
        
        <div className="flex items-start gap-3 mb-4">
          {question.question_number && (
            <div className="text-sm font-semibold text-primary min-w-[50px]">
              Q{question.question_number}:
            </div>
          )}
          <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200">
            {question.question_text || question.text}
          </h3>
        </div>
        
        {question.image || question.diagram ? (
          <div className="my-5 rounded-lg overflow-hidden border border-border/50 shadow-sm">
            <img 
              src={question.image || question.diagram} 
              alt="Question diagram" 
              className="w-full h-auto object-contain max-h-[300px]"
            />
          </div>
        ) : null}

        {/* Handle additional diagram fields that might exist */}
        {Object.entries(question).map(([key, value]) => {
          if (key.startsWith('diagram') && key !== 'diagram' && value) {
            return (
              <div key={key} className="my-5 rounded-lg overflow-hidden border border-border/50 shadow-sm">
                <img 
                  src={value as string} 
                  alt={`Diagram ${key.replace('diagram', '')}`} 
                  className="w-full h-auto object-contain max-h-[300px]"
                />
              </div>
            );
          }
          return null;
        })}

        {question.type !== "question" && (
          <div className="mt-6 bg-white dark:bg-gray-900 rounded-lg p-4 border border-border/50 shadow-sm backdrop-blur-sm">
            {question.type === "mcq" ? (
              <RadioGroup
                value={answer as string}
                onValueChange={handleMCQChange}
                disabled={showResults}
                className="space-y-3 mt-2"
              >
                {question.options?.map((option, index) => (
                  <div 
                    key={index} 
                    className={`flex items-center space-x-3 p-4 rounded-md transition-colors
                      ${showResults 
                        ? (option === question.correctAnswer 
                          ? 'bg-green-50/50 dark:bg-green-950/50 border border-green-200 dark:border-green-900' 
                          : answer === option 
                            ? 'bg-red-50/50 dark:bg-red-950/50 border border-red-200 dark:border-red-900' 
                            : 'hover:bg-muted/30 border border-transparent')
                        : 'hover:bg-muted/50 border border-transparent hover:border-primary/30'}`
                    }
                  >
                    <RadioGroupItem
                      value={option}
                      id={`option-${question.id || question.question_number}-${index}`}
                      className="text-primary"
                    />
                    <Label 
                      htmlFor={`option-${question.id || question.question_number}-${index}`}
                      className="flex-grow cursor-pointer font-medium"
                    >
                      {option}
                    </Label>
                    {showResults && option === question.correctAnswer && (
                      <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                    )}
                  </div>
                ))}
              </RadioGroup>
            ) : (
              <Textarea
                placeholder={
                  question.type === "fill_in_blank" ? "Fill in the blank..." : 
                  question.type === "numerical" ? "Enter your numerical answer here..." :
                  "Enter your answer here..."
                }
                className="min-h-[100px] mt-2 resize-none focus:ring-2 focus:ring-primary/50 bg-white dark:bg-gray-800"
                value={answer as string}
                onChange={handleSubjectiveChange}
                disabled={showResults}
              />
            )}
          </div>
        )}
      </CardContent>
      
      {showResults && evaluation && (
        <CardFooter className={`p-6 border-t ${isCorrect ? 'bg-green-50/80 dark:bg-green-950/50' : 'bg-red-50/80 dark:bg-red-950/50'} transition-colors`}>
          <div className="w-full">
            <div className={`flex items-center justify-between text-sm font-medium mb-3 ${isCorrect ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>
              <div className="flex items-center">
                {isCorrect ? (
                  <CheckCircle2 className="w-5 h-5 mr-2" />
                ) : (
                  <XCircle className="w-5 h-5 mr-2" />
                )}
                <span>{isCorrect ? "Correct" : "Incorrect"}</span>
              </div>
              <div className="px-4 py-1 rounded-full bg-white dark:bg-gray-800 shadow-md">
                <span className="font-bold">{evaluation.marks_awarded}</span>
                <span className="text-muted-foreground">/</span>
                <span>{evaluation.total_marks}</span>
                <span className="text-muted-foreground ml-1">marks</span>
              </div>
            </div>
            
            {evaluation.final_feedback && (
              <div className="mb-4 p-4 rounded-md bg-white/90 dark:bg-gray-800/90 shadow-md border border-border/50 flex items-start gap-3">
                <MessageCircle className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {evaluation.final_feedback}
                </p>
              </div>
            )}
            
            {evaluation.missing_or_wrong && evaluation.missing_or_wrong.length > 0 && (
              <div className="p-4 rounded-md bg-amber-50/90 dark:bg-amber-950/30 shadow-md border border-amber-200/50 dark:border-amber-800/50">
                <div className="flex items-center gap-2 mb-2">
                  <Info className="w-5 h-5 text-amber-500" />
                  <span className="font-medium text-amber-700 dark:text-amber-400">Things to improve:</span>
                </div>
                <ul className="list-disc pl-6 space-y-1">
                  {evaluation.missing_or_wrong.map((item, idx) => (
                    <li key={idx} className="text-sm text-gray-700 dark:text-gray-300">{item}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {question.correctAnswer && question.type === "mcq" && (
              <HoverCard>
                <HoverCardTrigger asChild>
                  <div className="mt-4 flex items-center text-sm text-primary cursor-help">
                    <HelpCircle className="w-4 h-4 mr-1" />
                    <span>View correct answer</span>
                  </div>
                </HoverCardTrigger>
                <HoverCardContent className="w-80 bg-white dark:bg-gray-800 p-4 shadow-lg">
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold">Correct Answer:</h4>
                    <p className="text-sm bg-green-50 dark:bg-green-950/50 p-2 rounded border border-green-200 dark:border-green-900">
                      {Array.isArray(question.correctAnswer) 
                        ? question.correctAnswer.join(", ")
                        : question.correctAnswer
                      }
                    </p>
                  </div>
                </HoverCardContent>
              </HoverCard>
            )}
            
            {question.explanation && (
              <div className="text-sm mt-4 p-4 rounded-md bg-blue-50/80 dark:bg-blue-950/30 shadow-md border border-blue-200/50 dark:border-blue-800/50">
                <span className="font-medium block mb-1 text-blue-700 dark:text-blue-400">Explanation: </span>
                <span className="text-gray-700 dark:text-gray-300">{question.explanation}</span>
              </div>
            )}
          </div>
        </CardFooter>
      )}
    </Card>
  );
};

export default QuestionCard;
