
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import TestPage from "./pages/TestPage";
import SyllabusPage from "./pages/SyllabusPage";
import PapersPage from "./pages/PapersPage";
import DoubtsPage from "./pages/DoubtsPage";
import PerformancePage from "./pages/PerformancePage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/test" element={<TestPage />} />
          <Route path="/syllabus" element={<SyllabusPage />} />
          <Route path="/papers" element={<PapersPage />} />
          <Route path="/doubts" element={<DoubtsPage />} />
          <Route path="/performance" element={<PerformancePage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
