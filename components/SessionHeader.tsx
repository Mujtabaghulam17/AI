import React from 'react';

interface SessionHeaderProps {
    currentQuestion: number;
    totalQuestions: number;
    subject: string;
    onPause: () => void;
    onExit: () => void;
    isExamMode?: boolean;
    timeRemaining?: number; // in seconds
}

const SessionHeader: React.FC<SessionHeaderProps> = ({
    currentQuestion,
    totalQuestions,
    subject,
    onPause,
    onExit,
    isExamMode = false,
    timeRemaining
}) => {
    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const progress = (currentQuestion / totalQuestions) * 100;

    return (
        <header style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            height: '60px',
            background: 'rgba(15, 15, 25, 0.95)',
            backdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 24px',
            zIndex: 1000,
        }}>
            {/* Left: Logo */}
            <div
                onClick={onExit}
                style={{
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                }}
            >
                <span style={{
                    fontSize: '24px',
                    fontWeight: 700,
                    background: 'linear-gradient(135deg, #22d3ee, #a78bfa)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                }}>
                    GLOW
                </span>
                <span style={{
                    fontSize: '12px',
                    color: 'rgba(255,255,255,0.5)',
                    padding: '4px 8px',
                    background: 'rgba(255,255,255,0.05)',
                    borderRadius: '6px',
                }}>
                    {subject}
                </span>
            </div>

            {/* Center: Progress */}
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
            }}>
                <div style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    color: 'white',
                }}>
                    Vraag {currentQuestion} van {totalQuestions}
                </div>
                <div style={{
                    width: '200px',
                    height: '4px',
                    background: 'rgba(255,255,255,0.1)',
                    borderRadius: '2px',
                    overflow: 'hidden',
                }}>
                    <div style={{
                        width: `${progress}%`,
                        height: '100%',
                        background: 'linear-gradient(90deg, #22d3ee, #a78bfa)',
                        borderRadius: '2px',
                        transition: 'width 0.3s ease',
                    }} />
                </div>
                {isExamMode && timeRemaining !== undefined && (
                    <div style={{
                        fontSize: '12px',
                        color: timeRemaining < 300 ? '#f87171' : 'rgba(255,255,255,0.6)',
                        fontWeight: timeRemaining < 300 ? 600 : 400,
                    }}>
                        ⏱️ {formatTime(timeRemaining)}
                    </div>
                )}
            </div>

            {/* Right: Actions */}
            <div style={{
                display: 'flex',
                gap: '12px',
            }}>
                <button
                    onClick={onPause}
                    style={{
                        padding: '8px 16px',
                        fontSize: '14px',
                        fontWeight: 500,
                        color: 'rgba(255,255,255,0.8)',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                    }}
                    onMouseOver={(e) => {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                    }}
                    onMouseOut={(e) => {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                    }}
                >
                    ⏸️ Pauzeer
                </button>
                <button
                    onClick={onExit}
                    style={{
                        padding: '8px 16px',
                        fontSize: '14px',
                        fontWeight: 500,
                        color: '#f87171',
                        background: 'rgba(248, 113, 113, 0.1)',
                        border: '1px solid rgba(248, 113, 113, 0.2)',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                    }}
                    onMouseOver={(e) => {
                        e.currentTarget.style.background = 'rgba(248, 113, 113, 0.2)';
                    }}
                    onMouseOut={(e) => {
                        e.currentTarget.style.background = 'rgba(248, 113, 113, 0.1)';
                    }}
                >
                    ✕ Stoppen
                </button>
            </div>
        </header>
    );
};

export default SessionHeader;
