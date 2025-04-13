
import { Question, GradeRequest, GradeResponse } from "../types";

// Mock API function to fetch questions
export const fetchQuestionsFromAPI = async (): Promise<Question[]> => {
  try {
    // In a real application, you would fetch from an actual API
    // First try the mock data endpoint
    const response = await fetch('http://127.0.0.1:8000/questions');
    if (!response.ok) {
      console.log('Failed to fetch from primary endpoint, using fallback');
      // Fallback to mock data
      return [];
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
    
    // For demo purposes, create mock evaluations if the API is not available
    const mockResponse: GradeResponse = {
      evaluations: gradeRequest.questions.map(q => ({
        question_number: q.question_number,
        section: q.section,
        marks_awarded: Math.floor(Math.random() * 5) + 1,
        total_marks: 5,
        missing_or_wrong: q.student_answer ? [] : ["Missing answer"],
        final_feedback: q.student_answer ? "Good attempt!" : "No answer provided."
      }))
    };
    
    try {
      const response = await fetch('http://127.0.0.1:8001/grade_batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(gradeRequest),
        // Short timeout to prevent long waiting if API is down
        signal: AbortSignal.timeout(3000)
      });
      
      if (!response.ok) {
        console.warn(`API returned error: ${response.status}. Using mock data instead.`);
        return mockResponse;
      }
      
      const data = await response.json();
      console.log("API response:", data);
      return data as GradeResponse;
    } catch (error) {
      console.warn("Error connecting to grading API, using mock data instead:", error);
      return mockResponse;
    }
  } catch (error) {
    console.error("Error grading questions:", error);
    throw error;
  }
};
