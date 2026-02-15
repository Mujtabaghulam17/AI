import React, { useState, useEffect, useCallback } from 'react';
import type { MasterySessionContent } from '../data/data.ts';

interface MasterySessionModalProps {
    isOpen: boolean;
    onClose: () => void;
    skillName: string;
    onGenerate: (skillName: string) => Promise<MasterySessionContent | null>;
    isGenerating: boolean;
    initialContent: MasterySessionContent | null;
}

type SessionStep = 'loading' | 'explanation' | 'guided_example' | 'practice_1' | 'practice_2' | 'final_tip';

const MasterySessionModal: React.FC<MasterySessionModalProps> = ({ isOpen, onClose, skillName, onGenerate, isGenerating, initialContent }) => {
    const [step, setStep] = useState<SessionStep>('loading');
    const [content, setContent] = useState<MasterySessionContent | null>(null);
    const [practiceAnswers, setPracticeAnswers] = useState<{[key: number]: string}>({});
    const [showPracticeFeedback, setShowPracticeFeedback] = useState<{[key: number]: boolean}>({});

    const startSession = useCallback(async () => {
        if (!skillName) return;
        setStep('loading');
        const generatedContent = await onGenerate(skillName);
        if (generatedContent) {
            setContent(generatedContent);
            setStep('explanation');
        } else {
            // Handle error case
            onClose();
        }
    }, [skillName, onGenerate, onClose]);

    useEffect(() => {
        if (isOpen && !content) {
             if (initialContent) {
                setContent(initialContent);
                setStep('explanation');
            } else if (!isGenerating) {
                startSession();
            }
        } else if (!isOpen) {
            // Reset state on close
            setStep('loading');
            setContent(null);
            setPracticeAnswers({});
            setShowPracticeFeedback({});
        }
    }, [isOpen, content, initialContent, isGenerating, startSession]);


    if (!isOpen) return null;
    
    const handleNextStep = () => {
        switch (step) {
            case 'explanation': setStep('guided_example'); break;
            case 'guided_example': setStep('practice_1'); break;
            case 'practice_1': setStep('practice_2'); break;
            case 'practice_2': setStep('final_tip'); break;
            case 'final_tip': onClose(); break;
        }
    };
    
    const handlePracticeSelect = (index: number, option: string) => {
        setPracticeAnswers(prev => ({...prev, [index]: option}));
        setShowPracticeFeedback(prev => ({...prev, [index]: true}));
    }

    const renderContent = () => {
        if (step === 'loading' || !content) {
            return (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                    <div className="spinner"></div>
                    <p style={{ marginTop: '16px', color: 'var(--subtle-text)' }}>Een moment, je persoonlijke sessie wordt voorbereid...</p>
                </div>
            );
        }

        switch (step) {
            case 'explanation':
                return (
                    <div>
                        <h3>Wat is {skillName}?</h3>
                        <p>{content.explanation}</p>
                        <button className="button" onClick={handleNextStep}>Oké, duidelijk</button>
                    </div>
                );
            case 'guided_example':
                return (
                    <div>
                        <h3>Voorbeeld Vraag</h3>
                        <div className="passage" style={{fontStyle: 'normal'}}>{content.guided_example.question}</div>
                        <h3>Denkproces</h3>
                        <p style={{whiteSpace: 'pre-wrap'}}>{content.guided_example.thinking_process}</p>
                        <button className="button" onClick={handleNextStep}>Volgende stap: Oefenen</button>
                    </div>
                );
            case 'practice_1':
            case 'practice_2':
                const index = step === 'practice_1' ? 0 : 1;
                const question = content.practice_questions[index];
                const userAnswer = practiceAnswers[index];
                const showFeedback = showPracticeFeedback[index];
                const isCorrect = userAnswer === question.correct_option;
                
                return (
                     <div>
                        <h3>Oefenvraag {index + 1}</h3>
                        <p>{question.question}</p>
                        <div className="mcq-options">
                            {question.options.map((option, i) => (
                                <div key={i}>
                                    <input 
                                        type="radio" 
                                        id={`ms-option-${i}`} 
                                        name="ms-mcq" 
                                        value={option}
                                        checked={userAnswer === option}
                                        onChange={() => handlePracticeSelect(index, option)}
                                        className="mcq-input"
                                        disabled={showFeedback}
                                    />
                                    <label htmlFor={`ms-option-${i}`} className="mcq-label">{option}</label>
                                </div>
                            ))}
                        </div>
                        {showFeedback && (
                             <div className={isCorrect ? 'hint-box' : 'mindset-tip'} style={{marginTop: 0}}>
                                <p>{isCorrect ? question.feedback_correct : question.feedback_incorrect}</p>
                                <button className="button" onClick={handleNextStep} style={{marginTop: '16px'}}>
                                    {step === 'practice_1' ? 'Volgende Vraag' : 'Naar de samenvatting'}
                                </button>
                            </div>
                        )}
                    </div>
                )
            case 'final_tip':
                return (
                     <div>
                        <h3>Belangrijkste Tip</h3>
                        <div className="ai-feedback">
                            <p>{content.final_tip}</p>
                        </div>
                        <button className="button" onClick={handleNextStep} style={{marginTop: '24px'}}>Sessie afronden</button>
                    </div>
                )
        }
    };
    
    return (
        <div className="modal-overlay">
            <div className="card modal-content" style={{maxWidth: '600px'}} onClick={(e) => e.stopPropagation()}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h2 style={{ color: 'var(--primary-color)', margin: 0, fontSize: '22px' }}>Meesterschapssessie: {skillName}</h2>
                     <button onClick={onClose} className="chat-close-btn" style={{color: 'var(--subtle-text)', fontSize: '28px', background: 'none', border: 'none', cursor: 'pointer'}} aria-label="Sluiten">&times;</button>
                </div>
                {renderContent()}
            </div>
        </div>
    );
};

export default MasterySessionModal;
