
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BadgeInfo, Lightbulb, Star, Zap } from "lucide-react";

const PhysicsTips: React.FC = () => {
  return (
    <Card className="border-blue-200 dark:border-blue-900 shadow-sm">
      <CardHeader className="bg-blue-50 dark:bg-blue-950/50 pb-2">
        <CardTitle className="text-lg flex items-center text-blue-700 dark:text-blue-300">
          <Lightbulb className="h-5 w-5 mr-2 text-yellow-500" />
          Physics Study Tips
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 space-y-4 text-sm">
        <div className="flex gap-2">
          <BadgeInfo className="h-5 w-5 text-blue-600 shrink-0" />
          <p>
            <span className="font-medium">Be specific</span> with your questions to get more accurate answers. Include relevant formulas or concepts when applicable.
          </p>
        </div>

        <div className="flex gap-2">
          <Zap className="h-5 w-5 text-amber-500 shrink-0" />
          <p>
            <span className="font-medium">Important questions</span> are processed by more advanced AI models that can handle complex concepts and provide more detailed explanations.
          </p>
        </div>

        <div className="flex gap-2">
          <Star className="h-5 w-5 text-purple-500 shrink-0" />
          <p>
            <span className="font-medium">Continue conversations</span> to build on previous responses and get a deeper understanding of the topic.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PhysicsTips;
