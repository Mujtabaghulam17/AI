import React from 'react';

interface WeakSpotBoosterModalProps {
    isOpen: boolean;
    onClose: () => void;
    onStart: () => void;
    skillName: string;
}

const WeakSpotBoosterModal: React.FC<WeakSpotBoosterModalProps> = ({ isOpen, onClose, onStart, skillName }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="card modal-content" onClick={(e) => e.stopPropagation()}>
                <div style={{ textAlign: 'center' }}>
                    <span style={{ fontSize: '48px' }} role="img" aria-label="Magnifying glass">🔎</span>
                    <h2 style={{ marginTop: '16px', color: 'var(--primary-color)' }}>Stop. Ik zie een patroon.</h2>
                    <p style={{ color: 'var(--subtle-text)', lineHeight: 1.6 }}>
                        Het lijkt erop dat je moeite hebt met de vaardigheid <strong>"{skillName}"</strong>.
                        Wil je nu een 5-minuten Meesterschapssessie doen om dit direct aan te pakken?
                    </p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '24px' }}>
                    <button onClick={onStart} className="button">Ja, start Meesterschapssessie</button>
                    <button onClick={onClose} className="button-tertiary">Niet nu</button>
                </div>
            </div>
        </div>
    );
};

export default WeakSpotBoosterModal;
