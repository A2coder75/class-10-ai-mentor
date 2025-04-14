
import { Question, GradeRequest, GradeResponse, Doubt, DoubtsResponse } from "../types";
import { toast } from "@/components/ui/use-toast";

const API_BASE_URL = "http://127.0.0.1:8000";

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
    
    const response = await fetch(`${API_BASE_URL}/grade_batch`, {
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

// Function to submit a doubt to the FastAPI endpoint
export const solveDoubt = async (prompt: string, important: boolean): Promise<DoubtsResponse> => {
  try {
    console.log("Sending doubt to API:", prompt, "Important:", important);
    
    const response = await fetch(`${API_BASE_URL}/solve_doubt`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt, important })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API error (${response.status}):`, errorText);
      throw new Error(`API returned error: ${response.status} - ${errorText || 'No error details'}`);
    }

    const data = await response.json();
    console.log("API response for doubt:", data);
    
    if (!data.response) {
      console.error("Invalid response format:", data);
      throw new Error("Invalid response format from doubts API");
    }

    return data as DoubtsResponse;
  } catch (error) {
    console.error("Error solving doubt:", error);
    
    // For development - return mock data if API is unavailable
    if (process.env.NODE_ENV === 'development') {
      console.log("Using mock doubt response for development");
      toast({
        title: "Using mock AI response",
        description: "Could not connect to doubts API. Using mock data instead.",
        variant: "default"
      });
      
      return getMockDoubtsResponse(prompt);
    }
    
    throw error;
  }
};

// Helper to generate mock grading response for development
function getMockGradingResponse(request: GradeRequest): GradeResponse {
  return {
    evaluations: request.questions.map(q => {
      const isCorrect = Math.random() > 0.5;
      return {
        question_number: q.question_number,
        section: q.section,
        marks_awarded: isCorrect ? 1 : 0,
        mistake: isCorrect ? [] : ["wrong identification because of wrong concept"],
        correct_answer: isCorrect ? undefined : ["The correct answer should be X"],
        mistake_type: isCorrect ? [] : ["conceptual"]
      };
    })
  };
}

// Helper to generate mock doubt response for development
function getMockDoubtsResponse(prompt: string): DoubtsResponse {
  return {
    response: {
      model: "deepseek-r1-distill-llama-70b",
      answer: `<think>\nAnalyzing the question about ${prompt}. This appears to be related to physics concepts. Let me consider the fundamental principles involved and structure a clear explanation.\n</think>\n\nThe question about ${prompt} can be explained by considering the conservation of energy principle. When we analyze this situation, we need to account for all energy transfers and transformations.\n\nFirst, we recognize that energy cannot be created or destroyed, only converted from one form to another. In this case, the system demonstrates how kinetic energy relates to potential energy through the work-energy theorem.\n\nTo solve problems like this, focus on identifying all forms of energy present and tracking their transformations throughout the process.`,
      tokens_used: 324
    }
  };
}
