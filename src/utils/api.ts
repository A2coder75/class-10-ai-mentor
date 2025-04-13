
import { Question, GradeRequest, GradeResponse } from "../types";

// Mock API function to fetch questions
export const fetchQuestionsFromAPI = async (): Promise<Question[]> => {
  try {
    // In a real application, you would fetch from an actual API
    const response = await fetch('/api/questions');
    if (!response.ok) {
      throw new Error('Failed to fetch questions');
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching questions:", error);
    // Return empty array if fetch fails
    return [];
  }
};

// Function to grade questions by sending them to the API
export const gradeQuestions = async (gradeRequest: GradeRequest): Promise<GradeResponse> => {
  try {
    console.log("Sending grading request to API:", gradeRequest);
    
    const response = await fetch('http://127.0.0.1:8001/grade_batch', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(gradeRequest),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API returned error: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    console.log("API response:", data);
    return data as GradeResponse;
  } catch (error) {
    console.error("Error grading questions:", error);
    // Return empty evaluations if API call fails
    throw error;
  }
};
