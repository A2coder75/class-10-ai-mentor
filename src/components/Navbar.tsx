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

  // Animate only on FIRST mount, not every route change
  const [hasMounted, setHasMounted] = React.useState(false);
  React.useEffect(() => setHasMounted(true), []);

  return (
    <motion.div
      initial={hasMounted ? false : { y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md 
                 border-t border-gray-200 dark:border-gray-800 shadow-xl z-10"
    >
      <nav className="max-w-screen-lg mx-auto">
        <motion.div
          className="flex justify-around items-center h-20 pb-2"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.08, delayChildren: 0.2 },
            },
          }}
        >
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className="relative flex flex-col items-center p-2"
              >

                {/* Icon */}
                <motion.div
                  variants={{
                    hidden: { scale: 0.8, opacity: 0 },
                    visible: {
                      scale: isActive ? 1.2 : 1,
                      opacity: 1,
                      transition: { type: "spring", stiffness: 500, damping: 20 },
                    },
                  }}
                  animate={{ scale: isActive ? 1.2 : 1 }}   // always revert properly
                  whileHover={{
                    y: -3,
                    rotate: 0, // prevents getting stuck in mid-rotation
                    scale: 1.15, // small hover grow
                    transition: { type: "spring", stiffness: 400, damping: 15 },
                  }}
                  className={`rounded-full p-2 mb-1 ${
                    isActive
                      ? "bg-accent/30 text-primary"
                      : "text-gray-500 dark:text-gray-400"
                  }`}
                >
                  {item.icon}
                </motion.div>


                {/* Label */}
                <motion.span
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: isActive ? 1 : 0.7, y: isActive ? 0 : 2 }}
                  transition={{ duration: 0.4 }}
                  className={`text-xs font-medium ${
                    isActive ? "text-primary" : "text-gray-500 dark:text-gray-400"
                  }`}
                >
                  {item.label}
                </motion.span>

                {/* Active underline */}
                {isActive && (
                  <motion.div
                    layoutId="underline"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    className="absolute -bottom-1 w-8 h-1 bg-primary rounded-full"
                  />
                )}
              </Link>
            );
          })}
        </motion.div>
      </nav>
    </motion.div>
  );
};

export default Navbar;
