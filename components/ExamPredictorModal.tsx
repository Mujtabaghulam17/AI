import React, { useState, useMemo } from 'react';
import { getCEDomains, type ExamDomain } from '../data/examInfo.ts';
import { generateContentWithRetry, cleanAndParseJSON } from '../api/gemini.ts';
import { getStudentPrediction, getPredictionContextForPrompt, learnFromStudentPerformance, type DomainPrediction, type ExamPredictionResult } from '../utils/examPredictor.ts';
import { Type } from "@google/genai";

const MODEL_NAME = 'gemini-3.1-flash-lite-preview';

interface ExamPredictorModalProps {
    isOpen: boolean;
    onClose: () => void;
    subject: string;
    examLevel?: string;
    masteryScores?: Record<string, { correct: number; total: number }>;
    onSaveResults?: (domainCode: string, score: { correct: number; total: number }) => void;
}

interface PredictedQuestion {
    question: string;
    source_text: string;
    answer: string;
    explanation: string;
    difficulty: 'makkelijk' | 'gemiddeld' | 'moeilijk';
    domain_code: string;
    question_type: string;
    options?: string[];
    correct_option?: string;
}

type AnswerResult = {
    studentAnswer: string;
    isRevealed: boolean;
};

type ViewMode = 'prediction' | 'practice' | 'results';

const priorityConfig = {
    critical: { color: '#f87171', bg: 'rgba(248, 113, 113, 0.12)', border: 'rgba(248, 113, 113, 0.3)', label: 'Kritiek', icon: '🔴' },
    attention: { color: '#fbbf24', bg: 'rgba(251, 191, 36, 0.12)', border: 'rgba(251, 191, 36, 0.3)', label: 'Aandacht', icon: '🟡' },
    good: { color: '#34d399', bg: 'rgba(52, 211, 153, 0.12)', border: 'rgba(52, 211, 153, 0.3)', label: 'Goed', icon: '🟢' },
    low: { color: '#60a5fa', bg: 'rgba(96, 165, 250, 0.10)', border: 'rgba(96, 165, 250, 0.2)', label: 'Laag', icon: '🔵' },
};

const difficultyColors: Record<string, string> = {
    'makkelijk': '#34d399',
    'gemiddeld': '#fbbf24',
    'moeilijk': '#f87171',
};

