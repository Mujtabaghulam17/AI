import React from 'react';
import type { SessionProposal } from '../data/data.ts';

interface SessionProposalModalProps {
    isOpen: boolean;
    onClose: () => void;
    onStart: () => void;
    proposal: SessionProposal | null;
}

const SessionProposalModal: React.FC<SessionProposalModalProps> = ({ isOpen, onClose, onStart, proposal }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="card modal-content" onClick={(e) => e.stopPropagation()}>
                <div style={{ textAlign: 'center' }}>
                    <span style={{ fontSize: '48px' }} role="img" aria-label="Target">🎯</span>
                    <h2 style={{ marginTop: '16px', color: 'var(--primary-color)' }}>Jouw Sessievoorstel</h2>
                </div>
                {proposal ? (
                    <>
                        <p style={{ color: 'var(--subtle-text)', lineHeight: 1.6, textAlign: 'center', marginTop: '8px' }}>
                            {proposal.introMessage}
                        </p>
                        <div className="ai-feedback" style={{textAlign: 'center', marginTop: '16px'}}>
                            <h3 style={{marginTop: 0, color: 'var(--primary-color)'}}>Focus: {proposal.focusSkill}</h3>
                            <p style={{margin: 0, fontSize: '18px', fontWeight: 600}}>{proposal.newQuestionsCount} Nieuwe Vragen</p>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '24px' }}>
                            <button onClick={onStart} className="button">Start Gerichte Sessie</button>
                            <button onClick={onClose} className="button-tertiary">Later Misschien</button>
                        </div>
                    </>
                ) : (
                    <div style={{ textAlign: 'center', padding: '20px 0' }}>
                        <div className="spinner"></div>
                        <p style={{ marginTop: '16px', color: 'var(--subtle-text)' }}>Sessie wordt voorbereid...</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SessionProposalModal;
