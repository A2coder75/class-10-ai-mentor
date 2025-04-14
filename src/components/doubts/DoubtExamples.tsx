
import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronRight } from "lucide-react";

interface ExampleProps {
  onSelectExample: (example: string) => void;
}

const DoubtExamples: React.FC<ExampleProps> = ({ onSelectExample }) => {
  const examples = [
    "Explain the difference between work and energy in physics",
    "How does a nuclear reactor work?",
    "What is the mathematical relationship between velocity and acceleration?",
    "Can you explain quantum entanglement in simple terms?"
  ];

  return (
    <Card className="border-dashed border-muted-foreground/20 bg-muted/30 p-4">
      <h3 className="text-sm font-medium mb-3">Try asking about:</h3>
      <div className="space-y-2">
        {examples.map((example, index) => (
          <Button 
            key={index} 
            variant="ghost" 
            className="w-full justify-start text-left h-auto py-2 text-sm font-normal hover:bg-muted"
            onClick={() => onSelectExample(example)}
          >
            <ChevronRight className="h-4 w-4 mr-2 text-muted-foreground" />
            {example}
          </Button>
        ))}
      </div>
    </Card>
  );
};

export default DoubtExamples;
