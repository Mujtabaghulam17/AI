import React from 'react';

interface SessionSummaryModalProps {
    isOpen: boolean;
    onClose: () => void;
    summary: string;
    isLoading: boolean;
}

const SessionSummaryModal: React.FC<SessionSummaryModalProps> = ({ isOpen, onClose, summary, isLoading }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="card modal-content" onClick={e => e.stopPropagation()}>
                <div style={{ textAlign: 'center' }}>
                    <span style={{ fontSize: '48px' }} role="img" aria-label="Checkmark">✅</span>
                    <h2 style={{ marginTop: '16px', color: 'var(--primary-color)' }}>Sessie Voltooid!</h2>
                </div>
                
                <div className="ai-feedback" style={{marginTop: '16px'}}>
                    <h3 style={{marginTop: 0}}>AI Samenvatting</h3>
                    {isLoading ? (
                        <div className="spinner" style={{width: '32px', height: '32px', margin: '24px auto'}}></div>
                    ) : (
                        <p style={{whiteSpace: 'pre-wrap', lineHeight: 1.6}}>{summary}</p>
                    )}
                </div>

                <button onClick={onClose} className="button" style={{marginTop: '24px'}}>
                    Terug naar Dashboard
                </button>
            </div>
        </div>
    );
};

export default SessionSummaryModal;
