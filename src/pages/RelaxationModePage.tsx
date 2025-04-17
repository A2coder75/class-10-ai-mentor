
import React, { useState, useRef } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
import { Brain, Dices, Gamepad2, Puzzle, Coffee, Sparkles, Lightbulb, Music, ArrowLeft, Play, Pause, SkipForward, SkipBack, Volume2 } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import WordleGame from '@/components/relaxation-games/WordleGame';
import SnakeGame from '@/components/relaxation-games/SnakeGame';
import MemoryGame from '@/components/relaxation-games/MemoryGame';
import QuickQuiz from '@/components/relaxation-games/QuickQuiz';
import SudokuGame from '@/components/relaxation-games/SudokuGame';
import BreakTimer from '@/components/BreakTimer';

const musicTracks = [
  {
    id: 'track-1',
    title: 'Peaceful Piano',
    artist: 'Study Music',
    duration: '3:45',
    cover: 'https://placehold.co/400x400/e9ecef/495057?text=Piano+Music',
    category: 'focus',
    src: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0fd068ab8.mp3?filename=peaceful-piano-116586.mp3'
  },
  {
    id: 'track-2',
    title: 'Ambient Study',
    artist: 'Focus Beats',
    duration: '4:20',
    cover: 'https://placehold.co/400x400/e9ecef/495057?text=Ambient+Music',
    category: 'focus',
    src: 'https://cdn.pixabay.com/download/audio/2021/11/25/audio_cb4f1212a9.mp3?filename=ambient-piano-amp-strings-10711.mp3'
  },
  {
    id: 'track-3',
    title: 'Nature Sounds',
    artist: 'Relaxing Vibes',
    duration: '5:30',
    cover: 'https://placehold.co/400x400/e9ecef/495057?text=Nature+Sounds',
    category: 'relax',
    src: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_270f49d42e.mp3?filename=forest-with-small-river-birds-and-nature-field-recording-6735.mp3'
  },
  {
    id: 'track-4',
    title: 'Meditation',
    artist: 'Calm Mind',
    duration: '6:15',
    cover: 'https://placehold.co/400x400/e9ecef/495057?text=Meditation',
    category: 'relax',
    src: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_f1b4f4c0a0.mp3?filename=meditation-112217.mp3'
  },
];

const RelaxationModePage = () => {
  const { toast } = useToast();
  const [activeGame, setActiveGame] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('games');
  const [currentTrack, setCurrentTrack] = useState<typeof musicTracks[0] | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [volume, setVolume] = useState(80);
  
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

  const handlePlayPause = () => {
    if (!currentTrack) return;
    
    if (isPlaying) {
      audioRef.current?.pause();
    } else {
      audioRef.current?.play();
    }
    
    setIsPlaying(!isPlaying);
  };

  const handleTrackSelect = (track: typeof musicTracks[0]) => {
    setCurrentTrack(track);
    
    if (audioRef.current) {
      audioRef.current.src = track.src;
      audioRef.current.load();
      if (isPlaying) {
        audioRef.current.play();
      }
    }
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume / 100;
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

  const musicCategories = ['All Tracks', 'Focus', 'Relax'];
  const [musicFilter, setMusicFilter] = useState('All Tracks');

  const filteredTracks = musicFilter === 'All Tracks' 
    ? musicTracks 
    : musicTracks.filter(track => track.category.toLowerCase() === musicFilter.toLowerCase());

  return (
    <div className="page-container">
      <audio ref={audioRef} onEnded={() => setIsPlaying(false)} />
      
      <div className="flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-primary">Relaxation Mode</h1>
            <p className="text-muted-foreground">
              Take a break, relax, and recharge your mind with these activities
            </p>
          </div>
          <Button variant="outline" asChild className="flex gap-2">
            <Link to="/study">
              <ArrowLeft className="h-4 w-4" />
              Back to Study
            </Link>
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6 grid w-full grid-cols-2">
            <TabsTrigger value="games" className="flex items-center gap-2">
              <Gamepad2 className="h-4 w-4" />
              <span>Games & Activities</span>
            </TabsTrigger>
            <TabsTrigger value="music" className="flex items-center gap-2">
              <Music className="h-4 w-4" />
              <span>Study Music</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="games" className="fade-in">
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

          <TabsContent value="music" className="fade-in">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="md:col-span-2 border-primary/20 animate-fade-in">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-xl font-semibold">Study Music</CardTitle>
                  <div className="flex space-x-1">
                    {musicCategories.map(category => (
                      <Button 
                        key={category}
                        variant={musicFilter === category ? "default" : "outline"}
                        size="sm"
                        onClick={() => setMusicFilter(category)}
                        className="text-xs"
                      >
                        {category}
                      </Button>
                    ))}
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  {currentTrack && (
                    <Card className="mb-6 border-primary/20 bg-muted/20">
                      <div className="flex items-center p-4">
                        <div className="w-16 h-16 mr-4 rounded-md overflow-hidden">
                          <img 
                            src={currentTrack.cover} 
                            alt={`${currentTrack.title} cover`} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{currentTrack.title}</h4>
                          <p className="text-sm text-muted-foreground">{currentTrack.artist}</p>
                          <div className="flex items-center gap-6 mt-2">
                            <div className="flex items-center gap-1">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8"
                                onClick={() => {
                                  const currentIndex = musicTracks.findIndex(t => t.id === currentTrack.id);
                                  if (currentIndex > 0) {
                                    handleTrackSelect(musicTracks[currentIndex - 1]);
                                  }
                                }}
                              >
                                <SkipBack className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="default" 
                                size="icon" 
                                className="h-8 w-8 rounded-full bg-primary"
                                onClick={handlePlayPause}
                              >
                                {isPlaying ? (
                                  <Pause className="h-4 w-4" />
                                ) : (
                                  <Play className="h-4 w-4 ml-0.5" />
                                )}
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8"
                                onClick={() => {
                                  const currentIndex = musicTracks.findIndex(t => t.id === currentTrack.id);
                                  if (currentIndex < musicTracks.length - 1) {
                                    handleTrackSelect(musicTracks[currentIndex + 1]);
                                  }
                                }}
                              >
                                <SkipForward className="h-4 w-4" />
                              </Button>
                            </div>
                            <div className="flex items-center gap-2 flex-1 max-w-[180px]">
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
                        </div>
                      </div>
                    </Card>
                  )}
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {filteredTracks.map((track) => (
                      <Card 
                        key={track.id} 
                        className={`hover:shadow-md transition-all duration-300 cursor-pointer ${
                          currentTrack?.id === track.id ? 'border-primary bg-primary/5' : ''
                        }`}
                        onClick={() => handleTrackSelect(track)}
                      >
                        <div className="flex items-center p-4">
                          <div className="w-12 h-12 mr-4 rounded-md overflow-hidden">
                            <img 
                              src={track.cover} 
                              alt={`${track.title} cover`} 
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-sm">{track.title}</h4>
                            <p className="text-xs text-muted-foreground">{track.artist}</p>
                          </div>
                          <div className="flex items-center">
                            <span className="text-xs text-muted-foreground mr-3">{track.duration}</span>
                            {currentTrack?.id === track.id && isPlaying ? (
                              <Pause className="h-4 w-4 text-primary" />
                            ) : (
                              <Play className="h-4 w-4 text-muted-foreground" />
                            )}
                          </div>
                        </div>
                      </Card>
                    ))}
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
        </Tabs>
      </div>
    </div>
  );
};

export default RelaxationModePage;
