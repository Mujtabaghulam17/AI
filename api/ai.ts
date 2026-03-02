import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';

/**
 * Vercel Serverless API proxy for Gemini AI calls.
 * The API key stays server-side and is never exposed to the browser.
 *
 * POST /api/ai
 * Body: { model, contents, config? }
 * Returns: { text, candidates? }
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const apiKey = process.env.API_KEY;
    if (!apiKey) {
        return res.status(500).json({ error: 'API_KEY niet geconfigureerd op de server.' });
    }

    try {
        const { model, contents, config } = req.body;

        if (!model || !contents) {
            return res.status(400).json({ error: 'model en contents zijn verplicht.' });
        }

        const ai = new GoogleGenAI({ apiKey });
        const response = await ai.models.generateContent({
            model,
            contents,
            config,
        });

        return res.status(200).json({
            text: response.text || '',
            candidates: response.candidates || [],
        });
    } catch (error: any) {
        const status = error.status || error.httpStatusCode || 500;
        const message = error.message || 'AI request mislukt.';
        return res.status(status >= 400 && status < 600 ? status : 500).json({ error: message });
    }
}
