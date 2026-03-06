import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';

// ─── Firebase Admin (optional – graceful if not configured) ─────────────────

let firebaseAdmin: any = null;
let adminDb: any = null;
let adminAuth: any = null;
let adminInitError: string | null = null;

try {
    firebaseAdmin = require('firebase-admin');

    if (!firebaseAdmin.apps.length) {
        const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
        if (serviceAccountJson) {
            const serviceAccount = JSON.parse(serviceAccountJson);
            firebaseAdmin.initializeApp({
                credential: firebaseAdmin.credential.cert(serviceAccount),
            });
            adminDb = firebaseAdmin.firestore();
            adminAuth = firebaseAdmin.auth();
        } else {
            adminInitError = 'FIREBASE_SERVICE_ACCOUNT_KEY not set';
        }
    } else {
        adminDb = firebaseAdmin.firestore();
        adminAuth = firebaseAdmin.auth();
    }
} catch (err: any) {
    adminInitError = err.message || 'Firebase Admin init failed';
}

if (adminInitError) {
    console.warn(`[api/ai] Firebase Admin unavailable: ${adminInitError}. Auth & rate limiting disabled.`);
}

// ─── Config ─────────────────────────────────────────────────────────────────

const ALLOWED_MODELS = [
    'gemini-3.1-flash-lite-preview',
    'gemini-2.5-flash-native-audio-preview-12-2025',
    'gemini-2.5-flash-preview-tts',
];

const DAILY_LIMITS: Record<string, number> = {
    free: 15,
    focus: 200,
    totaal: 500,
};

const MAX_BODY_SIZE = 50 * 1024; // 50KB

const ALLOWED_ORIGINS = [
    'https://glowexamen.nl',
    'https://www.glowexamen.nl',
    'http://localhost:5173',
    'http://localhost:3000',
];

// ─── Handler ────────────────────────────────────────────────────────────────

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // CORS
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

    // --- Auth: validate Firebase ID token (only if Admin SDK is available) ---
    let userId: string | null = null;

    if (adminAuth) {
        const authHeader = req.headers.authorization;
        if (authHeader?.startsWith('Bearer ')) {
            try {
                const token = authHeader.slice(7);
                const decoded = await adminAuth.verifyIdToken(token);
                userId = decoded.uid;
            } catch {
                // Token invalid — continue as unauthenticated
            }
        }
    }

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

        // --- Rate limiting (only if Firebase Admin is available + user is authenticated) ---
        if (adminDb && userId) {
            try {
                const today = new Date().toISOString().split('T')[0];
                const usageRef = adminDb.collection('users').doc(userId).collection('usage').doc(today);

                const allowed = await adminDb.runTransaction(async (transaction: any) => {
                    const usageDoc = await transaction.get(usageRef);
                    const currentCount = usageDoc.exists ? (usageDoc.data()?.aiCalls || 0) : 0;

                    const userDoc = await transaction.get(adminDb.collection('users').doc(userId));
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
            } catch (rateLimitError: any) {
                // Rate limiting failed — let the request through
                console.warn('[api/ai] Rate limiting check failed:', rateLimitError.message);
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
        console.error('[api/ai] Error:', error.message || error);
        const status = error.status || error.httpStatusCode || 500;
        const message = error.message || 'AI request mislukt.';
        return res.status(status >= 400 && status < 600 ? status : 500).json({ error: message });
    }
}
