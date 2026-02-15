import React, { useState } from 'react';
import type { Question } from '../data/data.ts';

interface ThinkingProcessModalProps {
    isOpen: boolean;
    onClose: () => void;
    questionContext: { question: Question; userAnswer: string; } | null;
    onAnalyze: (reflections: { deconstruction: string; reasoning: string; }) => Promise<string>;
}

const ThinkingProcessModal: React.FC<ThinkingProcessModalProps> = ({ isOpen, onClose, questionContext, onAnalyze }) => {
    const [step, setStep] = useState(1);
    const [deconstruction, setDeconstruction] = useState('');
    const [reasoning, setReasoning] = useState('');
    const [analysis, setAnalysis] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    if (!isOpen || !questionContext) return null;
    
    const { question, userAnswer } = questionContext;

    const handleNext = () => {
        if (step === 1 && deconstruction.trim()) {
            setStep(2);
        }
    };

    const handleSubmit = async () => {
        if (reasoning.trim()) {
            setIsLoading(true);
            const result = await onAnalyze({ deconstruction, reasoning });
            setAnalysis(result);
            setIsLoading(false);
            setStep(3);
        }
    };

    const handleClose = () => {
        setStep(1);
        setDeconstruction('');
        setReasoning('');
        setAnalysis('');
        setIsLoading(false);
        onClose();
    };

    const renderStepContent = () => {
        if (isLoading) {
             return (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                    <div className="spinner"></div>
                    <p style={{ marginTop: '16px', color: 'var(--subtle-text)' }}>De AI analyseert je denkproces...</p>
                </div>
            );
        }

        switch (step) {
            case 1:
                return (
                    <>
                        <p style={{color: 'var(--subtle-text)', fontSize: '14px'}}>Stap 1 van 2: De Vraag Begrijpen</p>
                        <p style={{fontWeight: 600}}>Wat is de kerntaak die de vraag van je vraagt? Probeer het in je eigen woorden te formuleren.</p>
                        <textarea
                            value={deconstruction}
                            onChange={(e) => setDeconstruction(e.target.value)}
                            placeholder="Bijvoorbeeld: 'Ik moet de reden achter de conclusie van de auteur vinden' of 'Ik moet twee standpunten met elkaar vergelijken'..."
                            rows={4}
                        />
                        <button className="button" onClick={handleNext} disabled={!deconstruction.trim()}>Volgende</button>
                    </>
                );
            case 2:
                return (
                    <>
                         <p style={{color: 'var(--subtle-text)', fontSize: '14px'}}>Stap 2 van 2: Je Redenering Uitleggen</p>
                        <p style={{fontWeight: 600}}>Welke logische stappen heb je genomen om van de tekst naar jouw antwoord te komen?</p>
                        <textarea
                            value={reasoning}
                            onChange={(e) => setReasoning(e.target.value)}
                            placeholder="Bijvoorbeeld: 'Eerst las ik de laatste zin, omdat daar vaak de conclusie staat. Toen zag ik het woord X, wat me deed denken aan Y. Daarom koos ik voor antwoord Z...'"
                            rows={6}
                        />
                         <button className="button" onClick={handleSubmit} disabled={!reasoning.trim()}>Analyseer mijn denkproces</button>
                    </>
                );
            case 3:
                return (
                     <>
                        <div className="ai-feedback" style={{marginTop: 0}}>
                            <h3 style={{marginTop: 0, color: 'var(--primary-color)'}}>AI Analyse van je Proces</h3>
                            <p style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{analysis}</p>
                        </div>
                        <button className="button" onClick={handleClose} style={{marginTop: '16px'}}>Oké, bedankt!</button>
                    </>
                );
            default: return null;
        }
    };


    return (
        <div className="modal-overlay" onClick={handleClose}>
            <div className="card modal-content" onClick={(e) => e.stopPropagation()}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h2 style={{ color: 'var(--primary-color)', margin: 0, fontSize: '22px' }}>Analyseer je Denkproces</h2>
                     <button onClick={handleClose} className="chat-close-btn" style={{color: 'var(--subtle-text)', fontSize: '28px', background: 'none', border: 'none', cursor: 'pointer'}} aria-label="Sluiten">&times;</button>
                </div>

                <div className="review-section" style={{borderTop: 'none', paddingTop: 0, marginTop: 0}}>
                    <h3>De Vraag</h3>
                    <p className="question-text" style={{fontSize: '16px', marginBottom: 0}}>{question.vraag_tekst}</p>
                    <h3 style={{marginTop: '16px'}}>Jouw Antwoord</h3>
                    <p className="user-answer" style={{marginTop: 0}}>{userAnswer}</p>
                </div>
                
                <div style={{marginTop: '24px', paddingTop: '24px', borderTop: '1px solid var(--border-color)'}}>
                    {renderStepContent()}
                </div>
            </div>
        </div>
    );
};

export default ThinkingProcessModal;