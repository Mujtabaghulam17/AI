import React from 'react';

interface FeatureFeedbackModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (wasHelpful: boolean) => void;
    feature: string;
}

const FeatureFeedbackModal: React.FC<FeatureFeedbackModalProps> = ({ isOpen, onClose, onSubmit, feature }) => {
    if (!isOpen) return null;

    const getQuestionText = () => {
        switch (feature) {
            case 'burnout_guard':
                return 'Was deze korte pauze nuttig om je focus te resetten?';
            default:
                return 'Was deze feature nuttig?';
        }
    };

    const handleYes = () => {
        onSubmit(true);
    };

    const handleNo = () => {
        onSubmit(false);
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="card modal-content" onClick={e => e.stopPropagation()} style={{maxWidth: '450px', textAlign: 'center'}}>
                 <span style={{ fontSize: '48px' }} role="img" aria-label="Thinking face">🤔</span>
                <h2 style={{ marginTop: '16px' }}>Snelle Vraag...</h2>
                <p style={{ color: 'var(--subtle-text)', lineHeight: 1.6 }}>
                    {getQuestionText()}
                </p>
                <p style={{fontSize: '13px', color: 'var(--subtle-text)'}}>
                    Jouw (anonieme) feedback helpt ons om je nog beter te kunnen coachen.
                </p>

                <div className="feature-feedback-buttons">
                    <button onClick={handleYes} className="button button-secondary">
                        Ja
                    </button>
                    <button onClick={handleNo} className="button button-secondary">
                        Nee
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FeatureFeedbackModal;
