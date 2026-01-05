
import { GoogleGenAI, Type } from "@google/genai";

const getAI = () => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is not configured");
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const analyzeSiteProgress = async (tasks: any[], materials: any[], team: any[]) => {
  const ai = getAI();
  const prompt = `
    Analyze this construction site data for a floor screeding project.
    TASKS: ${JSON.stringify(tasks)}
    MATERIALS: ${JSON.stringify(materials)}
    TEAM: ${JSON.stringify(team)}
    
    Provide a concise status report including:
    1. Overall progress summary.
    2. Any critical bottlenecks (delayed tasks or low materials).
    3. Resource optimization suggestions.
    4. Next 3 priority actions for the Project Manager.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 0 }
      }
    });
    return response.text;
  } catch (error) {
    console.error("AI Error:", error);
    return "Unable to generate AI report at this time. Please check your connection.";
  }
};

export const chatWithSiteAssistant = async (message: string, context: any) => {
    const ai = getAI();
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `
            You are "ScreedFlow AI", an expert construction project assistant for floor screeding.
            Current Project Context: ${JSON.stringify(context)}
            User Question: ${message}
        `,
        config: {
            systemInstruction: "You help floor screeding contractors manage their site. Give practical, technical, and data-driven advice based on the provided project context."
        }
    });
    return response.text;
}
