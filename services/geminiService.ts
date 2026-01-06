
import { GoogleGenAI } from "@google/genai";

// Standardizing initialization to follow "Create a new instance right before making an API call" guidance
// and strictly using process.env.API_KEY as per guidelines.
const getAIClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const analyzeSiteProgress = async (tasks: any[], materials: any[], team: any[], baselines: any) => {
  const ai = getAIClient();
  const prompt = `
    Analyze this construction site project for a floor screeding contractor.
    
    BASELINES: ${JSON.stringify(baselines)}
    CURRENT TASKS: ${JSON.stringify(tasks)}
    MATERIALS: ${JSON.stringify(materials)}
    TEAM: ${JSON.stringify(team)}
    
    Compare Current Progress vs Original Baselines.
    Provide a concise report on Schedule Variance, Budget Variance, Biggest Risk, and Mitigation Strategy.
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
    console.error("AI Insight Error:", error);
    return "AI Insight Error.";
  }
};

export const analyzePortfolioRisks = async (projects: any[], allTasks: any[], allTeam: any[]) => {
  const ai = getAIClient();
  const prompt = `
    Analyze the entire ScreedFlow Pro screeding portfolio. 
    PROJECTS: ${JSON.stringify(projects)}
    ALL TASKS: ${JSON.stringify(allTasks)}
    ALL TEAM: ${JSON.stringify(allTeam)}
    
    OBJECTIVE: 
    1. Identify which project is at highest risk of missing its baseline completion date.
    2. Suggest if crew should be moved between projects (e.g. from a completed site to a delayed one).
    3. Alert on any global resource bottlenecks (e.g. "Only 1 mixer available for 3 active sites").
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
    console.error("Portfolio analysis error:", error);
    return "Portfolio analysis error.";
  }
};

export const chatWithSiteAssistant = async (message: string, context: any) => {
    const ai = getAIClient();
    try {
        // Using chat interface as per guidelines for a natural conversational experience
        const chat = ai.chats.create({
            model: 'gemini-3-flash-preview',
            config: {
                systemInstruction: "You are 'ScreedFlow Pro AI Portfolio Assistant'. You manage multiple floor screeding sites and teams for a major contracting company. Suggest intelligent resource movements and budget realignments across the whole company."
            }
        });
        const response = await chat.sendMessage({ message: `Context: ${JSON.stringify(context)}. User: ${message}` });
        return response.text;
    } catch (error) {
        console.error("Assistant unavailable:", error);
        return "Assistant unavailable.";
    }
}
