
import { Question, GradeRequest, GradeResponse, DoubtsResponse, Doubt, AIModelResponse, Message } from "../types";
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
    
    // Only use mock data if explicitly in development mode and API is unavailable
    if (process.env.NODE_ENV === 'development') {
      console.log("Using mock grading response for development");
      toast({
        title: "Using mock grades",
        description: "Could not connect to grading API. Using mock data instead.",
        variant: "destructive" // Change to destructive to make it more noticeable
      });
      
      return getMockGradingResponse(gradeRequest);
    }
    
    throw error;
  }
};

// Updated function to submit a doubt with context support for chat
export const solveDoubt = async (doubt: Doubt): Promise<DoubtsResponse> => {
  try {
    console.log("Sending doubt to API:", doubt);
    
    const response = await fetch(`${API_BASE_URL}/solve_doubt`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(doubt)
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
    
    // Only use mock data if explicitly in development mode and API is unavailable
    if (process.env.NODE_ENV === 'development') {
      console.log("Using mock doubt response for development");
      toast({
        title: "Using mock AI response",
        description: "Could not connect to doubts API. Using mock data instead.",
        variant: "destructive" // Change to destructive to make it more noticeable
      });
      
      return getMockDoubtsResponse(doubt);
    }
    
    throw error;
  }
};

// Helper to generate mock grading response for development - with improved accuracy
function getMockGradingResponse(request: GradeRequest): GradeResponse {
  return {
    evaluations: request.questions.map(q => {
      // More realistic evaluation based on question number
      const questionNum = parseInt(q.question_number.replace(/\D/g, '')) || 0;
      const isCorrect = q.student_answer.toLowerCase().includes('correct') || 
                       (questionNum % 3 !== 0); // More realistic distribution
      
      return {
        question_number: q.question_number,
        section: q.section,
        marks_awarded: isCorrect ? 1 : 0,
        total_marks: 1,
        missing_or_wrong: isCorrect ? [] : ["Answer does not match expected solution"],
        final_feedback: isCorrect ? "Correct answer" : "Your response is incomplete or incorrect",
        mistake: isCorrect ? [] : ["Answer does not match expected solution"],
        correct_answer: isCorrect ? undefined : ["The correct answer should include the key concepts"],
        mistake_type: isCorrect ? [] : ["conceptual"]
      };
    })
  };
}

// Helper to generate mock doubt response for development with chat support
function getMockDoubtsResponse(doubt: Doubt): DoubtsResponse {
  const contextLength = doubt.context?.length || 0;
  const followUp = contextLength > 0;
  
  return {
    response: {
      model: followUp ? "deepseek-r1-llama-170b" : "deepseek-r1-distill-llama-70b",
      answer: followUp 
        ? `<think>\nAnalyzing the follow-up question about ${doubt.prompt} with the previous context. Let me provide a more detailed response that builds on our conversation.\n</think>\n\nBuilding on our previous discussion, I can provide more detail about ${doubt.prompt}. When we dig deeper into this physics concept, we find that it's connected to several fundamental principles.\n\nTo fully understand this, consider how energy and momentum are conserved in the system. The relationship can be expressed mathematically as E = mc² in relativistic cases, but in classical mechanics we typically work with E = ½mv² + mgh for mechanical energy.\n\nDoes this clarify your question? I'd be happy to elaborate further on any specific aspect.`
        : `<think>\nAnalyzing the question about ${doubt.prompt}. This appears to be related to physics concepts. Let me consider the fundamental principles involved and structure a clear explanation.\n</think>\n\nThe question about ${doubt.prompt} can be explained by considering the conservation of energy principle. When we analyze this situation, we need to account for all energy transfers and transformations.\n\nFirst, we recognize that energy cannot be created or destroyed, only converted from one form to another. In this case, the system demonstrates how kinetic energy relates to potential energy through the work-energy theorem.\n\nTo solve problems like this, focus on identifying all forms of energy present and tracking their transformations throughout the process.`,
      tokens_used: 324
    }
  };
}

// Function to save chat history to local storage
export const saveChatHistory = (chatHistory: ChatHistory): void => {
  try {
    const existingChatsString = localStorage.getItem('chatHistories');
    const existingChats: ChatHistory[] = existingChatsString ? JSON.parse(existingChatsString) : [];
    
    // Check if chat with this ID already exists
    const chatIndex = existingChats.findIndex(chat => chat.id === chatHistory.id);
    
    if (chatIndex >= 0) {
      // Update existing chat
      existingChats[chatIndex] = chatHistory;
    } else {
      // Add new chat
      existingChats.push(chatHistory);
    }
    
    localStorage.setItem('chatHistories', JSON.stringify(existingChats));
  } catch (error) {
    console.error("Failed to save chat history:", error);
  }
};

// Function to get all chat histories from local storage
export const getChatHistories = (): ChatHistory[] => {
  try {
    const chatsString = localStorage.getItem('chatHistories');
    return chatsString ? JSON.parse(chatsString) : [];
  } catch (error) {
    console.error("Failed to get chat histories:", error);
    return [];
  }
};

// Function to get a specific chat history by ID
export const getChatHistoryById = (id: string): ChatHistory | undefined => {
  try {
    const chats = getChatHistories();
    return chats.find(chat => chat.id === id);
  } catch (error) {
    console.error("Failed to get chat history:", error);
    return undefined;
  }
};

// Function to delete a chat history
export const deleteChatHistory = (id: string): void => {
  try {
    const chats = getChatHistories();
    const filteredChats = chats.filter(chat => chat.id !== id);
    localStorage.setItem('chatHistories', JSON.stringify(filteredChats));
  } catch (error) {
    console.error("Failed to delete chat history:", error);
  }
};
