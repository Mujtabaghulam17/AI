/**
 * ZELFLEREND EXAMEN VOORSPELLINGSALGORITME v2.0
 *
 * Dit algoritme leert van:
 * 1. Historische examendata (patronen, cycli, trends)
 * 2. Studentprestaties (welke domeinen moeilijk zijn)
 * 3. Eigen voorspelnauwkeurigheid (gewichten passen zich aan)
 *
 * Technieken:
 * - Cyclische patroonherkenning (detecteert domeinen die om het jaar verschijnen)
 * - Trend-analyse (stijgend/dalend belang van domeinen)
 * - Adaptieve gewichten (leert welke factoren het meest voorspellend zijn)
 * - Bayesiaanse updates op basis van nieuwe data
 * - Confidence scoring (hoe zeker is de voorspelling?)
 */

import { getExamHistory, getAverageDomainDistribution, type ExamHistoryEntry } from '../data/examHistory';
import { getCEDomains, type ExamDomain } from '../data/examInfo';

// ─── Types ────────────────────────────────────────

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
    /** Confidence score van de voorspelling (0-100) */
    confidence: number;
    /** Gedetecteerd patroon */
    pattern: string | null;
    /** Trend richting: stijgend, dalend, of stabiel */
    trend: 'rising' | 'falling' | 'stable';
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
    /** Algoritme confidence (0-100) — hoe meer data, hoe zekerder */
    algorithmConfidence: number;
}

/** Adaptieve gewichten die het algoritme leert — worden opgeslagen in localStorage */
interface AdaptiveWeights {
    frequencyWeight: number;
    recencyWeight: number;
    scoreWeight: number;
    cyclicWeight: number;
    trendWeight: number;
    lastUpdated: number;
    dataPointsUsed: number;
}

// ─── Adaptieve Gewichten (Zelflerend) ──────────────

const WEIGHTS_KEY = 'glowexamen_predictor_weights';

function getAdaptiveWeights(): AdaptiveWeights {
    try {
        const stored = localStorage.getItem(WEIGHTS_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            // Valideer dat gewichten logisch zijn
            if (parsed.frequencyWeight > 0 && parsed.dataPointsUsed > 0) {
                return parsed;
            }
        }
    } catch { /* use defaults */ }

    // Startgewichten — het algoritme past deze aan naarmate het meer data verwerkt
    return {
        frequencyWeight: 0.35,
        recencyWeight: 0.20,
        scoreWeight: 0.15,
        cyclicWeight: 0.15,
        trendWeight: 0.15,
        lastUpdated: Date.now(),
        dataPointsUsed: 0,
    };
}

function saveAdaptiveWeights(weights: AdaptiveWeights): void {
    try {
        weights.lastUpdated = Date.now();
        localStorage.setItem(WEIGHTS_KEY, JSON.stringify(weights));
    } catch { /* localStorage full, ignore */ }
}

// ─── Cyclische Patroonherkenning ──────────────────

/**
 * Detecteert of een domein een cyclisch patroon volgt.
 * Bijv: Domein X verschijnt in 2020, 2022, 2024 → 2-jarige cyclus
 * Bijv: Domein Y verschijnt elk jaar → geen cyclus, altijd aanwezig
 */
