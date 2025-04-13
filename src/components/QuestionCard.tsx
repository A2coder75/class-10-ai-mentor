
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
    'from-purple-200 to-blue-200 dark:from-purple-900 dark:to-blue-800'} 
    group-hover:opacity-70`;

  return (
    <Card className={`mb-6 overflow-hidden border-none shadow-md relative group ${cardClasses}`}>
      <div className={glowClasses}></div>
      <CardContent className="pt-6 px-6 relative z-10">
        <div className="flex justify-between mb-3">
          <div className="flex space-x-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
              {question.type === "mcq" ? "Multiple Choice" : 
               question.type === "descriptive" ? "Descriptive" : 
               question.type === "fill_in_blank" ? "Fill in Blank" : 
               question.type === "question" ? "Root Question" : "Subjective"}
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
        
        <div className="flex items-start gap-2 mb-3">
          {question.question_number && (
            <div className="text-sm font-semibold text-muted-foreground min-w-[50px]">
              Q{question.question_number}:
            </div>
          )}
          <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200">
            {question.question_text || question.text}
          </h3>
        </div>
        
        {question.image || question.diagram ? (
          <div className="my-5 rounded-lg overflow-hidden border border-border/50">
            <img 
              src={question.image || question.diagram} 
              alt="Question diagram" 
              className="w-full h-auto object-contain max-h-[300px]"
            />
          </div>
        ) : null}

        {question.type !== "question" && (
          <div className="mt-6 bg-card/50 dark:bg-card/30 rounded-lg p-3 backdrop-blur-sm">
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
                    className={`flex items-center space-x-2 p-3 rounded-md transition-colors
                      ${showResults 
                        ? (option === question.correctAnswer 
                          ? 'bg-green-50/50 dark:bg-green-950/50 border border-green-200 dark:border-green-900' 
                          : answer === option 
                            ? 'bg-red-50/50 dark:bg-red-950/50 border border-red-200 dark:border-red-900' 
                            : 'hover:bg-muted/30')
                        : 'hover:bg-muted/50'}`
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
                      <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                    )}
                  </div>
                ))}
              </RadioGroup>
            ) : (
              <Textarea
                placeholder={question.type === "fill_in_blank" ? "Fill in the blank..." : "Enter your answer here..."}
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
        <CardFooter className={`p-5 border-t ${isCorrect ? 'bg-green-50/80 dark:bg-green-950/50' : 'bg-red-50/80 dark:bg-red-950/50'} transition-colors`}>
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
              <div className="px-3 py-1 rounded-full bg-white dark:bg-gray-800 shadow-sm">
                <span className="font-bold">{evaluation.marks_awarded}</span>
                <span className="text-muted-foreground">/</span>
                <span>{evaluation.total_marks}</span>
                <span className="text-muted-foreground ml-1">marks</span>
              </div>
            </div>
            
            {evaluation.final_feedback && (
              <div className="mb-3 p-3 rounded-md bg-white/80 dark:bg-gray-800/80 shadow-sm flex items-start gap-2">
                <MessageCircle className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {evaluation.final_feedback}
                </p>
              </div>
            )}
            
            {evaluation.missing_or_wrong && evaluation.missing_or_wrong.length > 0 && (
              <div>
                <div className="flex items-center gap-1 mb-1">
                  <Info className="w-4 h-4 text-amber-500" />
                  <span className="text-sm font-medium text-amber-700 dark:text-amber-400">Things to improve:</span>
                </div>
                <ul className="list-disc pl-5 space-y-1">
                  {evaluation.missing_or_wrong.map((item, idx) => (
                    <li key={idx} className="text-sm text-gray-700 dark:text-gray-300">{item}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {question.correctAnswer && question.type === "mcq" && (
              <HoverCard>
                <HoverCardTrigger asChild>
                  <div className="mt-3 flex items-center text-sm text-primary cursor-help">
                    <HelpCircle className="w-4 h-4 mr-1" />
                    <span>View correct answer</span>
                  </div>
                </HoverCardTrigger>
                <HoverCardContent className="w-80">
                  <div className="flex justify-between space-x-4">
                    <div className="space-y-1">
                      <h4 className="text-sm font-semibold">Correct Answer:</h4>
                      <p className="text-sm">
                        {Array.isArray(question.correctAnswer) 
                          ? question.correctAnswer.join(", ")
                          : question.correctAnswer
                        }
                      </p>
                    </div>
                  </div>
                </HoverCardContent>
              </HoverCard>
            )}
            
            {question.explanation && (
              <div className="text-sm mt-3 p-3 rounded-md bg-white/80 dark:bg-gray-800/80 shadow-sm">
                <span className="font-medium block mb-1">Explanation: </span>
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
