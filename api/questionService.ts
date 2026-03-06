import { collection, getDocs, query, where, writeBatch, doc, addDoc, limit as firestoreLimit } from 'firebase/firestore';
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
const AI_COLLECTION_NAME = 'generated_questions';
const memoryCache = new Map<string, Question[]>();

// ─── Core API ───────────────────────────────────────────────────────────────

/**
 * Get questions for a subject + level combo.
 * Merges hardcoded + official Firestore + AI-generated Firestore questions.
 * Priority: memory cache → localStorage cache → Firestore + AI → hardcoded fallback
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

    // Start with hardcoded questions as base
    const hardcoded = getHardcodedQuestions(subject);
    const allQuestions = new Map<number | string, Question>();

    // Add hardcoded questions
    hardcoded.forEach(q => allQuestions.set(q.id, q));

    // 3. Firestore official questions
    try {
        if (!db) throw new Error('Firestore not initialized');

        const q = query(
            collection(db, COLLECTION_NAME),
            where('subject', '==', subject),
            where('level', '==', level)
        );
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
            snapshot.docs.forEach(docSnap => {
                const data = docSnap.data();
                const question: Question = {
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
                allQuestions.set(question.id, question);
            });
        }
    } catch (error) {
        console.warn(`[QuestionService] Official Firestore fetch failed for ${cacheKey}:`, error);
    }

    // 4. Firestore AI-generated questions
    try {
        if (db) {
            const aiQ = query(
                collection(db, AI_COLLECTION_NAME),
                where('subject', '==', subject),
                where('level', '==', level),
                where('approved', '==', true)
            );
            const aiSnapshot = await getDocs(aiQ);

            if (!aiSnapshot.empty) {
                aiSnapshot.docs.forEach(docSnap => {
                    const data = docSnap.data();
                    const question: Question = {
                        id: data.id ?? `ai_${docSnap.id}`,
                        examen_id: data.examen_id || `AI_${subject}_${level}`,
                        vraag_nummer: data.vraag_nummer || 0,
                        tekst_naam: data.tekst_naam || '',
                        vraag_passage: data.vraag_passage,
                        vraag_tekst: data.vraag_tekst,
                        vraag_type: data.vraag_type || 'open',
                        kern_vaardigheid: data.kern_vaardigheid,
                        max_score: data.max_score || 3,
                        correctie_model: data.correctie_model || '',
                        difficulty: data.difficulty || 2,
                        context_id: data.context_id,
                        options: data.options,
                        correct_option: data.correct_option,
                    } as Question;
                    allQuestions.set(question.id, question);
                });
            }
        }
    } catch (error) {
        console.warn(`[QuestionService] AI questions fetch failed for ${cacheKey}:`, error);
    }

    const merged = Array.from(allQuestions.values());

    // Cache the merged results
    memoryCache.set(cacheKey, merged);
    try {
        localStorage.setItem(`questions_${cacheKey}`, JSON.stringify({
            data: merged,
            timestamp: Date.now(),
        } as CacheEntry));
    } catch {
        // localStorage full or unavailable — no-op
    }

    return merged;
}

// ─── AI Question Saving ─────────────────────────────────────────────────────

let nextAiQuestionId = Date.now();

/**
 * Save an AI-generated question to Firestore for reuse by other students.
 * Questions are saved with approved=true since they've been AI-generated with our prompts.
 * Returns the assigned question ID.
 */
export async function saveGeneratedQuestion(
    question: Partial<Question>,
    subject: string,
    level: string,
    skill: string
): Promise<number | string> {
    const questionId = nextAiQuestionId++;

    const questionDoc = {
        id: questionId,
        examen_id: `AI_${level.toUpperCase()}_${subject}_${new Date().getFullYear()}`,
        vraag_nummer: 0,
        tekst_naam: '',
        vraag_passage: question.vraag_passage || '',
        vraag_tekst: question.vraag_tekst || '',
        vraag_type: question.vraag_type || 'open',
        kern_vaardigheid: skill,
        max_score: question.max_score || 3,
        correctie_model: question.correctie_model || '',
        difficulty: question.difficulty || 2,
        options: question.options || [],
        correct_option: question.correct_option || '',
        // Metadata
        subject,
        level: level.toLowerCase(),
        source: 'ai_generated' as const,
        approved: true,
        createdAt: Date.now(),
    };

    try {
        if (!db) throw new Error('Firestore not initialized');
        await addDoc(collection(db, AI_COLLECTION_NAME), questionDoc);

        // Invalidate cache so next load includes the new question
        invalidateQuestionCache(subject, level.toLowerCase());

        console.log(`[QuestionService] Saved AI question ${questionId} for ${subject}/${level}/${skill}`);
    } catch (error) {
        console.warn('[QuestionService] Failed to save AI question to Firestore:', error);
        // Continue anyway — the question still works locally
    }

    return questionId;
}

/**
 * Save multiple AI-generated questions at once (batch write).
 */
export async function saveGeneratedQuestionsBatch(
    questions: Array<{ question: Partial<Question>; subject: string; level: string; skill: string }>
): Promise<number[]> {
    const ids: number[] = [];

    if (!db) {
        console.warn('[QuestionService] Firestore not initialized, skipping batch save');
        return ids;
    }

    try {
        const batch = writeBatch(db);
        for (const { question, subject, level, skill } of questions) {
            const questionId = nextAiQuestionId++;
            ids.push(questionId);

            const docRef = doc(collection(db, AI_COLLECTION_NAME));
            batch.set(docRef, {
                id: questionId,
                examen_id: `AI_${level.toUpperCase()}_${subject}_${new Date().getFullYear()}`,
                vraag_nummer: 0,
                tekst_naam: '',
                vraag_passage: question.vraag_passage || '',
                vraag_tekst: question.vraag_tekst || '',
                vraag_type: question.vraag_type || 'open',
                kern_vaardigheid: skill,
                max_score: question.max_score || 3,
                correctie_model: question.correctie_model || '',
                difficulty: question.difficulty || 2,
                options: question.options || [],
                correct_option: question.correct_option || '',
                subject,
                level: level.toLowerCase(),
                source: 'ai_generated' as const,
                approved: true,
                createdAt: Date.now(),
            });
        }

        await batch.commit();
        console.log(`[QuestionService] Batch saved ${ids.length} AI questions`);

        // Invalidate relevant caches
        const subjects = new Set(questions.map(q => q.subject));
        const levels = new Set(questions.map(q => q.level.toLowerCase()));
        subjects.forEach(s => levels.forEach(l => invalidateQuestionCache(s, l)));
    } catch (error) {
        console.warn('[QuestionService] Batch save failed:', error);
    }

    return ids;
}

/**
 * Get count of available questions for a subject/level (without full load).
 */
export async function getQuestionCount(subject: string, level: string): Promise<number> {
    const questions = await getQuestions(subject, level);
    return questions.length;
}

// ─── Cache Management ───────────────────────────────────────────────────────

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
