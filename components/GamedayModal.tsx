import React, { useState, useEffect } from 'react';
import { ai } from '../api/gemini.ts';
import BreathingExercise from './BreathingExercise.tsx';

// Use the same model name as defined in App.tsx
const MODEL_NAME = 'gemini-2.5-flash';

interface GamedayModalProps {
    isOpen: boolean;
    onClose: () => void;
    userName: string;
    subject: string;
    masteryScores: any;
}

type GamedayStep = 'loading' | 'affirmation' | 'focus' | 'final_tip' | 'ready';

const breathingCycle = [
    { text: 'Adem in... (4s)', duration: 4, type: 'inhale' as const },
    { text: 'Houd vast... (4s)', duration: 4, type: 'hold' as const },
    { text: 'Adem rustig uit... (6s)', duration: 6, type: 'exhale' as const },
];

const GamedayModal: React.FC<GamedayModalProps> = ({ isOpen, onClose, userName, subject, masteryScores }) => {
    const [step, setStep] = useState<GamedayStep>('loading');
    const [content, setContent] = useState({ affirmation: '', final_tip: '' });

    const [phaseIndex, setPhaseIndex] = useState(0);
    const [breathingCycles, setBreathingCycles] = useState(0);

    useEffect(() => {
        if (!isOpen) return;

        const generateContent = async () => {
            const strongSkills = Object.entries(masteryScores)
                .filter(([, score]: [string, any]) => score.total > 2 && score.correct / score.total > 0.8)
                .map(([skill]) => skill);

            const prompt = `Genereer een 'Gameday Protocol' voor een VWO-leerling die vandaag examen ${subject} heeft. Geef een JSON-object.
            CONTEXT:
            - Naam: ${userName}
            - Sterkste vaardigheden: ${strongSkills.join(', ') || 'Nog onbekend'}
            
            OUTPUT JSON:
            {
              "affirmation": "Een krachtige, persoonlijke affirmatie die refereert aan een van de sterke vaardigheden. (max 2 zinnen)",
              "final_tip": "Een laatste, scherpe, mentale tip om mee de examenzaal in te nemen. (max 2 zinnen)"
            }`;
            try {
                const response = await ai.models.generateContent({ model: MODEL_NAME, contents: prompt, config: { responseMimeType: 'application/json' } });
                setContent(JSON.parse(response.text || '{}'));
                setStep('affirmation');
            } catch (e) {
                console.error(e);
                setContent({ affirmation: `Je hebt hier hard voor gewerkt, ${userName}. Vertrouw op je kennis.`, final_tip: 'Lees elke vraag rustig en tweemaal. Je hebt de tijd.' });
                setStep('affirmation');
            }
        };

        generateContent();
    }, [isOpen, userName, subject, masteryScores]);

    useEffect(() => {
        if (step !== 'focus') {
            setBreathingCycles(0);
            return;
        };

        const currentPhase = breathingCycle[phaseIndex];
        const timer = setTimeout(() => {
            const nextIndex = (phaseIndex + 1) % breathingCycle.length;
            setPhaseIndex(nextIndex);
            if (nextIndex === 0) {
                setBreathingCycles(c => c + 1);
            }
        }, currentPhase.duration * 1000);

        if (breathingCycles >= 3) {
            setStep('final_tip');
        }

        return () => clearTimeout(timer);
    }, [step, phaseIndex, breathingCycles]);


    const renderContent = () => {
        switch (step) {
            case 'loading':
                return <div className="spinner" style={{ margin: '48px auto' }}></div>;
            case 'affirmation':
                return (
                    <>
                        <p style={{ fontSize: '18px', lineHeight: 1.6, fontStyle: 'italic', textAlign: 'center' }}>"{content.affirmation}"</p>
                        <button className="button" style={{ marginTop: '24px' }} onClick={() => setStep('focus')}>Start Focus Oefening</button>
                    </>
                );
            case 'focus':
                const currentPhase = breathingCycle[phaseIndex];
                return (
                    <>
                        <p style={{ textAlign: 'center', color: 'var(--subtle-text)' }}>Focus op je ademhaling. Volg het ritme.</p>
                        <BreathingExercise text={currentPhase.text} phase={currentPhase} />
                    </>
                );
            case 'final_tip':
                return (
                    <>
                        <p style={{ fontSize: '18px', lineHeight: 1.6, fontWeight: 600, textAlign: 'center' }}>{content.final_tip}</p>
                        <button className="button" style={{ marginTop: '24px' }} onClick={() => setStep('ready')}>Ik ben er klaar voor</button>
                    </>
                );
            case 'ready':
                return (
                    <>
                        <p style={{ fontSize: '24px', lineHeight: 1.5, fontWeight: 700, textAlign: 'center', color: 'var(--correct-color)' }}>Je bent voorbereid. Ga en schitter.</p>
                        <button className="button" style={{ marginTop: '24px' }} onClick={onClose}>Veel Succes!</button>
                    </>
                );
        }
    };


    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="card modal-content" onClick={e => e.stopPropagation()}>
                <div style={{ textAlign: 'center' }}>
                    <span style={{ fontSize: '48px' }} role="img" aria-label="Target">🎯</span>
                    <h2 style={{ marginTop: '16px', color: 'var(--primary-color)' }}>Gameday Protocol: {subject}</h2>
                    <p style={{ color: 'var(--subtle-text)' }}>De dag is hier, {userName}. Laten we je mentaal voorbereiden.</p>
                </div>
                <div style={{ margin: '24px 0', borderTop: '1px solid var(--border-color)', paddingTop: '24px' }}>
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default GamedayModal;