
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { RefreshCw, Play, Pause } from 'lucide-react';

const GRID_SIZE = 20;
const CELL_SIZE = 20;
const INITIAL_SPEED = 150;

enum Direction {
  UP,
  RIGHT,
  DOWN,
  LEFT
}

interface Position {
  x: number;
  y: number;
}

const SnakeGame: React.FC = () => {
  const [snake, setSnake] = useState<Position[]>([{ x: 10, y: 10 }]);
  const [food, setFood] = useState<Position>({ x: 15, y: 10 });
  const [direction, setDirection] = useState<Direction>(Direction.RIGHT);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(true);
  const [score, setScore] = useState(0);
  const [speed, setSpeed] = useState(INITIAL_SPEED);
  const [bestScore, setBestScore] = useState(0);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const directionRef = useRef(direction);
  const isPausedRef = useRef(isPaused);
  const animationFrameRef = useRef<number | null>(null);
  const lastRenderTimeRef = useRef<number>(0);
  const speedRef = useRef(speed);

  // For mobile controls
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);

  useEffect(() => {
    const storedBestScore = localStorage.getItem('snakeGameBestScore');
    if (storedBestScore) {
      setBestScore(parseInt(storedBestScore));
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  useEffect(() => {
    directionRef.current = direction;
  }, [direction]);

  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

  const generateFood = useCallback(() => {
    const newFood = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE)
    };

    // Ensure food is not on snake
    for (const segment of snake) {
      if (segment.x === newFood.x && segment.y === newFood.y) {
        return generateFood();
      }
    }
    return newFood;
  }, [snake]);

  const resetGame = () => {
    setSnake([{ x: 10, y: 10 }]);
    setFood(generateFood());
    setDirection(Direction.RIGHT);
    setGameOver(false);
    setIsPaused(true);
    setScore(0);
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  };

  const togglePause = () => {
    if (gameOver) {
      resetGame();
    } else {
      setIsPaused(!isPaused);
      if (isPaused && !gameOver) {
        lastRenderTimeRef.current = 0; // Reset render time to start immediately
        requestAnimationFrame(gameLoop);
      }
    }
  };

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    switch (event.key) {
      case 'ArrowUp':
        if (directionRef.current !== Direction.DOWN) {
          setDirection(Direction.UP);
        }
        break;
      case 'ArrowDown':
        if (directionRef.current !== Direction.UP) {
          setDirection(Direction.DOWN);
        }
        break;
      case 'ArrowLeft':
        if (directionRef.current !== Direction.RIGHT) {
          setDirection(Direction.LEFT);
        }
        break;
      case 'ArrowRight':
        if (directionRef.current !== Direction.LEFT) {
          setDirection(Direction.RIGHT);
        }
        break;
      case ' ':
        togglePause();
        break;
    }
  }, []);

  const handleTouchStart = (event: React.TouchEvent) => {
    touchStartX.current = event.touches[0].clientX;
    touchStartY.current = event.touches[0].clientY;
  };

  const handleTouchMove = (event: React.TouchEvent) => {
    if (isPaused || gameOver) return;
    
    const touchEndX = event.touches[0].clientX;
    const touchEndY = event.touches[0].clientY;
    
    const deltaX = touchEndX - touchStartX.current;
    const deltaY = touchEndY - touchStartY.current;
    
    // Only change direction if swipe is significant
    if (Math.abs(deltaX) < 30 && Math.abs(deltaY) < 30) return;
    
    // Determine if horizontal or vertical swipe
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      // Horizontal swipe
      if (deltaX > 0 && directionRef.current !== Direction.LEFT) {
        setDirection(Direction.RIGHT);
      } else if (deltaX < 0 && directionRef.current !== Direction.RIGHT) {
        setDirection(Direction.LEFT);
      }
    } else {
      // Vertical swipe
      if (deltaY > 0 && directionRef.current !== Direction.UP) {
        setDirection(Direction.DOWN);
      } else if (deltaY < 0 && directionRef.current !== Direction.DOWN) {
        setDirection(Direction.UP);
      }
    }
    
    // Reset touch start for continuous tracking
    touchStartX.current = touchEndX;
    touchStartY.current = touchEndY;
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  const moveSnake = useCallback(() => {
    const head = { ...snake[0] };

    switch (directionRef.current) {
      case Direction.UP:
        head.y = (head.y - 1 + GRID_SIZE) % GRID_SIZE;
        break;
      case Direction.DOWN:
        head.y = (head.y + 1) % GRID_SIZE;
        break;
      case Direction.LEFT:
        head.x = (head.x - 1 + GRID_SIZE) % GRID_SIZE;
        break;
      case Direction.RIGHT:
        head.x = (head.x + 1) % GRID_SIZE;
        break;
    }

    // Check collision with self
    for (let i = 1; i < snake.length; i++) {
      if (snake[i].x === head.x && snake[i].y === head.y) {
        setGameOver(true);
        if (score > bestScore) {
          setBestScore(score);
          localStorage.setItem('snakeGameBestScore', score.toString());
          toast({
            title: "New High Score!",
            description: `You set a new personal best: ${score}`,
          });
        }
        return;
      }
    }

    const newSnake = [head, ...snake];
    
    // Check if snake ate food
    if (head.x === food.x && head.y === food.y) {
      setFood(generateFood());
      setScore(prev => prev + 1);
    } else {
      newSnake.pop(); // Remove the tail
    }

    setSnake(newSnake);
  }, [snake, food, score, bestScore, generateFood]);

  const drawGame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    ctx.strokeStyle = '#E5E7EB';
    for (let i = 0; i <= GRID_SIZE; i++) {
      ctx.beginPath();
      ctx.moveTo(i * CELL_SIZE, 0);
      ctx.lineTo(i * CELL_SIZE, GRID_SIZE * CELL_SIZE);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, i * CELL_SIZE);
      ctx.lineTo(GRID_SIZE * CELL_SIZE, i * CELL_SIZE);
      ctx.stroke();
    }

    // Draw snake
    snake.forEach((segment, index) => {
      if (index === 0) {
        // Draw head
        ctx.fillStyle = '#3B82F6';
      } else {
        // Draw body with gradient
        ctx.fillStyle = `rgba(59, 130, 246, ${1 - index * 0.02})`;
      }
      ctx.fillRect(segment.x * CELL_SIZE, segment.y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
      
      // Add border around segments
      ctx.strokeStyle = '#2563EB';
      ctx.lineWidth = 1;
      ctx.strokeRect(segment.x * CELL_SIZE, segment.y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
    });

    // Draw food
    ctx.fillStyle = '#EF4444';
    ctx.beginPath();
    const centerX = food.x * CELL_SIZE + CELL_SIZE / 2;
    const centerY = food.y * CELL_SIZE + CELL_SIZE / 2;
    ctx.arc(centerX, centerY, CELL_SIZE / 2, 0, 2 * Math.PI);
    ctx.fill();
    
    // Draw game over message
    if (gameOver) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.fillStyle = 'white';
      ctx.font = '24px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Game Over!', canvas.width / 2, canvas.height / 2 - 10);
      
      ctx.font = '18px sans-serif';
      ctx.fillText(`Score: ${score}`, canvas.width / 2, canvas.height / 2 + 20);
    }
    
    // Draw pause message
    else if (isPausedRef.current) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.fillStyle = 'white';
      ctx.font = '24px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Paused', canvas.width / 2, canvas.height / 2 - 10);
      
      ctx.font = '16px sans-serif';
      ctx.fillText('Press Space or Play to start', canvas.width / 2, canvas.height / 2 + 20);
    }
  }, [snake, food, gameOver, score]);

  const gameLoop = useCallback((timestamp: number) => {
    if (gameOver) return;
    
    if (!lastRenderTimeRef.current || timestamp - lastRenderTimeRef.current >= speedRef.current) {
      lastRenderTimeRef.current = timestamp;
      
      if (!isPausedRef.current) {
        moveSnake();
      }
      
      drawGame();
    }
    
    if (!isPausedRef.current && !gameOver) {
      animationFrameRef.current = requestAnimationFrame(gameLoop);
    }
  }, [drawGame, moveSnake, gameOver]);

  useEffect(() => {
    drawGame();
    
    if (!isPaused && !gameOver) {
      animationFrameRef.current = requestAnimationFrame(gameLoop);
    }
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [drawGame, gameLoop, isPaused, gameOver]);

  const handleSpeedChange = (value: number[]) => {
    // Convert from 0-100 slider to speed in ms (lower is faster)
    const newSpeed = Math.max(50, 250 - value[0] * 2);
    setSpeed(newSpeed);
  };

  return (
    <div className="flex flex-col items-center">
      <div className="flex justify-between items-center w-full max-w-md mb-4">
        <div>
          <h3 className="text-xl font-bold">Snake Game</h3>
          <p className="text-sm text-muted-foreground">Use arrow keys or swipe to control</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-primary">{score}</div>
          <div className="text-xs text-muted-foreground">Best: {bestScore}</div>
        </div>
      </div>

      <div 
        className="relative border-2 border-gray-200 dark:border-gray-700 rounded-lg mb-6 touch-none"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
      >
        <canvas 
          ref={canvasRef} 
          width={GRID_SIZE * CELL_SIZE} 
          height={GRID_SIZE * CELL_SIZE}
          className="bg-white dark:bg-gray-900"
        />
      </div>

      <div className="flex flex-col w-full max-w-md gap-6">
        <div className="flex gap-4">
          <Button 
            onClick={togglePause} 
            className="flex-1 flex items-center justify-center gap-2"
          >
            {isPaused || gameOver ? (
              <>
                <Play className="h-4 w-4" />
                {gameOver ? 'New Game' : 'Start Game'}
              </>
            ) : (
              <>
                <Pause className="h-4 w-4" />
                Pause
              </>
            )}
          </Button>
          
          <Button 
            onClick={resetGame} 
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Reset
          </Button>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="speed">Speed</Label>
            <span className="text-sm text-muted-foreground">
              {speed <= 70 ? 'Very Fast' : 
               speed <= 120 ? 'Fast' : 
               speed <= 170 ? 'Normal' : 'Slow'}
            </span>
          </div>
          <Slider
            id="speed"
            defaultValue={[(250 - speed) / 2]}
            max={100}
            step={10}
            onValueChange={handleSpeedChange}
          />
        </div>
      </div>
    </div>
  );
};

export default SnakeGame;