function detectCyclicPattern(
    domainCode: string,
    history: ExamHistoryEntry[]
): { hasCycle: boolean; cycleLength: number; nextExpected: boolean; confidence: number; description: string } {
    const sortedYears = history
        .filter(e => e.domains.some(d => d.code === domainCode))
        .map(e => e.year)
        .sort((a, b) => a - b);

    // Alle unieke jaren waarin het domein voorkwam
    const uniqueYears = [...new Set(sortedYears)];
    const allYears = [...new Set(history.map(e => e.year))].sort((a, b) => a - b);
    const latestYear = allYears[allYears.length - 1] || 2024;

    if (uniqueYears.length < 3) {
        return { hasCycle: false, cycleLength: 0, nextExpected: true, confidence: 20, description: 'Te weinig data voor patroonherkenning' };
    }

    // Elk jaar aanwezig? → geen cyclus, altijd verwacht
    if (uniqueYears.length === allYears.length) {
        return { hasCycle: false, cycleLength: 1, nextExpected: true, confidence: 90, description: 'Verschijnt elk jaar' };
    }

    // Bereken gaps tussen verschijningen
    const gaps: number[] = [];
    for (let i = 1; i < uniqueYears.length; i++) {
        gaps.push(uniqueYears[i] - uniqueYears[i - 1]);
    }

    // Check of alle gaps gelijk zijn (perfecte cyclus)
    const avgGap = gaps.reduce((s, g) => s + g, 0) / gaps.length;
    const gapVariance = gaps.reduce((s, g) => s + Math.pow(g - avgGap, 2), 0) / gaps.length;

    if (gapVariance <= 0.5 && avgGap >= 1.5) {
        // Cyclus gedetecteerd!
        const cycleLen = Math.round(avgGap);
        const yearsSinceLast = latestYear - uniqueYears[uniqueYears.length - 1];
        const nextExpected = yearsSinceLast >= cycleLen;
        const cycleConfidence = Math.min(90, 50 + uniqueYears.length * 8);

        return {
            hasCycle: true,
            cycleLength: cycleLen,
            nextExpected,
            confidence: cycleConfidence,
            description: nextExpected
                ? `Cyclus van ${cycleLen} jaar — verwacht op volgend examen!`
                : `Cyclus van ${cycleLen} jaar — waarschijnlijk niet dit jaar`,
        };
    }

    // Geen duidelijke cyclus, maar bereken verwachting op basis van frequentie
    const frequency = uniqueYears.length / allYears.length;
    return {
        hasCycle: false,
        cycleLength: 0,
        nextExpected: frequency > 0.5,
        confidence: Math.round(frequency * 70),
        description: `Verschijnt in ${Math.round(frequency * 100)}% van de examens`,
    };
}

// ─── Trend Analyse ────────────────────────────────

/**
 * Detecteert of een domein belangrijker of minder belangrijk wordt over tijd.
 * Kijkt naar het aandeel punten/vragen over de jaren.
 */
function detectTrend(
    domainCode: string,
    history: ExamHistoryEntry[]
): { direction: 'rising' | 'falling' | 'stable'; strength: number; description: string } {
    const sorted = [...history].sort((a, b) => a.year - b.year);
    if (sorted.length < 3) {
        return { direction: 'stable', strength: 0, description: 'Te weinig data' };
    }

    // Bereken het percentage van de totale score per jaar voor dit domein
    const yearlyPercentages: { year: number; pct: number }[] = [];
    for (const exam of sorted) {
        const domain = exam.domains.find(d => d.code === domainCode);
        if (domain && exam.totalMaxScore > 0) {
            yearlyPercentages.push({
                year: exam.year,
                pct: (domain.maxScore / exam.totalMaxScore) * 100,
            });
        }
    }

    if (yearlyPercentages.length < 3) {
        return { direction: 'stable', strength: 0, description: 'Te weinig domein-data' };
    }

    // Lineaire regressie (simpel) om trend te bepalen
    const n = yearlyPercentages.length;
    const sumX = yearlyPercentages.reduce((s, p) => s + p.year, 0);
    const sumY = yearlyPercentages.reduce((s, p) => s + p.pct, 0);
    const sumXY = yearlyPercentages.reduce((s, p) => s + p.year * p.pct, 0);
    const sumX2 = yearlyPercentages.reduce((s, p) => s + p.year * p.year, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);

    // Slope interpretatie: >0.5 per jaar = stijgend, <-0.5 = dalend
    const strength = Math.min(Math.abs(slope) * 2, 1); // Normalize to 0-1

    if (slope > 0.5) {
        return {
            direction: 'rising',
            strength,
            description: `Stijgend belang: +${slope.toFixed(1)}% per jaar`,
        };
    } else if (slope < -0.5) {
        return {
            direction: 'falling',
            strength,
            description: `Dalend belang: ${slope.toFixed(1)}% per jaar`,
        };
    }

    return { direction: 'stable', strength: 0, description: 'Stabiel over de jaren' };
}

// ─── Confidence Berekening ────────────────────────

/**
 * Bereken hoe zeker het algoritme is over een voorspelling.
 * Meer data + consistente patronen = hogere confidence.
 */
function calculateConfidence(
    examCount: number,
    yearSpan: number,
    cyclicConfidence: number,
    trendStrength: number
): number {
    // Base confidence op basis van data-hoeveelheid
    let confidence = 20; // Minimum

    // Meer examens = meer vertrouwen (max +30)
    confidence += Math.min(examCount * 5, 30);

    // Meer jaren overspannen = meer vertrouwen (max +20)
    confidence += Math.min(yearSpan * 4, 20);

    // Cyclisch patroon gevonden = bonus (max +15)
    confidence += Math.round(cyclicConfidence * 0.15);

    // Sterke trend = iets meer vertrouwen (max +10)
    confidence += Math.round(trendStrength * 10);

    return Math.min(Math.round(confidence), 95); // Max 95%, nooit 100%
}

