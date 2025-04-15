
import React, { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { StudyPlannerFormInputs } from "@/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import StudyPlanDisplay from "./StudyPlanDisplay";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { toast } from "./ui/use-toast";

// Mock subject data for the form
const availableSubjects = [
  "Physics",
  "Chemistry",
  "Biology",
  "Mathematics",
  "English",
  "Hindi",
  "Social Studies",
  "Computer Science"
];

const daysOfWeek = [
  { id: "monday", label: "Monday" },
  { id: "tuesday", label: "Tuesday" },
  { id: "wednesday", label: "Wednesday" },
  { id: "thursday", label: "Thursday" },
  { id: "friday", label: "Friday" },
  { id: "saturday", label: "Saturday" },
  { id: "sunday", label: "Sunday" },
];

const formSchema = z.object({
  studyHoursPerDay: z.coerce.number().min(1).max(12),
  daysPerWeek: z.array(z.string()).min(1, "Select at least one day"),
  strengths: z.array(z.string()).max(3, "You can select up to 3 strengths"),
  weakSubjects: z.array(z.string()).max(3, "You can select up to 3 weak subjects"),
  targetExamDate: z.date({
    required_error: "Please select a target exam date",
  }),
  preferredStudyTime: z.enum(["morning", "afternoon", "evening", "night"]),
});

const StudyPlannerForm = () => {
  const [showPlan, setShowPlan] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      studyHoursPerDay: 4,
      daysPerWeek: ["monday", "tuesday", "wednesday", "thursday", "friday"],
      strengths: [],
      weakSubjects: [],
      preferredStudyTime: "evening",
    },
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    console.log("Form submitted with:", data);
    toast({
      title: "Generating your study plan...",
      description: "Please wait while we create your personalized study plan.",
    });
    
    // In a real app, this would make an API call to generate the plan
    setTimeout(() => {
      setShowPlan(true);
    }, 1500);
  };

  return (
    <div>
      {!showPlan ? (
        <Card className="border border-primary/20">
          <CardHeader>
            <CardTitle>Create Your Study Plan</CardTitle>
            <CardDescription>
              Fill in the details below to generate your personalized study planner
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="studyHoursPerDay"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Study hours per day</FormLabel>
                        <FormControl>
                          <Input type="number" min={1} max={12} {...field} />
                        </FormControl>
                        <FormDescription>
                          How many hours can you dedicate to studying each day?
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="preferredStudyTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preferred study time</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select when you prefer to study" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="morning">Morning (5AM - 12PM)</SelectItem>
                            <SelectItem value="afternoon">Afternoon (12PM - 5PM)</SelectItem>
                            <SelectItem value="evening">Evening (5PM - 9PM)</SelectItem>
                            <SelectItem value="night">Night (9PM - 5AM)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          When are you most productive?
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="daysPerWeek"
                  render={() => (
                    <FormItem>
                      <div className="mb-2">
                        <FormLabel>Available days of the week</FormLabel>
                        <FormDescription>
                          Select the days you're available for studying
                        </FormDescription>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {daysOfWeek.map((day) => (
                          <FormField
                            key={day.id}
                            control={form.control}
                            name="daysPerWeek"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={day.id}
                                  className="flex flex-row items-center space-x-2 space-y-0 rounded-md border p-3"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(day.id)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...field.value, day.id])
                                          : field.onChange(
                                              field.value?.filter(
                                                (value) => value !== day.id
                                              )
                                            );
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="text-sm font-normal cursor-pointer">
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
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Your strengths (subjects)</FormLabel>
                        <div className="grid grid-cols-2 gap-2">
                          {availableSubjects.map((subject) => (
                            <FormField
                              key={subject}
                              control={form.control}
                              name="strengths"
                              render={({ field }) => {
                                return (
                                  <FormItem
                                    key={subject}
                                    className="flex flex-row items-center space-x-2 space-y-0 rounded-md border p-3"
                                  >
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(subject)}
                                        disabled={field.value?.length >= 3 && !field.value?.includes(subject)}
                                        onCheckedChange={(checked) => {
                                          return checked
                                            ? field.onChange([...field.value, subject])
                                            : field.onChange(
                                                field.value?.filter(
                                                  (value) => value !== subject
                                                )
                                              );
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className="text-sm font-normal cursor-pointer">
                                      {subject}
                                    </FormLabel>
                                  </FormItem>
                                );
                              }}
                            />
                          ))}
                        </div>
                        <FormDescription>
                          Select up to 3 subjects you're confident in
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="weakSubjects"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Your weak subjects</FormLabel>
                        <div className="grid grid-cols-2 gap-2">
                          {availableSubjects.map((subject) => (
                            <FormField
                              key={subject}
                              control={form.control}
                              name="weakSubjects"
                              render={({ field }) => {
                                return (
                                  <FormItem
                                    key={subject}
                                    className="flex flex-row items-center space-x-2 space-y-0 rounded-md border p-3"
                                  >
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(subject)}
                                        disabled={field.value?.length >= 3 && !field.value?.includes(subject)}
                                        onCheckedChange={(checked) => {
                                          return checked
                                            ? field.onChange([...field.value, subject])
                                            : field.onChange(
                                                field.value?.filter(
                                                  (value) => value !== subject
                                                )
                                              );
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className="text-sm font-normal cursor-pointer">
                                      {subject}
                                    </FormLabel>
                                  </FormItem>
                                );
                              }}
                            />
                          ))}
                        </div>
                        <FormDescription>
                          Select up to 3 subjects you need to focus on
                        </FormDescription>
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
                              date < new Date() || date > new Date(2025, 11, 31)
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormDescription>
                        When is your exam? We'll plan your study schedule accordingly.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button type="submit" className="w-full">Generate Study Plan</Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium">Your Study Plan</h2>
            <Button variant="outline" onClick={() => setShowPlan(false)}>
              Modify Plan
            </Button>
          </div>
          <StudyPlanDisplay />
        </div>
      )}
    </div>
  );
};

export default StudyPlannerForm;
