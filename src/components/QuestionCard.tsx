
import React, { useState } from "react";
import { Question } from "../types";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, XCircle } from "lucide-react";

interface QuestionCardProps {
  question: Question;
  onAnswerChange: (questionId: string, answer: string | string[]) => void;
  studentAnswer?: string | string[];
  showResults?: boolean;
}

const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  onAnswerChange,
  studentAnswer = "",
  showResults = false,
}) => {
  const [answer, setAnswer] = useState<string | string[]>(studentAnswer);

  const handleMCQChange = (value: string) => {
    setAnswer(value);
    onAnswerChange(question.id, value);
  };

  const handleSubjectiveChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setAnswer(e.target.value);
    onAnswerChange(question.id, e.target.value);
  };

  const isCorrect = showResults && (
    Array.isArray(question.correctAnswer) 
      ? question.correctAnswer.includes(answer.toString())
      : answer === question.correctAnswer
  );

  return (
    <Card className="mb-6 overflow-hidden border-none shadow-md card-hover">
      <CardContent className="pt-6 px-6">
        <div className="flex justify-between mb-3">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
            {question.type === "mcq" ? "Multiple Choice" : "Subjective"}
          </span>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
            {question.marks} {question.marks === 1 ? "mark" : "marks"}
          </span>
        </div>
        
        <h3 className="text-lg font-medium mb-4 text-gray-800">{question.text}</h3>
        
        {question.image && (
          <div className="mb-5">
            <img 
              src={question.image} 
              alt="Question diagram" 
              className="max-w-full h-auto rounded-md shadow-sm border border-gray-100"
            />
          </div>
        )}

        {question.type === "mcq" ? (
          <RadioGroup
            value={answer as string}
            onValueChange={handleMCQChange}
            disabled={showResults}
            className="space-y-2 mt-2"
          >
            {question.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2 p-3 rounded-md hover:bg-muted/50 transition-colors">
                <RadioGroupItem
                  value={option}
                  id={`option-${question.id}-${index}`}
                  className="text-primary"
                />
                <Label 
                  htmlFor={`option-${question.id}-${index}`}
                  className="flex-grow cursor-pointer"
                >
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        ) : (
          <Textarea
            placeholder="Enter your answer here..."
            className="min-h-[120px] mt-2 resize-none focus:ring-2 focus:ring-primary/50"
            value={answer as string}
            onChange={handleSubjectiveChange}
            disabled={showResults}
          />
        )}
      </CardContent>
      
      {showResults && (
        <CardFooter className={`p-4 border-t ${isCorrect ? 'bg-green-50' : 'bg-red-50'} transition-colors`}>
          <div className="w-full">
            <div className={`flex items-center text-sm font-medium mb-2 ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
              {isCorrect ? (
                <CheckCircle2 className="w-5 h-5 mr-2" />
              ) : (
                <XCircle className="w-5 h-5 mr-2" />
              )}
              {isCorrect ? "Correct Answer" : "Incorrect Answer"}
            </div>
            <div className="text-sm bg-white p-3 rounded-md shadow-sm">
              <span className="font-medium">Correct answer: </span>
              <span className="text-gray-700">
                {Array.isArray(question.correctAnswer) 
                  ? question.correctAnswer.join(", ")
                  : question.correctAnswer
                }
              </span>
            </div>
            {question.explanation && (
              <div className="text-sm mt-3 bg-white p-3 rounded-md shadow-sm">
                <span className="font-medium">Explanation: </span>
                <span className="text-gray-700">{question.explanation}</span>
              </div>
            )}
          </div>
        </CardFooter>
      )}
    </Card>
  );
};

export default QuestionCard;
