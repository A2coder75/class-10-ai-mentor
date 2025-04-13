
import { Question, GradeRequest, GradeResponse } from "../types";

const API_BASE_URL = "http://127.0.0.1:8000";
const GRADING_API_URL = "http://127.0.0.1:8001";

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

export async function gradeQuestions(request: GradeRequest): Promise<GradeResponse> {
  try {
    const response = await fetch(`${GRADING_API_URL}/grade_batch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data: GradeResponse = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to grade questions:", error);
    throw error;
  }
}
