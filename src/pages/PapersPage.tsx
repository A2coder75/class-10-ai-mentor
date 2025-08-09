
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { mockPapers } from "../utils/mockData";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Download, Play, Calendar, FileCheck, Clock, Tag, BookOpen, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";

const PapersPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [downloading, setDownloading] = useState<string | null>(null);
  
  const handleAttemptPaper = (paperId: string) => {
    // In a real app, this would navigate to a specific test with the paper's questions
    navigate("/test");
  };

  const handleDownloadPaper = (paperId: string) => {
    setDownloading(paperId);
    
    // Simulate download delay
    setTimeout(() => {
      setDownloading(null);
      
      // In a real app, this would download the PDF or open it
      toast({
        title: "Download started",
        description: "The paper will be downloaded to your device shortly.",
        duration: 3000,
      });
    }, 1500);
  };

  // Group papers by year
  const papersByYear = mockPapers.reduce((acc, paper) => {
    if (!acc[paper.year]) {
      acc[paper.year] = [];
    }
    acc[paper.year].push(paper);
    return acc;
  }, {} as Record<string, typeof mockPapers>);

  return (
    <div className="page-container pb-20">
      <Header 
        title="Previous Papers"
        subtitle="Practice with past year question papers to prepare for your exams"
        showLogo={false}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 shadow-md border-none overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center">
                <FileCheck className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle>All Papers</CardTitle>
                <CardDescription>Complete collection</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="text-center py-6">
            <div className="text-3xl font-bold">{mockPapers.length}</div>
            <p className="text-muted-foreground">Available papers</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 shadow-md border-none overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <div className="w-12 h-12 rounded-full bg-purple-500 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle>Year Coverage</CardTitle>
                <CardDescription>From various years</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="text-center py-6">
            <div className="text-3xl font-bold">{Object.keys(papersByYear).length}</div>
            <p className="text-muted-foreground">Year sets</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900 shadow-md border-none overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle>Completion</CardTitle>
                <CardDescription>Track your progress</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="text-center py-6">
            <div className="text-3xl font-bold">0%</div>
            <p className="text-muted-foreground">Papers attempted</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-8">
        {Object.entries(papersByYear).sort(([yearA], [yearB]) => Number(yearB) - Number(yearA)).map(([year, papers]) => (
          <div key={year} className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-6 w-1 bg-primary rounded"></div>
              <h2 className="text-xl font-semibold">{year}</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {papers.map((paper) => (
                <Card key={paper.id} className="overflow-hidden hover:shadow-lg transition-all duration-300 group border-primary/10">
                  <div className="h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
                  <CardHeader className="pb-2">
                    <CardTitle className="group-hover:text-primary transition-colors flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-primary" />
                      {paper.title}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2">
                      <Clock className="h-3 w-3" /> 3 hours
                      <Tag className="h-3 w-3 ml-2" /> 100 marks
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-1 flex-wrap mb-4">
                      <Badge variant="outline" className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800">Physics</Badge>
                      <Badge variant="outline" className="bg-green-500/10 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800">Board Exam</Badge>
                      <Badge variant="outline" className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800">{paper.year}</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <p>Complete paper with all sections including theory and numericals</p>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-0 flex justify-between gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      disabled={downloading === paper.id}
                      onClick={() => handleDownloadPaper(paper.id)}
                      className="flex-1"
                    >
                      {downloading === paper.id ? (
                        <>
                          <svg className="animate-spin h-4 w-4 mr-2 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Downloading...
                        </>
                      ) : (
                        <>
                          <Download className="h-4 w-4 mr-2" />
                          Download PDF
                        </>
                      )}
                    </Button>
                    <Button 
                      size="sm"
                      onClick={() => handleAttemptPaper(paper.id)}
                      className="flex-1 bg-primary hover:bg-primary/90"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Attempt
                    </Button>
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
