
import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { mockPapers } from "../utils/mockData";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Download, Play, FileText, CalendarIcon, Clock, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";

const PapersPage = () => {
  const navigate = useNavigate();
  
  const handleAttemptPaper = (paperId: string) => {
    // In a real app, this would navigate to a specific test with the paper's questions
    navigate("/test");
  };

  const handleDownloadPaper = (paperId: string) => {
    // In a real app, this would download the PDF or open it
    toast({
      title: "Download started",
      description: "Your paper download will begin shortly."
    });
  };

  // Group papers by year
  const papersByYear = mockPapers.reduce((acc, paper) => {
    const year = paper.year;
    if (!acc[year]) {
      acc[year] = [];
    }
    acc[year].push(paper);
    return acc;
  }, {} as Record<string, typeof mockPapers>);

  // Sort years in descending order
  const sortedYears = Object.keys(papersByYear).sort((a, b) => parseInt(b) - parseInt(a));

  return (
    <div className="page-container pb-20">
      <div className="mb-8 max-w-3xl">
        <h1 className="text-3xl font-bold mb-3 text-primary">Previous Papers</h1>
        <p className="text-muted-foreground">
          Practice with past year question papers to improve your exam performance. Attempt the papers online or download them for offline practice.
        </p>
      </div>

      <div className="space-y-8 max-w-4xl">
        {sortedYears.map((year) => (
          <div key={year} className="space-y-4">
            <div className="flex items-center gap-2">
              <Calendar className="text-primary h-5 w-5" />
              <h2 className="text-xl font-semibold">{year}</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {papersByYear[year].map((paper) => (
                <Card 
                  key={paper.id} 
                  className="overflow-hidden transition-all hover:shadow-md border-muted"
                >
                  <CardHeader className="bg-muted/30 pb-3">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <FileText className="h-4 w-4 text-primary" />
                        {paper.title}
                      </CardTitle>
                      <Badge variant="outline" className="bg-primary/5">
                        {paper.year}
                      </Badge>
                    </div>
                    <CardDescription className="flex items-center mt-1">
                      <Clock className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                      <span>3 hours</span>
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="pt-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Total marks:</span>
                        <span className="font-medium">100</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Sections:</span>
                        <span className="font-medium">3</span>
                      </div>
                    </div>
                  </CardContent>
                  
                  <CardFooter className="flex justify-between border-t p-4">
                    <HoverCard>
                      <HoverCardTrigger asChild>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleDownloadPaper(paper.id)}
                          className="text-xs h-8"
                        >
                          <Download className="h-3.5 w-3.5 mr-1" />
                          Download PDF
                        </Button>
                      </HoverCardTrigger>
                      <HoverCardContent className="w-80 p-2">
                        <p className="text-sm">Download this paper to view or print the original exam format</p>
                      </HoverCardContent>
                    </HoverCard>
                    
                    <HoverCard>
                      <HoverCardTrigger asChild>
                        <Button 
                          size="sm"
                          onClick={() => handleAttemptPaper(paper.id)}
                          className="text-xs h-8"
                        >
                          <Play className="h-3.5 w-3.5 mr-1" />
                          Attempt Now
                        </Button>
                      </HoverCardTrigger>
                      <HoverCardContent className="w-80 p-2">
                        <p className="text-sm">Take this paper in exam conditions with automatic grading</p>
                      </HoverCardContent>
                    </HoverCard>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>

      <Navbar />
    </div>
  );
};

export default PapersPage;