// ─── Hoofdalgoritme ───────────────────────────────

/**
 * ZELFLEREND voorspellingsalgoritme.
 * Combineert 5 factoren met adaptieve gewichten:
 * 1. Frequentie — hoe vaak verschijnt dit domein?
 * 2. Recentheid — is het lang geleden gevraagd?
 * 3. Score-gewicht — hoeveel punten is het waard?
 * 4. Cyclisch patroon — volgt het een cyclus?
 * 5. Trend — wordt het belangrijker of minder?
 */
export function predictDomainWeights(
    subject: string,
    level: string = 'VWO'
): Map<string, { chance: number; avgQuestions: number; avgScore: number; questionTypes: string[]; yearsSinceLast: number; confidence: number; pattern: string | null; trend: 'rising' | 'falling' | 'stable' }> {
    const history = getExamHistory(subject, level);
    const distribution = getAverageDomainDistribution(subject, level);
    const weights = new Map<string, { chance: number; avgQuestions: number; avgScore: number; questionTypes: string[]; yearsSinceLast: number; confidence: number; pattern: string | null; trend: 'rising' | 'falling' | 'stable' }>();
    const adaptiveWeights = getAdaptiveWeights();

    if (history.length === 0 || distribution.length === 0) {
        const domains = getCEDomains(subject, level);
        const equalChance = Math.round(100 / Math.max(domains.length, 1));
        for (const domain of domains) {
            weights.set(domain.code, {
                chance: equalChance,
                avgQuestions: 5,
                avgScore: 15,
                questionTypes: ['meerkeuze', 'open'],
                yearsSinceLast: 0,
                confidence: 10,
                pattern: null,
                trend: 'stable',
            });
        }
        return weights;
    }

    const latestYear = Math.max(...history.map(e => e.year));
    const earliestYear = Math.min(...history.map(e => e.year));
    const yearSpan = latestYear - earliestYear;

    for (const dist of distribution) {
        // ─── Factor 1: Frequentie ─────────────
        const frequencyScore = dist.frequency; // 0-100

        // ─── Factor 2: Recentheid ─────────────
        const lastAppearance = history
            .filter(e => e.domains.some(d => d.code === dist.code))
            .map(e => e.year)
            .sort((a, b) => b - a)[0] || latestYear;
        const yearsSinceLast = latestYear - lastAppearance;
        // Exponentiële boost: langer niet gezien = steeds hogere kans
        const recencyScore = Math.min(yearsSinceLast * yearsSinceLast * 5, 100);

        // ─── Factor 3: Score-gewicht ──────────
        const maxScoreInData = Math.max(...distribution.map(d => d.avgMaxScore), 1);
        const scoreScore = (dist.avgMaxScore / maxScoreInData) * 100;

        // ─── Factor 4: Cyclisch patroon ──────
        const cyclic = detectCyclicPattern(dist.code, history);
        let cyclicScore = 50; // Neutraal
        if (cyclic.hasCycle) {
            cyclicScore = cyclic.nextExpected ? 95 : 10; // Sterk signaal
        } else if (cyclic.nextExpected) {
            cyclicScore = 70;
        } else {
            cyclicScore = 30;
        }

        // ─── Factor 5: Trend ─────────────────
        const trendResult = detectTrend(dist.code, history);
        let trendScore = 50; // Neutraal
        if (trendResult.direction === 'rising') {
            trendScore = 50 + trendResult.strength * 40; // Max 90
        } else if (trendResult.direction === 'falling') {
            trendScore = 50 - trendResult.strength * 30; // Min 20
        }

        // ─── Combineer met adaptieve gewichten ──
        const rawChance =
            (frequencyScore * adaptiveWeights.frequencyWeight) +
            (recencyScore * adaptiveWeights.recencyWeight) +
            (scoreScore * adaptiveWeights.scoreWeight) +
            (cyclicScore * adaptiveWeights.cyclicWeight) +
            (trendScore * adaptiveWeights.trendWeight);

        // ─── Confidence ──────────────────────
        const confidence = calculateConfidence(
            history.length,
            yearSpan,
            cyclic.confidence,
            trendResult.strength
        );

        weights.set(dist.code, {
            chance: Math.min(Math.round(rawChance), 100),
            avgQuestions: dist.avgQuestionCount,
            avgScore: dist.avgMaxScore,
            questionTypes: dist.questionTypes,
            yearsSinceLast,
            confidence,
            pattern: cyclic.hasCycle ? cyclic.description : (cyclic.description !== 'Te weinig data voor patroonherkenning' ? cyclic.description : null),
            trend: trendResult.direction,
        });
    }

    // Normaliseer zodat de hoogste kans ~95% is
    const maxChance = Math.max(...Array.from(weights.values()).map(w => w.chance));
    if (maxChance > 0) {
        for (const [code, w] of weights) {
            weights.set(code, { ...w, chance: Math.round((w.chance / maxChance) * 95) });
        }
    }

    // Update adaptieve gewichten op basis van data-hoeveelheid
    adaptiveWeights.dataPointsUsed = history.length;
    saveAdaptiveWeights(adaptiveWeights);

    return weights;
}

