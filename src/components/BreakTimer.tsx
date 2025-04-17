
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/components/ui/use-toast';
import { Clock, Play, Pause, RotateCcw } from 'lucide-react';

interface BreakTimerProps {
  initialMinutes?: number;
}

const BreakTimer: React.FC<BreakTimerProps> = ({ initialMinutes = 5 }) => {
  const [timerLength, setTimerLength] = useState(initialMinutes);
  const [timeLeft, setTimeLeft] = useState(timerLength * 60);
  const [isActive, setIsActive] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [isPristine, setIsPristine] = useState(true);

  useEffect(() => {
    if (isPristine) {
      setTimeLeft(timerLength * 60);
    }
  }, [timerLength, isPristine]);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (isActive && timeLeft === 0) {
      setIsActive(false);
      toast({
        title: "Break time finished!",
        description: "Time to get back to studying.",
      });
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [isActive, timeLeft]);

  const toggleTimer = () => {
    setIsActive(!isActive);
    setIsPristine(false);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(timerLength * 60);
    setIsPristine(true);
  };

  const handleSliderChange = (value: number[]) => {
    const newValue = value[0];
    setTimerLength(newValue);
    if (isPristine) {
      setTimeLeft(newValue * 60);
    }
  };

  const calculateProgress = () => {
    const total = timerLength * 60;
    return ((total - timeLeft) / total) * 100;
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-center">
        <div className="p-6 rounded-full bg-gray-100 dark:bg-gray-800 relative">
          <div className="text-3xl font-mono tabular-nums font-semibold">
            {formatTime(timeLeft)}
          </div>
          <div className="absolute inset-0 flex items-center justify-center opacity-10">
            <Clock className="h-16 w-16" />
          </div>
        </div>
      </div>
      
      <Progress value={calculateProgress()} className="h-2 w-full" />
      
      <div className="flex space-x-3 justify-center">
        <Button
          onClick={toggleTimer}
          variant="default"
          className="w-24 flex items-center justify-center gap-2"
        >
          {isActive ? (
            <>
              <Pause className="h-4 w-4" /> 
              Pause
            </>
          ) : (
            <>
              <Play className="h-4 w-4" /> 
              Start
            </>
          )}
        </Button>
        <Button
          onClick={resetTimer}
          variant="outline"
          className="flex items-center gap-2"
        >
          <RotateCcw className="h-4 w-4" /> 
          Reset
        </Button>
      </div>

      <div className="space-y-2 pt-2">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>1 min</span>
          <span>{timerLength} min</span>
          <span>15 min</span>
        </div>
        <Slider
          defaultValue={[timerLength]}
          min={1}
          max={15}
          step={1}
          onValueChange={handleSliderChange}
          disabled={isActive}
        />
      </div>
    </div>
  );
};

export default BreakTimer;
