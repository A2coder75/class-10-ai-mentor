
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  Home, 
  BookOpen, 
  FileText, 
  MessageSquare, 
  BarChart2 
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
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-10">
      <nav className="flex justify-around items-center h-16">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center justify-center p-2 ${
              location.pathname === item.path
                ? "text-primary"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {item.icon}
            <span className="text-xs mt-1">{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default Navbar;
