
import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/use-toast";
import { Music, Search, ArrowLeft, Brain, Coffee, PlayCircle, PauseCircle, ChevronRight } from "lucide-react";

const RelaxationModePage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(5 * 60); // 5 minutes in seconds
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [activeTab, setActiveTab] = useState("music");
  
  // Mini games
  const [memoryGame, setMemoryGame] = useState({
    cards: Array(8).fill(null).map((_, i) => ({ id: i % 4, flipped: false, matched: false })).sort(() => Math.random() - 0.5),
    firstCard: null as number | null,
    moves: 0,
    complete: false
  });
  
  // Set timer for 5 minutes break
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          toast({
            title: "Break time is over!",
            description: "Time to get back to studying.",
          });
          setTimeout(() => navigate("/study"), 2000);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [navigate]);
  
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    
    // Mock YouTube search
    setSelectedVideo(`https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1`);
    toast({
      title: "Playing music",
      description: `Now playing: "${searchTerm}"`,
    });
  };
  
  const handleSkip = () => {
    navigate("/study"); 
  };

  const handleFlipCard = (index: number) => {
    if (memoryGame.cards[index].matched || memoryGame.cards[index].flipped || memoryGame.complete) return;
    
    const updatedCards = [...memoryGame.cards];
    updatedCards[index].flipped = true;
    
    if (memoryGame.firstCard === null) {
      // First card flipped
      setMemoryGame({ ...memoryGame, cards: updatedCards, firstCard: index });
    } else {
      // Second card flipped - check for match
      const firstCardId = memoryGame.cards[memoryGame.firstCard].id;
      const secondCardId = memoryGame.cards[index].id;
      
      if (firstCardId === secondCardId) {
        // Match found
        updatedCards[memoryGame.firstCard].matched = true;
        updatedCards[index].matched = true;
        
        // Check if game is complete
        const isGameComplete = updatedCards.every(card => card.matched);
        
        setMemoryGame({
          cards: updatedCards,
          firstCard: null,
          moves: memoryGame.moves + 1,
          complete: isGameComplete
        });
        
        if (isGameComplete) {
          toast({
            title: "Congratulations!",
            description: `You completed the memory game in ${memoryGame.moves + 1} moves!`,
          });
        }
      } else {
        // No match - flip cards back after delay
        setMemoryGame({
          cards: updatedCards,
          firstCard: null,
          moves: memoryGame.moves + 1,
          complete: false
        });
        
        setTimeout(() => {
          const resetCards = [...updatedCards];
          resetCards[memoryGame.firstCard!].flipped = false;
          resetCards[index].flipped = false;
          setMemoryGame(prev => ({ ...prev, cards: resetCards }));
        }, 1000);
      }
    }
  };
  
  const restartMemoryGame = () => {
    setMemoryGame({
      cards: Array(8).fill(null).map((_, i) => ({ id: i % 4, flipped: false, matched: false })).sort(() => Math.random() - 0.5),
      firstCard: null,
      moves: 0,
      complete: false
    });
  };

  const getCardEmoji = (id: number) => {
    const emojis = ['🧠', '📚', '🔬', '🧮'];
    return emojis[id];
  };

  return (
    <div className="flex flex-col min-h-screen p-4 bg-gradient-to-b from-indigo-900/20 to-purple-900/20 dark:from-indigo-900/40 dark:to-purple-900/40">
      <div className="flex justify-between items-center mb-6">
        <Button variant="ghost" onClick={handleSkip} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          <span>Return to Study</span>
        </Button>
        <div className="px-4 py-1 rounded-full bg-primary/20 text-primary flex items-center gap-1 font-mono">
          <Coffee className="h-4 w-4" />
          <span className="font-bold">{formatTime(timeLeft)}</span>
        </div>
      </div>
      
      <h1 className="text-3xl font-bold text-center mb-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-transparent bg-clip-text">
        Break Time
      </h1>
      <p className="text-center text-muted-foreground mb-8">
        Relax your mind before your next study session
      </p>
      
      <Tabs defaultValue="music" value={activeTab} onValueChange={setActiveTab} className="w-full max-w-4xl mx-auto">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="music" className="flex items-center gap-2">
            <Music className="h-4 w-4" />
            <span>Listen to Music</span>
          </TabsTrigger>
          <TabsTrigger value="games" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            <span>Mini Games</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="music" className="fade-in">
          <Card className="mb-8 border-primary/10">
            <CardHeader>
              <CardTitle>Music Break</CardTitle>
              <CardDescription>
                Listen to your favorite song to refresh your mind
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSearch} className="space-y-4">
                <div className="flex gap-2">
                  <Input 
                    type="text"
                    placeholder="Search for a song or artist..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1"
                  />
                  <Button type="submit">
                    <Search className="h-4 w-4 mr-1" />
                    Search
                  </Button>
                </div>
              </form>
              
              {selectedVideo && (
                <div className="mt-6 aspect-video rounded-lg overflow-hidden shadow-lg">
                  <iframe 
                    className="w-full h-full" 
                    src={selectedVideo} 
                    title="YouTube video player" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen
                  ></iframe>
                </div>
              )}
              
              {!selectedVideo && (
                <div className="mt-6 bg-card/50 p-8 rounded-lg border border-border/50 text-center">
                  <Music className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    Search for your favorite song to play
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
          
          <div className="bg-primary/10 p-4 rounded-lg">
            <h3 className="font-medium mb-2 flex items-center gap-2">
              <Coffee className="h-5 w-5 text-primary" />
              Break Time Tips
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground list-disc pl-6">
              <li>Take deep breaths to relax your mind</li>
              <li>Look away from screens to reduce eye strain</li>
              <li>Stretch your muscles to prevent stiffness</li>
              <li>Hydrate yourself with water or tea</li>
            </ul>
          </div>
        </TabsContent>
        
        <TabsContent value="games" className="fade-in">
          <Card className="mb-8 border-primary/10">
            <CardHeader>
              <CardTitle>Memory Game</CardTitle>
              <CardDescription>
                Find matching pairs to exercise your brain during your break
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4 mb-6">
                {memoryGame.cards.map((card, index) => (
                  <div
                    key={index}
                    className={`aspect-square rounded-md transition-all duration-300 
                      ${card.flipped || card.matched 
                        ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white rotate-y-180' 
                        : 'bg-primary/10 cursor-pointer hover:bg-primary/20'}`}
                    onClick={() => handleFlipCard(index)}
                  >
                    <div className="w-full h-full flex items-center justify-center">
                      {(card.flipped || card.matched) ? (
                        <span className="text-3xl rotate-y-180">{getCardEmoji(card.id)}</span>
                      ) : (
                        <span className="text-3xl text-primary/20">?</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-between items-center">
                <div className="text-sm text-muted-foreground">
                  Moves: <span className="font-semibold">{memoryGame.moves}</span>
                </div>
                <Button onClick={restartMemoryGame} variant="outline" size="sm">
                  Restart Game
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <div className="bg-primary/10 p-4 rounded-lg">
            <h3 className="font-medium mb-2">Break Time Affirmations</h3>
            <div className="space-y-2 text-sm text-center">
              <blockquote className="border-l-2 pl-4 italic">
                "Taking breaks is not a sign of weakness, but a strategy for long-term success."
              </blockquote>
              <blockquote className="border-l-2 pl-4 italic">
                "My mind works better when it's well-rested."
              </blockquote>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RelaxationModePage;
