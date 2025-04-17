
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface BreakTimerProps {
  initialMinutes?: number;
}

const BreakTimer: React.FC<BreakTimerProps> = ({ initialMinutes = 5 }) => {
  const [timeLeft, setTimeLeft] = useState(initialMinutes * 60);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsRunning(false);
    }

    return () => clearInterval(timer);
  }, [isRunning, timeLeft]);

  const startTimer = () => {
    setIsRunning(true);
  };

  const resetTimer = () => {
    setTimeLeft(initialMinutes * 60);
    setIsRunning(false);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  const progressPercentage = Math.max(0, (timeLeft / (initialMinutes * 60)) * 100);

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="text-2xl font-bold">{formatTime(timeLeft)}</div>
      <Progress value={progressPercentage} className="w-full" />
      <div className="flex gap-2">
        {!isRunning ? (
          <Button onClick={startTimer} className="w-full">
            Start Break
          </Button>
        ) : (
          <Button 
            variant="outline" 
            onClick={resetTimer} 
            className="w-full"
          >
            Reset
          </Button>
        )}
      </div>
    </div>
  );
};

export default BreakTimer;
