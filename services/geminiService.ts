
import { GoogleGenAI, Type } from "@google/genai";

// Ensure AI client is initialized with a named parameter
const getAI = () => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is not configured");
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

// Generates an automated construction site progress analysis
export const analyzeSiteProgress = async (tasks: any[], materials: any[], team: any[], baselines: any) => {
  const ai = getAI();
  const prompt = `
    Analyze this construction site project for a floor screeding contractor.
    
    BASELINES: ${JSON.stringify(baselines)}
    CURRENT TASKS: ${JSON.stringify(tasks)}
    MATERIALS: ${JSON.stringify(materials)}
    TEAM: ${JSON.stringify(team)}
    
    CRITICAL OBJECTIVE: 
    Compare Current Progress vs Original Baselines.
    
    Provide a concise strategic report including:
    1. Schedule Variance: Are we behind the Target End Date? By how much?
    2. Budget Variance: Estimated current spend vs budget allocation.
    3. Adverse Situation Alert: Identify the single biggest risk (e.g. "Labour productivity too low to meet June deadline").
    4. Mitigation Strategy: 3 actions to realign with original budget/schedule.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 0 } // Disable thinking for faster low-latency reports
      }
    });
    // Correctly accessing .text property (not a method)
    return response.text;
  } catch (error) {
    console.error("AI Analysis Error:", error);
    return "Unable to generate AI report at this time. Please check your connection.";
  }
};

// Interactive chat interface for project strategy
export const chatWithSiteAssistant = async (message: string, context: any) => {
    const ai = getAI();
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `
                Current Context: ${JSON.stringify(context)}
                User Question: ${message}
            `,
            config: {
                systemInstruction: "You are 'ScreedFlow AI', an expert floor screeding construction assistant. Use provided context to answer project management queries accurately. Focus on budget adherence and schedule compliance."
            }
        });
        // Correctly accessing .text property
        return response.text;
    } catch (error) {
        console.error("Chat AI Error:", error);
        return "The AI assistant is temporarily unavailable.";
    }
}
