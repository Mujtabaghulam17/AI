import React from 'react';

interface ExamStartModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    questionCount: number;
    timeLimitMinutes: number;
}

const ExamStartModal: React.FC<ExamStartModalProps> = ({ isOpen, onClose, onConfirm, questionCount, timeLimitMinutes }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="card modal-content" onClick={(e) => e.stopPropagation()}>
                <div style={{ textAlign: 'center' }}>
                    <span style={{ fontSize: '48px' }} role="img" aria-label="Stopwatch">⏱️</span>
                    <h2 style={{ marginTop: '16px', color: 'var(--primary-color)' }}>Klaar voor het Proefexamen?</h2>
                    <p style={{ color: 'var(--subtle-text)', lineHeight: 1.6 }}>
                        Dit is een volledige simulatie om je kennis en timing te testen. Je krijgt pas feedback aan het einde.
                    </p>
                </div>

                <div className="ai-feedback" style={{textAlign: 'center', marginTop: '16px'}}>
                    <h3 style={{marginTop: 0, color: 'var(--primary-color)'}}>Examenopzet</h3>
                    <p style={{margin: 0, fontSize: '18px', fontWeight: 600}}>
                        {questionCount} Vragen
                    </p>
                    <p style={{margin: 0, fontSize: '16px', color: 'var(--subtle-text)'}}>
                        Tijdslimiet: {timeLimitMinutes} minuten
                    </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '24px' }}>
                    <button onClick={onConfirm} className="button">Start Proefexamen</button>
                    <button onClick={onClose} className="button-tertiary">Niet nu</button>
                </div>
            </div>
        </div>
    );
};

export default ExamStartModal;