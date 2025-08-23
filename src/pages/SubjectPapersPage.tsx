import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { FileText } from "lucide-react";
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
  .map((d: any) => d.path.replace(`${subject}/`, ""));  // 👈 remove subject/

      setPapers(paperDirs);
    };
    fetchPapers();
  }, [subject]);

  return (
    <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {papers.map((paper, idx) => (
        <motion.div
          key={paper}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1 }}
        >
          <Card
            className="cursor-pointer hover:scale-105 transition-all bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-xl rounded-2xl"
            onClick={() => navigate(`/tests/${subject}/${paper}`)}
          >
            <CardHeader>
              <FileText className="h-10 w-10" />
              <CardTitle className="text-lg font-semibold">{paper}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="opacity-80">Open this paper</p>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
