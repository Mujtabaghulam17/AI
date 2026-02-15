import React from 'react';

interface TutorInterventionModalProps {
    isOpen: boolean;
    onClose: () => void;
    message: string;
}

const TutorInterventionModal: React.FC<TutorInterventionModalProps> = ({ isOpen, onClose, message }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="card modal-content tutor-intervention-modal-content" onClick={(e) => e.stopPropagation()}>
                <span style={{ fontSize: '48px' }} role="img" aria-label="Lightbulb">💡</span>
                <h3 style={{ marginTop: '16px', color: 'var(--primary-color)' }}>Tip van je AI-Coach</h3>
                <p style={{ color: 'var(--subtle-text)', lineHeight: 1.6, fontSize: '18px', fontWeight: 500 }}>
                    {message}
                </p>
                <button onClick={onClose} className="button" style={{marginTop: '16px'}}>Oké, bedankt!</button>
            </div>
        </div>
    );
};

export default TutorInterventionModal;