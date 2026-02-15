
import React from 'react';

interface UpgradeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUpgrade: () => void;
    reason?: string;
}

const UpgradeModal: React.FC<UpgradeModalProps> = ({ isOpen, onClose, onUpgrade, reason }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="card modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '450px' }}>
                <div style={{ textAlign: 'center' }}>
                    <span style={{ fontSize: '48px' }} role="img" aria-label="Rocket">🚀</span>
                    <h2 style={{ marginTop: '16px', color: 'var(--text-main)' }}>Investeer in je <span className="text-gradient">glow-up.</span></h2>
                    {reason ? (
                         <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, fontSize: '16px', fontWeight: 500 }}>
                            Upgrade naar GLOW PRO {reason}
                         </p>
                    ) : (
                         <p style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>
                            Upgrade naar GLOW PRO en ontgrendel alle tools om met zelfvertrouwen je examens in te gaan.
                        </p>
                    )}
                </div>

                <ul className="feature-list" style={{gridTemplateColumns: '1fr', gap: '16px', margin: '32px 0'}}>
                    <li className="feature-item">
                        <div className="feature-icon" style={{borderColor: 'var(--cyan)', color: 'var(--cyan)'}}>✓</div>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '15px' }}>Oneindig oefenen, zonder limieten</h3>
                        </div>
                    </li>
                    <li className="feature-item">
                        <div className="feature-icon" style={{borderColor: 'var(--cyan)', color: 'var(--cyan)'}}>✓</div>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '15px' }}>Nodig vrienden uit & deel content</h3>
                        </div>
                    </li>
                    <li className="feature-item">
                        <div className="feature-icon" style={{borderColor: 'var(--cyan)', color: 'var(--cyan)'}}>✓</div>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '15px' }}>24/7 toegang tot je GLOW AI coach</h3>
                        </div>
                    </li>
                     <li className="feature-item">
                        <div className="feature-icon" style={{borderColor: 'var(--cyan)', color: 'var(--cyan)'}}>✓</div>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '15px' }}>Alle premium tools & AI-analyses</h3>
                        </div>
                    </li>
                </ul>
                
                <div style={{textAlign: 'center', margin: '24px 0', padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '16px'}}>
                    <strong style={{fontSize: '32px'}} className="text-gradient">€14,99</strong>
                    <span style={{color: 'var(--text-muted)'}}> / maand</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <button onClick={onUpgrade} className="button" style={{height: '50px'}}>Upgrade naar GLOW PRO</button>
                    <button onClick={onClose} className="button-tertiary">Ga door met de gratis versie</button>
                </div>
            </div>
        </div>
    );
};

export default UpgradeModal;
