
import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { Brain, Dices, Gamepad2, Puzzle, LucideIcon, Coffee, Sparkles, Lightbulb, Music, Laugh } from 'lucide-react';
import BreakTimer from '../components/BreakTimer';
import WordleGame from '../components/relaxation-games/WordleGame';
import SnakeGame from '../components/relaxation-games/SnakeGame';
import MemoryGame from '../components/relaxation-games/MemoryGame';
import QuickQuiz from '../components/relaxation-games/QuickQuiz';
import SudokuGame from '../components/relaxation-games/SudokuGame';

interface GameCategory {
  id: string;
  name: string;
  icon: LucideIcon;
  description: string;
  games: Game[];
}

interface Game {
  id: string;
  title: string;
  description: string;
  component: React.ComponentType;
  icon: LucideIcon;
  difficulty: 'easy' | 'medium' | 'hard';
  timeEstimate: string;
}

const RelaxationModePage: React.FC = () => {
  const { toast } = useToast();
  const [activeGame, setActiveGame] = useState<Game | null>(null);

  const gameCategories: GameCategory[] = [
    {
      id: 'brain-games',
      name: 'Brain Games',
      icon: Brain,
      description: 'Fun puzzles to keep your mind sharp while taking a break',
      games: [
        {
          id: 'wordle',
          title: 'Word Puzzle',
          description: 'Guess the hidden word in six tries',
          component: WordleGame,
          icon: Lightbulb,
          difficulty: 'medium',
          timeEstimate: '3-5 min'
        },
        {
          id: 'memory',
          title: 'Memory Match',
          description: 'Test your memory by matching pairs of cards',
          component: MemoryGame,
          icon: Brain,
          difficulty: 'easy',
          timeEstimate: '3-5 min'
        },
        {
          id: 'sudoku',
          title: 'Sudoku',
          description: 'Classic number puzzle game',
          component: SudokuGame,
          icon: Puzzle,
          difficulty: 'medium',
          timeEstimate: '5-10 min'
        }
      ]
    },
    {
      id: 'quick-fun',
      name: 'Quick Fun',
      icon: Dices,
      description: 'Quick and engaging ways to refresh your mind',
      games: [
        {
          id: 'quick-quiz',
          title: 'Trivia Challenge',
          description: 'Test your general knowledge with fun trivia',
          component: QuickQuiz,
          icon: Sparkles,
          difficulty: 'easy',
          timeEstimate: '2-3 min'
        },
        {
          id: 'snake',
          title: 'Snake Game',
          description: 'Classic snake game to test your reflexes',
          component: SnakeGame,
          icon: Gamepad2,
          difficulty: 'easy',
          timeEstimate: '2-5 min'
        },
      ]
    }
  ];

  const renderGameCard = (game: Game) => {
    const difficultyColor = 
      game.difficulty === 'easy' ? 'text-green-500 bg-green-50 dark:bg-green-950/30' :
      game.difficulty === 'medium' ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/30' :
      'text-red-500 bg-red-50 dark:bg-red-950/30';

    return (
      <Card 
        key={game.id}
        className="hover:shadow-md transition-all duration-300 hover:border-primary/50 cursor-pointer animate-fade-in"
        onClick={() => setActiveGame(game)}
      >
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-md bg-primary/10">
                <game.icon className="h-5 w-5 text-primary" />
              </div>
              <CardTitle className="text-lg">{game.title}</CardTitle>
            </div>
            <span className={`text-xs px-2 py-1 rounded-full ${difficultyColor} font-medium`}>
              {game.difficulty}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{game.description}</p>
        </CardContent>
        <CardFooter className="flex justify-between border-t pt-3">
          <span className="text-xs text-muted-foreground flex items-center">
            <Coffee className="h-3 w-3 mr-1" /> {game.timeEstimate}
          </span>
          <Button variant="ghost" size="sm">Play Now</Button>
        </CardFooter>
      </Card>
    );
  };

  return (
    <div className="page-container">
      <div className="flex flex-col gap-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-primary">Relaxation Mode</h1>
          <p className="text-muted-foreground">
            Take a break, relax, and recharge your mind with these activities
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-2 border-primary/20 animate-fade-in">
            {activeGame ? (
              <div>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-md bg-primary/10">
                      <activeGame.icon className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle>{activeGame.title}</CardTitle>
                  </div>
                  <Button variant="outline" onClick={() => setActiveGame(null)}>
                    Back to Games
                  </Button>
                </CardHeader>
                <CardContent className="py-6">
                  <activeGame.component />
                </CardContent>
              </div>
            ) : (
              <Tabs defaultValue={gameCategories[0].id}>
                <CardHeader className="pb-0">
                  <CardTitle className="text-xl font-semibold">Games & Activities</CardTitle>
                  <TabsList className="mt-4">
                    {gameCategories.map(category => (
                      <TabsTrigger key={category.id} value={category.id} className="flex items-center gap-2">
                        <category.icon className="h-4 w-4" />
                        {category.name}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </CardHeader>
                <CardContent className="pt-6">
                  {gameCategories.map(category => (
                    <TabsContent key={category.id} value={category.id} className="mt-0">
                      <p className="text-sm text-muted-foreground mb-6">{category.description}</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {category.games.map(renderGameCard)}
                      </div>
                    </TabsContent>
                  ))}
                </CardContent>
              </Tabs>
            )}
          </Card>
          
          <div className="space-y-6">
            <Card className="animate-fade-in">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Coffee className="h-5 w-5 text-primary" />
                  Break Timer
                </CardTitle>
              </CardHeader>
              <CardContent>
                <BreakTimer initialMinutes={5} />
              </CardContent>
            </Card>
            
            <Card className="animate-fade-in">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-amber-500" />
                  Quick Mental Reset
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-primary/10 rounded-md">
                  <h4 className="font-medium mb-1 text-sm">Deep Breathing</h4>
                  <p className="text-xs text-muted-foreground">
                    Take 5 deep breaths, inhaling for 4 seconds and exhaling for 6 seconds.
                  </p>
                </div>
                
                <div className="p-3 bg-amber-500/10 rounded-md">
                  <h4 className="font-medium mb-1 text-sm">Stretch Break</h4>
                  <p className="text-xs text-muted-foreground">
                    Stand up and stretch your arms, neck, and shoulders for 30 seconds.
                  </p>
                </div>
                
                <div className="p-3 bg-blue-500/10 rounded-md">
                  <h4 className="font-medium mb-1 text-sm">Mindful Minute</h4>
                  <p className="text-xs text-muted-foreground">
                    Close your eyes for one minute and focus only on your breathing.
                  </p>
                </div>
                
                <Button 
                  className="w-full"
                  variant="outline"
                  onClick={() => {
                    toast({
                      title: "Break reminder set!",
                      description: "We'll remind you to take a short break in 25 minutes.",
                    });
                  }}
                >
                  Set Break Reminder
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RelaxationModePage;
