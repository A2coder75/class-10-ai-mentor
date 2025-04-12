
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { mockChapters } from "../utils/mockData";
import Navbar from "@/components/Navbar";
import { Check } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const SyllabusPage = () => {
  return (
    <div className="page-container pb-20">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Class 10 Physics Syllabus</h1>
        <p className="text-muted-foreground">
          ICSE curriculum chapter-wise breakdown
        </p>
      </div>

      <div className="space-y-4">
        {mockChapters.map((chapter) => (
          <Card key={chapter.id} className={chapter.completed ? "border-green-200" : ""}>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between">
                <span>{chapter.title}</span>
                {chapter.completed && (
                  <span className="text-green-600 bg-green-100 p-1 rounded-full">
                    <Check size={16} />
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-3">{chapter.description}</p>
              
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="topics">
                  <AccordionTrigger>Topics</AccordionTrigger>
                  <AccordionContent>
                    <ul className="list-disc list-inside space-y-1">
                      {chapter.topics.map((topic, index) => (
                        <li key={index} className="text-sm">{topic}</li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        ))}
      </div>

      <Navbar />
    </div>
  );
};

export default SyllabusPage;
