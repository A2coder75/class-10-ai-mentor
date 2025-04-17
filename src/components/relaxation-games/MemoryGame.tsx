
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { RefreshCw, Clock } from 'lucide-react';

interface MemoryCard {
  id: number;
  emoji: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const EMOJIS = [
  "🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼", 
  "🦁", "🐮", "🐷", "🐸", "🐵", "🐔", "🐧", "🐦",
  "🦄", "🦉", "🦋", "🐢", "🐬", "🐙", "🦀", "🐝"
];

const MemoryGame: React.FC = () => {
  const [cards, setCards] = useState<MemoryCard[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<number>(0);
  const [moves, setMoves] = useState<number>(0);
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [gameCompleted, setGameCompleted] = useState<boolean>(false);
  const [timer, setTimer] = useState<number>(0);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [bestScore, setBestScore] = useState<{ moves: number; time: number } | null>(null);

  const getGridSizeForDifficulty = () => {
    switch (difficulty) {
      case 'easy': return 8; // 4x4 grid (16 cards, 8 pairs)
      case 'medium': return 12; // 4x6 grid (24 cards, 12 pairs)
      case 'hard': return 18; // 6x6 grid (36 cards, 18 pairs)
    }
  };

  useEffect(() => {
    startNewGame();
    const storedBestScore = localStorage.getItem(`memoryGameBestScore_${difficulty}`);
    if (storedBestScore) {
      setBestScore(JSON.parse(storedBestScore));
    }
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
    const pairCount = getGridSizeForDifficulty();
    const selectedEmojis = EMOJIS.slice(0, pairCount);
    let newCards: MemoryCard[] = [];
    
    // Create pairs
    for (let i = 0; i < pairCount; i++) {
      const emoji = selectedEmojis[i];
      newCards.push(
        { id: i * 2, emoji, isFlipped: false, isMatched: false },
        { id: i * 2 + 1, emoji, isFlipped: false, isMatched: false }
      );
    }
    
    // Shuffle cards
    for (let i = newCards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newCards[i], newCards[j]] = [newCards[j], newCards[i]];
    }
    
    setCards(newCards);
    setFlippedCards([]);
    setMatchedPairs(0);
    setMoves(0);
    setTimer(0);
    setGameStarted(false);
    setGameCompleted(false);
  };

  const handleCardClick = (id: number) => {
    // Ignore if card is already flipped or matched
    if (
      flippedCards.length === 2 ||
      cards.find(card => card.id === id)?.isFlipped ||
      cards.find(card => card.id === id)?.isMatched
    ) {
      return;
    }
    
    if (!gameStarted) {
      setGameStarted(true);
    }
    
    // Flip the card
    setCards(cards.map(card => 
      card.id === id ? { ...card, isFlipped: true } : card
    ));
    
    setFlippedCards(prev => [...prev, id]);
    
    // Check for pair match
    if (flippedCards.length === 1) {
      setMoves(prev => prev + 1);
      
      const firstCardId = flippedCards[0];
      const firstCard = cards.find(card => card.id === firstCardId);
      const secondCard = cards.find(card => card.id === id);
      
      if (firstCard?.emoji === secondCard?.emoji) {
        // Match found
        setTimeout(() => {
          setCards(cards.map(card => 
            (card.id === firstCardId || card.id === id) 
              ? { ...card, isMatched: true } 
              : card
          ));
          setFlippedCards([]);
          setMatchedPairs(prev => {
            const newPairs = prev + 1;
            const totalPairs = getGridSizeForDifficulty();
            
            if (newPairs === totalPairs) {
              setGameCompleted(true);
              const currentScore = { moves: moves + 1, time: timer };
              
              if (!bestScore || 
                  (moves + 1 < bestScore.moves) || 
                  (moves + 1 === bestScore.moves && timer < bestScore.time)) {
                setBestScore(currentScore);
                localStorage.setItem(
                  `memoryGameBestScore_${difficulty}`, 
                  JSON.stringify(currentScore)
                );
                toast({
                  title: "New Best Score!",
                  description: `You completed the game in ${moves + 1} moves and ${formatTime(timer)}!`,
                });
              } else {
                toast({
                  title: "Game Completed!",
                  description: `You finished in ${moves + 1} moves and ${formatTime(timer)}.`,
                });
              }
            }
            
            return newPairs;
          });
        }, 500);
      } else {
        // No match
        setTimeout(() => {
          setCards(cards.map(card => 
            (card.id === firstCardId || card.id === id) 
              ? { ...card, isFlipped: false } 
              : card
          ));
          setFlippedCards([]);
        }, 1000);
      }
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getCardGridStyle = () => {
    switch (difficulty) {
      case 'easy': return 'grid-cols-4';
      case 'medium': return 'grid-cols-4 sm:grid-cols-6';
      case 'hard': return 'grid-cols-4 sm:grid-cols-6';
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="mb-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-xl font-bold">Memory Match</h3>
            <p className="text-sm text-muted-foreground">Find all matching pairs</p>
          </div>
          
          <div className="flex gap-3">
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4 text-primary" />
                <span className="font-mono text-lg">{formatTime(timer)}</span>
              </div>
              <span className="text-xs text-muted-foreground">
                Moves: {moves}
              </span>
            </div>
          </div>
        </div>
        
        {gameCompleted && (
          <div className="mb-4 p-4 bg-green-100 dark:bg-green-900/30 rounded-lg text-center">
            <h3 className="text-xl font-bold text-green-700 dark:text-green-400">
              Congratulations!
            </h3>
            <p className="text-green-600 dark:text-green-300">
              You completed the game in {moves} moves and {formatTime(timer)}!
            </p>
          </div>
        )}
        
        <div className="flex flex-wrap justify-center gap-2 mb-4">
          <Button 
            variant={difficulty === 'easy' ? 'default' : 'outline'}
            onClick={() => setDifficulty('easy')}
            size="sm"
          >
            Easy
          </Button>
          <Button 
            variant={difficulty === 'medium' ? 'default' : 'outline'}
            onClick={() => setDifficulty('medium')}
            size="sm"
          >
            Medium
          </Button>
          <Button 
            variant={difficulty === 'hard' ? 'default' : 'outline'}
            onClick={() => setDifficulty('hard')}
            size="sm"
          >
            Hard
          </Button>
          
          <Button 
            variant="outline"
            onClick={startNewGame}
            size="sm"
            className="ml-auto flex items-center gap-1"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Restart
          </Button>
        </div>

        <div className={`grid ${getCardGridStyle()} gap-2`}>
          {cards.map(card => (
            <div
              key={card.id}
              className="aspect-square"
              onClick={() => handleCardClick(card.id)}
            >
              <Card className={`h-full w-full transition-all duration-300 transform cursor-pointer ${
                card.isFlipped || card.isMatched 
                  ? 'bg-primary/10 border-primary/30'
                  : 'bg-primary hover:bg-primary/90 border-primary/50'
              } ${card.isMatched ? 'opacity-50' : 'opacity-100'}`}>
                <CardContent className="flex items-center justify-center h-full p-0">
                  {(card.isFlipped || card.isMatched) ? (
                    <span className="text-2xl sm:text-3xl">{card.emoji}</span>
                  ) : (
                    <span className="text-xl sm:text-2xl text-white">?</span>
                  )}
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>

      {bestScore && (
        <div className="text-center text-sm text-muted-foreground">
          Best Score ({difficulty}): {bestScore.moves} moves in {formatTime(bestScore.time)}
        </div>
      )}
    </div>
  );
};

export default MemoryGame;
