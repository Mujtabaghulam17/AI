import React from 'react';

interface BreathingExerciseProps {
    text: string;
    phase: { type: string, duration: number } | null;
}

const BreathingExercise: React.FC<BreathingExerciseProps> = ({ text, phase }) => {
    const style: React.CSSProperties = phase ? { 
        animationName: `breath-${phase.type}`,
        animationDuration: `${phase.duration}s`,
        animationFillMode: 'forwards',
        animationTimingFunction: 'ease-in-out',
    } : {};
    
    // Using a key forces React to re-render the element when the phase changes, thus restarting the animation.
    const key = phase ? `${phase.type}-${phase.duration}-${Date.now()}` : 'idle';

    return (
        <div className="breathing-container">
            <div className="breathing-circle" style={style} key={key}></div>
            <p className="breathing-text">{text}</p>
        </div>
    );
};

export default BreathingExercise;