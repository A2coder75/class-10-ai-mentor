
// Add a section to the existing studyPlannerData.ts to normalize subjects

export const normalizeSubjectName = (subject: string): string => {
  // Convert variations of Math to a standard form
  if (subject.toLowerCase() === 'math' || 
      subject.toLowerCase() === 'mathematics' || 
      subject.toLowerCase() === 'maths') {
    return 'Mathematics';
  }
  
  // You can add more normalizations here if needed
  return subject;
};
