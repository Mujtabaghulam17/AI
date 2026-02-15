import React from 'react';

interface BurnoutGuardModalProps {
    isOpen: boolean;
    onClose: () => void;
    onTakeBreak: () => void;
}

const BurnoutGuardModal: React.FC<BurnoutGuardModalProps> = ({ isOpen, onClose, onTakeBreak }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="card modal-content" onClick={e => e.stopPropagation()}>
                <div style={{ textAlign: 'center' }}>
                    <span style={{ fontSize: '48px' }} role="img" aria-label="Pause">⏸️</span>
                    <h2 style={{ marginTop: '16px', color: 'var(--primary-color)' }}>Even pauze, topper.</h2>
                    <p style={{ color: 'var(--subtle-text)', lineHeight: 1.6 }}>
                        Ik merk dat je even worstelt. Dat is volkomen normaal en een teken dat je hard werkt. Frustratie is de grootste vijand van leren.
                    </p>
                    <p style={{ fontWeight: 600, marginTop: '16px' }}>
                        Laten we een korte ademhalingsoefening doen in de Zen Zone om je hoofd leeg te maken.
                    </p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '24px' }}>
                    <button onClick={onTakeBreak} className="button">Ja, naar de Zen Zone</button>
                    <button onClick={onClose} className="button-tertiary">Nee, ik wil doorgaan</button>
                </div>
            </div>
        </div>
    );
};

export default BurnoutGuardModal;