const ExamPredictorModal: React.FC<ExamPredictorModalProps> = ({
    isOpen, onClose, subject, examLevel = 'VWO', masteryScores = {}, onSaveResults
}) => {
    const [viewMode, setViewMode] = useState<ViewMode>('prediction');
    const [activePrediction, setActivePrediction] = useState<DomainPrediction | null>(null);
    const [predictedQuestions, setPredictedQuestions] = useState<PredictedQuestion[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);

    // Practice state
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<AnswerResult[]>([]);
    const [currentInput, setCurrentInput] = useState('');
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [selfScores, setSelfScores] = useState<(boolean | null)[]>([]);

    // Compute predictions
    const prediction: ExamPredictionResult = useMemo(
        () => getStudentPrediction(subject, examLevel, masteryScores),
        [subject, examLevel, masteryScores]
    );

    const ceDomains = getCEDomains(subject, examLevel);

    const startPractice = async (domainPrediction: DomainPrediction) => {
        setActivePrediction(domainPrediction);
        setViewMode('practice');
        setIsGenerating(true);
        setCurrentQuestionIndex(0);
        setAnswers([]);
        setCurrentInput('');
        setSelectedOption(null);
        setSelfScores([]);

        const domain = ceDomains.find(d => d.code === domainPrediction.code);
        const subdomainsText = domain?.subdomains?.map(s => `  - ${s.code}: ${s.title}`).join('\n') || '';
        const predictionContext = getPredictionContextForPrompt(domainPrediction, subject, examLevel);

        // Build question type distribution from historical data
        const questionTypeMix = domainPrediction.questionTypes.length > 0
            ? `Gebruik deze vraagtypes (gebaseerd op echte examenpatronen): ${domainPrediction.questionTypes.join(', ')}.`
            : 'Mix van vraagtypen: meerkeuze, open vragen, uitlegvragen.';

        const prompt = `${predictionContext}

Genereer 10 unieke ${examLevel} CE-examenvragen voor ${subject}, domein ${domainPrediction.code}: ${domainPrediction.title}.
${subdomainsText ? `Subdomeinen:\n${subdomainsText}` : ''}

Eisen:
- ELKE vraag MOET een uitgebreide source_text hebben: een brontekst/contextpassage van 3-5 zinnen. VERPLICHT, nooit leeg!
- Elke vraag heeft: source_text, question, answer (volledig modelantwoord), explanation (kort), question_type, difficulty, domain_code
- Bij meerkeuze (question_type = "meerkeuze"): geef ALTIJD "options" (4 stuks A-D) en "correct_option"
- Mix: 3 makkelijk, 4 gemiddeld, 3 moeilijk
- ${questionTypeMix}
- Formuleer zoals echt CE: "Leg uit waarom...", "Welke uitspraak is juist?", "Bereken...", "Citeer de zin..."
- ${examLevel}-niveau!
- Genereer NIEUWE vragen, niet herhalen.`;

        try {
            const response = await generateContentWithRetry({
                model: MODEL_NAME,
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            questions: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        source_text: { type: Type.STRING },
                                        question: { type: Type.STRING },
                                        question_type: { type: Type.STRING },
                                        answer: { type: Type.STRING },
                                        explanation: { type: Type.STRING },
                                        difficulty: { type: Type.STRING },
                                        domain_code: { type: Type.STRING },
                                        options: { type: Type.ARRAY, items: { type: Type.STRING } },
                                        correct_option: { type: Type.STRING },
                                    },
                                    required: ["source_text", "question", "question_type", "answer", "explanation", "difficulty", "domain_code"]
                                }
                            }
                        },
                        required: ["questions"]
                    },
                    temperature: 1,
                    thinkingConfig: { thinkingBudget: 0 },
                }
            });
            const result = cleanAndParseJSON(response.text || '');
            if (result?.questions) {
                setPredictedQuestions(result.questions);
                setAnswers(result.questions.map(() => ({ studentAnswer: '', isRevealed: false })));
                setSelfScores(result.questions.map(() => null));
            }
        } catch (e) {
            console.error('Failed to generate predictions:', e);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSubmitAnswer = () => {
        const q = predictedQuestions[currentQuestionIndex];
        const answerText = q.options ? (selectedOption || '') : currentInput;
        const newAnswers = [...answers];
        newAnswers[currentQuestionIndex] = { studentAnswer: answerText, isRevealed: true };
        setAnswers(newAnswers);
        setCurrentInput('');
        setSelectedOption(null);
    };

    const handleSelfScore = (correct: boolean) => {
        const newScores = [...selfScores];
        newScores[currentQuestionIndex] = correct;
        setSelfScores(newScores);

        // Feedback loop: laat het algoritme leren van studentprestaties
        if (activePrediction) {
            learnFromStudentPerformance(
                activePrediction.code,
                correct,
                activePrediction.predictedChance,
                subject,
                examLevel
            );
        }
    };

    const handleNextQuestion = () => {
        if (currentQuestionIndex < predictedQuestions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        } else {
            // Save results before showing results screen
            if (activePrediction && onSaveResults) {
                const correct = selfScores.filter(s => s === true).length;
                const total = selfScores.filter(s => s !== null).length;
                onSaveResults(activePrediction.code, { correct, total });
            }
            setViewMode('results');
        }
    };

    const handleBackToPrediction = () => {
        setViewMode('prediction');
        setPredictedQuestions([]);
        setActivePrediction(null);
        setCurrentQuestionIndex(0);
        setAnswers([]);
        setSelfScores([]);
    };

    const handleClose = () => {
        handleBackToPrediction();
        onClose();
    };

    const correctCount = selfScores.filter(s => s === true).length;
    const answeredCount = selfScores.filter(s => s !== null).length;
    const currentQ = predictedQuestions[currentQuestionIndex];
    const currentAnswer = answers[currentQuestionIndex];
    const currentScore = selfScores[currentQuestionIndex];

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={handleClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()} style={{
                maxWidth: '780px', width: '95%', borderRadius: '20px', padding: '0', overflow: 'hidden',
            }}>
                {/* Header */}
                <div style={{
                    padding: '20px 28px 16px',
                    background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.12), rgba(34, 211, 238, 0.12))',
                    borderBottom: '1px solid rgba(168, 85, 247, 0.2)',
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h2 style={{ margin: 0, fontSize: '1.3rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                ExamPredictor
                            </h2>
                            <p style={{ margin: '6px 0 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                {viewMode === 'prediction'
                                    ? `${subject} ${examLevel} — ${prediction.examsAnalyzed} examens geanalyseerd`
                                    : viewMode === 'practice' && predictedQuestions.length > 0
                                        ? `Vraag ${currentQuestionIndex + 1}/${predictedQuestions.length} — ${activePrediction?.title}`
                                        : viewMode === 'results'
                                            ? `Resultaten — ${activePrediction?.title}`
                                            : `Voorspelde examenvragen voor ${subject}`
                                }
                            </p>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            {viewMode !== 'prediction' && (
                                <button onClick={handleBackToPrediction} style={{
                                    background: 'rgba(255,255,255,0.1)', border: 'none', color: 'var(--text-main)',
                                    fontSize: '0.8rem', cursor: 'pointer', borderRadius: '8px', padding: '6px 12px',
                                }}>← Overzicht</button>
                            )}
                            <button onClick={handleClose} style={{
                                background: 'rgba(255,255,255,0.1)', border: 'none', color: 'var(--text-main)',
                                fontSize: '1.2rem', cursor: 'pointer', borderRadius: '8px', padding: '6px 10px',
                            }}>✕</button>
                        </div>
                    </div>

                    {/* Progress dots for practice */}
                    {viewMode === 'practice' && predictedQuestions.length > 0 && (
                        <div style={{ display: 'flex', gap: '4px', marginTop: '12px' }}>
                            {predictedQuestions.map((_, i) => (
                                <div key={i}
                                    onClick={() => { if (answers[i]?.isRevealed || i <= currentQuestionIndex) setCurrentQuestionIndex(i); }}
                                    style={{
                                        flex: 1, height: '4px', borderRadius: '2px',
                                        cursor: (answers[i]?.isRevealed || i <= currentQuestionIndex) ? 'pointer' : 'default',
                                        background: i === currentQuestionIndex
                                            ? 'linear-gradient(90deg, #22d3ee, #a78bfa)'
                                            : selfScores[i] === true ? '#34d399'
                                                : selfScores[i] === false ? '#f87171'
                                                    : answers[i]?.isRevealed ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.08)',
                                        transition: 'all 0.3s ease',
                                    }}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Content */}
                <div style={{ padding: '20px 28px 28px', maxHeight: '72vh', overflowY: 'auto' }}>

                    {/* === PREDICTION OVERVIEW === */}
                    {viewMode === 'prediction' && (
                        <>
                            {/* Overall readiness */}
                            <div style={{
                                textAlign: 'center', padding: '20px', marginBottom: '20px', borderRadius: '14px',
                                background: 'linear-gradient(135deg, rgba(34, 211, 238, 0.06), rgba(168, 85, 247, 0.06))',
                                border: '1px solid rgba(34, 211, 238, 0.12)',
                            }}>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.5px', marginBottom: '8px' }}>
                                    EXAMEN GEREEDHEID
                                </div>
                                <div style={{
                                    fontSize: '2.5rem', fontWeight: 800,
                                    background: prediction.overallReadiness >= 65
                                        ? 'linear-gradient(135deg, #34d399, #22d3ee)'
                                        : prediction.overallReadiness >= 40
                                            ? 'linear-gradient(135deg, #fbbf24, #fb923c)'
                                            : 'linear-gradient(135deg, #f87171, #fb923c)',
                                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                                }}>
                                    {prediction.overallReadiness}%
                                </div>
                                <p style={{ color: 'var(--subtle-text)', fontSize: '0.8rem', margin: '4px 0 0' }}>
                                    Gebaseerd op {prediction.examsAnalyzed} examens ({prediction.yearsAnalyzed.join(', ')})
                                </p>
                                {/* Algoritme confidence indicator */}
                                <div style={{
                                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                                    marginTop: '10px', padding: '4px 12px', borderRadius: '20px',
                                    background: prediction.algorithmConfidence >= 70
                                        ? 'rgba(52, 211, 153, 0.1)'
                                        : prediction.algorithmConfidence >= 45
                                            ? 'rgba(251, 191, 36, 0.1)'
                                            : 'rgba(248, 113, 113, 0.1)',
                                    border: `1px solid ${prediction.algorithmConfidence >= 70 ? 'rgba(52, 211, 153, 0.25)' : prediction.algorithmConfidence >= 45 ? 'rgba(251, 191, 36, 0.25)' : 'rgba(248, 113, 113, 0.25)'}`,
                                }}>
                                    <span style={{ fontSize: '0.7rem' }}>
                                        {prediction.algorithmConfidence >= 70 ? '🧠' : prediction.algorithmConfidence >= 45 ? '📊' : '📈'}
                                    </span>
                                    <span style={{
                                        fontSize: '0.72rem', fontWeight: 600,
                                        color: prediction.algorithmConfidence >= 70 ? '#34d399' : prediction.algorithmConfidence >= 45 ? '#fbbf24' : '#f87171',
                                    }}>
                                        Algoritme zekerheid: {prediction.algorithmConfidence}%
                                    </span>
                                </div>
                            </div>

                            {/* Domain predictions */}
                            <h4 style={{ margin: '0 0 12px', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.5px' }}>
                                VOORSPELLING PER DOMEIN
                            </h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {prediction.predictions.map((pred) => {
                                    const config = priorityConfig[pred.priority];
                                    return (
                                        <button
                                            key={pred.code}
                                            onClick={() => startPractice(pred)}
                                            style={{
                                                display: 'flex', alignItems: 'center', gap: '14px',
                                                padding: '14px 16px', borderRadius: '12px',
                                                border: `1px solid ${config.border}`,
                                                background: config.bg,
                                                color: 'var(--text-main)', cursor: 'pointer',
                                                textAlign: 'left', transition: 'all 0.2s ease',
                                                width: '100%',
                                            }}
                                        >
                                            {/* Priority indicator */}
                                            <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>{config.icon}</span>

                                            {/* Domain info */}
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px', flexWrap: 'wrap' }}>
                                                    <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                                                        {pred.code}: {pred.title}
                                                    </span>
                                                    <span style={{
                                                        fontSize: '0.65rem', padding: '1px 6px', borderRadius: '4px',
                                                        background: config.bg, color: config.color, fontWeight: 700, border: `1px solid ${config.border}`,
                                                    }}>{config.label}</span>
                                                    {/* Trend indicator */}
                                                    {pred.trend !== 'stable' && (
                                                        <span style={{
                                                            fontSize: '0.62rem', padding: '1px 6px', borderRadius: '4px',
                                                            background: pred.trend === 'rising' ? 'rgba(52, 211, 153, 0.1)' : 'rgba(248, 113, 113, 0.1)',
                                                            color: pred.trend === 'rising' ? '#34d399' : '#f87171',
                                                            fontWeight: 600,
                                                            border: `1px solid ${pred.trend === 'rising' ? 'rgba(52, 211, 153, 0.25)' : 'rgba(248, 113, 113, 0.25)'}`,
                                                        }}>
                                                            {pred.trend === 'rising' ? '↑ Stijgend' : '↓ Dalend'}
                                                        </span>
                                                    )}
                                                    {/* Confidence badge */}
                                                    <span style={{
                                                        fontSize: '0.6rem', padding: '1px 5px', borderRadius: '4px',
                                                        background: 'rgba(168, 85, 247, 0.08)',
                                                        color: '#a78bfa', fontWeight: 600,
                                                        border: '1px solid rgba(168, 85, 247, 0.15)',
                                                    }}>
                                                        {pred.confidence}% zeker
                                                    </span>
                                                </div>
                                                {/* Pattern indicator */}
                                                {pred.pattern && (
                                                    <p style={{
                                                        margin: '0 0 3px', fontSize: '0.72rem', color: '#22d3ee',
                                                        display: 'flex', alignItems: 'center', gap: '4px',
                                                    }}>
                                                        <span style={{ fontSize: '0.65rem' }}>🔄</span> {pred.pattern}
                                                    </p>
                                                )}
                                                <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                                                    {pred.recommendation}
                                                </p>
                                            </div>

                                            {/* Stats */}
                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px', flexShrink: 0 }}>
                                                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                                                    <span style={{ fontWeight: 700, color: config.color, fontSize: '0.85rem' }}>
                                                        {pred.predictedChance}%
                                                    </span> examenkans
                                                </div>
                                                <div style={{ fontSize: '0.72rem', color: 'var(--subtle-text)' }}>
                                                    {pred.studentMastery !== null
                                                        ? `Mastery: ${pred.studentMastery}%`
                                                        : 'Nog niet geoefend'
                                                    }
                                                </div>
                                                <div style={{ fontSize: '0.65rem', color: 'var(--subtle-text)' }}>
                                                    ~{pred.avgQuestionCount} vragen/{pred.avgMaxScore}pt
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Legend */}
                            <div style={{
                                display: 'flex', gap: '16px', justifyContent: 'center', marginTop: '16px',
                                padding: '10px', borderRadius: '8px', background: 'rgba(255,255,255,0.02)',
                            }}>
                                {Object.entries(priorityConfig).map(([key, cfg]) => (
                                    <span key={key} style={{ fontSize: '0.7rem', color: 'var(--subtle-text)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        {cfg.icon} {cfg.label}
                                    </span>
                                ))}
                            </div>
                            <p style={{ fontSize: '0.7rem', color: 'var(--subtle-text)', textAlign: 'center', marginTop: '10px', fontStyle: 'italic' }}>
                                Zelflerend algoritme — analyseert patronen, cycli en trends uit 10+ jaar officiële examendata. Wordt nauwkeuriger naarmate je meer oefent.
                            </p>
                        </>
                    )}

                    {/* === LOADING === */}
                    {viewMode === 'practice' && isGenerating && (
                        <div style={{
                            textAlign: 'center', padding: '50px 20px',
                            background: 'rgba(168, 85, 247, 0.05)', borderRadius: '14px',
                            border: '1px solid rgba(168, 85, 247, 0.1)',
                        }}>
                            <div className="spinner" style={{ width: '36px', height: '36px', margin: '0 auto 16px' }}></div>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', fontWeight: 600 }}>
                                AI genereert gerichte examenvragen...
                            </p>
                            <p style={{ color: 'var(--subtle-text)', fontSize: '0.8rem', marginTop: '4px' }}>
                                Domein {activePrediction?.code}: {activePrediction?.title} (voorspelde examenkans: {activePrediction?.predictedChance}%)
                            </p>
                        </div>
                    )}

                    {/* === INTERACTIVE QUESTION === */}
                    {viewMode === 'practice' && !isGenerating && predictedQuestions.length > 0 && currentQ && (
                        <div>
                            {/* Source text */}
                            {currentQ.source_text && (
                                <div style={{
                                    padding: '14px 16px', marginBottom: '16px', borderRadius: '10px',
                                    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                                    fontSize: '0.85rem', lineHeight: 1.7, color: 'var(--text-muted)',
                                }}>
                                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--subtle-text)', marginBottom: '8px', letterSpacing: '0.5px' }}>
                                        BRONTEKST
                                    </div>
                                    <div style={{ fontStyle: 'italic' }}>{currentQ.source_text}</div>
                                </div>
                            )}

                            {/* Question */}
                            <div style={{
                                padding: '16px', marginBottom: '16px', borderRadius: '10px',
                                background: 'linear-gradient(135deg, rgba(34, 211, 238, 0.06), rgba(168, 85, 247, 0.06))',
                                border: '1px solid rgba(34, 211, 238, 0.15)',
                            }}>
                                <div style={{ display: 'flex', gap: '8px', marginBottom: '10px', flexWrap: 'wrap' }}>
                                    <span style={{
                                        fontSize: '0.7rem', padding: '2px 8px', borderRadius: '4px',
                                        background: 'rgba(168, 85, 247, 0.15)', color: '#c084fc', fontWeight: 600,
                                    }}>{currentQ.question_type}</span>
                                    <span style={{
                                        fontSize: '0.7rem', padding: '2px 8px', borderRadius: '4px',
                                        background: `${difficultyColors[currentQ.difficulty] || '#fbbf24'}20`,
                                        color: difficultyColors[currentQ.difficulty] || '#fbbf24', fontWeight: 600,
                                    }}>{currentQ.difficulty}</span>
                                </div>
                                <p style={{ margin: 0, fontSize: '0.95rem', lineHeight: 1.5, fontWeight: 500 }}>
                                    {currentQ.question}
                                </p>
                            </div>

                            {/* Answer input */}
                            {!currentAnswer?.isRevealed && (
                                <div>
                                    {currentQ.options && currentQ.options.length > 0 ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
                                            {currentQ.options.map((option, i) => {
                                                const isSelected = selectedOption === option;
                                                return (
                                                    <button key={i} onClick={() => setSelectedOption(option)} style={{
                                                        display: 'flex', alignItems: 'center', gap: '12px',
                                                        padding: '12px 16px', borderRadius: '10px',
                                                        border: isSelected ? '2px solid #22d3ee' : '1px solid rgba(255,255,255,0.1)',
                                                        background: isSelected ? 'rgba(34, 211, 238, 0.08)' : 'rgba(255,255,255,0.03)',
                                                        color: 'var(--text-main)', cursor: 'pointer', fontSize: '0.9rem',
                                                        lineHeight: 1.4, textAlign: 'left', transition: 'all 0.2s ease',
                                                    }}>
                                                        <span style={{
                                                            width: '24px', height: '24px', borderRadius: '50%', flexShrink: 0,
                                                            border: isSelected ? '2px solid #22d3ee' : '2px solid rgba(255,255,255,0.2)',
                                                            background: isSelected ? 'linear-gradient(135deg, #22d3ee, #a78bfa)' : 'transparent',
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                            fontSize: '0.7rem', fontWeight: 800,
                                                            color: isSelected ? '#0f0f1a' : 'var(--text-muted)',
                                                        }}>{String.fromCharCode(65 + i)}</span>
                                                        <span>{option}</span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <textarea
                                            value={currentInput}
                                            onChange={e => setCurrentInput(e.target.value)}
                                            placeholder="Typ hier je antwoord..."
                                            style={{
                                                width: '100%', minHeight: '100px', padding: '14px', borderRadius: '10px',
                                                border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.04)',
                                                color: 'var(--text-main)', fontSize: '0.9rem', resize: 'vertical',
                                                fontFamily: 'inherit', lineHeight: 1.5, outline: 'none', boxSizing: 'border-box',
                                            }}
                                            onFocus={e => e.target.style.borderColor = 'rgba(34, 211, 238, 0.4)'}
                                            onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
                                        />
                                    )}
                                    <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                                        <button onClick={handleSubmitAnswer}
                                            disabled={currentQ.options ? !selectedOption : !currentInput.trim()}
                                            style={{
                                                flex: 1, padding: '12px', borderRadius: '10px', border: 'none',
                                                background: (currentQ.options ? selectedOption : currentInput.trim())
                                                    ? 'linear-gradient(135deg, #22d3ee, #a78bfa)' : 'rgba(255,255,255,0.05)',
                                                color: (currentQ.options ? selectedOption : currentInput.trim()) ? '#0f0f1a' : 'var(--subtle-text)',
                                                fontWeight: 700, cursor: (currentQ.options ? selectedOption : currentInput.trim()) ? 'pointer' : 'default',
                                                fontSize: '0.9rem', transition: 'all 0.2s',
                                            }}>Controleer Antwoord</button>
                                        <button onClick={() => {
                                            if (currentQ.options) setSelectedOption('(overgeslagen)');
                                            else setCurrentInput('(overgeslagen)');
                                            setTimeout(handleSubmitAnswer, 50);
                                        }} style={{
                                            padding: '12px 16px', borderRadius: '10px',
                                            border: '1px solid rgba(255,255,255,0.1)', background: 'transparent',
                                            color: 'var(--subtle-text)', cursor: 'pointer', fontSize: '0.85rem',
                                        }}>Sla over</button>
                                    </div>
                                </div>
                            )}

                            {/* Revealed answer */}
                            {currentAnswer?.isRevealed && (
                                <div>
                                    {currentAnswer.studentAnswer && currentAnswer.studentAnswer !== '(overgeslagen)' && (
                                        <div style={{
                                            padding: '12px 14px', marginBottom: '12px', borderRadius: '8px',
                                            background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255,255,255,0.08)',
                                        }}>
                                            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--subtle-text)', marginBottom: '6px', letterSpacing: '0.5px' }}>
                                                JOUW ANTWOORD
                                            </div>
                                            <p style={{ margin: 0, fontSize: '0.88rem', lineHeight: 1.5 }}>{currentAnswer.studentAnswer}</p>
                                        </div>
                                    )}

                                    <div style={{
                                        padding: '12px 14px', marginBottom: '12px', borderRadius: '8px',
                                        background: 'rgba(34, 211, 238, 0.06)', border: '1px solid rgba(34, 211, 238, 0.15)',
                                    }}>
                                        <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#22d3ee', marginBottom: '6px', letterSpacing: '0.5px' }}>
                                            MODELANTWOORD
                                        </div>
                                        <p style={{ margin: 0, fontSize: '0.88rem', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>{currentQ.answer}</p>
                                    </div>

                                    <div style={{
                                        padding: '12px 14px', marginBottom: '16px', borderRadius: '8px',
                                        background: 'rgba(168, 85, 247, 0.04)', border: '1px solid rgba(168, 85, 247, 0.1)',
                                    }}>
                                        <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#a78bfa', marginBottom: '6px', letterSpacing: '0.5px' }}>
                                            UITLEG
                                        </div>
                                        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>{currentQ.explanation}</p>
                                    </div>

                                    {/* Self-scoring */}
                                    {currentScore === null && (
                                        <div style={{
                                            display: 'flex', gap: '10px', padding: '14px', borderRadius: '10px',
                                            background: 'rgba(255,255,255,0.03)', border: '1px dashed rgba(255,255,255,0.12)',
                                        }}>
                                            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', marginRight: '8px' }}>
                                                Was je antwoord goed?
                                            </span>
                                            <button onClick={() => handleSelfScore(true)} style={{
                                                flex: 1, padding: '10px', borderRadius: '8px',
                                                border: '1px solid rgba(52, 211, 153, 0.3)', background: 'rgba(52, 211, 153, 0.1)',
                                                color: '#34d399', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem',
                                            }}>Goed</button>
                                            <button onClick={() => handleSelfScore(false)} style={{
                                                flex: 1, padding: '10px', borderRadius: '8px',
                                                border: '1px solid rgba(248, 113, 113, 0.3)', background: 'rgba(248, 113, 113, 0.1)',
                                                color: '#f87171', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem',
                                            }}>Fout</button>
                                        </div>
                                    )}

                                    {/* Navigation */}
                                    {currentScore !== null && (
                                        <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                                            {currentQuestionIndex > 0 && (
                                                <button onClick={() => setCurrentQuestionIndex(prev => prev - 1)} style={{
                                                    padding: '12px 20px', borderRadius: '10px',
                                                    border: '1px solid rgba(255,255,255,0.1)', background: 'transparent',
                                                    color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.85rem',
                                                }}>Vorige</button>
                                            )}
                                            <button onClick={handleNextQuestion} style={{
                                                flex: 1, padding: '12px', borderRadius: '10px', border: 'none',
                                                background: 'linear-gradient(135deg, #22d3ee, #a78bfa)',
                                                color: '#0f0f1a', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem',
                                            }}>
                                                {currentQuestionIndex < predictedQuestions.length - 1
                                                    ? `Volgende (${currentQuestionIndex + 2}/${predictedQuestions.length})`
                                                    : 'Bekijk Resultaten'}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* === RESULTS SCREEN === */}
                    {viewMode === 'results' && (
                        <div>
                            <div style={{
                                textAlign: 'center', padding: '30px 20px', marginBottom: '20px', borderRadius: '14px',
                                background: 'linear-gradient(135deg, rgba(34, 211, 238, 0.08), rgba(168, 85, 247, 0.08))',
                                border: '1px solid rgba(34, 211, 238, 0.15)',
                            }}>
                                <div style={{ fontSize: '3rem', marginBottom: '8px' }}>
                                    {correctCount >= predictedQuestions.length * 0.8 ? '🎉' : correctCount >= predictedQuestions.length * 0.6 ? '💪' : correctCount >= predictedQuestions.length * 0.4 ? '📚' : '🔥'}
                                </div>
                                <div style={{
                                    fontSize: '2.5rem', fontWeight: 800,
                                    background: 'linear-gradient(135deg, #22d3ee, #a78bfa)',
                                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '4px',
                                }}>{correctCount}/{answeredCount}</div>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0 0 4px' }}>
                                    {activePrediction && `Domein ${activePrediction.code}: ${activePrediction.title}`}
                                </p>
                                <p style={{ color: 'var(--subtle-text)', fontSize: '0.8rem', margin: 0 }}>
                                    {correctCount >= predictedQuestions.length * 0.8
                                        ? 'Uitstekend! Je bent goed voorbereid op dit domein!'
                                        : correctCount >= predictedQuestions.length * 0.6
                                            ? 'Goed bezig! Nog een paar puntjes verbeteren.'
                                            : correctCount >= predictedQuestions.length * 0.4
                                                ? 'Prima start, maar meer oefening is nodig.'
                                                : 'Geen zorgen — elk fout antwoord is een leerkans!'}
                                </p>
                            </div>

                            {/* Question review */}
                            <h4 style={{ margin: '0 0 12px', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                                OVERZICHT VRAGEN
                            </h4>
                            {predictedQuestions.map((q, i) => (
                                <div key={i} style={{
                                    display: 'flex', alignItems: 'center', gap: '12px',
                                    padding: '10px 14px', marginBottom: '6px', borderRadius: '8px',
                                    background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
                                    cursor: 'pointer',
                                }} onClick={() => { setViewMode('practice'); setCurrentQuestionIndex(i); }}>
                                    <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>
                                        {selfScores[i] === true ? '✅' : selfScores[i] === false ? '❌' : '⚪'}
                                    </span>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <p style={{
                                            margin: 0, fontSize: '0.85rem', lineHeight: 1.3,
                                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                        }}>{q.question}</p>
                                    </div>
                                    <span style={{
                                        fontSize: '0.7rem', padding: '2px 8px', borderRadius: '4px',
                                        background: `${difficultyColors[q.difficulty] || '#fbbf24'}20`,
                                        color: difficultyColors[q.difficulty] || '#fbbf24', fontWeight: 600, flexShrink: 0,
                                    }}>{q.difficulty}</span>
                                </div>
                            ))}

                            {/* Actions */}
                            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                                <button onClick={handleBackToPrediction} style={{
                                    flex: 1, padding: '12px', borderRadius: '10px',
                                    border: '1px solid rgba(255,255,255,0.15)', background: 'transparent',
                                    color: 'var(--text-main)', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem',
                                }}>Terug naar Overzicht</button>
                                <button onClick={() => { if (activePrediction) startPractice(activePrediction); }} style={{
                                    flex: 1, padding: '12px', borderRadius: '10px', border: 'none',
                                    background: 'linear-gradient(135deg, #22d3ee, #a78bfa)',
                                    color: '#0f0f1a', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem',
                                }}>Meer Vragen</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ExamPredictorModal;
