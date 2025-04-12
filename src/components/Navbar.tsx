
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  Home, 
  BookOpen, 
  FileText, 
  MessageSquare, 
  BarChart2,
  ChevronUp
} from "lucide-react";

const Navbar: React.FC = () => {
  const location = useLocation();
  
  const navItems = [
    { path: "/", icon: <Home className="w-5 h-5" />, label: "Home" },
    { path: "/test", icon: <BookOpen className="w-5 h-5" />, label: "Test" },
    { path: "/syllabus", icon: <FileText className="w-5 h-5" />, label: "Syllabus" },
    { path: "/papers", icon: <FileText className="w-5 h-5" />, label: "Papers" },
    { path: "/doubts", icon: <MessageSquare className="w-5 h-5" />, label: "Doubts" },
    { path: "/performance", icon: <BarChart2 className="w-5 h-5" />, label: "Performance" }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 shadow-lg z-10 transition-colors duration-300">
      <nav className="max-w-screen-lg mx-auto">
        <div className="flex justify-around items-center h-16">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center justify-center relative p-2 transition-all duration-200 ${
                  isActive
                    ? "text-primary"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                {isActive && (
                  <div className="absolute -top-2.5 left-1/2 transform -translate-x-1/2">
                    <ChevronUp className="w-4 h-4 text-primary" />
                  </div>
                )}
                {isActive ? (
                  <div className="bg-accent dark:bg-accent/30 rounded-full p-2 mb-1">
                    {item.icon}
                  </div>
                ) : (
                  <div className="p-2 mb-1">{item.icon}</div>
                )}
                <span className="text-xs font-medium">{item.label}</span>
                {isActive && (
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-10 h-1 bg-primary rounded-full" />
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
