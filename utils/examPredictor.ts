/**
 * Examen Voorspellingsalgoritme
 *
 * Berekent per domein de kans dat het op het eerstvolgende CE verschijnt,
 * gecombineerd met de mastery-score van de student voor gepersonaliseerde aanbevelingen.
 */

import { getExamHistory, getAverageDomainDistribution, type ExamHistoryEntry } from '../data/examHistory';
import { getCEDomains, type ExamDomain } from '../data/examInfo';

export interface DomainPrediction {
    code: string;
    title: string;
    /** Voorspelde kans (0-100) dat dit domein op het examen komt */
    predictedChance: number;
    /** Student's mastery score voor dit domein (0-100), null als geen data */
    studentMastery: number | null;
    /** Readiness score (0-100): combinatie van kans × mastery */
    readinessScore: number;
    /** Prioriteit: 'critical' | 'attention' | 'good' | 'low' */
    priority: 'critical' | 'attention' | 'good' | 'low';
    /** Gemiddeld aantal vragen per examen */
    avgQuestionCount: number;
    /** Gemiddelde maximale score per examen */
    avgMaxScore: number;
    /** Vraagtypes die voorkomen */
    questionTypes: string[];
    /** Jaren sinds laatste verschijning (0 = afgelopen jaar) */
    yearsSinceLastAppearance: number;
    /** Aanbeveling tekst */
    recommendation: string;
}

export interface ExamPredictionResult {
    subject: string;
    level: string;
    predictions: DomainPrediction[];
    /** Algehele exam readiness (0-100) */
    overallReadiness: number;
    /** Hoeveel historische examens geanalyseerd */
    examsAnalyzed: number;
    /** Beschikbare jaren */
    yearsAnalyzed: number[];
}

/**
 * Bereken domein-voorspellingen op basis van historische patronen.
 */
export function predictDomainWeights(
    subject: string,
    level: string = 'VWO'
): Map<string, { chance: number; avgQuestions: number; avgScore: number; questionTypes: string[]; yearsSinceLast: number }> {
    const history = getExamHistory(subject, level);
    const distribution = getAverageDomainDistribution(subject, level);
    const weights = new Map<string, { chance: number; avgQuestions: number; avgScore: number; questionTypes: string[]; yearsSinceLast: number }>();

    if (history.length === 0 || distribution.length === 0) {
        // Geen historische data: alle domeinen gelijke kans
        const domains = getCEDomains(subject, level);
        const equalChance = Math.round(100 / Math.max(domains.length, 1));
        for (const domain of domains) {
            weights.set(domain.code, {
                chance: equalChance,
                avgQuestions: 5,
                avgScore: 15,
                questionTypes: ['meerkeuze', 'open'],
                yearsSinceLast: 0,
            });
        }
        return weights;
    }

    const latestYear = Math.max(...history.map(e => e.year));
    const totalExams = history.length;

    for (const dist of distribution) {
        // Factor 1: Frequentie (hoe vaak verscheen dit domein?)
        const frequencyScore = dist.frequency; // 0-100

        // Factor 2: Recentheid (is het lang geleden gevraagd? → hogere kans)
        const lastAppearance = history
            .filter(e => e.domains.some(d => d.code === dist.code))
            .map(e => e.year)
            .sort((a, b) => b - a)[0] || latestYear;
        const yearsSinceLast = latestYear - lastAppearance;
        const recencyBoost = yearsSinceLast >= 2 ? 15 : yearsSinceLast >= 1 ? 5 : 0;

        // Factor 3: Score-gewicht (domeinen met meer punten zijn belangrijker)
        const scoreWeight = Math.min(dist.avgMaxScore / 20, 1.5); // Normaliseer

        // Combineer factoren
        let rawChance = (frequencyScore * 0.6) + (recencyBoost * 0.2) + (scoreWeight * 20 * 0.2);
        rawChance = Math.min(Math.round(rawChance), 100);

        weights.set(dist.code, {
            chance: rawChance,
            avgQuestions: dist.avgQuestionCount,
            avgScore: dist.avgMaxScore,
            questionTypes: dist.questionTypes,
            yearsSinceLast,
        });
    }

    // Normaliseer zodat de hoogste kans ~95% is
    const maxChance = Math.max(...Array.from(weights.values()).map(w => w.chance));
    if (maxChance > 0) {
        for (const [code, w] of weights) {
            weights.set(code, { ...w, chance: Math.round((w.chance / maxChance) * 95) });
        }
    }

    return weights;
}

/**
 * Genereer gepersonaliseerde voorspellingen voor een student.
 * Combineert domein-kansen met de mastery scores van de student.
 */
