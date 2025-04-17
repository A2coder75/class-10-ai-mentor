
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { RefreshCw } from 'lucide-react';

const WORDS = [
  "REACT", "STUDY", "LEARN", "BRAIN", "FOCUS", 
  "THINK", "SMART", "EXAM", "BOOKS", "CLASS",
  "MIND", "LOGIC", "SOLVE", "QUEST", "SKILL",
  "TEACH", "GRADE", "PAPER", "WRITE", "MATH"
];

const WordleGame: React.FC = () => {
  const [secretWord, setSecretWord] = useState('');
  const [guesses, setGuesses] = useState<string[]>([]);
  const [currentGuess, setCurrentGuess] = useState('');
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [message, setMessage] = useState('');
  const maxGuesses = 6;

  useEffect(() => {
    startNewGame();
  }, []);

  const startNewGame = () => {
    const randomWord = WORDS[Math.floor(Math.random() * WORDS.length)];
    setSecretWord(randomWord);
    setGuesses([]);
    setCurrentGuess('');
    setGameOver(false);
    setGameWon(false);
    setMessage('Try to guess the 5-letter word');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (gameOver) return;
    
    if (e.key === 'Enter') {
      submitGuess();
    } else if (e.key === 'Backspace') {
      setCurrentGuess(prev => prev.slice(0, -1));
    } else if (/^[A-Za-z]$/.test(e.key) && currentGuess.length < 5) {
      setCurrentGuess(prev => prev + e.key.toUpperCase());
    }
  };

  const handleLetterClick = (letter: string) => {
    if (gameOver) return;
    if (currentGuess.length < 5) {
      setCurrentGuess(prev => prev + letter);
    }
  };

  const handleBackspace = () => {
    if (currentGuess.length > 0) {
      setCurrentGuess(prev => prev.slice(0, -1));
    }
  };

  const submitGuess = () => {
    if (currentGuess.length !== 5) {
      setMessage('Word must be 5 letters!');
      return;
    }

    if (guesses.includes(currentGuess)) {
      setMessage('You already guessed this word!');
      return;
    }

    const newGuesses = [...guesses, currentGuess];
    setGuesses(newGuesses);
    setCurrentGuess('');

    if (currentGuess === secretWord) {
      setGameOver(true);
      setGameWon(true);
      setMessage('You won!');
      toast({
        title: "Congratulations! 🎉",
        description: `You guessed the word "${secretWord}" in ${newGuesses.length} ${newGuesses.length === 1 ? 'try' : 'tries'}!`,
      });
      return;
    }

    if (newGuesses.length >= maxGuesses) {
      setGameOver(true);
      setMessage(`Game over! The word was ${secretWord}`);
    }
  };

  const getLetterColor = (letter: string, index: number, word: string) => {
    if (letter === secretWord[index]) {
      return 'bg-green-500 text-white border-green-600';
    } else if (secretWord.includes(letter)) {
      return 'bg-amber-500 text-white border-amber-600';
    } else {
      return 'bg-gray-500 text-white border-gray-600';
    }
  };

  // Keyboard letters
  const keyboard = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['Z', 'X', 'C', 'V', 'B', 'N', 'M']
  ];

  const getKeyColor = (letter: string) => {
    // If any guess has this letter in the right position
    for (const guess of guesses) {
      const index = guess.indexOf(letter);
      if (index >= 0 && guess[index] === secretWord[index]) {
        return 'bg-green-500 text-white hover:bg-green-600';
      }
    }
    
    // If any guess has this letter in the wrong position
    if (guesses.some(guess => guess.includes(letter) && secretWord.includes(letter))) {
      return 'bg-amber-500 text-white hover:bg-amber-600';
    }
    
    // If any guess has this letter and it's not in the word
    if (guesses.some(guess => guess.includes(letter) && !secretWord.includes(letter))) {
      return 'bg-gray-500 text-white hover:bg-gray-600';
    }
    
    return 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600';
  };

  return (
    <div className="flex flex-col items-center">
      <div className="mb-4 text-center">
        <h3 className="text-lg font-semibold mb-2">Guess the Word</h3>
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>

      {/* Game board */}
      <div className="mb-6 w-full max-w-md" onKeyDown={handleKeyPress} tabIndex={0}>
        {/* Past guesses */}
        <div className="space-y-2 mb-4">
          {Array.from({ length: maxGuesses }).map((_, rowIndex) => (
            <div key={rowIndex} className="grid grid-cols-5 gap-2">
              {Array.from({ length: 5 }).map((_, colIndex) => {
                const guessedLetter = guesses[rowIndex]?.[colIndex] || '';
                const letterColor = guesses[rowIndex] 
                  ? getLetterColor(guessedLetter, colIndex, guesses[rowIndex])
                  : 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700';
                
                return (
                  <div
                    key={colIndex}
                    className={`w-12 h-12 flex items-center justify-center text-lg font-bold border-2 rounded transition-all ${letterColor}`}
                  >
                    {guessedLetter}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Current guess */}
        {!gameOver && (
          <div className="grid grid-cols-5 gap-2 mb-6">
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="w-12 h-12 flex items-center justify-center text-lg font-bold border-2 border-primary/30 rounded bg-gray-100 dark:bg-gray-800"
              >
                {currentGuess[index] || ''}
              </div>
            ))}
          </div>
        )}

        {/* Virtual keyboard */}
        <div className="w-full max-w-md space-y-2">
          {keyboard.map((row, rowIndex) => (
            <div key={rowIndex} className="flex justify-center gap-1">
              {rowIndex === 2 && (
                <Button
                  onClick={submitGuess}
                  className="px-2 h-10"
                  disabled={gameOver || currentGuess.length !== 5}
                >
                  Enter
                </Button>
              )}
              {row.map(key => (
                <Button
                  key={key}
                  onClick={() => handleLetterClick(key)}
                  className={`w-8 h-10 p-0 font-medium ${getKeyColor(key)}`}
                  variant="outline"
                  disabled={gameOver}
                >
                  {key}
                </Button>
              ))}
              {rowIndex === 2 && (
                <Button
                  onClick={handleBackspace}
                  className="px-2 h-10"
                  variant="outline"
                  disabled={gameOver}
                >
                  ⌫
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>

      {gameOver && (
        <Button onClick={startNewGame} className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          New Game
        </Button>
      )}

      <Card className="p-3 mt-6 bg-gray-50 dark:bg-gray-900/50 w-full">
        <p className="text-xs text-muted-foreground text-center">
          <span className="font-medium">How to play:</span> Guess the 5-letter word in six tries. 
          After each guess, the color of the tiles will indicate how close your guess was.
          <span className="block mt-2">
            <span className="inline-block w-3 h-3 bg-green-500 mr-1 rounded-sm"></span> Right letter, right position
            <span className="mx-2">|</span>
            <span className="inline-block w-3 h-3 bg-amber-500 mr-1 rounded-sm"></span> Right letter, wrong position
            <span className="mx-2">|</span>
            <span className="inline-block w-3 h-3 bg-gray-500 mr-1 rounded-sm"></span> Letter not in word
          </span>
        </p>
      </Card>
    </div>
  );
};

export default WordleGame;
