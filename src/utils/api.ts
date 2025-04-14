import { Question, GradeRequest, GradeResponse } from "../types";
import { toast } from "@/components/ui/use-toast";

const API_BASE_URL = "http://127.0.0.1:8000";
const GRADING_API_URL = "http://127.0.0.1:8001";

// Function to fetch questions from the API
export async function fetchQuestionsFromAPI(): Promise<Question[]> {
  try {
    console.log("Fetching questions from API:", `${API_BASE_URL}/questions`);
    
    const response = await fetch(`${API_BASE_URL}/questions`);
    
    if (!response.ok) {
      console.error(`API returned status: ${response.status}`);
      throw new Error(`API error: ${response.status}`);
    }
    
    const data: Question[] = await response.json();
    console.log(`Successfully fetched ${data.length} questions`);
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
    
    const response = await fetch(`${GRADING_API_URL}/grade_batch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(gradeRequest)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API error (${response.status}):`, errorText);
      throw new Error(`API returned error: ${response.status} - ${errorText || 'No error details'}`);
    }

    const data = await response.json();
    console.log("API response:", data);
    
    if (!data.evaluations) {
      console.error("Invalid response format:", data);
      throw new Error("Invalid response format from grading API");
    }

    return data as GradeResponse;
  } catch (error) {
    console.error("Error grading questions:", error);
    
    // For development - return mock data if API is unavailable
    if (process.env.NODE_ENV === 'development') {
      console.log("Using mock grading response for development");
      toast({
        title: "Using mock grades",
        description: "Could not connect to grading API. Using mock data instead.",
        variant: "default"
      });
      
      return getMockGradingResponse(gradeRequest);
    }
    
    throw error;
  }
};

// Helper to generate mock grading response for development
function getMockGradingResponse(request: GradeRequest): GradeResponse {
  return {
    evaluations: request.questions.map(q => ({
      question_number: q.question_number,
      section: q.section,
      marks_awarded: Math.random() > 0.5 ? 1 : 0,
      total_marks: 1,
      missing_or_wrong: Math.random() > 0.5 ? [] : ["The student's answer is incorrect."],
      final_feedback: Math.random() > 0.5 ? "Correct answer." : "Incorrect answer."
    }))
  };
}
