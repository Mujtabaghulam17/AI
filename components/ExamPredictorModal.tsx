import React, { useState } from 'react';
import { getCEDomains, type ExamDomain } from '../data/examInfo.ts';
import { generateContentWithRetry, cleanAndParseJSON } from '../api/gemini.ts';
import { Type } from "@google/genai";

const MODEL_NAME = 'gemini-2.5-flash';

interface ExamPredictorModalProps {
    isOpen: boolean;
    onClose: () => void;
    subject: string;
    examLevel?: string;
}

interface PredictedQuestion {
    question: string;
    source_text: string;
    answer: string;
    explanation: string;
    difficulty: 'makkelijk' | 'gemiddeld' | 'moeilijk';
    domain_code: string;
    question_type: string;
}

type AnswerResult = {
    studentAnswer: string;
    isRevealed: boolean;
};

const ExamPredictorModal: React.FC<ExamPredictorModalProps> = ({ isOpen, onClose, subject, examLevel = 'VWO' }) => {
    const [selectedDomain, setSelectedDomain] = useState<ExamDomain | null>(null);
    const [predictedQuestions, setPredictedQuestions] = useState<PredictedQuestion[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedDomains, setGeneratedDomains] = useState<string[]>([]);

    // Interactive answering state
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<AnswerResult[]>([]);
    const [currentInput, setCurrentInput] = useState('');
    const [showResults, setShowResults] = useState(false);
    const [selfScores, setSelfScores] = useState<(boolean | null)[]>([]);

    const ceDomains = getCEDomains(subject, examLevel);
    const domainColors = ['#22d3ee', '#a78bfa', '#f472b6', '#34d399', '#fbbf24', '#fb923c', '#60a5fa', '#e879f9'];
    const difficultyColors: Record<string, string> = {
        'makkelijk': '#34d399',
        'gemiddeld': '#fbbf24',
        'moeilijk': '#f87171',
    };

    const generatePredictions = async (domain: ExamDomain) => {
        setSelectedDomain(domain);
        setIsGenerating(true);
        setCurrentQuestionIndex(0);
        setAnswers([]);
        setCurrentInput('');
        setShowResults(false);
        setSelfScores([]);

        const subdomainsText = domain.subdomains?.map(s => `  - ${s.code}: ${s.title}`).join('\n') || '';

        const prompt = `Je bent een ervaren ${examLevel} examinator voor ${subject}. Genereer 10 realistische examenvragen in de stijl van het Centraal Examen.

=== DOMEIN ===
${domain.code}: ${domain.title}
${subdomainsText ? `Subdomeinen:\n${subdomainsText}` : ''}

=== INSTRUCTIES ===
Genereer vragen die EXACT lijken op echte CE-vragen voor ${subject} ${examLevel}. Dit betekent:

1. **Brontekst/context is verplicht**: Elke vraag MOET een brontekst bevatten. Dit kan zijn:
   - Een tekstfragment (artikel, essay, gedicht, bron) waar vragen over gesteld worden
   - Een beschrijving van een grafiek, tabel of diagram
   - Een historische bron, citaat of document
   - Een wetenschappelijke tekst of casus
   De brontekst moet realistisch en gedetailleerd zijn (minimaal 3-4 zinnen).

2. **Vraagformulering**: Formuleer vragen precies zoals in het CE:
   - "Leg uit waarom..." / "Verklaar met behulp van bron X..."
   - "Welke van de volgende uitspraken is juist op basis van de tekst?"
   - "Citeer de zin waaruit blijkt dat..."
   - "Bereken..." / "Geef twee argumenten..."
   - Geef bij open vragen aan hoeveel punten de vraag waard is (bijv. "2p")

3. **Mix van vraagtypen**: open vragen, meerkeuzevragen, citaatvragen, berekenopgaven
4. **Maak 10 vragen**: 3 makkelijk, 4 gemiddeld, 3 moeilijk
5. **Geef bij elke vraag**:
   - source_text: de brontekst/context (VERPLICHT, minimaal 3-4 zinnen)
   - question: de examenvraag zelf
   - question_type: type vraag (bijv. "open vraag (2p)", "meerkeuze", "citaatvraag")
   - answer: het correcte modelantwoord (volledig, zoals in het correctiemodel)
   - explanation: uitleg waarom dit het juiste antwoord is en welke concepten/vaardigheden getoetst worden
   - difficulty: makkelijk/gemiddeld/moeilijk
   - domain_code: de domein-code

Let op: dit is ${examLevel}-niveau! Zorg dat het niveau klopt.

JSON output.`;

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
                                    },
                                    required: ["source_text", "question", "question_type", "answer", "explanation", "difficulty", "domain_code"]
                                }
                            }
                        },
                        required: ["questions"]
                    }
                }
            });
            const result = cleanAndParseJSON(response.text || '');
            if (result?.questions) {
                setPredictedQuestions(result.questions);
                setAnswers(result.questions.map(() => ({ studentAnswer: '', isRevealed: false })));
                setSelfScores(result.questions.map(() => null));
                if (!generatedDomains.includes(domain.code)) {
                    setGeneratedDomains(prev => [...prev, domain.code]);
                }
            }
        } catch (e) {
            console.error('Failed to generate predictions:', e);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSubmitAnswer = () => {
        const newAnswers = [...answers];
        newAnswers[currentQuestionIndex] = { studentAnswer: currentInput, isRevealed: true };
        setAnswers(newAnswers);
        setCurrentInput('');
    };

    const handleSelfScore = (correct: boolean) => {
        const newScores = [...selfScores];
        newScores[currentQuestionIndex] = correct;
        setSelfScores(newScores);
    };

    const handleNextQuestion = () => {
        if (currentQuestionIndex < predictedQuestions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        } else {
            setShowResults(true);
        }
    };

    const handlePrevQuestion = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1);
        }
    };

    const handleRestart = () => {
        setSelectedDomain(null);
        setPredictedQuestions([]);
        setCurrentQuestionIndex(0);
        setAnswers([]);
        setCurrentInput('');
        setShowResults(false);
        setSelfScores([]);
    };

    const handleClose = () => {
        handleRestart();
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
                maxWidth: '780px',
                width: '95%',
                borderRadius: '20px',
                padding: '0',
                overflow: 'hidden',
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
                                🔮 AI Examenvoorspeller
                            </h2>
                            <p style={{ margin: '6px 0 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                {predictedQuestions.length > 0 && !showResults
                                    ? `Vraag ${currentQuestionIndex + 1} van ${predictedQuestions.length} — ${selectedDomain?.title}`
                                    : `Voorspelde examenvragen voor ${subject}`
                                }
                            </p>
                        </div>
                        <button onClick={handleClose} style={{
                            background: 'rgba(255,255,255,0.1)',
                            border: 'none',
                            color: 'var(--text-main)',
                            fontSize: '1.2rem',
                            cursor: 'pointer',
                            borderRadius: '8px',
                            padding: '6px 10px',
                        }}>✕</button>
                    </div>

                    {/* Progress dots */}
                    {predictedQuestions.length > 0 && !showResults && (
                        <div style={{ display: 'flex', gap: '4px', marginTop: '12px' }}>
                            {predictedQuestions.map((_, i) => (
                                <div
                                    key={i}
                                    onClick={() => { if (answers[i]?.isRevealed || i <= currentQuestionIndex) setCurrentQuestionIndex(i); }}
                                    style={{
                                        flex: 1,
                                        height: '4px',
                                        borderRadius: '2px',
                                        cursor: (answers[i]?.isRevealed || i <= currentQuestionIndex) ? 'pointer' : 'default',
                                        background: i === currentQuestionIndex
                                            ? 'linear-gradient(90deg, #22d3ee, #a78bfa)'
                                            : selfScores[i] === true
                                                ? '#34d399'
                                                : selfScores[i] === false
                                                    ? '#f87171'
                                                    : answers[i]?.isRevealed
                                                        ? 'rgba(255,255,255,0.3)'
                                                        : 'rgba(255,255,255,0.08)',
                                        transition: 'all 0.3s ease',
                                    }}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Content */}
                <div style={{ padding: '20px 28px 28px', maxHeight: '72vh', overflowY: 'auto' }}>

                    {/* === DOMAIN SELECTOR === */}
                    {predictedQuestions.length === 0 && !isGenerating && (
                        <>
                            <div style={{ marginBottom: '20px' }}>
                                <h4 style={{ margin: '0 0 12px', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.5px' }}>
                                    KIES EEN DOMEIN
                                </h4>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                    {ceDomains.map((domain, i) => {
                                        const isGenerated = generatedDomains.includes(domain.code);
                                        return (
                                            <button
                                                key={domain.code}
                                                onClick={() => generatePredictions(domain)}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '8px',
                                                    padding: '10px 16px',
                                                    borderRadius: '10px',
                                                    border: '1px solid rgba(255,255,255,0.1)',
                                                    background: 'rgba(255,255,255,0.03)',
                                                    color: 'var(--text-main)',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s ease',
                                                    fontSize: '0.85rem',
                                                }}
                                            >
                                                <span style={{
                                                    color: domainColors[i % domainColors.length],
                                                    fontWeight: 800,
                                                    fontSize: '0.8rem',
                                                }}>{domain.code}</span>
                                                <span>{domain.title}</span>
                                                {isGenerated && <span style={{ fontSize: '0.7rem' }}>✅</span>}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                                <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🔮</div>
                                <p style={{ fontSize: '0.95rem', marginBottom: '6px' }}>Selecteer een domein hierboven</p>
                                <p style={{ fontSize: '0.8rem', color: 'var(--subtle-text)' }}>
                                    Je krijgt 10 realistische CE-vragen die je zelf beantwoordt
                                </p>
                            </div>
                        </>
                    )}

                    {/* === LOADING === */}
                    {isGenerating && (
                        <div style={{
                            textAlign: 'center',
                            padding: '50px 20px',
                            background: 'rgba(168, 85, 247, 0.05)',
                            borderRadius: '14px',
                            border: '1px solid rgba(168, 85, 247, 0.1)',
                        }}>
                            <div className="spinner" style={{ width: '36px', height: '36px', margin: '0 auto 16px' }}></div>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', fontWeight: 600 }}>
                                🔮 AI genereert 10 examenvragen...
                            </p>
                            <p style={{ color: 'var(--subtle-text)', fontSize: '0.8rem', marginTop: '4px' }}>
                                Domein {selectedDomain?.code}: {selectedDomain?.title}
                            </p>
                        </div>
                    )}

                    {/* === INTERACTIVE QUESTION === */}
                    {!isGenerating && predictedQuestions.length > 0 && !showResults && currentQ && (
                        <div>
                            {/* Source text */}
                            {currentQ.source_text && (
                                <div style={{
                                    padding: '14px 16px',
                                    marginBottom: '16px',
                                    borderRadius: '10px',
                                    background: 'rgba(255,255,255,0.03)',
                                    border: '1px solid rgba(255,255,255,0.08)',
                                    fontSize: '0.85rem',
                                    lineHeight: 1.7,
                                    color: 'var(--text-muted)',
                                }}>
                                    <div style={{
                                        fontSize: '0.72rem',
                                        fontWeight: 700,
                                        color: 'var(--subtle-text)',
                                        marginBottom: '8px',
                                        letterSpacing: '0.5px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                    }}>
                                        📄 BRONTEKST
                                    </div>
                                    <div style={{ fontStyle: 'italic' }}>{currentQ.source_text}</div>
                                </div>
                            )}

                            {/* Question */}
                            <div style={{
                                padding: '16px',
                                marginBottom: '16px',
                                borderRadius: '10px',
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
                                    <span style={{
                                        fontSize: '0.7rem', padding: '2px 8px', borderRadius: '4px',
                                        background: 'rgba(34, 211, 238, 0.1)', color: '#22d3ee',
                                    }}>{currentQ.domain_code}</span>
                                </div>
                                <p style={{ margin: 0, fontSize: '0.95rem', lineHeight: 1.5, fontWeight: 500 }}>
                                    {currentQ.question}
                                </p>
                            </div>

                            {/* Answer input (if not revealed yet) */}
                            {!currentAnswer?.isRevealed && (
                                <div>
                                    <textarea
                                        value={currentInput}
                                        onChange={e => setCurrentInput(e.target.value)}
                                        placeholder="Typ hier je antwoord..."
                                        style={{
                                            width: '100%',
                                            minHeight: '100px',
                                            padding: '14px',
                                            borderRadius: '10px',
                                            border: '1px solid rgba(255,255,255,0.12)',
                                            background: 'rgba(255,255,255,0.04)',
                                            color: 'var(--text-main)',
                                            fontSize: '0.9rem',
                                            resize: 'vertical',
                                            fontFamily: 'inherit',
                                            lineHeight: 1.5,
                                            outline: 'none',
                                            boxSizing: 'border-box',
                                        }}
                                        onFocus={e => e.target.style.borderColor = 'rgba(34, 211, 238, 0.4)'}
                                        onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
                                    />
                                    <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                                        <button
                                            onClick={handleSubmitAnswer}
                                            disabled={!currentInput.trim()}
                                            style={{
                                                flex: 1,
                                                padding: '12px',
                                                borderRadius: '10px',
                                                border: 'none',
                                                background: currentInput.trim()
                                                    ? 'linear-gradient(135deg, #22d3ee, #a78bfa)'
                                                    : 'rgba(255,255,255,0.05)',
                                                color: currentInput.trim() ? '#0f0f1a' : 'var(--subtle-text)',
                                                fontWeight: 700,
                                                cursor: currentInput.trim() ? 'pointer' : 'default',
                                                fontSize: '0.9rem',
                                                transition: 'all 0.2s',
                                            }}
                                        >
                                            Controleer Antwoord
                                        </button>
                                        <button
                                            onClick={() => {
                                                setCurrentInput('(overgeslagen)');
                                                setTimeout(handleSubmitAnswer, 50);
                                            }}
                                            style={{
                                                padding: '12px 16px',
                                                borderRadius: '10px',
                                                border: '1px solid rgba(255,255,255,0.1)',
                                                background: 'transparent',
                                                color: 'var(--subtle-text)',
                                                cursor: 'pointer',
                                                fontSize: '0.85rem',
                                            }}
                                        >
                                            Sla over
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Revealed answer */}
                            {currentAnswer?.isRevealed && (
                                <div>
                                    {/* Student answer */}
                                    {currentAnswer.studentAnswer && currentAnswer.studentAnswer !== '(overgeslagen)' && (
                                        <div style={{
                                            padding: '12px 14px',
                                            marginBottom: '12px',
                                            borderRadius: '8px',
                                            background: 'rgba(255, 255, 255, 0.03)',
                                            border: '1px solid rgba(255,255,255,0.08)',
                                        }}>
                                            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--subtle-text)', marginBottom: '6px', letterSpacing: '0.5px' }}>
                                                JOUW ANTWOORD
                                            </div>
                                            <p style={{ margin: 0, fontSize: '0.88rem', lineHeight: 1.5 }}>{currentAnswer.studentAnswer}</p>
                                        </div>
                                    )}

                                    {/* Model answer */}
                                    <div style={{
                                        padding: '12px 14px',
                                        marginBottom: '12px',
                                        borderRadius: '8px',
                                        background: 'rgba(34, 211, 238, 0.06)',
                                        border: '1px solid rgba(34, 211, 238, 0.15)',
                                    }}>
                                        <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#22d3ee', marginBottom: '6px', letterSpacing: '0.5px' }}>
                                            MODELANTWOORD
                                        </div>
                                        <p style={{ margin: 0, fontSize: '0.88rem', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>{currentQ.answer}</p>
                                    </div>

                                    {/* Explanation */}
                                    <div style={{
                                        padding: '12px 14px',
                                        marginBottom: '16px',
                                        borderRadius: '8px',
                                        background: 'rgba(168, 85, 247, 0.04)',
                                        border: '1px solid rgba(168, 85, 247, 0.1)',
                                    }}>
                                        <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#a78bfa', marginBottom: '6px', letterSpacing: '0.5px' }}>
                                            UITLEG & BEOORDELINGSCRITERIA
                                        </div>
                                        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>{currentQ.explanation}</p>
                                    </div>

                                    {/* Self-scoring */}
                                    {currentScore === null && (
                                        <div style={{
                                            display: 'flex',
                                            gap: '10px',
                                            padding: '14px',
                                            borderRadius: '10px',
                                            background: 'rgba(255,255,255,0.03)',
                                            border: '1px dashed rgba(255,255,255,0.12)',
                                        }}>
                                            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', marginRight: '8px' }}>
                                                Was je antwoord goed?
                                            </span>
                                            <button
                                                onClick={() => handleSelfScore(true)}
                                                style={{
                                                    flex: 1, padding: '10px', borderRadius: '8px',
                                                    border: '1px solid rgba(52, 211, 153, 0.3)',
                                                    background: 'rgba(52, 211, 153, 0.1)',
                                                    color: '#34d399', fontWeight: 700, cursor: 'pointer',
                                                    fontSize: '0.9rem',
                                                }}
                                            >
                                                ✅ Goed
                                            </button>
                                            <button
                                                onClick={() => handleSelfScore(false)}
                                                style={{
                                                    flex: 1, padding: '10px', borderRadius: '8px',
                                                    border: '1px solid rgba(248, 113, 113, 0.3)',
                                                    background: 'rgba(248, 113, 113, 0.1)',
                                                    color: '#f87171', fontWeight: 700, cursor: 'pointer',
                                                    fontSize: '0.9rem',
                                                }}
                                            >
                                                ❌ Fout
                                            </button>
                                        </div>
                                    )}

                                    {/* Navigation */}
                                    {currentScore !== null && (
                                        <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                                            {currentQuestionIndex > 0 && (
                                                <button onClick={handlePrevQuestion} style={{
                                                    padding: '12px 20px', borderRadius: '10px',
                                                    border: '1px solid rgba(255,255,255,0.1)',
                                                    background: 'transparent', color: 'var(--text-muted)',
                                                    cursor: 'pointer', fontSize: '0.85rem',
                                                }}>← Vorige</button>
                                            )}
                                            <button onClick={handleNextQuestion} style={{
                                                flex: 1, padding: '12px', borderRadius: '10px',
                                                border: 'none',
                                                background: 'linear-gradient(135deg, #22d3ee, #a78bfa)',
                                                color: '#0f0f1a', fontWeight: 700, cursor: 'pointer',
                                                fontSize: '0.9rem',
                                            }}>
                                                {currentQuestionIndex < predictedQuestions.length - 1
                                                    ? `Volgende Vraag (${currentQuestionIndex + 2}/${predictedQuestions.length})`
                                                    : '📊 Bekijk Resultaten'}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* === RESULTS SCREEN === */}
                    {showResults && (
                        <div>
                            {/* Score header */}
                            <div style={{
                                textAlign: 'center',
                                padding: '30px 20px',
                                marginBottom: '20px',
                                borderRadius: '14px',
                                background: 'linear-gradient(135deg, rgba(34, 211, 238, 0.08), rgba(168, 85, 247, 0.08))',
                                border: '1px solid rgba(34, 211, 238, 0.15)',
                            }}>
                                <div style={{ fontSize: '3rem', marginBottom: '8px' }}>
                                    {correctCount >= predictedQuestions.length * 0.8 ? '🎉' : correctCount >= predictedQuestions.length * 0.6 ? '💪' : correctCount >= predictedQuestions.length * 0.4 ? '📚' : '🔥'}
                                </div>
                                <div style={{
                                    fontSize: '2.5rem',
                                    fontWeight: 800,
                                    background: 'linear-gradient(135deg, #22d3ee, #a78bfa)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    marginBottom: '4px',
                                }}>
                                    {correctCount}/{answeredCount}
                                </div>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>
                                    {correctCount >= predictedQuestions.length * 0.8
                                        ? 'Uitstekend! Je bent goed voorbereid!'
                                        : correctCount >= predictedQuestions.length * 0.6
                                            ? 'Goed bezig! Nog een paar puntjes verbeteren.'
                                            : correctCount >= predictedQuestions.length * 0.4
                                                ? 'Prima start, maar meer oefening is nodig.'
                                                : 'Geen zorgen — elk fout antwoord is een leerkans!'}
                                </p>
                            </div>

                            {/* Question review list */}
                            <h4 style={{ margin: '0 0 12px', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                                OVERZICHT VRAGEN
                            </h4>
                            {predictedQuestions.map((q, i) => (
                                <div key={i} style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    padding: '10px 14px',
                                    marginBottom: '6px',
                                    borderRadius: '8px',
                                    background: 'rgba(255,255,255,0.02)',
                                    border: '1px solid rgba(255,255,255,0.06)',
                                    cursor: 'pointer',
                                }}
                                    onClick={() => { setShowResults(false); setCurrentQuestionIndex(i); }}
                                >
                                    <span style={{
                                        fontSize: '1.1rem',
                                        flexShrink: 0,
                                    }}>
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
                                        color: difficultyColors[q.difficulty] || '#fbbf24',
                                        fontWeight: 600, flexShrink: 0,
                                    }}>{q.difficulty}</span>
                                </div>
                            ))}

                            {/* Actions */}
                            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                                <button onClick={handleRestart} style={{
                                    flex: 1, padding: '12px', borderRadius: '10px',
                                    border: 'none',
                                    background: 'linear-gradient(135deg, #22d3ee, #a78bfa)',
                                    color: '#0f0f1a', fontWeight: 700, cursor: 'pointer',
                                    fontSize: '0.9rem',
                                }}>
                                    Kies Ander Domein
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ExamPredictorModal;