export function getStudentPrediction(
    subject: string,
    level: string,
    masteryScores: Record<string, { correct: number; total: number }>
): ExamPredictionResult {
    const domainWeights = predictDomainWeights(subject, level);
    const ceDomains = getCEDomains(subject, level);
    const history = getExamHistory(subject, level);
    const predictions: DomainPrediction[] = [];

    for (const domain of ceDomains) {
        const weight = domainWeights.get(domain.code);
        const chance = weight?.chance ?? 50;

        // Bereken student mastery voor dit domein
        // Match mastery scores op basis van domein-gerelateerde skills
        let studentMastery: number | null = null;
        const relevantScores = Object.entries(masteryScores)
            .filter(([skill]) => {
                const skillLower = skill.toLowerCase();
                const domainTitle = domain.title.toLowerCase();
                // Match op domein-titel keywords of domein-code
                return skillLower.includes(domainTitle) ||
                    domainTitle.includes(skillLower) ||
                    skillLower.includes(`domein ${domain.code.toLowerCase()}`);
            });

        if (relevantScores.length > 0) {
            const totalCorrect = relevantScores.reduce((sum, [, s]) => sum + s.correct, 0);
            const totalAttempts = relevantScores.reduce((sum, [, s]) => sum + s.total, 0);
            studentMastery = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : null;
        }

        // Bereken readiness: hoge kans + hoge mastery = goed
        const mastery = studentMastery ?? 50; // Default 50% als geen data
        const readinessScore = Math.round(mastery * (chance / 100));

        // Bepaal prioriteit
        let priority: DomainPrediction['priority'];
        if (chance >= 70 && mastery < 50) {
            priority = 'critical'; // Hoge kans, lage mastery = rode vlag
        } else if (chance >= 50 && mastery < 65) {
            priority = 'attention'; // Gemiddelde kans, onder-niveau mastery
        } else if (chance >= 50 && mastery >= 65) {
            priority = 'good'; // Hoge kans, goede mastery
        } else {
            priority = 'low'; // Lage kans
        }

        // Genereer aanbeveling
        let recommendation: string;
        switch (priority) {
            case 'critical':
                recommendation = `Dit domein verschijnt in bijna elk examen en je scoort nog onder de 50%. Focus hier je studietijd op!`;
                break;
            case 'attention':
                recommendation = `Er is een goede kans dat dit op het examen komt. Oefen regelmatig om je score te verhogen.`;
                break;
            case 'good':
                recommendation = `Goed voorbereid! Blijf oefenen om je kennis scherp te houden.`;
                break;
            case 'low':
                recommendation = `Dit domein komt minder vaak voor. Besteed hier minder tijd aan, maar negeer het niet volledig.`;
                break;
        }

        predictions.push({
            code: domain.code,
            title: domain.title,
            predictedChance: chance,
            studentMastery,
            readinessScore,
            priority,
            avgQuestionCount: weight?.avgQuestions ?? 5,
            avgMaxScore: weight?.avgScore ?? 15,
            questionTypes: weight?.questionTypes ?? ['meerkeuze', 'open'],
            yearsSinceLastAppearance: weight?.yearsSinceLast ?? 0,
            recommendation,
        });
    }

    // Sorteer: critical eerst, dan attention, dan good, dan low
    const priorityOrder = { critical: 0, attention: 1, good: 2, low: 3 };
    predictions.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

    // Bereken algehele readiness
    const totalWeight = predictions.reduce((sum, p) => sum + p.predictedChance, 0);
    const weightedReadiness = totalWeight > 0
        ? Math.round(predictions.reduce((sum, p) => sum + p.readinessScore * p.predictedChance, 0) / totalWeight)
        : 0;

    return {
        subject,
        level,
        predictions,
        overallReadiness: weightedReadiness,
        examsAnalyzed: history.length,
        yearsAnalyzed: [...new Set(history.map(e => e.year))].sort((a, b) => b - a),
    };
}

/**
 * Genereer een contextuele prompt voor AI-vraaggenratie op basis van voorspellingen.
 * Geeft de AI meer context over het belang van het domein en historische patronen.
 */
export function getPredictionContextForPrompt(prediction: DomainPrediction, subject: string, level: string): string {
    const lines: string[] = [];

    lines.push(`CONTEXT VOOR VRAAGGENERATIE:`);
    lines.push(`- Domein ${prediction.code} (${prediction.title}) verschijnt in ~${prediction.predictedChance}% van de ${level} ${subject} examens.`);

    if (prediction.avgQuestionCount > 0) {
        lines.push(`- Gemiddeld ${prediction.avgQuestionCount} vragen per examen, goed voor ~${prediction.avgMaxScore} punten.`);
    }

    if (prediction.questionTypes.length > 0) {
        lines.push(`- Meest voorkomende vraagtypes: ${prediction.questionTypes.join(', ')}.`);
    }

    if (prediction.yearsSinceLastAppearance > 1) {
        lines.push(`- LET OP: dit domein is ${prediction.yearsSinceLastAppearance} jaar niet gevraagd — kans op terugkeer is hoger!`);
    }

    if (prediction.studentMastery !== null && prediction.studentMastery < 60) {
        lines.push(`- De leerling scoort ${prediction.studentMastery}% op dit domein — focus op fundamentele concepten.`);
    }

    return lines.join('\n');
}
