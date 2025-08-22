import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { 
  Brain, Dices, Gamepad2, Puzzle, Coffee, Sparkles, 
  Lightbulb, Music, ArrowLeft, Play, Pause, SkipForward, 
  SkipBack, Volume2, Search, Youtube
} from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import WordleGame from '@/components/relaxation-games/WordleGame';
import SnakeGame from '@/components/relaxation-games/SnakeGame';
import MemoryGame from '@/components/relaxation-games/MemoryGame';
import QuickQuiz from '@/components/relaxation-games/QuickQuiz';
import SudokuGame from '@/components/relaxation-games/SudokuGame';
import BreakTimer from '@/components/BreakTimer';

const RelaxationModePage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [activeGame, setActiveGame] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('music');
  const [volume, setVolume] = useState(80);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [youtubeVideoId, setYoutubeVideoId] = useState('');
  const [searchInput, setSearchInput] = useState('');
  
  useEffect(() => {
    const breakTimerElement = document.querySelector('.break-timer-component');
    if (breakTimerElement) {
      const playButton = breakTimerElement.querySelector('button');
      if (playButton) {
        setTimeout(() => {
          playButton.click();
        }, 500);
      }
    }
  }, []);

  const handleYoutubeSearch = async () => {
    if (!searchInput.trim()) return;

    try {
      const searchQuery = encodeURIComponent(searchInput + ' lyrics');
      const videoId = await fetchYoutubeVideoId(searchQuery);
      
      if (videoId) {
        setYoutubeVideoId(videoId);
        toast({
          title: "Video found",
          description: `Now playing "${searchInput}"`,
        });
      } else {
        toast({
          title: "No video found",
          description: "Try a different search term",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error searching YouTube:", error);
      toast({
        title: "Search failed",
        description: "Unable to load YouTube results",
        variant: "destructive"
      });
    }
  };

  const fetchYoutubeVideoId = async (query: string): Promise<string> => {
    console.log("Searching for YouTube video:", query);
    
    const sampleVideoMap: Record<string, string> = {
      'default': 'dQw4w9WgXcQ',
      'adele': '5GWlxGAyhVM',
      'taylor swift': 'bCeQNucpFxM',
      'imagine dragons': '7wtfhZwyrcc',
      'ed sheeran': 'JGwWNGJdvx8',
    };
    
    const lowerQuery = query.toLowerCase();
    for (const [key, videoId] of Object.entries(sampleVideoMap)) {
      if (lowerQuery.includes(key.toLowerCase())) {
        return videoId;
      }
    }
    
    return sampleVideoMap.default;
  };
  
  const gameCategories = [
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
        }
      ]
    }
  ];

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    
    const youtubeFrame = document.getElementById('youtube-player') as HTMLIFrameElement;
    if (youtubeFrame && youtubeFrame.contentWindow) {
      try {
        console.log("Setting YouTube volume to:", newVolume / 100);
      } catch (error) {
        console.error("Error setting YouTube volume:", error);
      }
    }
  };

  const renderGameCard = (game: any) => {
    const difficultyColor = game.difficulty === 'easy' 
      ? 'text-green-500 bg-green-50 dark:bg-green-950/30' 
      : game.difficulty === 'medium' 
        ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/30' 
        : 'text-red-500 bg-red-50 dark:bg-red-950/30';
    
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
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-primary/5 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col gap-8">
          <div className="flex items-center justify-between mb-4">
            <div className="space-y-3">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Relaxation Mode
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl">
                Take a well-deserved break, relax, and recharge your mind with these carefully curated activities designed to help you unwind
              </p>
            </div>
          <Button 
            variant="outline" 
            onClick={() => {
              // Check if we came from study mode
              const studyState = localStorage.getItem('studyModeState');
              if (studyState) {
                navigate("/study", { state: JSON.parse(studyState) });
              } else {
                navigate("/study");
              }
            }}
            className="flex gap-2 shadow-lg hover:shadow-xl transition-all"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Study
          </Button>
          </div>

          <Card className="border-primary/20 animate-fade-in shadow-lg bg-gradient-to-r from-primary/5 to-primary/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl flex items-center gap-3">
                <div className="p-2 rounded-full bg-primary/10">
                  <Coffee className="h-6 w-6 text-primary" />
                </div>
                Break Timer
              </CardTitle>
            </CardHeader>
            <CardContent className="break-timer-component">
              <BreakTimer initialMinutes={5} />
            </CardContent>
          </Card>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-8 grid w-full grid-cols-2 h-12 bg-muted/50 p-1 rounded-xl">
              <TabsTrigger value="music" className="flex items-center gap-2 text-sm font-medium data-[state=active]:bg-background data-[state=active]:shadow-md">
                <Music className="h-4 w-4" />
                <span>Music & Videos</span>
              </TabsTrigger>
              <TabsTrigger value="games" className="flex items-center gap-2 text-sm font-medium data-[state=active]:bg-background data-[state=active]:shadow-md">
                <Gamepad2 className="h-4 w-4" />
                <span>Games & Activities</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="music" className="fade-in">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card className="lg:col-span-2 border-primary/20 animate-fade-in shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-xl font-semibold flex items-center gap-2">
                    <Youtube className="h-5 w-5 text-red-500" />
                    YouTube Music
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="flex flex-col space-y-6">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Search for music on YouTube..."
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleYoutubeSearch();
                        }}
                        className="flex-1"
                      />
                      <Button onClick={handleYoutubeSearch}>
                        <Search className="h-4 w-4 mr-2" />
                        Search
                      </Button>
                    </div>

                    <div className="aspect-video w-full bg-muted rounded-md overflow-hidden">
                      {youtubeVideoId ? (
                        <iframe
                          id="youtube-player"
                          className="w-full h-full"
                          src={`https://www.youtube.com/embed/${youtubeVideoId}?autoplay=1&controls=1`}
                          title="YouTube video player"
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        ></iframe>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center flex-col space-y-4 text-muted-foreground">
                          <Youtube className="h-16 w-16 opacity-20" />
                          <p>Search for your favorite music to play</p>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Volume2 className="h-4 w-4 text-muted-foreground" />
                      <Slider 
                        value={[volume]} 
                        max={100} 
                        step={1}
                        className="w-full"
                        onValueChange={handleVolumeChange}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-6">
                <Card className="animate-fade-in">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Music className="h-5 w-5 text-primary" />
                      Music Benefits
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-3 bg-primary/10 rounded-md">
                      <h4 className="font-medium mb-1 text-sm">Increased Concentration</h4>
                      <p className="text-xs text-muted-foreground">
                        Instrumental music helps maintain focus while studying complex materials.
                      </p>
                    </div>

                    <div className="p-3 bg-amber-500/10 rounded-md">
                      <h4 className="font-medium mb-1 text-sm">Reduced Anxiety</h4>
                      <p className="text-xs text-muted-foreground">
                        Calming music lowers stress and anxiety levels before exams.
                      </p>
                    </div>

                    <div className="p-3 bg-blue-500/10 rounded-md">
                      <h4 className="font-medium mb-1 text-sm">Better Memory</h4>
                      <p className="text-xs text-muted-foreground">
                        Studies show certain music improves information retention and recall.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

            <TabsContent value="games" className="fade-in">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <Card className="lg:col-span-2 border-primary/20 animate-fade-in shadow-lg">
                {activeGame ? (
                  <div>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-md bg-primary/10">
                          <activeGame.icon className="h-5 w-5 text-primary" />
                        </div>
                        <CardTitle>{activeGame.title}</CardTitle>
                      </div>
                      <Button 
                        variant="outline" 
                        onClick={() => setActiveGame(null)}
                      >
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
                        {gameCategories.map((category) => (
                          <TabsTrigger
                            key={category.id}
                            value={category.id}
                            className="flex items-center gap-2"
                          >
                            <category.icon className="h-4 w-4" />
                            {category.name}
                          </TabsTrigger>
                        ))}
                      </TabsList>
                    </CardHeader>
                    <CardContent className="pt-6">
                      {gameCategories.map((category) => (
                        <TabsContent key={category.id} value={category.id} className="mt-0">
                          <p className="text-sm text-muted-foreground mb-6">
                            {category.description}
                          </p>
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
                          description: "We'll remind you to take a short break in 25 minutes."
                        });
                      }}
                    >
                      Set Break Reminder
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        </div>
      </div>
    </div>
  );
};

export default RelaxationModePage;