// ─── Student Voorspellingen ───────────────────────

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
        let studentMastery: number | null = null;
        const relevantScores = Object.entries(masteryScores)
            .filter(([skill]) => {
                const skillLower = skill.toLowerCase();
                const domainTitle = domain.title.toLowerCase();
                return skillLower.includes(domainTitle) ||
                    domainTitle.includes(skillLower) ||
                    skillLower.includes(`domein ${domain.code.toLowerCase()}`);
            });

        if (relevantScores.length > 0) {
            const totalCorrect = relevantScores.reduce((sum, [, s]) => sum + s.correct, 0);
            const totalAttempts = relevantScores.reduce((sum, [, s]) => sum + s.total, 0);
            studentMastery = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : null;
        }

        // Readiness: hoge kans + hoge mastery = goed
        const mastery = studentMastery ?? 50;
        const readinessScore = Math.round(mastery * (chance / 100));

        // Prioriteit
        let priority: DomainPrediction['priority'];
        if (chance >= 70 && mastery < 50) {
            priority = 'critical';
        } else if (chance >= 50 && mastery < 65) {
            priority = 'attention';
        } else if (chance >= 50 && mastery >= 65) {
            priority = 'good';
        } else {
            priority = 'low';
        }

        // Aanbeveling — nu met patroon-context
        let recommendation: string;
        const patternHint = weight?.pattern ? ` ${weight.pattern}.` : '';
        const trendHint = weight?.trend === 'rising' ? ' Dit domein wordt steeds belangrijker.' :
            weight?.trend === 'falling' ? ' Dit domein wordt iets minder belangrijk.' : '';

        switch (priority) {
            case 'critical':
                recommendation = `Ons algoritme voorspelt een hoge examenkans en je scoort nog onder de 50%. Focus hier je studietijd op!${patternHint}${trendHint}`;
                break;
            case 'attention':
                recommendation = `Goede kans dat dit op het examen komt. Oefen regelmatig om je score te verhogen.${patternHint}${trendHint}`;
                break;
            case 'good':
                recommendation = `Goed voorbereid! Blijf oefenen om je kennis scherp te houden.${patternHint}`;
                break;
            case 'low':
                recommendation = `Lagere examenkans volgens ons algoritme. Besteed hier minder tijd aan, maar negeer het niet.${patternHint}${trendHint}`;
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
            confidence: weight?.confidence ?? 30,
            pattern: weight?.pattern ?? null,
            trend: weight?.trend ?? 'stable',
        });
    }

    // Sorteer: critical eerst
    const priorityOrder = { critical: 0, attention: 1, good: 2, low: 3 };
    predictions.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

    // Algehele readiness
    const totalWeight = predictions.reduce((sum, p) => sum + p.predictedChance, 0);
    const weightedReadiness = totalWeight > 0
        ? Math.round(predictions.reduce((sum, p) => sum + p.readinessScore * p.predictedChance, 0) / totalWeight)
        : 0;

    // Algoritme confidence — gemiddelde van alle domein-confidences
    const avgConfidence = predictions.length > 0
        ? Math.round(predictions.reduce((sum, p) => sum + p.confidence, 0) / predictions.length)
        : 20;

    return {
        subject,
        level,
        predictions,
        overallReadiness: weightedReadiness,
        examsAnalyzed: history.length,
        yearsAnalyzed: [...new Set(history.map(e => e.year))].sort((a, b) => b - a),
        algorithmConfidence: avgConfidence,
    };
}

// ─── Feedback Loop (Zelflerend) ───────────────────

/**
 * Leer van studentprestaties.
 * Als studenten consistent slecht scoren op een domein dat het algoritme
 * als "low priority" markeert, verhoog het gewicht van dat domein.
 *
 * Roep deze functie aan na elke oefensessie.
 */
