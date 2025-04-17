
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/use-toast";
import { Music, Search, ArrowLeft, Brain, Coffee, Gamepad, PlayCircle, PauseCircle, ChevronRight, Shuffle, Calculator, Zap, Lightbulb, PenTool } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const RelaxationModePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(5 * 60); // 5 minutes in seconds
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [activeTab, setActiveTab] = useState("music");
  
  // Mini games states
  const [memoryGame, setMemoryGame] = useState({
    cards: Array(8).fill(null).map((_, i) => ({ id: i % 4, flipped: false, matched: false })).sort(() => Math.random() - 0.5),
    firstCard: null as number | null,
    moves: 0,
    complete: false
  });
  
  // Word Scramble game state
  const [wordScramble, setWordScramble] = useState({
    words: ["PHYSICS", "CHEMISTRY", "BIOLOGY", "MATHEMATICS", "HISTORY", "GEOGRAPHY"],
    currentWord: "",
    scrambledWord: "",
    userInput: "",
    score: 0,
    message: "",
    gameStarted: false
  });
  
  // Quick Math game state
  const [mathGame, setMathGame] = useState({
    num1: 0,
    num2: 0,
    operator: "+",
    userAnswer: "",
    correctAnswer: 0,
    score: 0,
    timer: 10,
    isActive: false,
    message: ""
  });
  
  // Color match game state
  const [colorGame, setColorGame] = useState({
    colors: ["red", "blue", "green", "yellow", "purple", "orange"],
    colorNames: ["Red", "Blue", "Green", "Yellow", "Purple", "Orange"],
    currentColor: 0,
    currentText: 0,
    score: 0,
    timeLeft: 30,
    isActive: false
  });

  // Reaction time game state
  const [reactionGame, setReactionGame] = useState({
    stage: "waiting", // waiting, ready, clicked
    startTime: 0,
    reactionTime: 0,
    bestTime: Infinity,
    attempts: 0,
    message: "Click to start"
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
  
  // Initialize word scramble game
  useEffect(() => {
    if (wordScramble.gameStarted) {
      startNewWordRound();
    }
  }, [wordScramble.gameStarted]);

  // Start a new word scramble round
  const startNewWordRound = () => {
    const randomIndex = Math.floor(Math.random() * wordScramble.words.length);
    const word = wordScramble.words[randomIndex];
    setWordScramble(prev => ({
      ...prev,
      currentWord: word,
      scrambledWord: scrambleWord(word),
      userInput: "",
      message: ""
    }));
  };

  // Scramble a word
  const scrambleWord = (word: string) => {
    const arr = word.split("");
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr.join("");
  };

  // Check word scramble answer
  const checkWordAnswer = () => {
    if (wordScramble.userInput.toUpperCase() === wordScramble.currentWord) {
      setWordScramble(prev => ({
        ...prev,
        score: prev.score + 1,
        message: "Correct! 🎉"
      }));
      setTimeout(() => {
        startNewWordRound();
      }, 1000);
    } else {
      setWordScramble(prev => ({
        ...prev,
        message: "Try again!"
      }));
    }
  };

  // Start quick math game
  const startMathGame = () => {
    generateMathProblem();
    setMathGame(prev => ({
      ...prev,
      score: 0,
      timer: 30,
      isActive: true,
      message: ""
    }));

    const timerInterval = setInterval(() => {
      setMathGame(prev => {
        if (prev.timer <= 1) {
          clearInterval(timerInterval);
          return {
            ...prev,
            timer: 0,
            isActive: false,
            message: `Game over! Final score: ${prev.score}`
          };
        }
        return {
          ...prev,
          timer: prev.timer - 1
        };
      });
    }, 1000);
  };

  // Generate math problem
  const generateMathProblem = () => {
    const operators = ["+", "-", "×", "÷"];
    const operator = operators[Math.floor(Math.random() * operators.length)];
    let num1, num2, answer;

    switch (operator) {
      case "+":
        num1 = Math.floor(Math.random() * 50) + 1;
        num2 = Math.floor(Math.random() * 50) + 1;
        answer = num1 + num2;
        break;
      case "-":
        num1 = Math.floor(Math.random() * 50) + 20;
        num2 = Math.floor(Math.random() * num1) + 1;
        answer = num1 - num2;
        break;
      case "×":
        num1 = Math.floor(Math.random() * 12) + 1;
        num2 = Math.floor(Math.random() * 12) + 1;
        answer = num1 * num2;
        break;
      case "÷":
        num2 = Math.floor(Math.random() * 10) + 1;
        answer = Math.floor(Math.random() * 10) + 1;
        num1 = num2 * answer;
        break;
      default:
        num1 = Math.floor(Math.random() * 50) + 1;
        num2 = Math.floor(Math.random() * 50) + 1;
        answer = num1 + num2;
        break;
    }

    setMathGame(prev => ({
      ...prev,
      num1,
      num2,
      operator,
      userAnswer: "",
      correctAnswer: answer
    }));
  };

  // Check math game answer
  const checkMathAnswer = () => {
    if (parseInt(mathGame.userAnswer) === mathGame.correctAnswer) {
      setMathGame(prev => ({
        ...prev,
        score: prev.score + 1,
        message: "Correct! 👍"
      }));
      setTimeout(() => {
        generateMathProblem();
        setMathGame(prev => ({ ...prev, message: "" }));
      }, 500);
    } else {
      setMathGame(prev => ({ ...prev, message: "Wrong! Try again" }));
    }
  };

  // Start color match game
  const startColorGame = () => {
    updateColorGame();
    setColorGame(prev => ({
      ...prev,
      score: 0,
      timeLeft: 30,
      isActive: true
    }));

    const timerInterval = setInterval(() => {
      setColorGame(prev => {
        if (prev.timeLeft <= 1) {
          clearInterval(timerInterval);
          return {
            ...prev,
            timeLeft: 0,
            isActive: false
          };
        }
        return {
          ...prev,
          timeLeft: prev.timeLeft - 1
        };
      });
    }, 1000);
  };

  // Update color game
  const updateColorGame = () => {
    const colorIndex = Math.floor(Math.random() * colorGame.colors.length);
    let textIndex;
    
    // Make sure text and color are different sometimes
    if (Math.random() > 0.5) {
      do {
        textIndex = Math.floor(Math.random() * colorGame.colorNames.length);
      } while (textIndex === colorIndex);
    } else {
      textIndex = colorIndex;
    }
    
    setColorGame(prev => ({
      ...prev,
      currentColor: colorIndex,
      currentText: textIndex
    }));
  };

  // Handle color game answer
  const handleColorAnswer = (isMatch: boolean) => {
    const actualMatch = colorGame.currentColor === colorGame.currentText;
    
    if ((isMatch && actualMatch) || (!isMatch && !actualMatch)) {
      setColorGame(prev => ({ ...prev, score: prev.score + 1 }));
    }
    
    updateColorGame();
  };

  // Start reaction time game
  const handleReactionClick = () => {
    const { stage } = reactionGame;
    
    if (stage === "waiting") {
      // Start the game
      setReactionGame({
        ...reactionGame,
        stage: "ready",
        message: "Wait for green...",
      });
      
      // Set random timeout before showing green
      const timeout = Math.floor(Math.random() * 3000) + 1000; // 1-4 seconds
      setTimeout(() => {
        setReactionGame(prev => {
          if (prev.stage === "ready") {
            return {
              ...prev,
              stage: "clicking",
              startTime: Date.now(),
              message: "Click now!"
            };
          }
          return prev;
        });
      }, timeout);
    } 
    else if (stage === "ready") {
      // Clicked too early
      setReactionGame({
        ...reactionGame,
        stage: "waiting",
        message: "Too soon! Click to try again",
      });
    } 
    else if (stage === "clicking") {
      // Calculate reaction time
      const endTime = Date.now();
      const reactionTime = endTime - reactionGame.startTime;
      const bestTime = Math.min(reactionGame.bestTime, reactionTime);
      
      setReactionGame({
        ...reactionGame,
        stage: "waiting",
        reactionTime,
        bestTime,
        attempts: reactionGame.attempts + 1,
        message: `${reactionTime} ms. Click to try again!`,
      });
    }
  };
  
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
    <div className="flex flex-col min-h-screen p-4 bg-gradient-to-b from-indigo-50/50 to-purple-50/50 dark:from-indigo-900/20 dark:to-purple-900/20">
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
      
      <Tabs defaultValue="music" value={activeTab} onValueChange={setActiveTab} className="w-full max-w-5xl mx-auto">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="music" className="flex items-center gap-2">
            <Music className="h-4 w-4" />
            <span>Music Break</span>
          </TabsTrigger>
          <TabsTrigger value="games" className="flex items-center gap-2">
            <Gamepad className="h-4 w-4" />
            <span>Mini Games</span>
          </TabsTrigger>
          <TabsTrigger value="quick-games" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            <span>Quick Games</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="music" className="fade-in">
          <Card className="mb-8 border-primary/10 shadow-md">
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
        
        <TabsContent value="games" className="fade-in space-y-6">
          {/* Memory Game */}
          <Card className="border-primary/10 shadow-md">
            <CardHeader>
              <CardTitle>Memory Game</CardTitle>
              <CardDescription>
                Find matching pairs to exercise your brain
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
          
          {/* Word Scramble Game */}
          <Card className="border-primary/10 shadow-md">
            <CardHeader>
              <CardTitle>Word Scramble</CardTitle>
              <CardDescription>
                Unscramble the letters to form study-related words
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!wordScramble.gameStarted ? (
                <Button onClick={() => setWordScramble(prev => ({ ...prev, gameStarted: true }))}>
                  Start Game
                </Button>
              ) : (
                <>
                  <div className="text-center">
                    <div className="text-2xl font-bold tracking-wider mb-4">{wordScramble.scrambledWord}</div>
                    <div className="text-sm text-muted-foreground">Score: {wordScramble.score}</div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Input 
                      value={wordScramble.userInput}
                      onChange={(e) => setWordScramble(prev => ({ ...prev, userInput: e.target.value }))}
                      placeholder="Type your answer here"
                      className="flex-1"
                    />
                    <Button onClick={checkWordAnswer}>Check</Button>
                  </div>
                  
                  {wordScramble.message && (
                    <div className={`text-center font-medium ${wordScramble.message.includes('Correct') ? 'text-green-500' : 'text-amber-500'}`}>
                      {wordScramble.message}
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="quick-games" className="fade-in space-y-6">
          {/* Quick Math Game */}
          <Card className="border-primary/10 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Quick Math
              </CardTitle>
              <CardDescription>
                Test your mental math skills under time pressure
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!mathGame.isActive ? (
                <div className="text-center">
                  <Button onClick={startMathGame} className="bg-gradient-to-r from-indigo-500 to-violet-500">
                    Start Game
                  </Button>
                  {mathGame.message && (
                    <div className="mt-2 font-medium text-primary">{mathGame.message}</div>
                  )}
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-center text-sm">
                    <div>Score: <span className="font-bold">{mathGame.score}</span></div>
                    <div>Time: <span className="font-bold">{mathGame.timer}s</span></div>
                  </div>
                  
                  <Progress value={(mathGame.timer / 30) * 100} className="h-2 w-full" />
                  
                  <div className="text-center py-6">
                    <div className="text-3xl font-bold mb-4">
                      {mathGame.num1} {mathGame.operator} {mathGame.num2} = ?
                    </div>
                    
                    <div className="flex gap-2">
                      <Input 
                        value={mathGame.userAnswer}
                        onChange={(e) => setMathGame(prev => ({ ...prev, userAnswer: e.target.value }))}
                        placeholder="Your answer"
                        className="flex-1 text-center text-lg"
                        type="number"
                        autoFocus
                      />
                      <Button onClick={checkMathAnswer}>Submit</Button>
                    </div>
                    
                    {mathGame.message && (
                      <div className={`mt-2 font-medium ${mathGame.message.includes('Correct') ? 'text-green-500' : 'text-amber-500'}`}>
                        {mathGame.message}
                      </div>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
          
          {/* Color Match Game */}
          <Card className="border-primary/10 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PenTool className="h-5 w-5" />
                Color Match
              </CardTitle>
              <CardDescription>
                Test your focus by identifying color/word matches
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!colorGame.isActive ? (
                <div className="text-center">
                  <Button onClick={startColorGame} className="bg-gradient-to-r from-pink-500 to-orange-500">
                    Start Game
                  </Button>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-center text-sm">
                    <div>Score: <span className="font-bold">{colorGame.score}</span></div>
                    <div>Time: <span className="font-bold">{colorGame.timeLeft}s</span></div>
                  </div>
                  
                  <Progress value={(colorGame.timeLeft / 30) * 100} className="h-2 w-full" />
                  
                  <div className="text-center py-8">
                    <div 
                      className="text-3xl font-bold mb-8" 
                      style={{ color: colorGame.colors[colorGame.currentColor] }}
                    >
                      {colorGame.colorNames[colorGame.currentText]}
                    </div>
                    
                    <div className="flex justify-center gap-4">
                      <Button 
                        variant="outline" 
                        size="lg" 
                        onClick={() => handleColorAnswer(true)}
                      >
                        Match
                      </Button>
                      <Button 
                        variant="outline" 
                        size="lg" 
                        onClick={() => handleColorAnswer(false)}
                      >
                        No Match
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
          
          {/* Reaction Time Game */}
          <Card className="border-primary/10 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                Reaction Time
              </CardTitle>
              <CardDescription>
                Test your reflexes with this simple reaction game
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div 
                onClick={handleReactionClick}
                className={`w-full py-16 rounded-lg text-center cursor-pointer transition-all ${
                  reactionGame.stage === "clicking" 
                    ? "bg-green-500 text-white" 
                    : reactionGame.stage === "ready"
                    ? "bg-red-500 text-white"
                    : "bg-primary/20"
                }`}
              >
                <div className="text-xl font-bold">{reactionGame.message}</div>
              </div>
              
              {reactionGame.attempts > 0 && (
                <div className="flex justify-around text-sm">
                  <div>
                    Last attempt: <span className="font-bold">{reactionGame.reactionTime} ms</span>
                  </div>
                  <div>
                    Best time: <span className="font-bold">{
                      reactionGame.bestTime === Infinity ? "-" : `${reactionGame.bestTime} ms`
                    }</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RelaxationModePage;
