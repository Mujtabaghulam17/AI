import { collection, getDocs, query, where, writeBatch, doc } from 'firebase/firestore';
import { db } from './firebase.ts';
import type { Question } from '../data/data.ts';
import { getHardcodedQuestions } from '../data/questionHelper.ts';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface FirestoreQuestion extends Question {
    firestoreId?: string;
    subject: string;
    level: string;
    jaar: number;
    tijdvak: number;
    source: 'official' | 'ai_generated';
}

interface CacheEntry {
    data: Question[];
    timestamp: number;
}

// ─── Constants ──────────────────────────────────────────────────────────────

const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const COLLECTION_NAME = 'questions';
const memoryCache = new Map<string, Question[]>();

// ─── Core API ───────────────────────────────────────────────────────────────

/**
 * Get questions for a subject + level combo.
 * Priority: memory cache → localStorage cache → Firestore → hardcoded fallback
 */
export async function getQuestions(subject: string, level: string = 'vwo'): Promise<Question[]> {
    const cacheKey = `${subject}_${level}`;

    // 1. Memory cache (instant)
    if (memoryCache.has(cacheKey)) {
        return memoryCache.get(cacheKey)!;
    }

    // 2. localStorage cache (fast, survives page reloads)
    try {
        const stored = localStorage.getItem(`questions_${cacheKey}`);
        if (stored) {
            const entry: CacheEntry = JSON.parse(stored);
            if (Date.now() - entry.timestamp < CACHE_TTL_MS) {
                memoryCache.set(cacheKey, entry.data);
                return entry.data;
            }
        }
    } catch {
        // localStorage unavailable or corrupted — continue
    }

    // 3. Firestore
    try {
        if (!db) throw new Error('Firestore not initialized');

        const q = query(
            collection(db, COLLECTION_NAME),
            where('subject', '==', subject),
            where('level', '==', level)
        );
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
            const questions: Question[] = snapshot.docs.map(docSnap => {
                const data = docSnap.data();
                return {
                    id: data.id ?? docSnap.id,
                    examen_id: data.examen_id,
                    vraag_nummer: data.vraag_nummer,
                    tekst_naam: data.tekst_naam,
                    vraag_passage: data.vraag_passage,
                    vraag_tekst: data.vraag_tekst,
                    vraag_type: data.vraag_type,
                    kern_vaardigheid: data.kern_vaardigheid,
                    max_score: data.max_score,
                    correctie_model: data.correctie_model,
                    difficulty: data.difficulty,
                    context_id: data.context_id,
                    options: data.options,
                    correct_option: data.correct_option,
                } as Question;
            });

            // Cache the results
            memoryCache.set(cacheKey, questions);
            try {
                localStorage.setItem(`questions_${cacheKey}`, JSON.stringify({
                    data: questions,
                    timestamp: Date.now(),
                } as CacheEntry));
            } catch {
                // localStorage full or unavailable — no-op
            }

            return questions;
        }
    } catch (error) {
        console.warn(`[QuestionService] Firestore fetch failed for ${cacheKey}, falling back to hardcoded:`, error);
    }

    // 4. Hardcoded fallback (always works, offline-safe)
    const fallback = getHardcodedQuestions(subject);
    memoryCache.set(cacheKey, fallback);
    return fallback;
}

/**
 * Invalidate the cache for a specific subject + level (or all).
 */
export function invalidateQuestionCache(subject?: string, level?: string): void {
    if (subject && level) {
        const key = `${subject}_${level}`;
        memoryCache.delete(key);
        try { localStorage.removeItem(`questions_${key}`); } catch { }
    } else {
        memoryCache.clear();
        try {
            const keys = Object.keys(localStorage);
            keys.forEach(k => {
                if (k.startsWith('questions_')) localStorage.removeItem(k);
            });
        } catch { }
    }
}

// ─── Seeding ────────────────────────────────────────────────────────────────

/**
 * Parse subject & metadata from examen_id like "VWO_Nederlands_2023_T1"
 */
function parseExamenId(examenId: string): { level: string; subject: string; jaar: number; tijdvak: number } {
    const parts = examenId.split('_');
    // Format: LEVEL_Subject_YEAR_TXXX or LEVEL_Subject Subject_YEAR_TXXX
    const level = (parts[0] || 'vwo').toLowerCase();
    const jaar = parseInt(parts[parts.length - 2]) || 2023;
    const tijdvakStr = parts[parts.length - 1] || 'T1';
    const tijdvak = parseInt(tijdvakStr.replace('T', '')) || 1;

    // Subject is everything between level and year
    const subjectParts = parts.slice(1, parts.length - 2);
    const subject = subjectParts.join(' ');

    return { level, subject, jaar, tijdvak };
}

/**
 * Seed hardcoded questions into Firestore.
 * Safe to call multiple times — checks for existing documents by original ID.
 * Returns the number of questions written.
 */
export async function seedQuestionsToFirestore(
    subject: string,
    displaySubject: string
): Promise<number> {
    if (!db) throw new Error('Firestore not initialized');

    const questions = getHardcodedQuestions(displaySubject);
    if (questions.length === 0) return 0;

    // Check what's already seeded
    const existing = await getDocs(
        query(collection(db, COLLECTION_NAME), where('subject', '==', displaySubject))
    );
    const existingIds = new Set(existing.docs.map(d => d.data().id));

    const batch = writeBatch(db);
    let count = 0;

    for (const q of questions) {
        if (existingIds.has(q.id)) continue; // Skip duplicates

        const parsed = parseExamenId(q.examen_id);
        const docRef = doc(collection(db, COLLECTION_NAME));

        batch.set(docRef, {
            ...q,
            subject: displaySubject,
            level: parsed.level,
            jaar: parsed.jaar,
            tijdvak: parsed.tijdvak,
            source: 'official' as const,
        });
        count++;
    }

    if (count > 0) {
        await batch.commit();
    }

    return count;
}

/**
 * Seed ALL subjects at once. Useful for initial setup.
 */
export async function seedAllQuestions(): Promise<{ [subject: string]: number }> {
    const subjects = [
        'Nederlands', 'Engels', 'Natuurkunde', 'Biologie', 'Economie',
        'Geschiedenis', 'Scheikunde', 'Bedrijfseconomie', 'Wiskunde A',
        'Wiskunde B', 'Frans', 'Duits'
    ];

    const results: { [subject: string]: number } = {};

    for (const subject of subjects) {
        try {
            results[subject] = await seedQuestionsToFirestore(subject, subject);
        } catch (error) {
            console.error(`[Seed] Failed for ${subject}:`, error);
            results[subject] = -1;
        }
    }

    return results;
}
