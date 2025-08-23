import React, { useState, useEffect, useCallback, useRef } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { format } from "date-fns";
import { Loader2, Calendar as CalendarIcon, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import useStudyPlanStore from "@/hooks/useStudyPlanStore";
import { loadSyllabusData } from "@/utils/syllabusStorage";
import { generateStudyPlanner } from "@/utils/api";
import StudyPlanDisplay from "./StudyPlanDisplay";

const formSchema = z.object({
  studyHoursPerDay: z.number().min(1).max(12),
  daysPerWeek: z.array(z.string()).min(1),
  strengths: z.array(z.string()).min(1),
  weakSubjects: z.array(z.string()).min(1),
  targetExamDate: z.date({ required_error: "Please select a date" }),
  preferredStudyTime: z.enum(["morning", "afternoon", "evening", "night"]),
  studyGoals: z.string().min(1),
  selectedChapters: z.array(z.string()).default([]),
});

const daysOfWeek = [
  { id: "monday", label: "Monday" },
  { id: "tuesday", label: "Tuesday" },
  { id: "wednesday", label: "Wednesday" },
  { id: "thursday", label: "Thursday" },
  { id: "friday", label: "Friday" },
  { id: "saturday", label: "Saturday" },
  { id: "sunday", label: "Sunday" },
];

const StudyPlannerForm = () => {
  const [showForm, setShowForm] = useState(false);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [selectedChaptersMap, setSelectedChaptersMap] = useState<Record<string, string[]>>({});
  const [syllabusSubjects, setSyllabusSubjects] = useState<any[]>([]);
  const isHandlingClick = useRef(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { hasPlan, loading, saveNewPlan } = useStudyPlanStore();

  useEffect(() => {
    const syllabusData = loadSyllabusData();
    if (syllabusData) setSyllabusSubjects(syllabusData);
  }, []);

  useEffect(() => {
    if (!loading) setShowForm(!hasPlan);
  }, [hasPlan, loading]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      studyHoursPerDay: 3,
      daysPerWeek: ["monday", "tuesday", "wednesday", "thursday", "friday"],
      strengths: [],
      weakSubjects: [],
      preferredStudyTime: "evening",
      studyGoals: "",
      selectedChapters: [],
    },
  });

  const handleSubjectToggle = (subject: string) => {
    setSelectedSubjects((prev) =>
      prev.includes(subject) ? prev.filter((s) => s !== subject) : [...prev, subject]
    );
    setSelectedChaptersMap((prev) => {
      const newMap = { ...prev };
      if (newMap[subject]) delete newMap[subject];
      return newMap;
    });
  };

  const handleChapterToggle = (subject: string, chapter: string) => {
    setSelectedChaptersMap((prev) => {
      const chapters = prev[subject] || [];
      const updated = chapters.includes(chapter)
        ? chapters.filter((c) => c !== chapter)
        : [...chapters, chapter];
      const newMap = { ...prev, [subject]: updated };
      form.setValue("selectedChapters", Object.values(newMap).flat());
      return newMap;
    });
  };

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    if (selectedSubjects.length === 0) {
      toast({ title: "Select subjects", description: "Pick at least one subject", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      const targetDate = data.targetExamDate;
      const now = new Date();
      const daysUntilTarget = Math.ceil((targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      const apiRequest = {
        subjects: selectedSubjects,
        chapters: data.selectedChapters,
        study_goals: data.studyGoals,
        strengths: data.strengths,
        weaknesses: data.weakSubjects,
        time_available: data.studyHoursPerDay * 60,
        target: [targetDate.getFullYear(), targetDate.getMonth() + 1, targetDate.getDate()],
        days_until_target: daysUntilTarget,
        days_per_week: data.daysPerWeek,
        start_date: [now.getFullYear(), now.getMonth() + 1, now.getDate()],
      };

      const response = await generateStudyPlanner(apiRequest);
      if (response) {
        saveNewPlan(response);
        toast({ title: "Plan ready!", description: "Your personalized study plan is generated." });
        setShowForm(false);
      }
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "Could not generate study plan.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!showForm) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">Your Study Plan</h2>
          <Button onClick={() => setShowForm(true)} className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
            Generate New Plan
          </Button>
        </div>
        <StudyPlanDisplay />
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="p-6 backdrop-blur-lg bg-white/70 shadow-2xl rounded-2xl">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* SUBJECT SELECTION */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Select Your Subjects</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {syllabusSubjects.map((subject) => {
                  const isSelected = selectedSubjects.includes(subject.name);
                  return (
                    <motion.div
                      key={subject.id}
                      whileHover={{ scale: 1.03 }}
                      onClick={() => handleSubjectToggle(subject.name)}
                      className={cn(
                        "cursor-pointer p-4 rounded-xl border shadow-sm flex items-center gap-2 transition",
                        isSelected ? "bg-gradient-to-r from-purple-500/20 to-blue-500/20 border-primary" : "bg-white hover:shadow-md"
                      )}
                    >
                      <Checkbox checked={isSelected} />
                      <span className="font-medium">{subject.name}</span>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* CHAPTER SELECTION */}
            {selectedSubjects.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Select Chapters</h3>
                <div className="space-y-4">
                  {selectedSubjects.map((subject) => {
                    const sub = syllabusSubjects.find((s) => s.name === subject);
                    return (
                      <motion.div key={subject} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="border rounded-xl p-4">
                        <h4 className="font-medium mb-3">{subject}</h4>
                        <ScrollArea className="h-40">
                          <div className="grid grid-cols-1 gap-2">
                            {sub?.topics?.map((chapter: any) => {
                              const checked = selectedChaptersMap[subject]?.includes(chapter.name);
                              return (
                                <div key={chapter.id} className="flex items-center gap-2">
                                  <Checkbox
                                    checked={checked}
                                    onCheckedChange={() => handleChapterToggle(subject, chapter.name)}
                                  />
                                  <span>{chapter.name}</span>
                                </div>
                              );
                            })}
                          </div>
                        </ScrollArea>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* SELECTED CHAPTERS BADGES */}
            <div className="flex flex-wrap gap-2">
              {Object.entries(selectedChaptersMap).flatMap(([sub, chaps]) =>
                chaps.map((c) => (
                  <motion.div key={`${sub}-${c}`} whileHover={{ scale: 1.1 }}>
                    <Badge variant="secondary" className="cursor-pointer" onClick={() => handleChapterToggle(sub, c)}>
                      {c} ×
                    </Badge>
                  </motion.div>
                ))
              )}
              {Object.values(selectedChaptersMap).flat().length === 0 && (
                <span className="text-sm text-muted-foreground">No chapters selected</span>
              )}
            </div>

            {/* STUDY GOALS */}
            <FormField control={form.control} name="studyGoals" render={({ field }) => (
              <FormItem>
                <FormLabel>Study Goals</FormLabel>
                <FormControl>
                  <Textarea {...field} placeholder="Enter your goals..." className="rounded-xl" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            {/* HOURS PER DAY */}
            <FormField control={form.control} name="studyHoursPerDay" render={({ field }) => (
              <FormItem>
                <FormLabel>Hours per Day</FormLabel>
                <FormControl>
                  <Input type="number" min={1} max={12} {...field} onChange={(e) => field.onChange(parseInt(e.target.value))} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            {/* DAYS OF WEEK */}
            <FormField control={form.control} name="daysPerWeek" render={({ field }) => (
              <FormItem>
                <FormLabel>Study Days</FormLabel>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {daysOfWeek.map((day) => {
                    const isSelected = field.value?.includes(day.id);
                    return (
                      <motion.div
                        key={day.id}
                        whileHover={{ scale: 1.05 }}
                        onClick={() =>
                          field.onChange(
                            isSelected ? field.value.filter((d) => d !== day.id) : [...field.value, day.id]
                          )
                        }
                        className={cn(
                          "cursor-pointer px-3 py-2 rounded-lg border text-center",
                          isSelected ? "bg-gradient-to-r from-purple-500/20 to-blue-500/20 border-primary" : "hover:bg-muted"
                        )}
                      >
                        {day.label}
                      </motion.div>
                    );
                  })}
                </div>
                <FormMessage />
              </FormItem>
            )} />

            {/* DATE PICKER */}
            <FormField control={form.control} name="targetExamDate" render={({ field }) => (
              <FormItem>
                <FormLabel>Target Exam Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-between">
                      {field.value ? format(field.value, "PPP") : "Pick a date"}
                      <CalendarIcon className="h-4 w-4 opacity-60" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent align="start" className="p-0">
                    <Calendar mode="single" selected={field.value} onSelect={field.onChange} />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )} />

            {/* PREFERRED TIME */}
            <FormField control={form.control} name="preferredStudyTime" render={({ field }) => (
              <FormItem>
                <FormLabel>Preferred Study Time</FormLabel>
                <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex gap-4">
                  {["morning", "afternoon", "evening", "night"].map((time) => (
                    <label key={time} className="flex items-center gap-2 cursor-pointer">
                      <RadioGroupItem value={time} /> {time}
                    </label>
                  ))}
                </RadioGroup>
              </FormItem>
            )} />

            <Button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating Plan...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" /> Generate Study Plan
                </>
              )}
            </Button>
          </form>
        </Form>
      </Card>
    </motion.div>
  );
};

export default StudyPlannerForm;
