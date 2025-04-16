
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Index from "./pages/Index";
import TestPage from "./pages/TestPage";
import SyllabusPage from "./pages/SyllabusPage";
import PapersPage from "./pages/PapersPage";
import DoubtsPage from "./pages/DoubtsPage";
import PerformancePage from "./pages/PerformancePage";
import StudyPage from "./pages/StudyPage";
import NotFound from "./pages/NotFound";
import Navbar from "./components/Navbar";
import ThemeToggle from "./components/ThemeToggle";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="min-h-screen pb-16 dark:bg-gray-900 dark:text-white transition-colors duration-300">
            <ThemeToggle />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/test" element={<TestPage />} />
              <Route path="/syllabus" element={<SyllabusPage />} />
              <Route path="/papers" element={<PapersPage />} />
              <Route path="/doubts" element={<DoubtsPage />} />
              <Route path="/performance" element={<PerformancePage />} />
              <Route path="/study" element={<StudyPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Navbar />
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
