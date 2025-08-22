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
    <div className="fixed bottom-0 left-0 right-0 bg-white/70 dark:bg-gray-900/70 backdrop-blur-md border-t border-gray-200 dark:border-gray-800 shadow-lg z-10 transition-colors duration-300">
      <nav className="max-w-screen-lg mx-auto">
        <div className="flex justify-around items-center h-16">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center justify-center relative p-2 transition-all duration-300 hover:scale-110`}
              >
                {/* Active bubble animation */}
                {isActive ? (
                  <motion.div
                    layoutId="activeIcon"
                    className="bg-accent dark:bg-accent/30 rounded-full p-2 mb-1"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  >
                    {item.icon}
                  </motion.div>
                ) : (
                  <div className="p-2 mb-1">{item.icon}</div>
                )}

                <span
                  className={`text-xs font-medium ${
                    isActive
                      ? "text-primary"
                      : "text-gray-500 dark:text-gray-400"
                  }`}
                >
                  {item.label}
                </span>

                {/* Active underline animation */}
                {isActive && (
                  <motion.div
                    layoutId="activeUnderline"
                    className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-10 h-1 bg-primary rounded-full"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
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
