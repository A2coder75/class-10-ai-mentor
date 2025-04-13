
import { Question, GradeRequest, GradeResponse } from "../types";

// Mock API function to fetch questions
export const gradeQuestions = async (gradeRequest: GradeRequest): Promise<GradeResponse> => {
  try {
    console.log("Sending grading request to API:", JSON.stringify(gradeRequest, null, 2));
    
    const response = await fetch('http://127.0.0.1:8000/grade', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(gradeRequest)
    });

    if (!response.ok) {
      throw new Error(`API returned error: ${response.status}`);
    }

    const data = await response.json();
    console.log("API response:", data);
    
    if (!data.evaluations) {
      throw new Error("Invalid response format from grading API");
    }

    return data as GradeResponse;
  } catch (error) {
    console.error("Error grading questions:", error);
    throw error; // Re-throw the error to be handled by the calling component
  }
};

// Function to grade questions by sending them to the API
export const gradeQuestions = async (gradeRequest: GradeRequest): Promise<GradeResponse> => {
  try {
    console.log("Sending grading request to API:", gradeRequest);
    
    // For demo purposes, create mock evaluations if the API is not available
    
    
    try {
      const response = await fetch('http://127.0.0.1:8001/grade_batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(gradeRequest),
        // Short timeout to prevent long waiting if API is down
        //signal: AbortSignal.timeout(3000)
      });
      
      if (!response.ok) {
        console.warn(`API returned error: ${response.status}. Using mock data instead.`);
        //return mockResponse;
      }
      
      const data = await response.json();
      console.log("API response:", data);
      return data as GradeResponse;
    } catch (error) {
      console.warn("Error connecting to grading API, using mock data instead:", error);
     // return mockResponse;
    }
  } catch (error) {
    console.error("Error grading questions:", error);
    throw error;
  }
};
