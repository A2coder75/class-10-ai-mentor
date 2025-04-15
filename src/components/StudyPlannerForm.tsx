import React, { useState, useCallback, useRef } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
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
  const [showForm, setShowForm] = useState(true);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const isHandlingClick = useRef(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      studyHoursPerDay: 3,
      daysPerWeek: ["monday", "tuesday", "wednesday", "thursday", "friday"],
      strengths: [],
      weakSubjects: [],
      preferredStudyTime: "evening",
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
      
      setTimeout(() => {
        isHandlingClick.current = false;
      }, 0);
      
      return newState;
    });
  }, []);

  const onSubmit = (data: z.infer<typeof formSchema>) => {
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

    console.log("Form submitted:", data);
    toast({
      title: "Study plan generated!",
      description: "Your personalized study plan is ready.",
    });
    setShowForm(false);
  };

  if (!showForm) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-medium">Your Study Plan</h2>
          <Button 
            variant="outline" 
            onClick={() => setShowForm(true)}
          >
            Edit Plan
          </Button>
        </div>
        <StudyPlanDisplay />
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
                      className="flex space-x-1"
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
            >
              Generate Study Plan
            </Button>
          </form>
        </Form>
      </Card>
    </div>
  );
};

export default StudyPlannerForm;
