import React from 'react';
import TestResultsReviewNew from '@/components/TestResultsReviewNew';

const TestResultsDemo = () => {
  // Sample data following the updated JSON format (question, type, feedback included)
  const sampleEvaluations = [
    {
      question_number: '2(i)(b)',
      section: 'A',
      question: 'Identify the class of lever shown in the diagram.',
      type: 'Short Answer',
      verdict: 'wrong' as const,
      marks_awarded: 0,
      mistake: 'Class I Lever was wrong identification because of wrong concept',
      correct_answer: ['Class II lever'],
      mistake_type: 'conceptual',
      feedback: 'This is a class II lever because the load lies between the fulcrum and effort. Review lever classes and common examples.'
    },
    {
      question_number: '2(ii)(a)',
      section: 'A',
      question: 'What is the speed of light in vacuum?',
      type: 'MCQ',
      verdict: 'correct' as const,
      marks_awarded: 1,
      mistake: [],
      correct_answer: '3 × 10^8 m/s',
      mistake_type: [],
      feedback: []
    },
    {
      question_number: '3(a)',
      section: 'B',
      question: 'State the formula for kinetic energy.',
      type: 'Short Answer',
      verdict: 'wrong' as const,
      marks_awarded: 0,
      mistake: 'Formula for kinetic energy was applied incorrectly',
      correct_answer: ['KE = 1/2 mv²'],
      mistake_type: 'calculation',
      feedback: 'Memorize the exact formula and practice substituting values carefully to avoid slips.'
    },
    {
      question_number: '3(b)',
      section: 'B',
      question: 'Write Newton’s second law of motion.',
      type: 'Short Answer',
      verdict: 'correct' as const,
      marks_awarded: 1,
      mistake: [],
      correct_answer: ['F = ma'],
      mistake_type: [],
      feedback: []
    }
  ];

  return (
    <TestResultsReviewNew evaluations={sampleEvaluations} testName="Physics Final Exam" timeTaken={45} />
  );
};

export default TestResultsDemo;