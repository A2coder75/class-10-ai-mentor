import { Question, GradeRequest, GradeResponse, DoubtsResponse, ChatMessage } from "../types/index.d";
import { toast } from "@/components/ui/use-toast";
import { mockStudyPlan } from "@/utils/studyPlannerData";

const API_BASE_URL = "http://127.0.0.1:8000";

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

export const solveDoubt = async (prompt: string, important: boolean, context?: ChatMessage[]): Promise<DoubtsResponse> => {
  try {
    console.log("Sending doubt to API:", prompt, "Important:", important);
    
    const requestBody: Record<string, any> = { prompt, important };
    
    if (context && context.length > 0) {
      const contentStrings = context.map(msg => msg.content);
      requestBody.context = contentStrings;
      console.log("Sending with context:", contentStrings);
    }
    
    const response = await fetch(`${API_BASE_URL}/solve_doubt`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
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
    
    if (process.env.NODE_ENV === 'development') {
      console.log("Using mock doubt response for development");
      toast({
        title: "Using mock AI response",
        description: "Could not connect to doubts API. Using mock data instead.",
        variant: "default"
      });
      
      return getMockDoubtsResponse(prompt, context);
    }
    
    throw error;
  }
};

export interface StudyPlannerRequest {
  subjects: string[];
  chapters: string[];
  study_goals: string;
  strengths: string[];
  weaknesses: string[];
  time_available: number;
  target: number[];
  days_until_target: number;
  days_per_week: string[];
  start_date: number[];
}

export interface PlannerResponse {
  model: string;
  planner: string;
  tokens_used: number;
}

export const generateStudyPlanner = async (request: StudyPlannerRequest): Promise<PlannerResponse> => {
  try {
    console.log("Sending study planner request to API:", JSON.stringify(request, null, 2));
    
    const response = await fetch(`${API_BASE_URL}/generate_planner`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API error (${response.status}):`, errorText);
      throw new Error(`API returned error: ${response.status} - ${errorText || 'No error details'}`);
    }

    const data = await response.json();
    console.log("API response for study planner:", data);
    return data as PlannerResponse;
  } catch (error) {
    console.error("Error generating study planner:", error);
    
    if (process.env.NODE_ENV === 'development') {
      console.log("Using mock planner response for development");
      toast({
        title: "Using mock study planner",
        description: "Could not connect to planner API. Using mock data instead.",
        variant: "default"
      });
      
      const mockResponse: PlannerResponse = {
        model: "llama3-8b-8192",
        planner: "Here is the personalized study schedule for ICSE Class 10 students:\n\n```\n{\n  \"target_date\": \"2025-06-15\",\n  \"study_plan\": [\n    {\n      \"week_number\": 1,\n      \"days\": [\n        {\n          \"date\": \"2025-04-15\",\n          \"tasks\": [\n            {\n              \"subject\": \"Physics\",\n              \"chapter\": \"Electricity\",\n              \"task_type\": \"learning\",\n              \"estimated_time\": 120,\n              \"status\": \"pending\"\n            },\n            {\n              \"break\": 20\n            },\n            {\n              \"subject\": \"Math\",\n              \"chapter\": \"Quadratic Equations\",\n              \"task_type\": \"revision\",\n              \"estimated_time\": 60,\n              \"status\": \"pending\"\n            }\n          ]\n        },\n        {\n          \"date\": \"2025-04-17\",\n          \"tasks\": [\n            {\n              \"subject\": \"Physics\",\n              \"chapter\": \"Electricity\",\n              \"task_type\": \"revision\",\n              \"estimated_time\": 60,\n              \"status\": \"pending\"\n            },\n            {\n              \"break\": 20\n            },\n            {\n              \"subject\": \"Math\",\n              \"chapter\": \"Quadratic Equations\",\n              \"task_type\": \"practice\",\n              \"estimated_time\": 40,\n              \"status\": \"pending\"\n            }\n          ]\n        }\n      ]\n    },\n    {\n      \"week_number\": 2,\n      \"days\": [\n        {\n          \"date\": \"2025-04-22\",\n          \"tasks\": [\n            {\n              \"subject\": \"Chemistry\",\n              \"chapter\": \"Chemical Reactions\",\n              \"task_type\": \"learning\",\n              \"estimated_time\": 100,\n              \"status\": \"pending\"\n            },\n            {\n              \"break\": 20\n            },\n            {\n              \"subject\": \"Physics\",\n              \"chapter\": \"Electricity\",\n              \"task_type\": \"practice\",\n              \"estimated_time\": 40,\n              \"status\": \"pending\"\n            }\n          ]\n        },\n        {\n          \"date\": \"2025-04-24\",\n          \"tasks\": [\n            {\n              \"subject\": \"Chemistry\",\n              \"chapter\": \"Chemical Reactions\",\n              \"task_type\": \"revision\",\n              \"estimated_time\": 60,\n              \"status\": \"pending\"\n            },\n            {\n              \"break\": 20\n            },\n            {\n              \"subject\": \"Math\",\n              \"chapter\": \"Quadratic Equations\",\n              \"task_type\": \"revision\",\n              \"estimated_time\": 60,\n              \"status\": \"pending\"\n            }\n          ]\n        }\n      ]\n    },\n    {\n      \"week_number\": 3,\n      \"days\": [\n        {\n          \"date\": \"2025-05-03\",\n          \"tasks\": [\n            {\n              \"subject\": \"Physics\",\n              \"chapter\": \"Electricity\",\n              \"task_type\": \"practice\",\n              \"estimated_time\": 40,\n              \"status\": \"pending\"\n            },\n            {\n              \"break\": 20\n            },\n            {\n              \"subject\": \"Chemistry\",\n              \"chapter\": \"Chemical Reactions\",\n              \"task_type\": \"practice\",\n              \"estimated_time\": 40,\n              \"status\": \"pending\"\n            }\n          ]\n        },\n        {\n          \"date\": \"2025-05-06\",\n          \"tasks\": [\n            {\n              \"subject\": \"Math\",\n              \"chapter\": \"Quadratic Equations\",\n              \"task_type\": \"practice\",\n              \"estimated_time\": 40,\n              \"status\": \"pending\"\n            },\n            {\n              \"break\": 20\n            },\n            {\n              \"subject\": \"Physics\",\n              \"chapter\": \"Electricity\",\n              \"task_type\": \"revision\",\n              \"estimated_time\": 60,\n              \"status\": \"pending\"\n            }\n          ]\n        }\n      ]\n    },\n    {\n      \"week_number\": 4,\n      \"days\": [\n        {\n          \"date\": \"2025-05-10\",\n          \"tasks\": [\n            {\n              \"subject\": \"Chemistry\",\n              \"chapter\": \"Chemical Reactions\",\n              \"task_type\": \"revision\",\n              \"estimated_time\": 60,\n              \"status\": \"pending\"\n            },\n            {\n              \"break\": 20\n            },\n            {\n              \"subject\": \"Math\",\n              \"chapter\": \"Quadratic Equations\",\n              \"task_type\": \"revision\",\n              \"estimated_time\": 60,\n              \"status\": \"pending\"\n            }\n          ]\n        },\n        {\n          \"date\": \"2025-05-13\",\n          \"tasks\": [\n            {\n              \"subject\": \"Physics\",\n              \"chapter\": \"Electricity\",\n              \"task_type\": \"revision\",\n              \"estimated_time\": 60,\n              \"status\": \"pending\"\n            },\n            {\n              \"break\": 20\n            },\n            {\n              \"subject\": \"Chemistry\",\n              \"chapter\": \"Chemical Reactions\",\n              \"task_type\": \"practice\",\n              \"estimated_time\": 40,\n              \"status\": \"pending\"\n            }\n          ]\n        }\n      ]\n    }\n  ]\n}\n```",
        tokens_used: 2122
      };
      
      return mockResponse;
    }
    
    throw error;
  }
};

function getMockGradingResponse(request: GradeRequest): GradeResponse {
  return {
    evaluations: request.questions.map((q, index) => {
      const isCorrect = Math.random() > 0.5;
      return {
        question_number: q.question_number,
        section: q.section,
        verdict: isCorrect ? "correct" : "wrong",
        marks_awarded: isCorrect ? 1 : 0,
        total_marks: 1,
        missing_or_wrong: isCorrect ? [] : ["wrong identification because of wrong concept"],
        final_feedback: isCorrect ? "Correct answer" : "Incorrect answer",
        mistake: isCorrect ? [] : ["wrong identification because of wrong concept"],
        correct_answer: isCorrect ? undefined : ["The correct answer should be X"],
        mistake_type: isCorrect ? [] : ["conceptual"]
      };
    })
  };
}

function getMockDoubtsResponse(prompt: string, context?: ChatMessage[]): DoubtsResponse {
  const isContinuation = context && context.length > 0;
  
  const response = {
    response: {
      model: "deepseek-r1-distill-llama-70b",
      answer: isContinuation 
        ? `<think>\nContinuing our conversation about ${prompt}. Let me build upon what we've discussed.\n</think>\n\nBased on our previous discussion, I can add that ${prompt} involves several interesting aspects. When we consider the fundamental principles, we need to factor in conservation laws and the specific conditions of the problem. The key insight here is that we need to analyze both the initial and final states carefully.`
        : `<think>\nAnalyzing the question about ${prompt}. This appears to be related to physics concepts. Let me consider the fundamental principles involved and structure a clear explanation.\n</think>\n\nThe question about ${prompt} can be explained by considering the conservation of energy principle. When we analyze this situation, we need to account for all energy transfers and transformations.\n\nFirst, we recognize that energy cannot be created or destroyed, only converted from one form to another. In this case, the system demonstrates how kinetic energy relates to potential energy through the work-energy theorem.\n\nTo solve problems like this, focus on identifying all forms of energy present and tracking their transformations throughout the process.`,
      tokens_used: 324
    }
  };
  
  return response;
}
