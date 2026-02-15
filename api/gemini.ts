import { GoogleGenAI } from "@google/genai";

// De API key wordt exclusief uit process.env.API_KEY gehaald.
// De build tool (Vite) zorgt dat deze beschikbaar is in de browser context.
export const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Helper om JSON uit AI responses te halen, zelfs als er markdown omheen staat.
 */
export const cleanAndParseJSON = (text: string) => {
    try {
        if (!text) return null;
        // Verwijder markdown code blocks indien aanwezig
        let cleanText = text.replace(/```(?:json|JSON)?/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleanText);
    } catch (e) {
        console.error("JSON Parsing mislukt:", text);
        return null;
    }
};

/**
 * Robuuste wrapper voor generateContent met retry logica en exponential backoff.
 */
export const generateContentWithRetry = async (params: any, retries = 3, delay = 1000) => {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await ai.models.generateContent(params);
            return response;
        } catch (error: any) {
            const isLastAttempt = i === retries - 1;
            const isRateLimit = error.message?.includes('429') || error.status === 429;
            
            if (isRateLimit) {
                 // Langere wachtrij bij rate limits
                 await new Promise(resolve => setTimeout(resolve, delay * 2 * Math.pow(2, i)));
                 continue;
            }

            if (isLastAttempt) throw error;
            await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
        }
    }
    throw new Error("AI Request mislukt na meerdere pogingen.");
};
