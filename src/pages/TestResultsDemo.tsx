import React from 'react';
import TestResultsReview from '@/components/TestResultsReview';

const TestResultsDemo = () => {
  // Sample test data for demonstration
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
    }
  ];

  return (
    <TestResultsReview
      totalMarks={11}
      maxMarks={18}
      timeTaken={45}
      questions={sampleQuestions}
      testName="Science & Mathematics Practice Test"
    />
  );
};

export default TestResultsDemo;