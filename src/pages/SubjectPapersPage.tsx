import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { FileText, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

export default function SubjectPapersPage() {
  const { subject } = useParams<{ subject: string }>();
  const [papers, setPapers] = useState<string[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPapers = async () => {
      const res = await fetch(
        `https://huggingface.co/api/datasets/A2coder75/QnA_All/tree/main/${subject}`
      );
      const data = await res.json();
      const paperDirs = data
        .filter((item: any) => item.type === "directory")
        .map((d: any) => d.path.replace(`${subject}/`, "")); // remove subject/
      setPapers(paperDirs);
    };
    fetchPapers();
  }, [subject]);

  return (
    <div className="page-container pb-20">
      {/* Header with Back button */}
      <div className="mb-10">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-500 text-white hover:from-purple-600 hover:to-indigo-600 transition-all shadow-md"
        >
          <ArrowLeft className="h-5 w-5" />
          Back
        </button>

        <div className="text-center mt-6">
          <h1 className="text-3xl md:text-4xl font-bold gradient-text capitalize">
            {subject?.replace(/-/g, " ")} Papers
          </h1>
          <p className="text-muted-foreground mt-2">
            Select a paper to begin practicing
          </p>
        </div>
      </div>

      {/* Paper cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {papers.map((paper, idx) => (
          <motion.div
            key={paper}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.05 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card
              className="cursor-pointer group transition-all duration-300 hover:shadow-2xl border border-gray-200 dark:border-gray-800"
              onClick={() => navigate(`/tests/${subject}/${paper}`)}
            >
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center shadow-md">
                    <FileText className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-xs font-medium px-3 py-1 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300">
                    Practice
                  </span>
                </div>
                <CardTitle className="text-lg font-semibold mt-3 capitalize">
                  {paper}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Past Year Paper
                </p>
                <div className="w-full h-2 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 opacity-70"></div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
