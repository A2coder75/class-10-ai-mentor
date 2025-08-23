import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, Clock, FileText, ArrowLeft, Play, Download, Calendar, Target } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/Navbar';
import { fetchSubjects, fetchPapersForSubject, SubjectInfo, PaperInfo } from '@/utils/huggingfaceApi';
import { Skeleton } from '@/components/ui/skeleton';

const TestHomePage = () => {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState<SubjectInfo[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<SubjectInfo | null>(null);
  const [papers, setPapers] = useState<PaperInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingPapers, setLoadingPapers] = useState(false);

  useEffect(() => {
    loadSubjects();
  }, []);

  const loadSubjects = async () => {
    setLoading(true);
    try {
      const subjectData = await fetchSubjects();
      setSubjects(subjectData);
    } catch (error) {
      console.error('Failed to load subjects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubjectClick = async (subject: SubjectInfo) => {
    setSelectedSubject(subject);
    setLoadingPapers(true);
    
    try {
      const paperData = await fetchPapersForSubject(subject.path);
      setPapers(paperData);
    } catch (error) {
      console.error('Failed to load papers:', error);
      setPapers([]);
    } finally {
      setLoadingPapers(false);
    }
  };

  const handlePaperClick = (paper: PaperInfo) => {
    // Navigate to test page with the paper filename
    const filename = paper.path.replace(/\.[^/.]+$/, ""); // Remove file extension
    navigate('/test', { state: { filename } });
  };

  const handleBackToSubjects = () => {
    setSelectedSubject(null);
    setPapers([]);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      y: 20,
      scale: 0.95
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24
      }
    }
  };

  if (loading) {
    return (
      <div className="page-container pb-20">
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold gradient-text mb-4">
            Practice Tests
          </h1>
          <p className="text-lg text-muted-foreground">
            Loading available subjects...
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <CardHeader>
                <Skeleton className="h-12 w-12 rounded-full mb-3" />
                <Skeleton className="h-6 w-3/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Navbar />
      </div>
    );
  }

  return (
    <div className="page-container pb-20">
      <AnimatePresence mode="wait">
        {!selectedSubject ? (
          <motion.div
            key="subjects"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={containerVariants}
          >
            {/* Header */}
            <motion.div 
              className="mb-8 text-center"
              variants={itemVariants}
            >
              <div className="flex items-center justify-center gap-4 mb-6">
                <img 
                  src="/logo_2_transparent.png" 
                  alt="Studia Logo" 
                  className="h-20 w-auto object-contain"
                />
                <h1 className="text-3xl md:text-4xl font-bold gradient-text">
                  Practice Tests
                </h1>
              </div>
              <p className="text-lg text-muted-foreground">
                Choose a subject to start practicing with past year papers
              </p>
            </motion.div>

            {/* Subject Cards */}
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              variants={containerVariants}
            >
              {subjects.map((subject) => (
                <motion.div
                  key={subject.name}
                  variants={itemVariants}
                  whileHover={{ 
                    scale: 1.02,
                    y: -4,
                    transition: { type: "spring", stiffness: 400, damping: 25 }
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card 
                    className="cursor-pointer overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900"
                    onClick={() => handleSubjectClick(subject)}
                  >
                    <div className={`h-2 bg-gradient-to-r ${subject.color}`}></div>
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${subject.color} flex items-center justify-center text-2xl shadow-lg`}>
                          {subject.icon}
                        </div>
                        <Badge variant="secondary" className="text-xs font-medium">
                          Available
                        </Badge>
                      </div>
                      <CardTitle className="text-xl font-bold text-gray-800 dark:text-gray-100">
                        {subject.displayName}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                        {subject.description}
                      </p>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <FileText className="h-4 w-4" />
                          <span>Multiple papers available</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>3 hrs duration</span>
                        </div>
                      </div>
                      <div className={`w-full h-1 rounded-full bg-gradient-to-r ${subject.color} mt-4 opacity-70`}></div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="papers"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={containerVariants}
          >
            {/* Header with Back Button */}
            <motion.div 
              className="mb-8"
              variants={itemVariants}
            >
              <div className="flex items-center gap-4 mb-6">
                <Button
                  variant="outline"
                  onClick={handleBackToSubjects}
                  className="flex items-center gap-2 hover:bg-primary/10"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Subjects
                </Button>
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${selectedSubject.color} flex items-center justify-center text-xl shadow-lg`}>
                    {selectedSubject.icon}
                  </div>
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100">
                      {selectedSubject.displayName} Papers
                    </h1>
                    <p className="text-muted-foreground">
                      Choose a paper to start your practice test
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Papers Grid */}
            {loadingPapers ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className="overflow-hidden">
                    <div className="h-1 bg-gray-200 dark:bg-gray-700"></div>
                    <CardHeader>
                      <Skeleton className="h-6 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-1/2" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-2/3 mb-4" />
                      <div className="flex gap-2">
                        <Skeleton className="h-6 w-16" />
                        <Skeleton className="h-6 w-20" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <motion.div 
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                variants={containerVariants}
              >
                {papers.map((paper, index) => (
                  <motion.div
                    key={paper.path}
                    variants={itemVariants}
                    whileHover={{ 
                      scale: 1.02,
                      y: -4,
                      transition: { type: "spring", stiffness: 400, damping: 25 }
                    }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 group">
                      <div className={`h-1 bg-gradient-to-r ${selectedSubject.color}`}></div>
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg font-bold text-gray-800 dark:text-gray-100 group-hover:text-primary transition-colors">
                              {paper.displayName}
                            </CardTitle>
                            <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              <span>3 hours</span>
                              <Target className="h-3 w-3 ml-2" />
                              <span>100 marks</span>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="flex gap-2 flex-wrap mb-4">
                          <Badge 
                            variant="outline" 
                            className="bg-primary/10 text-primary border-primary/20"
                          >
                            {selectedSubject.displayName}
                          </Badge>
                          {paper.type && (
                            <Badge 
                              variant="outline" 
                              className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800"
                            >
                              {paper.type}
                            </Badge>
                          )}
                          {paper.year && (
                            <Badge 
                              variant="outline" 
                              className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800"
                            >
                              {paper.year}
                            </Badge>
                          )}
                        </div>
                        
                        <div className="text-sm text-muted-foreground mb-4">
                          <p>Complete paper with all sections including theory and practical questions</p>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="flex-1 group-hover:border-primary/50 transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              // In a real app, this would download the PDF
                              console.log('Download paper:', paper.path);
                            }}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                          <Button 
                            size="sm"
                            onClick={() => handlePaperClick(paper)}
                            className={`flex-1 bg-gradient-to-r ${selectedSubject.color} text-white hover:opacity-90 transition-opacity`}
                          >
                            <Play className="h-4 w-4 mr-2" />
                            Start Test
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {!loadingPapers && papers.length === 0 && (
              <motion.div 
                className="text-center py-12"
                variants={itemVariants}
              >
                <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No Papers Available</h3>
                <p className="text-muted-foreground">
                  No practice papers found for {selectedSubject.displayName}. Please try another subject.
                </p>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <Navbar />
    </div>
  );
};

export default TestHomePage;