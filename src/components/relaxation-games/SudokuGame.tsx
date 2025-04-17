
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import { RefreshCw, Lightbulb, Clock, Check } from 'lucide-react';
import { Label } from '@/components/ui/label';

interface SudokuCellProps {
  value: number | null;
  isFixed: boolean;
  isSelected: boolean;
  isHighlighted: boolean;
  isSameValue: boolean;
  onClick: () => void;
  isValid: boolean;
}

// Simple Sudoku cell component
const SudokuCell: React.FC<SudokuCellProps> = ({
  value,
  isFixed,
  isSelected,
  isHighlighted,
  isSameValue,
  onClick,
  isValid
}) => {
  const getBgColor = () => {
    if (isSelected) return 'bg-primary text-primary-foreground';
    if (!isValid) return 'bg-red-100 dark:bg-red-900/30 text-red-900 dark:text-red-300';
    if (isHighlighted) return 'bg-primary/10';
    if (isSameValue && value !== null) return 'bg-blue-100 dark:bg-blue-900/20';
    return 'bg-white dark:bg-gray-800';
  };
  
  const getBorderClasses = () => {
    let classes = 'border-gray-300 dark:border-gray-600 border';
    
    // Add thicker borders to create the 3x3 grid appearance
    if ([2, 5].includes(Math.floor((parseInt(String(onClick).split('_')[1]) % 9) / 3))) {
      classes += ' border-r-2 border-r-gray-400 dark:border-r-gray-500';
    }
    if ([2, 5].includes(Math.floor(parseInt(String(onClick).split('_')[1]) / 9) % 3)) {
      classes += ' border-b-2 border-b-gray-400 dark:border-b-gray-500';
    }
    
    return classes;
  };
  
  return (
    <div
      className={`w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center cursor-pointer transition-colors ${getBgColor()} ${getBorderClasses()} ${isFixed ? 'font-bold' : 'font-normal'}`}
      onClick={onClick}
    >
      {value !== null ? value : ''}
    </div>
  );
};

// Generate a solved Sudoku board
const generateSolvedBoard = (): number[][] => {
  // For simplicity, we'll use a pre-solved board
  return [
    [5, 3, 4, 6, 7, 8, 9, 1, 2],
    [6, 7, 2, 1, 9, 5, 3, 4, 8],
    [1, 9, 8, 3, 4, 2, 5, 6, 7],
    [8, 5, 9, 7, 6, 1, 4, 2, 3],
    [4, 2, 6, 8, 5, 3, 7, 9, 1],
    [7, 1, 3, 9, 2, 4, 8, 5, 6],
    [9, 6, 1, 5, 3, 7, 2, 8, 4],
    [2, 8, 7, 4, 1, 9, 6, 3, 5],
    [3, 4, 5, 2, 8, 6, 1, 7, 9]
  ];
};

// Create a playable board by removing cells from a solved board
const createPlayableBoardWithDifficulty = (solved: number[][], difficulty: 'easy' | 'medium' | 'hard'): { board: (number | null)[][], solution: number[][] } => {
  // Deep copy the solved board
  const solution = JSON.parse(JSON.stringify(solved));
  const board: (number | null)[][] = JSON.parse(JSON.stringify(solved));

  // Determine number of cells to remove
  let cellsToRemove;
  switch (difficulty) {
    case 'easy':
      cellsToRemove = 35; // ~40 clues
      break;
    case 'medium':
      cellsToRemove = 45; // ~30 clues
      break;
    case 'hard':
      cellsToRemove = 55; // ~20 clues
      break;
    default:
      cellsToRemove = 40;
  }

  let count = 0;
  while (count < cellsToRemove) {
    const row = Math.floor(Math.random() * 9);
    const col = Math.floor(Math.random() * 9);
    
    if (board[row][col] !== null) {
      board[row][col] = null;
      count++;
    }
  }

  return { board, solution };
};

