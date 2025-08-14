import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, MessageSquare, BarChart2 } from "lucide-react";
import { ReactTyped } from "react-typed"; // ✅ Correct named import

const Index = () => {
  const navigate = useNavigate();
  const studentName = "Student"; // Replace with user auth

  return (
    <div className="page-container pb-20">
      {/* Rounded Banner Hero */}
      <div className="relative max-w-7xl mx-auto mt-10 px-6">
        <div className="relative flex flex-col md:flex-row items-center justify-between gap-8 bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-purple-950 dark:via-gray-900 dark:to-blue-950 rounded-3xl shadow-lg overflow-hidden p-8">
          {/* Left - Logo */}
          <div className="flex-shrink-0">
            <img
              src="/logo_1_transparent.png"
              alt="Studia Logo"
              className="w-36 md:w-48 lg:w-56 object-contain drop-shadow-lg"
            />
          </div>

          {/* Right - Text */}
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight mb-2">
              Welcome back
            </h1>
            <h2 className="text-2xl md:text-3xl font-semibold text-purple-600 dark:text-purple-300 mb-3">
              {studentName}
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground font-medium mb-6 h-[30px]">
              <ReactTyped
                strings={[
                  "Your intelligent companion for academic excellence",
                  "Master every subject with AI-powered guidance",
                  "Stay on track, study smarter, succeed faster",
                  "Personalized learning made simple",
                ]}
                typeSpeed={50}
                backSpeed={30}
                loop
              />
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

      {/* Content Below (Cards) */}
      <div className="grid gap-6 mt-8">
        <Card className="card-hover bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-purple-200 dark:border-purple-900/30">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">Ready to practice?</h2>
            <Button
              className="w-full bg-primary"
              size="lg"
              onClick={() => navigate("/test")}
            >
              Start your Test
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
