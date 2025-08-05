import React from 'react';
import TestResultsReview from '@/components/TestResultsReview';

const TestResultsDemo = () => {
  // Enhanced sample test data with comprehensive student performance metrics
  const sampleQuestions = [
    {
      id: 1,
      question: "What is the chemical formula for water?",
      studentAnswer: "H2O",
      correctAnswer: "H2O",
      marks: 2,
      maxMarks: 2,
      difficulty: 'Easy' as const,
      type: 'MCQ' as const,
      topic: 'Chemistry',
      feedback: "Perfect! You correctly identified the molecular formula of water."
    },
    {
      id: 2,
      question: "Solve for x: 2x + 5 = 13",
      studentAnswer: "x = 3",
      correctAnswer: "x = 4",
      marks: 1,
      maxMarks: 3,
      difficulty: 'Medium' as const,
      type: 'Short Answer' as const,
      topic: 'Mathematics',
      mistakes: ["Calculation error in subtraction", "Did not verify the answer"],
      feedback: "You set up the equation correctly but made an error in the calculation. Remember: 2x = 13 - 5 = 8, so x = 4."
    },
    {
      id: 3,
      question: "Explain the process of photosynthesis and its importance in the ecosystem.",
      studentAnswer: "Plants make food using sunlight",
      correctAnswer: "Photosynthesis is the process by which plants convert light energy, carbon dioxide, and water into glucose and oxygen. It's crucial for the ecosystem as it produces oxygen for respiration and forms the base of most food chains.",
      marks: 2,
      maxMarks: 5,
      difficulty: 'Hard' as const,
      type: 'Long Answer' as const,
      topic: 'Biology',
      mistakes: ["Incomplete explanation", "Missing key terms like chlorophyll", "No mention of chemical equation"],
      feedback: "Your basic understanding is correct, but your answer lacks detail. Include the chemical equation (6CO₂ + 6H₂O + light energy → C₆H₁₂O₆ + 6O₂) and explain the role of chlorophyll."
    },
    {
      id: 4,
      question: "What is the capital of France?",
      studentAnswer: "",
      correctAnswer: "Paris",
      marks: 0,
      maxMarks: 1,
      difficulty: 'Easy' as const,
      type: 'MCQ' as const,
      topic: 'Geography',
      feedback: "This was not attempted. Paris is the capital and largest city of France."
    },
    {
      id: 5,
      question: "Calculate the area of a circle with radius 5 cm.",
      studentAnswer: "π × 5² = 25π cm²",
      correctAnswer: "π × 5² = 25π ≈ 78.54 cm²",
      marks: 4,
      maxMarks: 4,
      difficulty: 'Medium' as const,
      type: 'Short Answer' as const,
      topic: 'Mathematics',
      feedback: "Excellent work! You applied the formula correctly and showed your working clearly."
    },
    {
      id: 6,
      question: "Name three Newton's laws of motion.",
      studentAnswer: "1. Law of inertia 2. F=ma",
      correctAnswer: "1. Law of Inertia (object at rest stays at rest) 2. F = ma (force equals mass times acceleration) 3. Action-Reaction law (every action has equal and opposite reaction)",
      marks: 2,
      maxMarks: 3,
      difficulty: 'Medium' as const,
      type: 'Short Answer' as const,
      topic: 'Physics',
      mistakes: ["Did not mention the third law", "Incomplete explanation of first two laws"],
      feedback: "Good start! You identified the first two laws but missed Newton's third law about action-reaction pairs."
    },
    // Additional questions for better analysis
    {
      id: 7,
      question: "Which of the following is a prime number: 15, 17, 21, or 25?",
      studentAnswer: "17",
      correctAnswer: "17",
      marks: 1,
      maxMarks: 1,
      difficulty: 'Easy' as const,
      type: 'MCQ' as const,
      topic: 'Mathematics',
      feedback: "Correct! 17 is only divisible by 1 and itself."
    },
    {
      id: 8,
      question: "What is the powerhouse of the cell?",
      studentAnswer: "Mitochondria",
      correctAnswer: "Mitochondria",
      marks: 1,
      maxMarks: 1,
      difficulty: 'Easy' as const,
      type: 'MCQ' as const,
      topic: 'Biology',
      feedback: "Excellent! Mitochondria produce ATP, the cell's energy currency."
    },
    {
      id: 9,
      question: "Calculate the velocity of a car that travels 100 meters in 5 seconds.",
      studentAnswer: "v = 100/5 = 20 m/s",
      correctAnswer: "v = distance/time = 100m/5s = 20 m/s",
      marks: 3,
      maxMarks: 3,
      difficulty: 'Medium' as const,
      type: 'Short Answer' as const,
      topic: 'Physics',
      feedback: "Perfect calculation! You correctly applied the formula v = d/t."
    },
    {
      id: 10,
      question: "Describe the water cycle and explain how it affects climate.",
      studentAnswer: "Water evaporates and then rains",
      correctAnswer: "The water cycle involves evaporation, condensation, precipitation, and collection. It regulates Earth's temperature through heat transfer and affects regional climate patterns through moisture distribution.",
      marks: 1,
      maxMarks: 5,
      difficulty: 'Hard' as const,
      type: 'Long Answer' as const,
      topic: 'Geography',
      mistakes: ["Oversimplified explanation", "No mention of condensation or collection", "Missing climate impact discussion"],
      feedback: "Your answer is too brief. Expand on each stage of the water cycle and explain how it redistributes heat around Earth."
    }
  ];

  return (
    <TestResultsReview
      totalMarks={17}
      maxMarks={26}
      timeTaken={45}
      questions={sampleQuestions}
      testName="Science & Mathematics Practice Test"
    />
  );
};

export default TestResultsDemo;