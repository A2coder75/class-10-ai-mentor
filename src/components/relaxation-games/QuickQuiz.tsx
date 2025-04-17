
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/components/ui/use-toast';
import { RefreshCw, Check, X, Loader2 } from 'lucide-react';

interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
}

const QUESTIONS: Question[] = [
  {
    question: "Which planet is known as the Red Planet?",
    options: ["Venus", "Mars", "Jupiter", "Saturn"],
    correctAnswer: 1
  },
  {
    question: "What is the chemical symbol for gold?",
    options: ["Ag", "Au", "Fe", "Pb"],
    correctAnswer: 1
  },
  {
    question: "Which is the largest ocean on Earth?",
    options: ["Atlantic Ocean", "Indian Ocean", "Arctic Ocean", "Pacific Ocean"],
    correctAnswer: 3
  },
  {
    question: "What is the capital of Japan?",
    options: ["Seoul", "Beijing", "Tokyo", "Bangkok"],
    correctAnswer: 2
  },
  {
    question: "Who wrote 'Romeo and Juliet'?",
    options: ["Charles Dickens", "William Shakespeare", "Jane Austen", "Mark Twain"],
    correctAnswer: 1
  },
  {
    question: "How many continents are there on Earth?",
    options: ["5", "6", "7", "8"],
    correctAnswer: 2
  },
  {
    question: "What is the largest mammal in the world?",
    options: ["Elephant", "Blue Whale", "Giraffe", "Rhinoceros"],
    correctAnswer: 1
  },
  {
    question: "What gas do plants absorb from the atmosphere?",
    options: ["Oxygen", "Nitrogen", "Carbon Dioxide", "Hydrogen"],
    correctAnswer: 2
  },
  {
    question: "Which country is home to the kangaroo?",
    options: ["New Zealand", "South Africa", "Australia", "Brazil"],
    correctAnswer: 2
  },
  {
    question: "What is the freezing point of water in Celsius?",
    options: ["-10°C", "0°C", "10°C", "100°C"],
    correctAnswer: 1
  },
  {
    question: "Which vitamin is provided by sunlight?",
    options: ["Vitamin A", "Vitamin B", "Vitamin C", "Vitamin D"],
    correctAnswer: 3
  },
  {
    question: "What is the smallest prime number?",
    options: ["0", "1", "2", "3"],
    correctAnswer: 2
  },
  {
    question: "What is the hardest natural substance on Earth?",
    options: ["Gold", "Iron", "Diamond", "Platinum"],
    correctAnswer: 2
  },
  {
    question: "Which planet has the most moons?",
    options: ["Jupiter", "Saturn", "Uranus", "Neptune"],
    correctAnswer: 1
  },
  {
    question: "How many sides does a hexagon have?",
    options: ["5", "6", "7", "8"],
    correctAnswer: 1
  }
];

