import type { Question } from '../data/data.ts';
import {
    dutchExamQuestions, englishExamQuestions, natuurkundeExamQuestions,
    biologieExamQuestions, economieExamQuestions, geschiedenisExamQuestions,
    scheikundeExamQuestions, bedrijfseconomieExamQuestions, wiskundeAExamQuestions,
    wiskundeBExamQuestions, fransExamQuestions, duitsExamQuestions,
    FREE_QUESTION_IDS_NL, FREE_QUESTION_IDS_EN, FREE_QUESTION_IDS_NK,
    FREE_QUESTION_IDS_BIO, FREE_QUESTION_IDS_ECO, FREE_QUESTION_IDS_GS,
    FREE_QUESTION_IDS_SK, FREE_QUESTION_IDS_BECO, FREE_QUESTION_IDS_WISA,
    FREE_QUESTION_IDS_WISB, FREE_QUESTION_IDS_FR, FREE_QUESTION_IDS_DE,
} from '../data/data.ts';

/**
 * Returns the hardcoded question set for a given subject.
 * Used as offline fallback when Firestore is unavailable.
 */
export function getHardcodedQuestions(subject: string): Question[] {
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

/**
 * Returns the free (non-premium) question IDs for a given subject.
 */
export function getFreeQuestionIds(subject: string): number[] {
    switch (subject) {
        case 'Nederlands': return FREE_QUESTION_IDS_NL;
        case 'Engels': return FREE_QUESTION_IDS_EN;
        case 'Natuurkunde': return FREE_QUESTION_IDS_NK;
        case 'Biologie': return FREE_QUESTION_IDS_BIO;
        case 'Economie': return FREE_QUESTION_IDS_ECO;
        case 'Geschiedenis': return FREE_QUESTION_IDS_GS;
        case 'Scheikunde': return FREE_QUESTION_IDS_SK;
        case 'Bedrijfseconomie': return FREE_QUESTION_IDS_BECO;
        case 'Wiskunde A': return FREE_QUESTION_IDS_WISA;
        case 'Wiskunde B': return FREE_QUESTION_IDS_WISB;
        case 'Frans': return FREE_QUESTION_IDS_FR;
        case 'Duits': return FREE_QUESTION_IDS_DE;
        default: return [];
    }
}

/**
 * All supported subjects.
 */
export const ALL_SUBJECTS = [
    'Nederlands', 'Engels', 'Natuurkunde', 'Biologie', 'Economie',
    'Geschiedenis', 'Scheikunde', 'Bedrijfseconomie', 'Wiskunde A',
    'Wiskunde B', 'Frans', 'Duits'
] as const;
