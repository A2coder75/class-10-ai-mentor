import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen } from "lucide-react";
import { motion } from "framer-motion";

const TestHomePage = () => {
  const [subjects, setSubjects] = useState<string[]>([]);
  const navigate = useNavigate();

  const gradients = [
    "from-blue-500 to-cyan-500",
    "from-purple-500 to-pink-500",
    "from-green-500 to-emerald-500",
    "from-orange-500 to-yellow-500",
    "from-indigo-500 to-violet-500",
    "from-red-500 to-rose-500",
  ];

  useEffect(() => {
    const fetchSubjects = async () => {
      const res = await fetch("https://huggingface.co/api/datasets/A2coder75/QnA_All/tree/main");
      const data = await res.json();
      const subjectDirs = data
        .filter((item: any) => item.type === "directory")
        .map((d: any) => d.path);
      setSubjects(subjectDirs);
    };
    fetchSubjects();
  }, []);

  return (
    <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {subjects.map((subject, idx) => (
        <motion.div
          key={subject}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.08, y: -4 }}
          transition={{ delay: idx * 0.1, type: "spring", stiffness: 200 }}
        >
          <Card
            className={`cursor-pointer shadow-xl rounded-2xl bg-gradient-to-r ${
              gradients[idx % gradients.length]
            } text-white`}
            onClick={() => navigate(`/tests/${subject}`)}
          >
            <CardHeader>
              <BookOpen className="h-10 w-10" />
              <CardTitle className="text-xl font-bold capitalize">{subject}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="opacity-80">Past Year Papers</p>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};

export default TestHomePage;
