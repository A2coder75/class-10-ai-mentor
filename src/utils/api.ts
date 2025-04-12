
import { Question } from "../types";

const API_BASE_URL = "http://127.0.0.1:8000";

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
