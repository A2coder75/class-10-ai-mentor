import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Clock, FileText } from "lucide-react";

const TestHomePage = () => {
  const [subjects, setSubjects] = useState<any[]>([]);
  const navigate = useNavigate();

  // Predefined gradient/color styles (cycling for each subject dynamically)
  const gradients = [
    {
      color: "from-blue-500 to-cyan-500",
      textColor: "text-blue-700",
      bgColor: "bg-blue-50 dark:bg-blue-950/20",
      borderColor: "border-blue-200 dark:border-blue-900/30",
    },
    {
      color: "from-green-500 to-emerald-500",
      textColor: "text-green-700",
      bgColor: "bg-green-50 dark:bg-green-950/20",
      borderColor: "border-green-200 dark:border-green-900/30",
    },
    {
      color: "from-purple-500 to-indigo-500",
      textColor: "text-purple-700",
      bgColor: "bg-purple-50 dark:bg-purple-950/20",
      borderColor: "border-purple-200 dark:border-purple-900/30",
    },
    {
      color: "from-pink-500 to-rose-500",
      textColor: "text-pink-700",
      bgColor: "bg-pink-50 dark:bg-pink-950/20",
      borderColor: "border-pink-200 dark:border-pink-900/30",
    },
    {
      color: "from-orange-500 to-amber-500",
      textColor: "text-orange-700",
      bgColor: "bg-orange-50 dark:bg-orange-950/20",
      borderColor: "border-orange-200 dark:border-orange-900/30",
    },
    {
      color: "from-red-500 to-pink-500",
      textColor: "text-red-700",
      bgColor: "bg-red-50 dark:bg-red-950/20",
      borderColor: "border-red-200 dark:border-red-900/30",
    },
  ];

  // fixed chapter counts you provided
  const chapterCounts: Record<string, number | string> = {
    Physics: 12,
    Chemistry: 9,
    Biology: 15,
    Mathematics: 20,
    "English Literature": 11,
    "English Language": "N/A",
    History: 14,
    Civics: 5,
    Geography: 14,
    "Commercial Studies": 13,
  };

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await fetch(
          "https://huggingface.co/api/datasets/A2coder75/QnA_All/tree/main"
        );
        const data = await res.json();

        // Only directories are subjects
        const subjectDirs = await Promise.all(
          data
            .filter((item: any) => item.type === "directory")
            .map(async (d: any, idx: number) => {
              const style = gradients[idx % gradients.length];

              // fetch number of files inside each subject folder = number of papers
              const subRes = await fetch(
                `https://huggingface.co/api/datasets/A2coder75/QnA_All/tree/main/${d.path}`
              );
              const subData = await subRes.json();
              const papers = subData.filter((i: any) => i.type === "file").length;

              // map repo folder names to display names
              const displayName = d.path.replace(/-/g, " ");

              return {
                id: d.path,
                name: displayName,
                chapters: chapterCounts[displayName] ?? "N/A",
                papers,
                ...style,
              };
            })
        );

        setSubjects(subjectDirs);
      } catch (err) {
        console.error("Error fetching subjects:", err);
      }
    };

    fetchSubjects();
  }, []);

  const handleSubjectClick = (subjectId: string) => {
    navigate(`/tests/${subjectId}`);
  };

  return (
    <div className="page-container pb-20">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center gap-4 mb-6">
          <img
            src="/logo_2_transparent.png"
            alt="Studia Logo"
            className="h-20 w-auto object-contain"
          />
          <h1 className="text-3xl md:text-4xl font-bold gradient-text">
            Practice Tests
          </h1>
        </div>
        <p className="text-lg text-muted-foreground">
          Choose a subject to start practicing with past year papers
        </p>
      </div>

      {/* Subject Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subjects.map((subject) => (
          <Card
            key={subject.id}
            className={`cursor-pointer ${subject.bgColor} ${subject.borderColor} transition-all duration-300 hover:scale-105`}
            onClick={() => handleSubjectClick(subject.id)}
          >
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div
                  className={`w-12 h-12 rounded-full bg-gradient-to-r ${subject.color} flex items-center justify-center mb-3`}
                >
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <Badge variant="secondary" className="text-xs">
                  {subject.papers} Papers
                </Badge>
              </div>
              <CardTitle
                className={`text-lg font-semibold ${subject.textColor}`}
              >
                {subject.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  <span>{subject.chapters} Chapters</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>3 hrs duration</span>
                </div>
                <div
                  className={`w-full h-2 rounded-full bg-gradient-to-r ${subject.color} opacity-70`}
                ></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default TestHomePage;
