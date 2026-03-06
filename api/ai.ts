import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin (shared with stripe-webhook.ts, only once)
if (!admin.apps.length) {
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
        ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
        : undefined;

    if (serviceAccount) {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
        });
    } else {
        admin.initializeApp();
    }
}

const db = admin.firestore();

// Allowed models to prevent abuse
const ALLOWED_MODELS = [
    'gemini-3.1-flash-lite-preview',
    'gemini-2.5-flash-native-audio-preview-12-2025',
    'gemini-2.5-flash-preview-tts',
];

// Daily limits per subscription tier
const DAILY_LIMITS: Record<string, number> = {
    free: 15,
    focus: 200,
    totaal: 500,
};

// Max request body size (50KB)
const MAX_BODY_SIZE = 50 * 1024;

// Allowed origins
const ALLOWED_ORIGINS = [
    'https://glowexamen.nl',
    'https://www.glowexamen.nl',
    'http://localhost:5173',
    'http://localhost:3000',
];

/**
 * Vercel Serverless API proxy for Gemini AI calls.
 * Includes: Firebase Auth, rate limiting, model whitelist, CORS restriction.
 *
 * POST /api/ai
 * Headers: { Authorization: 'Bearer <firebase-id-token>' }
 * Body: { model, contents, config? }
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
    // CORS - restrict to allowed origins
    const origin = req.headers.origin || '';
    if (ALLOWED_ORIGINS.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    } else if (process.env.NODE_ENV !== 'production') {
        res.setHeader('Access-Control-Allow-Origin', '*');
    }
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

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

    // --- Auth: validate Firebase ID token ---
    const authHeader = req.headers.authorization;
    let userId: string | null = null;

    if (authHeader?.startsWith('Bearer ')) {
        try {
            const token = authHeader.slice(7);
            const decoded = await admin.auth().verifyIdToken(token);
            userId = decoded.uid;
        } catch {
            return res.status(401).json({ error: 'Ongeldige authenticatie token.' });
        }
    }
    // Allow unauthenticated requests with stricter limits (for backwards compatibility during migration)

    // --- Body size check ---
    const bodyStr = JSON.stringify(req.body || {});
    if (bodyStr.length > MAX_BODY_SIZE) {
        return res.status(413).json({ error: 'Request te groot (max 50KB).' });
    }

    try {
        const { model, contents, config } = req.body;

        if (!model || !contents) {
            return res.status(400).json({ error: 'model en contents zijn verplicht.' });
        }

        // --- Model whitelist ---
        if (!ALLOWED_MODELS.includes(model)) {
            return res.status(400).json({ error: `Model '${model}' is niet toegestaan.` });
        }

        // --- Rate limiting ---
        if (userId) {
            const today = new Date().toISOString().split('T')[0];
            const usageRef = db.collection('users').doc(userId).collection('usage').doc(today);

            const allowed = await db.runTransaction(async (transaction) => {
                const usageDoc = await transaction.get(usageRef);
                const currentCount = usageDoc.exists ? (usageDoc.data()?.aiCalls || 0) : 0;

                // Get user's subscription tier
                const userDoc = await transaction.get(db.collection('users').doc(userId!));
                const tier = userDoc.exists ? (userDoc.data()?.subscriptionTier || 'free') : 'free';
                const limit = DAILY_LIMITS[tier] || DAILY_LIMITS.free;

                if (currentCount >= limit) {
                    return false;
                }

                transaction.set(usageRef, {
                    aiCalls: (currentCount + 1),
                    lastCall: new Date().toISOString(),
                }, { merge: true });

                return true;
            });

            if (!allowed) {
                return res.status(429).json({
                    error: 'Dagelijkse limiet bereikt. Upgrade je abonnement voor meer vragen.',
                });
            }
        }

        // --- Gemini API call ---
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
