import React, { useState } from 'react';
import { getCEDomains, getExamProgramSummary, type ExamDomain } from '../data/examInfo.ts';
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
    source_text: string; // Context/passage/source that accompanies the question
    answer: string;
    explanation: string;
    difficulty: 'makkelijk' | 'gemiddeld' | 'moeilijk';
    domain_code: string;
    question_type: string; // e.g. 'open vraag', 'meerkeuze', 'citaatvraag', etc.
}

const ExamPredictorModal: React.FC<ExamPredictorModalProps> = ({ isOpen, onClose, subject, examLevel = 'VWO' }) => {
    const [selectedDomain, setSelectedDomain] = useState<ExamDomain | null>(null);
    const [predictedQuestions, setPredictedQuestions] = useState<PredictedQuestion[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [expandedQuestion, setExpandedQuestion] = useState<number | null>(null);
    const [generatedDomains, setGeneratedDomains] = useState<string[]>([]);

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
        setExpandedQuestion(null);

        const subdomainsText = domain.subdomains?.map(s => `  - ${s.code}: ${s.title}`).join('\n') || '';

        const prompt = `Je bent een ervaren ${examLevel} examinator voor ${subject}. Genereer 5 realistische examenvragen in de stijl van het Centraal Examen.

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
4. **Moeilijkheidsgraad**: 1 makkelijk, 2 gemiddeld, 2 moeilijk
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

    // Reset on close
    const handleClose = () => {
        setSelectedDomain(null);
        setPredictedQuestions([]);
        setExpandedQuestion(null);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={handleClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()} style={{
                maxWidth: '680px',
                width: '95%',
                borderRadius: '20px',
                padding: '0',
                overflow: 'hidden',
            }}>
                {/* Header */}
                <div style={{
                    padding: '24px 28px 20px',
                    background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.12), rgba(34, 211, 238, 0.12))',
                    borderBottom: '1px solid rgba(168, 85, 247, 0.2)',
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h2 style={{ margin: 0, fontSize: '1.3rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                🔮 AI Examenvoorspeller
                            </h2>
                            <p style={{ margin: '6px 0 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                Voorspelde examenvragen voor <strong>{subject}</strong> op basis van het officiële examenprogramma
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
                </div>

                {/* Content */}
                <div style={{ padding: '20px 28px 28px', maxHeight: '70vh', overflowY: 'auto' }}>
                    {/* Domain selector */}
                    <div style={{ marginBottom: '20px' }}>
                        <h4 style={{ margin: '0 0 12px', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.5px' }}>
                            KIES EEN DOMEIN
                        </h4>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                            {ceDomains.map((domain, i) => {
                                const isSelected = selectedDomain?.code === domain.code;
                                const isGenerated = generatedDomains.includes(domain.code);
                                return (
                                    <button
                                        key={domain.code}
                                        onClick={() => generatePredictions(domain)}
                                        disabled={isGenerating}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            padding: '10px 16px',
                                            borderRadius: '10px',
                                            border: isSelected
                                                ? `2px solid ${domainColors[i % domainColors.length]}`
                                                : '1px solid rgba(255,255,255,0.1)',
                                            background: isSelected
                                                ? `rgba(${i % 2 === 0 ? '34, 211, 238' : '168, 85, 247'}, 0.15)`
                                                : 'rgba(255,255,255,0.03)',
                                            color: 'var(--text-main)',
                                            cursor: isGenerating ? 'wait' : 'pointer',
                                            transition: 'all 0.2s ease',
                                            fontSize: '0.85rem',
                                            position: 'relative',
                                        }}
                                    >
                                        <span style={{
                                            color: domainColors[i % domainColors.length],
                                            fontWeight: 800,
                                            fontSize: '0.8rem',
                                        }}>
                                            {domain.code}
                                        </span>
                                        <span>{domain.title}</span>
                                        {isGenerated && !isSelected && (
                                            <span style={{ fontSize: '0.7rem' }}>✅</span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Loading state */}
                    {isGenerating && (
                        <div style={{
                            textAlign: 'center',
                            padding: '40px',
                            background: 'rgba(168, 85, 247, 0.05)',
                            borderRadius: '14px',
                            border: '1px solid rgba(168, 85, 247, 0.1)',
                        }}>
                            <div className="spinner" style={{ width: '32px', height: '32px', margin: '0 auto 16px' }}></div>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                🔮 AI analyseert examenprogramma en trends...
                            </p>
                            <p style={{ color: 'var(--subtle-text)', fontSize: '0.8rem', marginTop: '4px' }}>
                                Domein {selectedDomain?.code}: {selectedDomain?.title}
                            </p>
                        </div>
                    )}

                    {/* Questions */}
                    {!isGenerating && predictedQuestions.length > 0 && (
                        <div>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '14px',
                            }}>
                                <h4 style={{ margin: 0, fontSize: '0.9rem' }}>
                                    Voorspelde vragen — Domein {selectedDomain?.code}: {selectedDomain?.title}
                                </h4>
                                <span style={{
                                    fontSize: '0.75rem',
                                    color: 'var(--subtle-text)',
                                    background: 'rgba(255,255,255,0.05)',
                                    padding: '3px 10px',
                                    borderRadius: '6px',
                                }}>
                                    {predictedQuestions.length} vragen
                                </span>
                            </div>

                            {predictedQuestions.map((q, i) => (
                                <div
                                    key={i}
                                    style={{
                                        marginBottom: '10px',
                                        borderRadius: '12px',
                                        border: '1px solid rgba(255,255,255,0.08)',
                                        overflow: 'hidden',
                                        background: expandedQuestion === i
                                            ? 'rgba(168, 85, 247, 0.04)'
                                            : 'rgba(255,255,255,0.02)',
                                        transition: 'all 0.2s ease',
                                    }}
                                >
                                    {/* Question header */}
                                    <div
                                        onClick={() => setExpandedQuestion(expandedQuestion === i ? null : i)}
                                        style={{
                                            padding: '14px 16px',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'flex-start',
                                            gap: '12px',
                                        }}
                                    >
                                        <span style={{
                                            background: 'linear-gradient(135deg, var(--cyan), var(--purple))',
                                            color: '#0f0f1a',
                                            fontWeight: 800,
                                            fontSize: '0.7rem',
                                            padding: '3px 8px',
                                            borderRadius: '6px',
                                            flexShrink: 0,
                                            marginTop: '2px',
                                        }}>
                                            {i + 1}
                                        </span>
                                        <div style={{ flex: 1 }}>
                                            {/* Source text / context */}
                                            {q.source_text && (
                                                <div style={{
                                                    padding: '10px 12px',
                                                    marginBottom: '10px',
                                                    borderRadius: '8px',
                                                    background: 'rgba(255,255,255,0.03)',
                                                    border: '1px solid rgba(255,255,255,0.06)',
                                                    fontSize: '0.82rem',
                                                    lineHeight: 1.6,
                                                    color: 'var(--text-muted)',
                                                    fontStyle: 'italic',
                                                }}>
                                                    <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--subtle-text)', marginBottom: '6px', letterSpacing: '0.5px', fontStyle: 'normal' }}>
                                                        📄 BRONTEKST
                                                    </div>
                                                    {q.source_text}
                                                </div>
                                            )}
                                            <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: 1.4 }}>{q.question}</p>
                                            <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
                                                {q.question_type && (
                                                    <span style={{
                                                        fontSize: '0.7rem',
                                                        padding: '2px 8px',
                                                        borderRadius: '4px',
                                                        background: 'rgba(168, 85, 247, 0.1)',
                                                        color: '#c084fc',
                                                        fontWeight: 600,
                                                    }}>
                                                        {q.question_type}
                                                    </span>
                                                )}
                                                <span style={{
                                                    fontSize: '0.7rem',
                                                    padding: '2px 8px',
                                                    borderRadius: '4px',
                                                    background: `${difficultyColors[q.difficulty] || '#fbbf24'}20`,
                                                    color: difficultyColors[q.difficulty] || '#fbbf24',
                                                    fontWeight: 600,
                                                }}>
                                                    {q.difficulty}
                                                </span>
                                                <span style={{
                                                    fontSize: '0.7rem',
                                                    padding: '2px 8px',
                                                    borderRadius: '4px',
                                                    background: 'rgba(34, 211, 238, 0.1)',
                                                    color: '#22d3ee',
                                                }}>
                                                    {q.domain_code}
                                                </span>
                                            </div>
                                        </div>
                                        <span style={{
                                            fontSize: '0.9rem',
                                            color: 'var(--subtle-text)',
                                            transition: 'transform 0.2s ease',
                                            transform: expandedQuestion === i ? 'rotate(180deg)' : 'rotate(0)',
                                        }}>
                                            ▼
                                        </span>
                                    </div>

                                    {/* Expanded answer */}
                                    {expandedQuestion === i && (
                                        <div style={{
                                            padding: '0 16px 16px',
                                            borderTop: '1px solid rgba(255,255,255,0.06)',
                                        }}>
                                            <div style={{
                                                margin: '14px 0 10px',
                                                padding: '12px 14px',
                                                borderRadius: '8px',
                                                background: 'rgba(34, 211, 238, 0.06)',
                                                border: '1px solid rgba(34, 211, 238, 0.12)',
                                            }}>
                                                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#22d3ee', marginBottom: '6px', letterSpacing: '0.5px' }}>
                                                    MODELANTWOORD
                                                </div>
                                                <p style={{ margin: 0, fontSize: '0.88rem', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>{q.answer}</p>
                                            </div>
                                            <div style={{
                                                padding: '12px 14px',
                                                borderRadius: '8px',
                                                background: 'rgba(168, 85, 247, 0.04)',
                                                border: '1px solid rgba(168, 85, 247, 0.1)',
                                            }}>
                                                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#a78bfa', marginBottom: '6px', letterSpacing: '0.5px' }}>
                                                    UITLEG & BEOORDELINGSCRITERIA
                                                </div>
                                                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>{q.explanation}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Empty state */}
                    {!isGenerating && predictedQuestions.length === 0 && (
                        <div style={{
                            textAlign: 'center',
                            padding: '40px 20px',
                            color: 'var(--text-muted)',
                        }}>
                            <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🔮</div>
                            <p style={{ fontSize: '0.95rem', marginBottom: '6px' }}>Selecteer een domein hierboven</p>
                            <p style={{ fontSize: '0.8rem', color: 'var(--subtle-text)' }}>
                                De AI analyseert het examenprogramma en genereert realistische examenvragen
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ExamPredictorModal;