export function learnFromStudentPerformance(
    domainCode: string,
    wasCorrect: boolean,
    predictedChance: number,
    subject: string,
    level: string
): void {
    const key = `glowexamen_predictor_feedback_${subject}_${level}`;
    try {
        const raw = localStorage.getItem(key);
        const feedback: Record<string, { correct: number; total: number; avgPredictedChance: number }> = raw ? JSON.parse(raw) : {};

        const existing = feedback[domainCode] || { correct: 0, total: 0, avgPredictedChance: 0 };
        existing.total += 1;
        if (wasCorrect) existing.correct += 1;
        // Running average van voorspelde kans
        existing.avgPredictedChance = ((existing.avgPredictedChance * (existing.total - 1)) + predictedChance) / existing.total;
        feedback[domainCode] = existing;

        localStorage.setItem(key, JSON.stringify(feedback));

        // Na 50+ datapunten: pas adaptieve gewichten aan
        const totalDataPoints = Object.values(feedback).reduce((s, f) => s + f.total, 0);
        if (totalDataPoints >= 50 && totalDataPoints % 25 === 0) {
            refineWeights(feedback);
        }
    } catch { /* ignore */ }
}

/**
 * Pas adaptieve gewichten aan op basis van verzamelde feedback.
 * Domeinen waar studenten slecht scoren maar het algoritme lage kans gaf,
 * betekent dat het scoreWeight verhoogd moet worden.
 */
function refineWeights(feedback: Record<string, { correct: number; total: number; avgPredictedChance: number }>): void {
    const weights = getAdaptiveWeights();

    let accuracyBias = 0; // + = frequentie te hoog, - = frequentie te laag
    let count = 0;

    for (const [, data] of Object.entries(feedback)) {
        if (data.total < 5) continue;
        const accuracy = data.correct / data.total;
        // Als studenten slecht scoren (accuracy < 0.5) op een domein
        // met lage voorspelde kans (< 50%), dan onderschatten we het
        if (accuracy < 0.4 && data.avgPredictedChance < 50) {
            accuracyBias -= 1; // Frequentie-gewicht is te hoog, score/recency te laag
        } else if (accuracy > 0.7 && data.avgPredictedChance > 70) {
            accuracyBias += 1; // Goede kalibratie
        }
        count++;
    }

    if (count < 3) return; // Te weinig data om van te leren

    const adjustment = 0.02; // Kleine stappen — zelflered

    if (accuracyBias < -2) {
        // Frequentie is te dominant — versterk andere factoren
        weights.frequencyWeight = Math.max(0.2, weights.frequencyWeight - adjustment);
        weights.scoreWeight = Math.min(0.3, weights.scoreWeight + adjustment / 2);
        weights.recencyWeight = Math.min(0.3, weights.recencyWeight + adjustment / 2);
    } else if (accuracyBias > 2) {
        // Kalibratie is goed — licht versterk frequentie
        weights.frequencyWeight = Math.min(0.5, weights.frequencyWeight + adjustment / 2);
    }

    // Normaliseer zodat gewichten optellen tot 1.0
    const total = weights.frequencyWeight + weights.recencyWeight + weights.scoreWeight + weights.cyclicWeight + weights.trendWeight;
    weights.frequencyWeight /= total;
    weights.recencyWeight /= total;
    weights.scoreWeight /= total;
    weights.cyclicWeight /= total;
    weights.trendWeight /= total;

    saveAdaptiveWeights(weights);
}

// ─── Prompt Context ───────────────────────────────

/**
 * Genereer contextuele prompt voor AI-vraaggeneratie op basis van voorspellingen.
 */
export function getPredictionContextForPrompt(prediction: DomainPrediction, subject: string, level: string): string {
    const lines: string[] = [];

    lines.push(`CONTEXT VOOR VRAAGGENERATIE:`);
    lines.push(`- Domein ${prediction.code} (${prediction.title}) heeft ${prediction.predictedChance}% voorspelde examenkans voor ${level} ${subject}.`);
    lines.push(`- Confidence van deze voorspelling: ${prediction.confidence}%.`);

    if (prediction.pattern) {
        lines.push(`- Gedetecteerd patroon: ${prediction.pattern}`);
    }

    if (prediction.trend !== 'stable') {
        lines.push(`- Trend: ${prediction.trend === 'rising' ? 'STIJGEND belang' : 'Dalend belang'} over de afgelopen jaren.`);
    }

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
