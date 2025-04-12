
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { mockPapers } from "../utils/mockData";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Download, Play } from "lucide-react";
import { useNavigate } from "react-router-dom";

const PapersPage = () => {
  const navigate = useNavigate();
  
  const handleAttemptPaper = (paperId: string) => {
    // In a real app, this would navigate to a specific test with the paper's questions
    navigate("/test");
  };

  const handleDownloadPaper = (paperId: string) => {
    // In a real app, this would download the PDF or open it
    alert("Paper download functionality would be here");
  };

  return (
    <div className="page-container pb-20">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Previous Papers</h1>
        <p className="text-muted-foreground">
          Practice with past year question papers
        </p>
      </div>

      <div className="space-y-4">
        {mockPapers.map((paper) => (
          <Card key={paper.id}>
            <CardHeader className="pb-2">
              <CardTitle>{paper.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">{paper.year}</span>
                <div className="space-x-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleDownloadPaper(paper.id)}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    PDF
                  </Button>
                  <Button 
                    size="sm"
                    onClick={() => handleAttemptPaper(paper.id)}
                  >
                    <Play className="h-4 w-4 mr-1" />
                    Attempt
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Navbar />
    </div>
  );
};

export default PapersPage;
