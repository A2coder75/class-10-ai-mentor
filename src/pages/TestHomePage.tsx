import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Clock, FileText } from "lucide-react";

const TestHomePage = () => {
  const [subjects, setSubjects] = useState<any[]>([]);
  const navigate = useNavigate();

  // Predefined gradient/color styles
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

  // Static chapter counts (from you)
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

        // Step 1: Get subject directories
        const subjectDirs = data.filter((item: any) => item.type === "directory");

        // Step 2: For each subject, fetch sub-directories count (papers = #subfolders)
        const subjectData = await Promise.all(
          subjectDirs.map(async (d: any, idx: number) => {
            const style = gradients[idx % gradients.length];
            const subjectName = d.path.replace(/-/g, " ");

            // Fetch contents of subject folder
            const res2 = await fetch(
              `https://huggingface.co/api/datasets/A2coder75/QnA_All/tree/main/${d.path}`
            );
            const folderContents = await res2.json();

            // Count sub-directories (these represent paper sets)
            const papers = folderContents.filter((f: any) => f.type === "directory").length;
            const chapters = chapterCounts[subjectName] ?? "N/A";

            return {
              id: d.path,
              name: subjectName,
              chapters,
              papers,
              ...style,
            };
          })
        );

        setSubjects(subjectData);
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
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between">
                <span className={`font-bold text-xl ${subject.textColor}`}>
                  {subject.name}
                </span>
                <Badge
                  className={`bg-gradient-to-r ${subject.color} text-white shadow`}
                >
                  <BookOpen className="h-3 w-3 mr-1" />
                  {subject.chapters} Chapters
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <FileText className={`h-4 w-4 ${subject.textColor}`} />
                  <span>{subject.papers} Papers</span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>Past Years</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default TestHomePage;
