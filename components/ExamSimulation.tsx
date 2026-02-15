import React, { useState, useEffect } from 'react';
import type { Question, ExamSimulationState } from '../data/data.ts';

interface ExamSimulationProps {
    examState: ExamSimulationState;
    onAnswer: (answer: string) => void;
    onNavigate: (direction: 'next' | 'prev') => void;
    onFlag: (index: number) => void;
    onJumpToQuestion: (index: number) => void;
    onSubmit: () => void;
}

const FlagIcon = ({ flagged }: { flagged: boolean }) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill={flagged ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path><line x1="4" y1="22" x2="4" y2="15"></line>
    </svg>
);

const ExamSimulation: React.FC<ExamSimulationProps> = ({ examState, onAnswer, onNavigate, onFlag, onJumpToQuestion, onSubmit }) => {
    const { questions, answers, currentIndex, startTime, flags } = examState;
    const currentQuestion = questions[currentIndex];
    const [currentAnswer, setCurrentAnswer] = useState(answers[currentIndex] || '');
    
    const totalTime = questions.length * 2 * 60; // 2 minutes per question
    const [timeLeft, setTimeLeft] = useState(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        return totalTime - elapsed;
    });

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if(prev <= 1) {
                    clearInterval(timer);
                    onSubmit();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [onSubmit]);

    useEffect(() => {
        setCurrentAnswer(answers[currentIndex] || '');
    }, [currentIndex, answers]);

    const handleAnswerChange = (value: string) => {
        setCurrentAnswer(value);
        onAnswer(value);
    };
    
    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    };

    const getTimerClass = () => {
        const percentageLeft = (timeLeft / totalTime) * 100;
        if (percentageLeft < 25) return 'low-time';
        if (percentageLeft < 50) return 'medium-time';
        return '';
    };

    return (
        <div className="card">
             <p style={{textAlign: 'center', fontSize: '13px', color: 'var(--subtle-text)', marginBottom: '16px'}}>
                Je zit in de 'locked-in' examenmodus. Druk op 'Esc' om volledig scherm te verlaten.
            </p>
            <div className="exam-header">
                <span className="exam-progress">Vraag {currentIndex + 1} / {questions.length}</span>
                <span className={`exam-timer ${getTimerClass()}`}>{formatTime(timeLeft)}</span>
            </div>

            <div className="exam-question-nav">
                {questions.map((_, index) => {
                    const isAnswered = answers[index] && answers[index].trim() !== '';
                    const isFlagged = flags[index];
                    const isActive = index === currentIndex;
                    let className = 'nav-item';
                    if (isActive) className += ' active';
                    if (isAnswered) className += ' answered';
                    if (isFlagged) className += ' flagged';
                    
                    return (
                        <button key={index} onClick={() => onJumpToQuestion(index)} className={className}>
                            {index + 1}
                        </button>
                    );
                })}
            </div>

            {currentQuestion.vraag_passage && <div className="passage">{currentQuestion.vraag_passage}</div>}
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px'}}>
                <p className="question-text">{currentQuestion.vraag_tekst}</p>
                <button 
                    onClick={() => onFlag(currentIndex)} 
                    className={`exam-flag-button ${flags[currentIndex] ? 'flagged' : ''}`}
                    title="Markeer deze vraag"
                >
                    <FlagIcon flagged={flags[currentIndex]} />
                </button>
            </div>


            {currentQuestion.options ? (
                <div className="mcq-options">
                    {currentQuestion.options.map((option, index) => (
                        <div key={index}>
                            <input 
                                type="radio" 
                                id={`exam-option-${index}`} 
                                name="exam-mcq" 
                                value={option} 
                                checked={currentAnswer === option}
                                onChange={(e) => handleAnswerChange(e.target.value)}
                                className="mcq-input"
                            />
                            <label htmlFor={`exam-option-${index}`} className="mcq-label">{option}</label>
                        </div>
                    ))}
                </div>
            ) : (
                <textarea 
                  value={currentAnswer}
                  onChange={(e) => handleAnswerChange(e.target.value)}
                  placeholder="Typ hier je antwoord..."
                  aria-label="Antwoord invoerveld"
                />
            )}
            
            <div className="exam-navigation">
                <button className="button button-secondary" onClick={() => onNavigate('prev')} disabled={currentIndex === 0}>
                    Vorige
                </button>
                {currentIndex < questions.length - 1 ? (
                    <button className="button" onClick={() => onNavigate('next')}>
                        Volgende
                    </button>
                ) : (
                    <button className="button" onClick={onSubmit}>
                        Lever Examen In
                    </button>
                )}
            </div>
        </div>
    );
};

export default ExamSimulation;