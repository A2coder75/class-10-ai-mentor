
import React, { useState, useCallback, useRef, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { mockSubjects } from "@/utils/studyPlannerData";
import StudyPlanDisplay from "./StudyPlanDisplay";
import { toast } from "@/components/ui/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { generateStudyPlanner, PlannerResponseInterface } from "@/utils/api";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import useStudyPlanStore from "@/hooks/useStudyPlanStore";

const formSchema = z.object({
  studyHoursPerDay: z
    .number()
    .min(1, { message: "Must study at least 1 hour" })
    .max(12, { message: "Maximum 12 hours per day" }),
  daysPerWeek: z
    .array(z.string())
    .min(1, { message: "Select at least one day" }),
  strengths: z
    .array(z.string())
    .min(1, { message: "Select at least one strength" }),
  weakSubjects: z
    .array(z.string())
    .min(1, { message: "Select at least one weak subject" }),
  targetExamDate: z.date({
    required_error: "Please select a date",
  }),
  preferredStudyTime: z.enum(["morning", "afternoon", "evening", "night"], {
    required_error: "Please select a preferred study time",
  }),
  studyGoals: z.string().min(1, { message: "Please enter your study goals" }),
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

const subjectChapters = {
  "Physics": [
    "Mechanics",
    "Electricity",
    "Magnetism",
    "Optics",
    "Modern Physics",
    "Heat and Thermodynamics",
    "Waves and Sound"
  ],
  "Chemistry": [
    "Organic Chemistry",
    "Inorganic Chemistry",
    "Physical Chemistry",
    "Chemical Reactions",
    "Periodic Table",
    "Chemical Bonding",
    "Acids and Bases"
  ],
  "Mathematics": [
    "Algebra",
    "Calculus",
    "Geometry",
    "Trigonometry",
    "Statistics",
    "Probability",
    "Quadratic Equations",
    "Linear Equations"
  ],
  "Biology": [
    "Cell Biology",
    "Genetics",
    "Human Physiology",
    "Ecology",
    "Evolution",
    "Taxonomy",
    "Molecular Biology"
  ],
  "Computer Science": [
    "Programming Fundamentals",
    "Data Structures",
    "Algorithms",
    "Database Systems",
    "Operating Systems",
    "Computer Networks",
    "Web Development"
  ],
  "English": [
    "Grammar",
    "Literature",
    "Comprehension",
    "Writing Skills",
    "Poetry",
    "Drama",
    "Prose"
  ],
  "History": [
    "Ancient History",
    "Medieval History",
    "Modern History",
    "World Wars",
    "Indian Freedom Movement",
    "World Civilizations",
    "European History"
  ],
  "Geography": [
    "Physical Geography",
    "Human Geography",
    "Economic Geography",
    "Maps and Cartography",
    "Climate and Weather",
    "Landforms",
    "Population Studies"
  ],
};

const StudyPlannerForm = () => {
  const [showForm, setShowForm] = useState(false); // Start with false, will be set by useEffect
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [selectedChaptersMap, setSelectedChaptersMap] = useState<Record<string, string[]>>({});
  const isHandlingClick = useRef(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentSubject, setCurrentSubject] = useState<string | null>(null);
  
  // Use the study plan store
  const { studyPlan, hasPlan, loading, saveNewPlan } = useStudyPlanStore();

  // Show the saved plan by default if it exists
  useEffect(() => {
    if (!loading) {
      setShowForm(!hasPlan);
    }
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

  const handleSubjectSelection = useCallback((subject: string, isSelected: boolean) => {
    if (isHandlingClick.current) return;
    isHandlingClick.current = true;
    
    setSelectedSubjects(prev => {
      const newState = isSelected && !prev.includes(subject)
        ? [...prev, subject]
        : !isSelected && prev.includes(subject)
          ? prev.filter(s => s !== subject)
          : prev;
      
      if (!isSelected && prev.includes(subject)) {
        setSelectedChaptersMap(prevChaptersMap => {
          const newMap = {...prevChaptersMap};
          delete newMap[subject];
          return newMap;
        });
        
        const remainingChapters = Object.values(selectedChaptersMap)
          .flat()
          .filter(chapter => {
            return selectedChaptersMap[subject] ? !selectedChaptersMap[subject].includes(chapter) : true;
          });
        
        form.setValue('selectedChapters', remainingChapters);
      }
      
      setTimeout(() => {
        isHandlingClick.current = false;
      }, 0);
      
      return newState;
    });
  }, [selectedChaptersMap, form]);

  const handleChapterSelection = (subject: string, chapter: string, isSelected: boolean) => {
    setSelectedChaptersMap(prev => {
      const prevChapters = prev[subject] || [];
      const newChapters = isSelected 
        ? [...prevChapters, chapter] 
        : prevChapters.filter(c => c !== chapter);
      
      const newMap = {...prev, [subject]: newChapters};
      
      const allSelectedChapters = Object.values(newMap).flat();
      form.setValue('selectedChapters', allSelectedChapters);
      
      return newMap;
    });
  };

  const isChapterSelected = (subject: string, chapter: string) => {
    return selectedChaptersMap[subject]?.includes(chapter) || false;
  };

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    const commonSubjects = data.strengths.filter(subject => 
      data.weakSubjects.includes(subject)
    );
    
    if (commonSubjects.length > 0) {
      form.setError("weakSubjects", { 
        message: `${commonSubjects.join(", ")} cannot be both strength and weakness` 
      });
      return;
    }
    
    if (selectedSubjects.length === 0) {
      toast({
        title: "No subjects selected",
        description: "Please select at least one subject to study",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const chapters = data.selectedChapters;
      const targetDate = data.targetExamDate;
      const currentDate = new Date();
      const daysUntilTarget = Math.ceil((targetDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
      
      const apiRequest = {
        subjects: selectedSubjects,
        chapters: chapters,
        study_goals: data.studyGoals,
        strengths: data.strengths,
        weaknesses: data.weakSubjects,
        time_available: data.studyHoursPerDay * 60, // Convert to minutes
        target: [targetDate.getFullYear(), targetDate.getMonth() + 1, targetDate.getDate()], 
        days_until_target: daysUntilTarget,
        days_per_week: data.daysPerWeek,
        start_date: [currentDate.getFullYear(), currentDate.getMonth() + 1, currentDate.getDate()],
      };
      
      console.log("Sending API request:", apiRequest);
      const response = await generateStudyPlanner(apiRequest);
      
      if (response) {
        saveNewPlan(response);
        toast({
          title: "Study plan generated!",
          description: "Your personalized study plan is ready.",
        });
        setShowForm(false);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast({
        title: "Error generating study plan",
        description: "There was a problem generating your study plan. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!showForm) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">Your Study Plan</h2>
          <Button 
            variant="outline" 
            onClick={() => {
              setShowForm(true);
            }}
            className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white"
          >
            Generate New Plan
          </Button>
        </div>
        <StudyPlanDisplay plannerResponse={studyPlan || undefined} />
      </div>
    );
  }

  return (
    <div>
      <Card className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Select Your Subjects</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {mockSubjects.map((subject) => {
                  const isSelected = selectedSubjects.includes(subject.name);
                  
                  return (
                    <div 
                      key={subject.id} 
                      className={cn(
                        "flex items-center space-x-2 border rounded-md p-3 cursor-pointer transition-all",
                        isSelected ? "border-primary bg-primary/10" : "border-input"
                      )}
                      onClick={() => {
                        if (!isHandlingClick.current) {
                          handleSubjectSelection(subject.name, !isSelected);
                        }
                      }}
                    >
                      <Checkbox 
                        checked={isSelected}
                        id={`subject-${subject.id}`}
                        className="pointer-events-none"
                        tabIndex={-1}
                      />
                      <span>{subject.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Select Chapters to Study</h3>
              
              {selectedSubjects.length > 0 ? (
                <div className="space-y-4">
                  <Select 
                    value={currentSubject || ""} 
                    onValueChange={(value) => setCurrentSubject(value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a subject to view chapters" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Subjects</SelectLabel>
                        {selectedSubjects.map(subject => (
                          <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  
                  {currentSubject && subjectChapters[currentSubject as keyof typeof subjectChapters] && (
                    <div className="border rounded-md p-4">
                      <h4 className="font-medium mb-3">{currentSubject} Chapters</h4>
                      <ScrollArea className="h-48">
                        <div className="space-y-2">
                          {subjectChapters[currentSubject as keyof typeof subjectChapters].map(chapter => (
                            <div 
                              key={`${currentSubject}-${chapter}`}
                              className="flex items-center space-x-2"
                            >
                              <Checkbox 
                                id={`${currentSubject}-${chapter}`}
                                checked={isChapterSelected(currentSubject, chapter)}
                                onCheckedChange={(checked) => {
                                  handleChapterSelection(currentSubject, chapter, checked === true);
                                }}
                              />
                              <label 
                                htmlFor={`${currentSubject}-${chapter}`}
                                className="text-sm cursor-pointer"
                              >
                                {chapter}
                              </label>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                  )}
                  
                  <div className="mt-4">
                    <h4 className="text-sm font-medium mb-2">Selected Chapters:</h4>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(selectedChaptersMap).map(([subject, chapters]) => 
                        chapters.map(chapter => (
                          <Badge 
                            key={`${subject}-${chapter}`} 
                            variant="outline"
                            className="flex items-center gap-1"
                          >
                            <span className="text-xs font-medium">{chapter}</span>
                            <span 
                              className="cursor-pointer text-xs hover:text-destructive"
                              onClick={() => handleChapterSelection(subject, chapter, false)}
                            >
                              ×
                            </span>
                          </Badge>
                        ))
                      )}
                      {Object.values(selectedChaptersMap).flat().length === 0 && (
                        <span className="text-xs text-muted-foreground">No chapters selected</span>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 border rounded-md bg-muted/20">
                  <p className="text-muted-foreground">Please select subjects first</p>
                </div>
              )}
            </div>

            <FormField
              control={form.control}
              name="studyGoals"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Study Goals</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter your study goals and objectives..." 
                      {...field}
                      className="min-h-[100px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="studyHoursPerDay"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hours of study per day</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min={1} 
                      max={12} 
                      {...field} 
                      onChange={e => field.onChange(parseInt(e.target.value))} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="daysPerWeek"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel>Days available for study</FormLabel>
                  </div>
                  <div className="grid grid-cols-3 md:grid-cols-7 gap-3">
                    {daysOfWeek.map((day) => (
                      <FormField
                        key={day.id}
                        control={form.control}
                        name="daysPerWeek"
                        render={({ field }) => {
                          const isSelected = field.value?.includes(day.id);
                          
                          return (
                            <FormItem
                              key={day.id}
                              className="flex flex-row items-center space-x-2 space-y-0"
                            >
                              <div 
                                className="flex items-center"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (!isHandlingClick.current) {
                                    isHandlingClick.current = true;
                                    const updatedValue = isSelected
                                      ? field.value?.filter(value => value !== day.id)
                                      : [...(field.value || []), day.id];
                                    field.onChange(updatedValue);
                                    setTimeout(() => {
                                      isHandlingClick.current = false;
                                    }, 0);
                                  }
                                }}
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={isSelected}
                                    id={`day-${day.id}`}
                                    className="pointer-events-none"
                                    tabIndex={-1}
                                  />
                                </FormControl>
                              </div>
                              <FormLabel 
                                className="text-sm font-normal cursor-pointer" 
                                htmlFor={`day-${day.id}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (!isHandlingClick.current) {
                                    isHandlingClick.current = true;
                                    const updatedValue = isSelected
                                      ? field.value?.filter(value => value !== day.id)
                                      : [...(field.value || []), day.id];
                                    field.onChange(updatedValue);
                                    setTimeout(() => {
                                      isHandlingClick.current = false;
                                    }, 0);
                                  }
                                }}
                              >
                                {day.label}
                              </FormLabel>
                            </FormItem>
                          );
                        }}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="strengths"
                render={() => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel>Your strengths</FormLabel>
                    </div>
                    <div className="space-y-2">
                      {selectedSubjects.map((subject) => {
                        const isWeakSubject = form.watch("weakSubjects")?.includes(subject);
                        const isSelected = form.watch("strengths")?.includes(subject);
                        
                        return (
                          <FormItem
                            key={`strength-${subject}`}
                            className="flex flex-row items-center space-x-2 space-y-0"
                          >
                            <div 
                              className="relative flex items-center"
                              onClick={() => {
                                if (!isHandlingClick.current && !isWeakSubject) {
                                  isHandlingClick.current = true;
                                  const currentStrengths = form.getValues("strengths") || [];
                                  const updatedValue = !isSelected
                                    ? [...currentStrengths, subject]
                                    : currentStrengths.filter(s => s !== subject);
                                  form.setValue("strengths", updatedValue, { shouldValidate: true });
                                  setTimeout(() => {
                                    isHandlingClick.current = false;
                                  }, 0);
                                }
                              }}
                            >
                              <FormControl>
                                <Checkbox
                                  checked={isSelected}
                                  id={`strength-${subject}`}
                                  disabled={isWeakSubject}
                                  className="pointer-events-none"
                                  tabIndex={-1}
                                />
                              </FormControl>
                            </div>
                            <FormLabel 
                              className={`text-sm font-normal cursor-pointer ${isWeakSubject ? 'opacity-50' : ''}`} 
                              htmlFor={`strength-${subject}`}
                              onClick={() => {
                                if (!isHandlingClick.current && !isWeakSubject) {
                                  isHandlingClick.current = true;
                                  const currentStrengths = form.getValues("strengths") || [];
                                  const updatedValue = !isSelected
                                    ? [...currentStrengths, subject]
                                    : currentStrengths.filter(s => s !== subject);
                                  form.setValue("strengths", updatedValue, { shouldValidate: true });
                                  setTimeout(() => {
                                    isHandlingClick.current = false;
                                  }, 0);
                                }
                              }}
                            >
                              {subject}
                            </FormLabel>
                          </FormItem>
                        );
                      })}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="weakSubjects"
                render={() => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel>Your weak subjects</FormLabel>
                    </div>
                    <div className="space-y-2">
                      {selectedSubjects.map((subject) => {
                        const isStrength = form.watch("strengths")?.includes(subject);
                        const isSelected = form.watch("weakSubjects")?.includes(subject);
                        
                        return (
                          <FormItem
                            key={`weak-${subject}`}
                            className="flex flex-row items-center space-x-2 space-y-0"
                          >
                            <div 
                              className="relative flex items-center"
                              onClick={() => {
                                if (!isHandlingClick.current && !isStrength) {
                                  isHandlingClick.current = true;
                                  const currentWeakSubjects = form.getValues("weakSubjects") || [];
                                  const updatedValue = !isSelected
                                    ? [...currentWeakSubjects, subject]
                                    : currentWeakSubjects.filter(s => s !== subject);
                                  form.setValue("weakSubjects", updatedValue, { shouldValidate: true });
                                  setTimeout(() => {
                                    isHandlingClick.current = false;
                                  }, 0);
                                }
                              }}
                            >
                              <FormControl>
                                <Checkbox
                                  checked={isSelected}
                                  id={`weak-${subject}`}
                                  disabled={isStrength}
                                  className="pointer-events-none"
                                  tabIndex={-1}
                                />
                              </FormControl>
                            </div>
                            <FormLabel 
                              className={`text-sm font-normal cursor-pointer ${isStrength ? 'opacity-50' : ''}`} 
                              htmlFor={`weak-${subject}`}
                              onClick={() => {
                                if (!isHandlingClick.current && !isStrength) {
                                  isHandlingClick.current = true;
                                  const currentWeakSubjects = form.getValues("weakSubjects") || [];
                                  const updatedValue = !isSelected
                                    ? [...currentWeakSubjects, subject]
                                    : currentWeakSubjects.filter(s => s !== subject);
                                  form.setValue("weakSubjects", updatedValue, { shouldValidate: true });
                                  setTimeout(() => {
                                    isHandlingClick.current = false;
                                  }, 0);
                                }
                              }}
                            >
                              {subject}
                            </FormLabel>
                          </FormItem>
                        );
                      })}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="targetExamDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Target exam date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date < new Date() || date > new Date("2030-01-01")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="preferredStudyTime"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Preferred study time</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-wrap gap-4"
                    >
                      <FormItem className="flex items-center space-x-1 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="morning" id="morning" />
                        </FormControl>
                        <FormLabel className="font-normal text-sm" htmlFor="morning">
                          Morning
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-1 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="afternoon" id="afternoon" />
                        </FormControl>
                        <FormLabel className="font-normal text-sm" htmlFor="afternoon">
                          Afternoon
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-1 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="evening" id="evening" />
                        </FormControl>
                        <FormLabel className="font-normal text-sm" htmlFor="evening">
                          Evening
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-1 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="night" id="night" />
                        </FormControl>
                        <FormLabel className="font-normal text-sm" htmlFor="night">
                          Night
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Plan...
                </>
              ) : (
                "Generate Study Plan"
              )}
            </Button>
          </form>
        </Form>
      </Card>
    </div>
  );
};

export default StudyPlannerForm;
