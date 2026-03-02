/**
 * Standalone Firestore Seed Script
 * 
 * Seeds all hardcoded exam questions into the Firestore `questions` collection.
 * Uses Firebase client SDK — no auth needed if rules allow public writes.
 * 
 * Usage: npx tsx scripts/seedFirestore.ts
 */

import dotenv from 'dotenv';
import path from 'path';

// Load .env and .env.local (like Vite does)
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local'), override: true });

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs, writeBatch, doc } from 'firebase/firestore';

// ─── Firebase config (from environment variables) ────────────────
const firebaseConfig = {
    apiKey: process.env.VITE_FIREBASE_API_KEY || process.env.FIREBASE_API_KEY,
    authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.VITE_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.VITE_FIREBASE_APP_ID || process.env.FIREBASE_APP_ID,
    measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID || process.env.FIREBASE_MEASUREMENT_ID,
};

if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
    console.error('❌ Missing Firebase config. Set VITE_FIREBASE_* or FIREBASE_* env vars (or add a .env file).');
    process.exit(1);
}

// ─── Initialize ──────────────────────────────────────────────────
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const COLLECTION_NAME = 'questions';

// ─── Question data imports ───────────────────────────────────────
import {
    dutchExamQuestions, englishExamQuestions, natuurkundeExamQuestions,
    biologieExamQuestions, economieExamQuestions, geschiedenisExamQuestions,
    scheikundeExamQuestions, bedrijfseconomieExamQuestions, wiskundeAExamQuestions,
    wiskundeBExamQuestions, fransExamQuestions, duitsExamQuestions,
} from '../data/data.ts';

function getHardcodedQuestions(subject: string) {
    switch (subject) {
        case 'Nederlands': return dutchExamQuestions;
        case 'Engels': return englishExamQuestions;
        case 'Natuurkunde': return natuurkundeExamQuestions;
        case 'Biologie': return biologieExamQuestions;
        case 'Economie': return economieExamQuestions;
        case 'Geschiedenis': return geschiedenisExamQuestions;
        case 'Scheikunde': return scheikundeExamQuestions;
        case 'Bedrijfseconomie': return bedrijfseconomieExamQuestions;
        case 'Wiskunde A': return wiskundeAExamQuestions;
        case 'Wiskunde B': return wiskundeBExamQuestions;
        case 'Frans': return fransExamQuestions;
        case 'Duits': return duitsExamQuestions;
        default: return [];
    }
}

function parseExamenId(examenId: string) {
    const parts = examenId.split('_');
    return {
        level: parts[0]?.toLowerCase() || 'vwo',
        subject: parts[1] || '',
        jaar: parseInt(parts[2] || '0'),
        tijdvak: parts[3] || 'T1',
    };
}

const ALL_SUBJECTS = [
    'Nederlands', 'Engels', 'Natuurkunde', 'Biologie', 'Economie',
    'Geschiedenis', 'Scheikunde', 'Bedrijfseconomie', 'Wiskunde A',
    'Wiskunde B', 'Frans', 'Duits'
];

// ─── Seed function (handles batches of max 500) ──────────────────
async function seedSubject(subject: string): Promise<number> {
    const questions = getHardcodedQuestions(subject);
    if (questions.length === 0) return 0;

    // Check existing
    let existingIds = new Set<number>();
    try {
        const existing = await getDocs(
            query(collection(db, COLLECTION_NAME), where('subject', '==', subject))
        );
        existingIds = new Set(existing.docs.map(d => d.data().id));
    } catch (e) {
        // Collection may not exist yet — that's fine
    }

    // Filter to new questions only
    const newQuestions = questions.filter(q => !existingIds.has(q.id));
    if (newQuestions.length === 0) return 0;

    // Firestore batches are limited to 500 operations
    const BATCH_SIZE = 450;
    let count = 0;

    for (let i = 0; i < newQuestions.length; i += BATCH_SIZE) {
        const batch = writeBatch(db);
        const chunk = newQuestions.slice(i, i + BATCH_SIZE);

        for (const q of chunk) {
            const parsed = parseExamenId(q.examen_id);
            const docRef = doc(collection(db, COLLECTION_NAME));

            batch.set(docRef, {
                ...q,
                subject,
                level: parsed.level,
                jaar: parsed.jaar,
                tijdvak: parsed.tijdvak,
                source: 'official',
            });
            count++;
        }

        await batch.commit();
        if (newQuestions.length > BATCH_SIZE) {
            console.log(`    batch ${Math.floor(i / BATCH_SIZE) + 1} committed (${chunk.length} docs)`);
        }
    }

    return count;
}

// ─── Main ────────────────────────────────────────────────────────
async function main() {
    console.log('📊 No auth required — using public write rules.');
    console.log(`\n🌱 Seeding ${ALL_SUBJECTS.length} subjects...\n`);

    let totalSeeded = 0;
    let totalExisting = 0;

    for (const subject of ALL_SUBJECTS) {
        try {
            const total = getHardcodedQuestions(subject).length;
            const count = await seedSubject(subject);
            const emoji = count > 0 ? '✅' : '⏭️ ';
            console.log(`  ${emoji} ${subject}: ${count} new / ${total} total`);
            totalSeeded += count;
            totalExisting += (total - count);
        } catch (e: any) {
            console.error(`  ❌ ${subject}: ${e.message}`);
        }
    }

    console.log(`\n🎉 Done! Seeded ${totalSeeded} new questions (${totalExisting} already existed).`);
    process.exit(0);
}

main();