const QuickQuiz: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(15);
  const [isLoading, setIsLoading] = useState(true);
  const [quizStarted, setQuizStarted] = useState(false);
  
  const QUIZ_LENGTH = 5; // Number of questions in a quiz

  useEffect(() => {
    startNewQuiz();
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (quizStarted && !quizCompleted && timeRemaining > 0) {
      timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            // Time's up for this question
            handleTimeout();
            return 15; // Reset for next question
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [quizStarted, quizCompleted, currentQuestionIndex]);

  const startNewQuiz = () => {
    setIsLoading(true);
    setQuizStarted(false);
    setQuizCompleted(false);
    setScore(0);
    setSelectedOption(null);
    setCurrentQuestionIndex(0);
    setTimeRemaining(15);
    
    // Shuffle questions and pick QUIZ_LENGTH
    const shuffledQuestions = [...QUESTIONS]
      .sort(() => Math.random() - 0.5)
      .slice(0, QUIZ_LENGTH);
    
    setQuestions(shuffledQuestions);
    
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  };

  const handleSelectOption = (optionIndex: number) => {
    if (selectedOption !== null || quizCompleted) return;
    
    setSelectedOption(optionIndex);
    
    const isCorrect = optionIndex === questions[currentQuestionIndex].correctAnswer;
    
    if (isCorrect) {
      setScore(prev => prev + 1);
    }
    
    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
        setSelectedOption(null);
        setTimeRemaining(15);
      } else {
        setQuizCompleted(true);
      }
    }, 1500);
  };

  const handleTimeout = () => {
    // Automatically move to next question or end quiz
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOption(null);
    } else {
      setQuizCompleted(true);
    }
  };

  const getProgressPercentage = () => {
    return ((currentQuestionIndex + 1) / questions.length) * 100;
  };

  const startQuiz = () => {
    setQuizStarted(true);
  };

  const currentQuestion = questions[currentQuestionIndex];

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Loader2 className="h-12 w-12 animate-spin text-primary opacity-70" />
        <p className="mt-4 text-muted-foreground">Loading quiz questions...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full max-w-lg mx-auto">
      {!quizStarted ? (
        <Card className="w-full animate-fade-in">
          <CardHeader className="text-center">
            <CardTitle>Quick Knowledge Quiz</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <p>Test your general knowledge with this quick 5-question quiz!</p>
            <div className="p-4 bg-primary/10 rounded-lg">
              <ul className="text-sm space-y-2 text-left">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" /> You have 15 seconds for each question
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" /> Answer correctly to score points
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" /> See if you can get a perfect score!
                </li>
              </ul>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={startQuiz}>Start Quiz</Button>
          </CardFooter>
        </Card>
      ) : quizCompleted ? (
        <Card className="w-full animate-fade-in">
          <CardHeader className="text-center">
            <CardTitle>Quiz Completed!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <div className="flex flex-col items-center mb-4">
              <div className="text-4xl font-bold mb-2">{score}/{questions.length}</div>
              <Progress value={(score / questions.length) * 100} className="h-3 w-60" />
            </div>
            
            <div className="p-4 rounded-lg bg-primary/10">
              <p className="mb-2 font-medium">Your performance:</p>
              {score === questions.length ? (
                <p className="text-green-600 dark:text-green-400">Perfect score! Amazing job!</p>
              ) : score >= questions.length / 2 ? (
                <p className="text-amber-600 dark:text-amber-400">Good job! Keep learning!</p>
              ) : (
                <p className="text-blue-600 dark:text-blue-400">Keep practicing to improve!</p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button onClick={startNewQuiz} className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Play Again
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <>
          <div className="w-full mb-8">
            <div className="flex justify-between text-sm mb-2">
              <span>Question {currentQuestionIndex + 1}/{questions.length}</span>
              <span className="font-medium">Score: {score}</span>
            </div>
            <Progress value={getProgressPercentage()} className="h-2" />
          </div>
          
          <Card className="w-full animate-fade-in">
            <div className="relative">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700">
                <div 
                  className="h-full bg-primary transition-all duration-1000"
                  style={{ width: `${(timeRemaining / 15) * 100}%` }}
                ></div>
              </div>
              <div className="absolute top-2 right-2 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="font-mono font-medium">{timeRemaining}</span>
              </div>
            </div>
            
            <CardHeader className="pt-6">
              <CardTitle className="text-lg leading-tight">
                {currentQuestion?.question}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {currentQuestion?.options.map((option, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className={`w-full justify-start text-left py-6 pl-4 pr-12 relative ${
                      selectedOption === index 
                        ? index === currentQuestion.correctAnswer 
                          ? 'bg-green-100 dark:bg-green-900/30 border-green-500' 
                          : 'bg-red-100 dark:bg-red-900/30 border-red-500' 
                        : selectedOption !== null && index === currentQuestion.correctAnswer
                          ? 'bg-green-100 dark:bg-green-900/30 border-green-500'
                          : ''
                    }`}
                    onClick={() => handleSelectOption(index)}
                    disabled={selectedOption !== null}
                  >
                    <span className="mr-2">{String.fromCharCode(65 + index)}.</span>
                    {option}
                    {selectedOption === index && (
                      <span className="absolute right-4">
                        {index === currentQuestion.correctAnswer ? (
                          <Check className="h-5 w-5 text-green-500" />
                        ) : (
                          <X className="h-5 w-5 text-red-500" />
                        )}
                      </span>
                    )}
                    {selectedOption !== null && 
                     selectedOption !== index && 
                     index === currentQuestion.correctAnswer && (
                      <span className="absolute right-4">
                        <Check className="h-5 w-5 text-green-500" />
                      </span>
                    )}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default QuickQuiz;
