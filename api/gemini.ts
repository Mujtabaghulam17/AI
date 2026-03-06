import { GoogleGenAI } from "@google/genai";
import { auth } from './firebase';

/**
 * In production (Vercel), AI calls go through /api/ai to keep the API key server-side.
 * In development, the key is injected via Vite define (process.env.API_KEY).
 *
 * The `ai` instance is still exported for features that need the SDK directly
 * (e.g. OralPracticeModal's live audio sessions which use WebSocket).
 */
const clientApiKey = (() => {
    try { return process.env.API_KEY || ''; } catch { return ''; }
})();

export const ai = new GoogleGenAI({ apiKey: clientApiKey });

/**
 * Helper om JSON uit AI responses te halen, zelfs als er markdown omheen staat.
 */
export const cleanAndParseJSON = (text: string) => {
    try {
        if (!text) return null;
        let cleanText = text.replace(/```(?:json|JSON)?/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleanText);
    } catch {
        return null;
    }
};

/**
 * Get Firebase Auth ID token for authenticated API calls.
 */
const getAuthToken = async (): Promise<string | null> => {
    try {
        const user = auth?.currentUser;
        if (!user) return null;
        return await user.getIdToken();
    } catch {
        return null;
    }
};

/**
 * Determines whether to use the server proxy or the client SDK.
 * In production (no client API key), always proxy through /api/ai.
 */
const isProxyAvailable = (): boolean => {
    // If running on the deployed Vercel site (no client key baked in), use proxy
    if (!clientApiKey && typeof window !== 'undefined') return true;
    // If explicitly on a vercel/production domain, use proxy
    if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') return true;
    return false;
};

/**
 * Robuuste wrapper voor generateContent met retry logica en exponential backoff.
 * Routes through /api/ai server proxy in production to keep API key safe.
 * Includes Firebase Auth token for server-side rate limiting.
 */
export const generateContentWithRetry = async (params: any, retries = 3, delay = 1000) => {
    const useProxy = isProxyAvailable();

    // Default: disable thinking to speed up responses (callers can override)
    if (!params.config?.thinkingConfig) {
        params = {
            ...params,
            config: {
                ...params.config,
                thinkingConfig: { thinkingBudget: 0 },
            },
        };
    }
    for (let i = 0; i < retries; i++) {
        try {
            if (useProxy) {
                // Get auth token for rate limiting
                const token = await getAuthToken();
                const headers: Record<string, string> = {
                    'Content-Type': 'application/json',
                };
                if (token) {
                    headers['Authorization'] = `Bearer ${token}`;
                }

                // Server-side proxy call
                const response = await fetch('/api/ai', {
                    method: 'POST',
                    headers,
                    body: JSON.stringify({
                        model: params.model,
                        contents: params.contents,
                        config: params.config,
                    }),
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
                    const error: any = new Error(errorData.error || `HTTP ${response.status}`);
                    error.status = response.status;
                    throw error;
                }

                const data = await response.json();
                // Return a response-like object matching the SDK shape
                return {
                    text: data.text,
                    candidates: data.candidates,
                };
            } else {
                // Direct SDK call (development only)
                const response = await ai.models.generateContent(params);
                return response;
            }
        } catch (error: any) {
            const isLastAttempt = i === retries - 1;
            const isRateLimit = error.message?.includes('429') || error.status === 429;

            if (isRateLimit) {
                await new Promise(resolve => setTimeout(resolve, delay * 2 * Math.pow(2, i)));
                continue;
            }

            if (isLastAttempt) throw error;
            await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
        }
    }
    throw new Error("AI Request mislukt na meerdere pogingen.");
};
