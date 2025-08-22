import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AnimatePresence, motion } from "framer-motion";

import Index from "./pages/Index";
import TestHomePage from "./pages/TestHomePage";
import TestPage from "./pages/TestPage";
import SyllabusPage from "./pages/SyllabusPage";
import PapersPage from "./pages/PapersPage";
import DoubtsPage from "./pages/DoubtsPage";
import PerformancePage from "./pages/PerformancePage";
import StudyPage from "./pages/StudyPage";
import StudyModePage from "./pages/StudyModePage";
import RelaxationModePage from "./pages/RelaxationModePage";
import TestResultsDemo from "./pages/TestResultsDemo";
import TestResultsBeautiful from "./pages/TestResultsBeautiful";
import NotFound from "./pages/NotFound";

import Navbar from "./components/Navbar";
import ThemeToggle from "./components/ThemeToggle";

const queryClient = new QueryClient();

// Smooth animated routes
const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {[
          { path: "/", element: <Index /> },
          { path: "/tests", element: <TestHomePage /> },
          { path: "/test", element: <TestPage /> },
          { path: "/syllabus", element: <SyllabusPage /> },
          { path: "/papers", element: <PapersPage /> },
          { path: "/doubts", element: <DoubtsPage /> },
          { path: "/performance", element: <PerformancePage /> },
          { path: "/study", element: <StudyPage /> },
          { path: "/study-mode", element: <StudyModePage /> },
          { path: "/relaxation-mode", element: <RelaxationModePage /> },
          { path: "/test-results-demo", element: <TestResultsDemo /> },
          { path: "/test/results", element: <TestResultsBeautiful /> },
          { path: "*", element: <NotFound /> },
        ].map(({ path, element }) => (
          <Route
            key={path}
            path={path}
            element={
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                {element}
              </motion.div>
            }
          />
        ))}
      </Routes>
    </AnimatePresence>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="min-h-screen pb-16 dark:bg-gray-900 dark:text-white transition-colors duration-300">
            <ThemeToggle />
            <AnimatedRoutes />
            <Navbar />
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
