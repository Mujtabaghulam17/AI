import React, { useState, useEffect } from 'react';
import BreathingExercise from './BreathingExercise.tsx';

interface MindfulMomentProps {
    onContinue: () => void;
}

const breathingCycle = [
    { text: 'Adem in...', duration: 4, type: 'inhale' as const },
    { text: 'Houd vast...', duration: 4, type: 'hold' as const },
    { text: 'Adem uit...', duration: 6, type: 'exhale' as const },
];

const MindfulMoment: React.FC<MindfulMomentProps> = ({ onContinue }) => {
    const [phaseIndex, setPhaseIndex] = useState(0);

    useEffect(() => {
        const currentPhase = breathingCycle[phaseIndex];
        const timer = setTimeout(() => {
            setPhaseIndex((prevIndex) => (prevIndex + 1) % breathingCycle.length);
        }, currentPhase.duration * 1000);

        return () => clearTimeout(timer);
    }, [phaseIndex]);

    const currentPhase = breathingCycle[phaseIndex];

    return (
        <div className="card">
            <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '48px' }} role="img" aria-label="Hourglass">⏳</span>
                <h2 style={{ marginTop: '16px', color: 'var(--primary-color)' }}>Mindful Moment</h2>
                <p style={{ color: 'var(--subtle-text)', lineHeight: 1.6, maxWidth: '450px', margin: '0 auto 24px auto' }}>
                    Goed bezig! Korte pauzes helpen je om beter te leren. Neem even de tijd om op adem te komen.
                </p>
            </div>
            
            <BreathingExercise text={currentPhase.text} phase={currentPhase} />

            <div style={{marginTop: '32px'}}>
                <button className="button" onClick={onContinue}>Ga verder met leren</button>
            </div>
        </div>
    );
};

export default MindfulMoment;