const SudokuGame: React.FC = () => {
  const [board, setBoard] = useState<(number | null)[][]>([]);
  const [fixedCells, setFixedCells] = useState<boolean[][]>([]);
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [solution, setSolution] = useState<number[][]>([]);
  const [timer, setTimer] = useState<number>(0);
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [gameCompleted, setGameCompleted] = useState<boolean>(false);
  const [hints, setHints] = useState<number>(3);
  const [invalidCells, setInvalidCells] = useState<Set<string>>(new Set());

  useEffect(() => {
    startNewGame();
  }, [difficulty]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (gameStarted && !gameCompleted) {
      interval = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [gameStarted, gameCompleted]);

  const startNewGame = () => {
    const solved = generateSolvedBoard();
    const { board: newBoard, solution: newSolution } = createPlayableBoardWithDifficulty(solved, difficulty);
    
    setBoard(newBoard);
    setSolution(newSolution);
    setSelectedCell(null);
    setGameStarted(false);
    setGameCompleted(false);
    setTimer(0);
    setHints(3);
    setInvalidCells(new Set());
    
    // Track which cells are fixed (given as clues)
    const newFixedCells = Array(9).fill(null).map(() => Array(9).fill(false));
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (newBoard[row][col] !== null) {
          newFixedCells[row][col] = true;
        }
      }
    }
    setFixedCells(newFixedCells);
  };

  const handleCellClick = (row: number, col: number) => {
    if (!gameStarted) {
      setGameStarted(true);
    }
    
    if (!fixedCells[row][col]) {
      setSelectedCell([row, col]);
    }
  };

  const handleKeypadClick = (value: number) => {
    if (!selectedCell || fixedCells[selectedCell[0]][selectedCell[1]]) return;
    
    const [row, col] = selectedCell;
    const newBoard = [...board];
    
    // Clear cell if same number is clicked again
    if (newBoard[row][col] === value) {
      newBoard[row][col] = null;
    } else {
      newBoard[row][col] = value;
    }
    
    setBoard(newBoard);
    
    // Check if move is valid (no duplicates in row, column, or 3x3 box)
    validateCell(row, col, newBoard);
    
    // Check if the game is completed
    checkCompletion(newBoard);
  };

  const validateCell = (row: number, col: number, currentBoard: (number | null)[][]) => {
    const value = currentBoard[row][col];
    const cellKey = `${row}_${col}`;
    const newInvalidCells = new Set(invalidCells);
    
    if (value === null) {
      newInvalidCells.delete(cellKey);
      setInvalidCells(newInvalidCells);
      return;
    }

    // Check row
    for (let c = 0; c < 9; c++) {
      if (c !== col && currentBoard[row][c] === value) {
        newInvalidCells.add(cellKey);
        setInvalidCells(newInvalidCells);
        return;
      }
    }

    // Check column
    for (let r = 0; r < 9; r++) {
      if (r !== row && currentBoard[r][col] === value) {
        newInvalidCells.add(cellKey);
        setInvalidCells(newInvalidCells);
        return;
      }
    }

    // Check 3x3 box
    const boxRow = Math.floor(row / 3) * 3;
    const boxCol = Math.floor(col / 3) * 3;
    for (let r = boxRow; r < boxRow + 3; r++) {
      for (let c = boxCol; c < boxCol + 3; c++) {
        if ((r !== row || c !== col) && currentBoard[r][c] === value) {
          newInvalidCells.add(cellKey);
          setInvalidCells(newInvalidCells);
          return;
        }
      }
    }

    newInvalidCells.delete(cellKey);
    setInvalidCells(newInvalidCells);
  };

  const checkCompletion = (currentBoard: (number | null)[][]) => {
    // First check if all cells are filled and none are invalid
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (currentBoard[row][col] === null || invalidCells.has(`${row}_${col}`)) {
          return;
        }
      }
    }
    
    // Then check if all values match the solution
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (currentBoard[row][col] !== solution[row][col]) {
          return;
        }
      }
    }
    
    // If we get here, the board is completed correctly
    setGameCompleted(true);
    toast({
      title: "Congratulations!",
      description: `You completed the ${difficulty} Sudoku puzzle!`,
    });
  };

  const useHint = () => {
    if (hints <= 0 || !selectedCell) return;
    
    const [row, col] = selectedCell;
    if (fixedCells[row][col] || board[row][col] === solution[row][col]) return;
    
    const newBoard = [...board];
    newBoard[row][col] = solution[row][col];
    setBoard(newBoard);
    
    // Remove from invalid cells if present
    const newInvalidCells = new Set(invalidCells);
    newInvalidCells.delete(`${row}_${col}`);
    setInvalidCells(newInvalidCells);
    
    setHints(prev => prev - 1);
    
    // Check if the game is completed
    checkCompletion(newBoard);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getBoardCompletion = (): number => {
    let filledCount = 0;
    let totalCells = 81;
    
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (board[row][col] !== null) {
          filledCount++;
        }
      }
    }
    
    return Math.floor((filledCount / totalCells) * 100);
  };

  const isHighlighted = (row: number, col: number): boolean => {
    if (!selectedCell) return false;
    
    const [selectedRow, selectedCol] = selectedCell;
    
    // Same row, column, or 3x3 box
    return (
      row === selectedRow || 
      col === selectedCol || 
      (Math.floor(row / 3) === Math.floor(selectedRow / 3) && 
       Math.floor(col / 3) === Math.floor(selectedCol / 3))
    );
  };
  
  const isSameValue = (row: number, col: number): boolean => {
    if (!selectedCell) return false;
    
    const [selectedRow, selectedCol] = selectedCell;
    const selectedValue = board[selectedRow][selectedCol];
    
    // Only highlight if selected cell has a value
    return selectedValue !== null && board[row][col] === selectedValue;
  };

  if (board.length === 0) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col items-center">
      <div className="flex justify-between items-center w-full max-w-md mb-4">
        <div>
          <h3 className="text-lg font-bold">Sudoku</h3>
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="font-mono">{formatTime(timer)}</span>
          </div>
        </div>
        
        <div className="flex flex-col items-end">
          <div className="text-sm text-muted-foreground">
            Completion: {getBoardCompletion()}%
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="difficulty" className="text-sm">Difficulty:</Label>
            <Select 
              value={difficulty} 
              onValueChange={(value: 'easy' | 'medium' | 'hard') => setDifficulty(value)}
              disabled={gameStarted && !gameCompleted}
            >
              <SelectTrigger id="difficulty" className="w-[90px] h-8 text-xs">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      {gameCompleted && (
        <Card className="p-4 mb-4 bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800 w-full max-w-md">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 text-green-600 dark:text-green-400 mb-2">
              <Check className="h-5 w-5" />
              <span className="text-lg font-bold">Puzzle Completed!</span>
            </div>
            <p className="text-green-600 dark:text-green-300">
              You solved the {difficulty} Sudoku in {formatTime(timer)}!
            </p>
          </div>
        </Card>
      )}

      <div className="mb-6 select-none">
        <div className="grid grid-cols-9 border-2 border-gray-400 dark:border-gray-500">
          {board.map((row, rowIndex) => (
            row.map((cell, colIndex) => (
              <SudokuCell
                key={`${rowIndex}_${colIndex}`}
                value={cell}
                isFixed={fixedCells[rowIndex][colIndex]}
                isSelected={selectedCell !== null && selectedCell[0] === rowIndex && selectedCell[1] === colIndex}
                isHighlighted={isHighlighted(rowIndex, colIndex)}
                isSameValue={isSameValue(rowIndex, colIndex)}
                onClick={() => handleCellClick(rowIndex, colIndex)}
                isValid={!invalidCells.has(`${rowIndex}_${colIndex}`)}
              />
            ))
          ))}
        </div>
      </div>

      <div className="space-y-4 w-full max-w-md">
        <div className="flex justify-center gap-1 mb-4">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
            <Button
              key={num}
              variant="outline"
              className="w-8 h-8 p-0 sm:w-10 sm:h-10"
              onClick={() => handleKeypadClick(num)}
              disabled={!selectedCell || fixedCells[selectedCell[0]][selectedCell[1]]}
            >
              {num}
            </Button>
          ))}
        </div>
        
        <div className="flex justify-between gap-2">
          <Button
            variant="outline"
            onClick={useHint}
            className="flex items-center gap-2"
            disabled={hints === 0 || !selectedCell || (selectedCell && fixedCells[selectedCell[0]][selectedCell[1]])}
          >
            <Lightbulb className="h-4 w-4 text-amber-500" />
            Hint ({hints})
          </Button>
          
          <Button
            onClick={startNewGame}
            variant={gameCompleted ? 'default' : 'outline'}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            New Game
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SudokuGame;
