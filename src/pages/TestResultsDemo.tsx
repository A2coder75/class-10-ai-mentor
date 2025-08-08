import React from 'react';
import TestResultsReviewNew from '@/components/TestResultsReviewNew';

const TestResultsDemo = () => {
  // Sample evaluation data matching the new JSON format
  const sampleEvaluations = [
    {
      question_number: "1",
      section: "A",
      verdict: "correct" as const,
      marks_awarded: 1,
      mistake: [],
      correct_answer: ["H2O"],
      mistake_type: []
    },
    {
      question_number: "2(i)(b)",
      section: "A",
      verdict: "wrong" as const,
      marks_awarded: 0,
      mistake: "Class I Lever was wrong identification because of wrong concept",
      correct_answer: ["Class II lever"],
      mistake_type: "conceptual"
    },
    {
      question_number: "2(ii)(a)",
      section: "A",
      verdict: "correct" as const,
      marks_awarded: 1,
      mistake: [],
      correct_answer: ["option C: 3 × 10^8 m/s"],
      mistake_type: []
    },
    {
      question_number: "3(a)",
      section: "B",
      verdict: "wrong" as const,
      marks_awarded: 0,
      mistake: "Formula for kinetic energy was applied incorrectly",
      correct_answer: ["KE = 1/2 mv²"],
      mistake_type: "calculation"
    },
    {
      question_number: "3(b)",
      section: "B",
      verdict: "correct" as const,
      marks_awarded: 1,
      mistake: [],
      correct_answer: ["F = ma"],
      mistake_type: []
    },
    {
      question_number: "4(i)",
      section: "C",
      verdict: "wrong" as const,
      marks_awarded: 0,
      mistake: ["Misunderstood the principle of electromagnetic induction", "Did not apply Lenz's law correctly"],
      correct_answer: ["Induced EMF opposes the change in magnetic flux"],
      mistake_type: ["conceptual", "application"]
    },
    {
      question_number: "4(ii)",
      section: "C",
      verdict: "correct" as const,
      marks_awarded: 1,
      mistake: [],
      correct_answer: ["V = IR (Ohm's Law)"],
      mistake_type: []
    },
    {
      question_number: "5(a)",
      section: "D",
      verdict: "wrong" as const,
      marks_awarded: 0,
      mistake: "Confusion between speed and velocity concepts",
      correct_answer: ["Velocity is speed with direction"],
      mistake_type: "conceptual"
    },
    {
      question_number: "5(b)",
      section: "D",
      verdict: "correct" as const,
      marks_awarded: 1,
      mistake: [],
      correct_answer: ["a = v/t"],
      mistake_type: []
    },
    {
      question_number: "6",
      section: "E",
      verdict: "wrong" as const,
      marks_awarded: 0,
      mistake: "Arithmetic error in final calculation step",
      correct_answer: ["42"],
      mistake_type: "calculation"
    }
  ];

  return (
    <TestResultsReviewNew
      evaluations={sampleEvaluations}
      testName="Physics Final Exam"
      timeTaken={45}
    />
  );
};

export default TestResultsDemo;