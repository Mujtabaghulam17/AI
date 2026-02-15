import React, { useState } from 'react';

type Subject = 'Nederlands' | 'Engels' | 'Natuurkunde' | 'Biologie' | 'Economie' | 'Geschiedenis' | 'Scheikunde' | 'Bedrijfseconomie' | 'Wiskunde A' | 'Wiskunde B' | 'Frans' | 'Duits' | 'Wiskunde' | 'Nask 1' | 'Nask 2' | 'Aardrijkskunde' | 'Maatschappijkunde';
type Level = 'VMBO' | 'HAVO' | 'VWO';

interface OnboardingData {
    name: string;
    subjects: Subject[];
    level: Level;
    examDate: string;
    studyHoursPerWeek: number;
}

interface OnboardingModalProps {
    isOpen: boolean;
    onComplete: (data: OnboardingData) => void;
    userName?: string;
}

const SUBJECTS_BY_LEVEL: Record<Level, Subject[]> = {
    'VWO': ['Nederlands', 'Engels', 'Wiskunde A', 'Wiskunde B', 'Natuurkunde', 'Scheikunde', 'Biologie', 'Economie', 'Bedrijfseconomie', 'Geschiedenis', 'Frans', 'Duits'],
    'HAVO': ['Nederlands', 'Engels', 'Wiskunde A', 'Wiskunde B', 'Natuurkunde', 'Scheikunde', 'Biologie', 'Economie', 'Bedrijfseconomie', 'Geschiedenis', 'Frans', 'Duits'],
    'VMBO': ['Nederlands', 'Engels', 'Wiskunde', 'Nask 1', 'Nask 2', 'Biologie', 'Economie', 'Geschiedenis', 'Aardrijkskunde', 'Duits', 'Maatschappijkunde'],
};

