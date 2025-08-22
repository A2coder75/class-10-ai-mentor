// App.tsx
import React from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

// Import pages
import Home from "./pages/Home";
import Tests from "./pages/Tests";
import Syllabus from "./pages/Syllabus";
import Papers from "./pages/Papers";
import Doubts from "./pages/Doubts";
import Study from "./pages/Study";
import Performance from "./pages/Performance";
import StudyMode from "./pages/StudyMode";
import RelaxationMode from "./pages/RelaxationMode";

// UI components
import Navbar from "./components/Navbar";
import ThemeToggle from "./components/ThemeToggle";

// This is the wrapper that adds page transitions
const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route
          path="/"
          element={
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <Home />
            </motion.div>
          }
        />
        <Route path="/tests" element={<Tests />} />
        <Route path="/syllabus" element={<Syllabus />} />
        <Route path="/papers" element={<Papers />} />
        <Route path="/doubts" element={<Doubts />} />
        <Route path="/study" element={<Study />} />
        <Route path="/performance" element={<Performance />} />
        <Route path="/study-mode" element={<StudyMode />} />
        <Route path="/relaxation-mode" element={<RelaxationMode />} />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <div className="min-h-screen pb-16 dark:bg-gray-900 dark:text-white transition-colors duration-300">
        {/* theme toggle at top */}
        <ThemeToggle />

        {/* page transitions */}
        <AnimatedRoutes />

        {/* persistent navbar (no remounts) */}
        <Navbar />
      </div>
    </BrowserRouter>
  );
};

export default App;
