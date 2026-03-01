import React, { useState, useEffect, useRef } from 'react';
import { Type } from "@google/genai";
import { ai } from '../api/gemini.ts';
import BreathingExercise from './BreathingExercise.tsx';

// Use the same model name as defined in App.tsx
const MODEL_NAME = 'gemini-2.5-flash';

interface ZenZoneModalProps {
    isOpen: boolean;
    onClose: () => void;
    affirmation: string;
    onGenerateAffirmation: () => void;
    isGenerating: boolean;
}

interface BreathingPhase {
    text: string;
    duration: number;
    type: 'inhale' | 'hold' | 'exhale';
}

const ZenZoneModal: React.FC<ZenZoneModalProps> = ({ isOpen, onClose, affirmation, onGenerateAffirmation, isGenerating }) => {
    const [guidedExerciseState, setGuidedExerciseState] = useState<'idle' | 'loading' | 'playing' | 'finished'>('idle');
    const [breathingText, setBreathingText] = useState('Klaar voor een moment van rust?');
    const [currentPhase, setCurrentPhase] = useState<{ type: string, duration: number } | null>(null);

    const phaseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Escape key handler
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) onClose();
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    useEffect(() => {
        // Cleanup on close
        if (!isOpen) {
            if (phaseTimeoutRef.current) {
                clearTimeout(phaseTimeoutRef.current);
            }
            setGuidedExerciseState('idle');
            setBreathingText('Klaar voor een moment van rust?');
            setCurrentPhase(null);
        }
    }, [isOpen]);

    const runExercisePhases = (phases: BreathingPhase[], index = 0) => {
        if (index >= phases.length) {
            setGuidedExerciseState('finished');
            setCurrentPhase(null);
            setBreathingText("Goed gedaan. Voel de rust.");
            return;
        }
        const phase = phases[index];
        setBreathingText(phase.text);
        setCurrentPhase({ type: phase.type, duration: phase.duration });

        phaseTimeoutRef.current = setTimeout(() => {
            runExercisePhases(phases, index + 1);
        }, phase.duration * 1000);
    };

    const handleStartGuidedExercise = async () => {
        if (guidedExerciseState === 'playing') {
            if (phaseTimeoutRef.current) clearTimeout(phaseTimeoutRef.current);
            setGuidedExerciseState('idle');
            setCurrentPhase(null);
            setBreathingText('Klaar voor een moment van rust?');
            return;
        }

        setGuidedExerciseState('loading');
        try {
            const exercisePrompt = "Genereer een gestructureerde ademhalingsoefening. Geef een JSON-object terug met een 'phases' array. Elke fase heeft 'text' (bijv. 'Adem nu diep in door je neus'), 'duration' (in seconden, tussen 3 en 6), en 'type' ('inhale', 'hold', of 'exhale'). Creëer 4 tot 6 fasen voor een complete cyclus.";
            const response = await ai.models.generateContent({
                model: MODEL_NAME,
                contents: exercisePrompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            phases: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        text: { type: Type.STRING },
                                        duration: { type: Type.INTEGER },
                                        type: { type: Type.STRING }
                                    },
                                    required: ["text", "duration", "type"]
                                }
                            }
                        },
                        required: ["phases"]
                    }
                }
            });

            const data = JSON.parse(response.text || '{\"phases\":[]}');
            setGuidedExerciseState('playing');
            runExercisePhases(data.phases);

        } catch (e) {
            console.error("Failed to start guided exercise", e);
            setGuidedExerciseState('idle');
            setBreathingText('Er is iets misgegaan. Probeer het opnieuw.');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="card modal-content" onClick={(e) => e.stopPropagation()}>
                <div style={{ textAlign: 'center' }}>
                    <span style={{ fontSize: '48px' }} role="img" aria-label="Lotus flower">🧘‍♀️</span>
                    <h2 style={{ marginTop: '16px', color: 'var(--primary-color)' }}>Zen Zone</h2>
                    <p style={{ color: 'var(--subtle-text)', lineHeight: 1.6, maxWidth: '450px', margin: '0 auto 24px auto' }}>
                        Neem een moment voor jezelf. Focus op je ademhaling en kom tot rust.
                    </p>
                </div>

                <div className="zen-zone-content">
                    <div className="card" style={{ backgroundColor: 'var(--background-color)' }}>
                        <h4>Positieve Affirmatie</h4>
                        {isGenerating ? (
                            <div className="spinner" style={{ width: '24px', height: '24px', margin: '8px auto' }}></div>
                        ) : affirmation ? (
                            <>
                                <p style={{ fontStyle: 'italic', color: 'var(--cyan)' }}>"{affirmation}"</p>
                                <button className="button-tertiary" onClick={onGenerateAffirmation} style={{ marginTop: '8px' }}>🔄 Nieuwe affirmatie</button>
                            </>
                        ) : (
                            <button className="button button-secondary" onClick={onGenerateAffirmation}>✨ Genereer een affirmatie</button>
                        )}
                    </div>

                    <div className="card" style={{ backgroundColor: 'var(--background-color)', marginTop: '16px' }}>
                        <h4>Begeleide Ademhaling</h4>
                        <BreathingExercise text={breathingText} phase={currentPhase} />
                        <button
                            className="button button-secondary"
                            style={{ marginTop: '16px' }}
                            onClick={handleStartGuidedExercise}
                            disabled={guidedExerciseState === 'loading'}
                        >
                            {guidedExerciseState === 'loading' && <div className="button-spinner"></div>}
                            {guidedExerciseState === 'playing' ? 'Stop Oefening' : (guidedExerciseState === 'finished' ? 'Start Opnieuw' : 'Start Oefening')}
                        </button>
                    </div>
                </div>

                <div style={{ marginTop: '32px' }}>
                    <button className="button" onClick={onClose}>Sluit de Zen Zone</button>
                </div>
            </div>
        </div>
    );
};

export default ZenZoneModal;