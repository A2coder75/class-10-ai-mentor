import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Home,
  BookOpen,
  ClipboardList,
  FileText,
  MessageSquare,
  BarChart2,
  BookMarked,
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
    { path: "/performance", icon: <BarChart2 className="w-5 h-5" />, label: "Performance" },
  ];

  // Hide navbar on study mode or relaxation mode pages
  if (location.pathname === "/study-mode" || location.pathname === "/relaxation-mode") {
    return null;
  }

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-t border-gray-200 dark:border-gray-800 shadow-xl z-50"
    >
      <nav className="max-w-screen-lg mx-auto relative">
        <div className="flex justify-around items-center h-20 px-2 relative">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className="relative flex flex-col items-center p-3 min-w-[60px] group"
              >
                {/* Icon */}
                <motion.div
                  initial={false}
                  animate={{
                    scale: isActive ? 1.1 : 1,
                    y: isActive ? -2 : 0,
                  }}
                  whileHover={{
                    scale: 1.05,
                    y: -1,
                  }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 400, 
                    damping: 25,
                    mass: 0.5
                  }}
                  className={`rounded-xl p-2 mb-1 transition-colors duration-200 ${
                    isActive 
                      ? "bg-primary/15 text-primary" 
                      : "text-gray-500 dark:text-gray-400 group-hover:text-primary group-hover:bg-primary/10"
                  }`}
                >
                  {item.icon}
                </motion.div>

                {/* Label */}
                <motion.span
                  initial={false}
                  animate={{ 
                    opacity: isActive ? 1 : 0.7,
                    fontWeight: isActive ? 600 : 400,
                  }}
                  transition={{ duration: 0.2 }}
                  className={`text-xs leading-tight ${
                    isActive 
                      ? "text-primary" 
                      : "text-gray-500 dark:text-gray-400 group-hover:text-primary"
                  }`}
                >
                  {item.label}
                </motion.span>

                {/* Active underline - positioned to be fully visible */}
                {isActive && (
                  <motion.div
                    layoutId="navbar-underline"
                    transition={{ 
                      type: "spring", 
                      stiffness: 500, 
                      damping: 30,
                      mass: 0.8
                    }}
                    className="absolute -bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-gradient-to-r from-primary to-primary/80 rounded-full"
                  />
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </motion.div>
  );
};

export default Navbar;