
import React, { useState } from "react";
import { Question } from "../types";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

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
    <Card className="mb-4">
      <CardContent className="pt-6">
        <div className="flex justify-between mb-2">
          <span className="text-sm font-medium text-gray-500">
            {question.type === "mcq" ? "Multiple Choice" : "Subjective"}
          </span>
          <span className="text-sm font-medium text-gray-500">
            {question.marks} {question.marks === 1 ? "mark" : "marks"}
          </span>
        </div>
        
        <h3 className="text-lg font-medium mb-4">{question.text}</h3>
        
        {question.image && (
          <div className="mb-4">
            <img 
              src={question.image} 
              alt="Question diagram" 
              className="max-w-full h-auto rounded-md"
            />
          </div>
        )}

        {question.type === "mcq" ? (
          <RadioGroup
            value={answer as string}
            onValueChange={handleMCQChange}
            disabled={showResults}
          >
            {question.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2 mb-2">
                <RadioGroupItem
                  value={option}
                  id={`option-${question.id}-${index}`}
                />
                <Label htmlFor={`option-${question.id}-${index}`}>{option}</Label>
              </div>
            ))}
          </RadioGroup>
        ) : (
          <Textarea
            placeholder="Enter your answer here..."
            className="min-h-[100px]"
            value={answer as string}
            onChange={handleSubjectiveChange}
            disabled={showResults}
          />
        )}
      </CardContent>
      
      {showResults && (
        <CardFooter className={`bg-opacity-20 ${isCorrect ? 'bg-green-100' : 'bg-red-100'}`}>
          <div className="w-full">
            <div className={`text-sm font-medium mb-1 ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
              {isCorrect ? "Correct!" : "Incorrect"}
            </div>
            <div className="text-sm">
              <span className="font-medium">Correct answer: </span>
              {Array.isArray(question.correctAnswer) 
                ? question.correctAnswer.join(", ")
                : question.correctAnswer
              }
            </div>
            {!isCorrect && question.explanation && (
              <div className="text-sm mt-2">
                <span className="font-medium">Explanation: </span>
                {question.explanation}
              </div>
            )}
          </div>
        </CardFooter>
      )}
    </Card>
  );
};

export default QuestionCard;
