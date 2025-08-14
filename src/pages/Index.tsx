import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, MessageSquare, BarChart2 } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const studentName = "Student"; // In a real app, this would come from user state/authentication

  return (
    <div className="page-container pb-20">
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-background to-background/80 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-5xl mx-auto px-4 pt-16 pb-12 text-center">
          {/* Logo + Brand Name */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 mb-8">
            {/* You can conditionally swap logos for light/dark mode if needed */}
            <img
              src="/logo_1_transparent.png"
              alt="Studia Logo"
              className="h-20 md:h-28 w-auto object-contain"
            />
            <div className="text-center md:text-left">
              <h1 className="text-6xl md:text-7xl font-extrabold gradient-text mb-2">
                Studia
              </h1>
              <p className="text-base md:text-lg text-muted-foreground uppercase tracking-widest">
                AI Study Assistant
              </p>
            </div>
          </div>

          {/* Welcome Text */}
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              Welcome back,{" "}
              <span className="gradient-text">{studentName}</span>
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground font-medium">
              Your intelligent companion for academic excellence
            </p>
          </div>
        </div>
      </div>

      {/* Content Below */}
      <div className="grid gap-6 mt-8">
        <Card className="card-hover bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-purple-200 dark:border-purple-900/30">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">Ready to practice?</h2>
            <Button
              className="w-full bg-primary"
              size="lg"
              onClick={() => navigate("/study")}
            >
              Start Studying
            </Button>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="card-hover">
            <CardContent className="p-6 flex flex-col items-center text-center">
              <BookOpen className="h-8 w-8 mb-2 text-primary" />
              <h3 className="font-medium mb-1">View Syllabus</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Check chapter-wise topics
              </p>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate("/syllabus")}
              >
                Open
              </Button>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardContent className="p-6 flex flex-col items-center text-center">
              <MessageSquare className="h-8 w-8 mb-2 text-primary" />
              <h3 className="font-medium mb-1">Ask a Doubt</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Get answers from AI
              </p>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate("/doubts")}
              >
                Ask
              </Button>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardContent className="p-6 flex flex-col items-center text-center">
              <BarChart2 className="h-8 w-8 mb-2 text-primary" />
              <h3 className="font-medium mb-1">Performance</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Track your progress
              </p>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate("/performance")}
              >
                View
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card className="card-hover">
          <CardContent className="p-6">
            <h3 className="font-medium mb-2">Previous Papers</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Practice with past year papers to get familiar with exam pattern
            </p>
            <Button
              variant="secondary"
              className="w-full"
              onClick={() => navigate("/papers")}
            >
              Browse Papers
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
