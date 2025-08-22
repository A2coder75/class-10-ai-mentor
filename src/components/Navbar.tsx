import React from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  Home, 
  BookOpen,
  ClipboardList,
  FileText, 
  MessageSquare, 
  BarChart2,
  BookMarked
} from "lucide-react";
import { motion } from "framer-motion";

const Navbar: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { path: "/", icon: <Home className="w-5 h-5" />, label: "Home" },
    { path: "/tests", icon: <BookOpen className="w-5 h-5" />, label: "Tests" },
    { path: "/syllabus", icon: <ClipboardList className="w-5 h-5" />, label: "Syllabus" },
    { path: "/papers", icon: <FileText className="w-5 h-5" />, label: "Papers" },
    { path: "/doubts", icon: <MessageSquare className="w-5 h-5" />, label: "Doubts" },
    { path: "/study", icon: <BookMarked className="w-5 h-5" />, label: "Study" },
    { path: "/performance", icon: <BarChart2 className="w-5 h-5" />, label: "Performance" }
  ];

  // Hide navbar on study mode or relaxation mode pages
  if (location.pathname === "/study-mode" || location.pathname === "/relaxation-mode") {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-t border-gray-200 dark:border-gray-800 shadow-xl z-10 transition-colors duration-300">
      <nav className="max-w-screen-lg mx-auto">
        <div className="flex justify-around items-center h-16">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className="flex flex-col items-center justify-center relative p-2"
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0.7 }}
                  animate={{
                    scale: isActive ? 1.15 : 1,
                    opacity: isActive ? 1 : 0.8,
                  }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className={`rounded-full p-2 mb-1 ${
                    isActive ? "bg-accent/30 text-primary" : "text-gray-500 dark:text-gray-400"
                  }`}
                >
                  {item.icon}
                </motion.div>

                <motion.span
                  animate={{ color: isActive ? "var(--primary)" : "var(--gray)" }}
                  transition={{ duration: 0.25 }}
                  className={`text-xs font-medium ${
                    isActive ? "text-primary" : "text-gray-500 dark:text-gray-400"
                  }`}
                >
                  {item.label}
                </motion.span>

                {isActive && (
                  <motion.div
                    layoutId="underline"
                    initial={{ opacity: 0, scaleX: 0 }}
                    animate={{ opacity: 1, scaleX: 1 }}
                    exit={{ opacity: 0, scaleX: 0 }}
                    transition={{ duration: 0.25 }}
                    className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-10 h-1 bg-primary rounded-full"
                  />
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