const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onComplete, userName }) => {
    const [step, setStep] = useState(1);
    const [data, setData] = useState<OnboardingData>({
        name: userName || '',
        subjects: ['Nederlands'],
        level: 'VWO',
        examDate: '',
        studyHoursPerWeek: 10
    });

    if (!isOpen) return null;

    const handleSubjectToggle = (subject: Subject) => {
        setData(prev => ({
            ...prev,
            subjects: prev.subjects.includes(subject)
                ? prev.subjects.filter(s => s !== subject)
                : [...prev.subjects, subject]
        }));
    };

    const canProceed = () => {
        switch (step) {
            case 1: return data.name.trim().length > 0;
            case 2: return true; // Level always has a default
            case 3: return data.subjects.length > 0;
            case 4: return data.examDate !== '';
            case 5: return true;
            default: return true;
        }
    };

    const handleNext = () => {
        if (step < 5) {
            setStep(step + 1);
        } else {
            onComplete(data);
        }
    };

    const handleBack = () => {
        if (step > 1) setStep(step - 1);
    };

    const modalStyle: React.CSSProperties = {
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
        padding: '20px'
    };

    const cardStyle: React.CSSProperties = {
        background: 'linear-gradient(135deg, rgba(30, 30, 50, 0.95) 0%, rgba(20, 20, 35, 0.98) 100%)',
        borderRadius: '24px',
        padding: '40px',
        maxWidth: '600px',
        width: '100%',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
    };

    const progressDots = (
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '32px' }}>
            {[1, 2, 3, 4, 5].map(i => (
                <div key={i} style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    background: i === step
                        ? 'linear-gradient(135deg, #22d3ee, #a78bfa)'
                        : i < step
                            ? '#22d3ee'
                            : 'rgba(255,255,255,0.2)',
                    transition: 'all 0.3s ease',
                }} />
            ))}
        </div>
    );

    const buttonStyle: React.CSSProperties = {
        padding: '14px 28px',
        fontSize: '16px',
        fontWeight: 600,
        borderRadius: '12px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
    };

    return (
        <div style={modalStyle}>
            <div style={cardStyle}>
                {progressDots}

                {/* Step 1: Welcome */}
                {step === 1 && (
                    <div style={{ textAlign: 'center' }}>
                        <span style={{ fontSize: '64px' }}>👋</span>
                        <h2 style={{
                            fontSize: '28px',
                            fontWeight: 700,
                            marginTop: '20px',
                            background: 'linear-gradient(135deg, #22d3ee, #a78bfa)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                        }}>
                            Welkom bij GlowExamen!
                        </h2>
                        <p style={{ color: 'rgba(255,255,255,0.7)', marginTop: '12px', fontSize: '16px' }}>
                            Laten we je persoonlijke examenplan maken.<br />
                            Hoe mogen we je noemen?
                        </p>
                        <input
                            type="text"
                            placeholder="Je naam..."
                            value={data.name}
                            onChange={(e) => setData(prev => ({ ...prev, name: e.target.value }))}
                            style={{
                                width: '100%',
                                maxWidth: '300px',
                                marginTop: '24px',
                                padding: '16px 20px',
                                fontSize: '18px',
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.15)',
                                borderRadius: '12px',
                                color: 'white',
                                textAlign: 'center',
                                outline: 'none',
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#22d3ee'}
                            onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.15)'}
                            autoFocus
                        />
                    </div>
                )}

                {/* Step 2: Level (was step 3) */}
                {step === 2 && (
                    <div style={{ textAlign: 'center' }}>
                        <span style={{ fontSize: '48px' }}>🎓</span>
                        <h2 style={{ fontSize: '24px', fontWeight: 700, marginTop: '16px', marginBottom: '8px' }}>
                            Op welk niveau doe je examen?
                        </h2>
                        <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '32px' }}>
                            We passen alles aan op jouw examenniveau
                        </p>
                        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
                            {(['VMBO', 'HAVO', 'VWO'] as Level[]).map(level => (
                                <button
                                    key={level}
                                    onClick={() => setData(prev => ({ ...prev, level, subjects: prev.level !== level ? ['Nederlands'] : prev.subjects }))}
                                    style={{
                                        padding: '24px 36px',
                                        fontSize: '20px',
                                        fontWeight: 600,
                                        borderRadius: '16px',
                                        cursor: 'pointer',
                                        background: data.level === level
                                            ? 'linear-gradient(135deg, #22d3ee, #a78bfa)'
                                            : 'rgba(255,255,255,0.05)',
                                        border: '1px solid ' + (data.level === level
                                            ? 'transparent'
                                            : 'rgba(255,255,255,0.1)'),
                                        color: 'white',
                                        transition: 'all 0.2s ease',
                                        minWidth: '100px',
                                    }}
                                >
                                    <div style={{ fontSize: '12px', opacity: 0.7, marginBottom: '4px' }}>
                                        {level === 'VMBO' ? '4e klas' : level === 'HAVO' ? '5e klas' : '6e klas'}
                                    </div>
                                    {level}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Step 3: Subjects (was step 2, now level-aware) */}
                {step === 3 && (
                    <div>
                        <h2 style={{ fontSize: '24px', fontWeight: 700, textAlign: 'center', marginBottom: '8px' }}>
                            Welke vakken doe je examen?
                        </h2>
                        <p style={{ color: 'rgba(255,255,255,0.6)', textAlign: 'center', marginBottom: '24px' }}>
                            Selecteer minimaal 1 vak • {data.level}
                        </p>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(3, 1fr)',
                            gap: '12px',
                            maxHeight: '300px',
                            overflowY: 'auto',
                        }}>
                            {SUBJECTS_BY_LEVEL[data.level].map(subject => (
                                <button
                                    key={subject}
                                    onClick={() => handleSubjectToggle(subject)}
                                    style={{
                                        padding: '14px 12px',
                                        fontSize: '14px',
                                        fontWeight: 500,
                                        borderRadius: '10px',
                                        cursor: 'pointer',
                                        background: data.subjects.includes(subject)
                                            ? 'linear-gradient(135deg, #22d3ee, #a78bfa)'
                                            : 'rgba(255,255,255,0.05)',
                                        border: '1px solid ' + (data.subjects.includes(subject)
                                            ? 'transparent'
                                            : 'rgba(255,255,255,0.1)'),
                                        color: 'white',
                                        transition: 'all 0.2s ease',
                                    }}
                                >
                                    {subject}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Step 4: Exam Date */}
                {step === 4 && (
                    <div style={{ textAlign: 'center' }}>
                        <span style={{ fontSize: '48px' }}>📅</span>
                        <h2 style={{ fontSize: '24px', fontWeight: 700, marginTop: '16px', marginBottom: '8px' }}>
                            Wanneer is je examen?
                        </h2>
                        <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '24px' }}>
                            We plannen je voorbereiding automatisch
                        </p>
                        <input
                            type="date"
                            value={data.examDate}
                            onChange={(e) => setData(prev => ({ ...prev, examDate: e.target.value }))}
                            style={{
                                padding: '16px 24px',
                                fontSize: '18px',
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.15)',
                                borderRadius: '12px',
                                color: 'white',
                                outline: 'none',
                                cursor: 'pointer',
                            }}
                        />
                    </div>
                )}

                {/* Step 5: Study Hours */}
                {step === 5 && (
                    <div style={{ textAlign: 'center' }}>
                        <span style={{ fontSize: '48px' }}>⏰</span>
                        <h2 style={{ fontSize: '24px', fontWeight: 700, marginTop: '16px', marginBottom: '8px' }}>
                            Hoeveel uur per week kun je studeren?
                        </h2>
                        <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '32px' }}>
                            We passen je plan aan op jouw tempo
                        </p>
                        <div style={{
                            fontSize: '48px',
                            fontWeight: 700,
                            background: 'linear-gradient(135deg, #22d3ee, #a78bfa)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            marginBottom: '16px',
                        }}>
                            {data.studyHoursPerWeek} uur
                        </div>
                        <input
                            type="range"
                            min="1"
                            max="30"
                            value={data.studyHoursPerWeek}
                            onChange={(e) => setData(prev => ({ ...prev, studyHoursPerWeek: parseInt(e.target.value) }))}
                            style={{
                                width: '100%',
                                maxWidth: '300px',
                                cursor: 'pointer',
                            }}
                        />
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            maxWidth: '300px',
                            margin: '8px auto 0',
                            color: 'rgba(255,255,255,0.5)',
                            fontSize: '12px',
                        }}>
                            <span>1 uur</span>
                            <span>30 uur</span>
                        </div>
                    </div>
                )}

                {/* Navigation Buttons */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginTop: '40px',
                    gap: '16px',
                }}>
                    {step > 1 ? (
                        <button
                            onClick={handleBack}
                            style={{
                                ...buttonStyle,
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                color: 'rgba(255,255,255,0.8)',
                            }}
                        >
                            ← Terug
                        </button>
                    ) : <div />}
                    <button
                        onClick={handleNext}
                        disabled={!canProceed()}
                        style={{
                            ...buttonStyle,
                            background: canProceed()
                                ? 'linear-gradient(135deg, #22d3ee, #a78bfa)'
                                : 'rgba(255,255,255,0.1)',
                            border: 'none',
                            color: canProceed() ? 'white' : 'rgba(255,255,255,0.4)',
                            cursor: canProceed() ? 'pointer' : 'not-allowed',
                            flex: step === 1 ? 1 : 'none',
                        }}
                    >
                        {step === 5 ? '🚀 Start je reis!' : 'Volgende →'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OnboardingModal;
