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
      <div className="relative bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-purple-950 dark:via-gray-900 dark:to-blue-950 overflow-hidden">
        {/* Decorative glowing circles */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-purple-300/30 dark:bg-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 -right-32 w-96 h-96 bg-blue-300/30 dark:bg-blue-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>

        {/* Hero container */}
        <div className="relative max-w-7xl mx-auto px-6 pt-16 pb-20 flex flex-col md:flex-row items-center gap-12">
          {/* Left - Large Logo */}
          <div className="flex-1 flex justify-center">
            <img
              src="/logo_1_transparent.png"
              alt="Studia Logo"
              className="w-52 md:w-72 lg:w-80 object-contain drop-shadow-xl transition-transform duration-500 hover:scale-105"
            />
          </div>

          {/* Right - Welcome Text */}
          <div className="flex-1 text-center md:text-left bg-white/60 dark:bg-gray-800/40 p-8 rounded-3xl shadow-lg backdrop-blur-sm">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 leading-tight">
              Welcome back,{" "}
              <span className="bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">
                {studentName}
              </span>
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground font-medium mb-8">
              Your intelligent companion for academic excellence
            </p>
            <Button
              size="lg"
              className="px-8 py-4 text-lg bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg hover:scale-105 transition-transform"
              onClick={() => navigate("/study")}
            >
              Start Studying
            </Button>
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
