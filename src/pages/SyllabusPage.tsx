
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mockChapters } from "../utils/mockData";
import Navbar from "@/components/Navbar";
import { Check, Clock, X, ChevronDown, ChevronRight, Plus, BookOpen, Calendar, ArrowRight } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Subject, Topic } from "@/types";
import { useNavigate } from "react-router-dom";
import StudyPlannerForm from "@/components/StudyPlannerForm";
import SubjectCard from "@/components/SubjectCard";
import { mockSubjects } from "@/utils/studyPlannerData";
import useStudyPlanStore from "@/hooks/useStudyPlanStore";
import { toast } from "@/components/ui/use-toast";
import { loadSyllabusData, updateTopicStatus as updateTopicStatusInStorage } from "@/utils/syllabusStorage";

const SyllabusPage = () => {
  const [activeTab, setActiveTab] = useState("syllabus");
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const navigate = useNavigate();
  const { hasPlan, loading, todaysTasks } = useStudyPlanStore();

  // Load syllabus data on component mount
  useEffect(() => {
    const savedData = loadSyllabusData();
    if (savedData) {
      setSubjects(savedData);
    } else {
      // If no saved data, use mock data and save it
      setSubjects(mockSubjects);
    }
  }, []);

  useEffect(() => {
    // Check if the user has a study plan when the component loads
    if (hasPlan) {
      toast({
        title: "Study plan loaded",
        description: "Your previously saved study plan has been loaded",
      });
    }
  }, [hasPlan]);

  const updateTopicStatus = (subjectId: string, topicId: string, status: Topic['status']) => {
    const updatedSubjects = updateTopicStatusInStorage(subjects, subjectId, topicId, status);
    setSubjects(updatedSubjects);
  };

  const handleStudyToday = () => {
    if (hasPlan && todaysTasks && todaysTasks.length > 0) {
      navigate('/study');
    } else {
      toast({
        title: "No study plan",
        description: "Please create a study plan first",
      });
      setActiveTab("planner");
    }
  };

  return (
    <div className="page-container pb-20">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2 gradient-text">Studia Study Hub</h1>
        <p className="text-muted-foreground">
          Track your syllabus progress and plan your study schedule
        </p>
      </div>

      <Tabs defaultValue="syllabus" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="syllabus" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            <span>Syllabus Tracker</span>
          </TabsTrigger>
          <TabsTrigger value="planner" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>Study Planner</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="syllabus" className="space-y-4 fade-in">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium">Subject Progress</h2>
            <Button 
              onClick={handleStudyToday}
              className="bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600"
            >
              <BookOpen className="mr-2 h-4 w-4" /> Study Today
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {subjects.map((subject) => (
              <SubjectCard 
                key={subject.id} 
                subject={subject} 
                updateTopicStatus={updateTopicStatus} 
              />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="planner" className="space-y-4 fade-in">
          <StudyPlannerForm />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SyllabusPage;
