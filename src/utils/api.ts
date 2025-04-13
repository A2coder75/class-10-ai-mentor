import { Question, GradeRequest, GradeResponse } from "../types";

const API_BASE_URL = "http://127.0.0.1:8000";

// Function to fetch questions from the API
export async function fetchQuestionsFromAPI(): Promise<Question[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/questions`);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data: Question[] = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to fetch questions:", error);
    throw error;
  }
}

// Function to send grading request to the backend
export const gradeQuestions = async (gradeRequest: GradeRequest): Promise<GradeResponse> => {
  try {
    console.log("Sending grading request to API:", JSON.stringify(gradeRequest, null, 2));
    
    const response = await fetch(`${API_BASE_URL.replace("8000", "8001")}/grade_batch`, {
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
    throw error;
  }
};
