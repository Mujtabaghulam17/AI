
import React from 'react';
import type { SubscriptionTier } from '../utils/subscriptionTiers';

interface UpgradeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUpgrade: (plan: 'focus' | 'totaal') => void;
    reason?: string;
    currentTier?: SubscriptionTier;
}

const UpgradeModal: React.FC<UpgradeModalProps> = ({ isOpen, onClose, onUpgrade, reason, currentTier = 'free' }) => {
    if (!isOpen) return null;

    // If user is on Focus tier, only show the Totaal upgrade
    const showFocusPlan = currentTier === 'free';

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="card modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
                <div style={{ textAlign: 'center' }}>
                    <span style={{ fontSize: '48px' }} role="img" aria-label="Rocket">🚀</span>
                    <h2 style={{ marginTop: '16px', color: 'var(--text-main)' }}>Investeer in je <span className="text-gradient">glow-up.</span></h2>
                    {reason ? (
                        <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, fontSize: '16px', fontWeight: 500 }}>
                            Upgrade {reason}
                        </p>
                    ) : (
                        <p style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>
                            Ontgrendel alle tools om met zelfvertrouwen je examens in te gaan.
                        </p>
                    )}
                </div>

                {/* Plan Cards */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: showFocusPlan ? '1fr 1fr' : '1fr',
                    gap: '16px',
                    margin: '24px 0',
                }}>
                    {/* Focus Plan */}
                    {showFocusPlan && (
                        <div style={{
                            background: 'rgba(255,255,255,0.03)',
                            borderRadius: '16px',
                            padding: '24px',
                            border: '1px solid rgba(255,255,255,0.08)',
                            display: 'flex',
                            flexDirection: 'column',
                        }}>
                            <div style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '4px' }}>Focus</div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '16px' }}>Je struikelvak</div>

                            <div style={{ marginBottom: '16px' }}>
                                <span style={{ fontSize: '2rem', fontWeight: 700 }}>€14,99</span>
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>/mnd</span>
                            </div>

                            <div style={{ flex: 1, marginBottom: '16px' }}>
                                {[
                                    'Onbeperkt 1 vak oefenen',
                                    'Examenvoorspeller (1 vak)',
                                    'Zen Mode & AI-coach',
                                    'Proefexamens & analyses',
                                ].map((f, i) => (
                                    <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '8px', fontSize: '0.9rem' }}>
                                        <span style={{ color: '#22d3ee' }}>✓</span>
                                        <span>{f}</span>
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={() => onUpgrade('focus')}
                                className="button button-secondary"
                                style={{ width: '100%', height: '44px' }}
                            >
                                Kies Focus
                            </button>
                        </div>
                    )}

                    {/* Totaal Plan */}
                    <div style={{
                        background: 'linear-gradient(135deg, rgba(34, 211, 238, 0.06) 0%, rgba(167, 139, 250, 0.06) 100%)',
                        borderRadius: '16px',
                        padding: '24px',
                        border: '2px solid rgba(34, 211, 238, 0.3)',
                        display: 'flex',
                        flexDirection: 'column',
                        position: 'relative',
                    }}>
                        <div style={{
                            position: 'absolute',
                            top: '-10px',
                            right: '16px',
                            background: 'linear-gradient(135deg, #22d3ee, #a78bfa)',
                            color: 'white',
                            padding: '3px 12px',
                            borderRadius: '12px',
                            fontSize: '0.7rem',
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                        }}>
                            Populair
                        </div>

                        <div style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '4px' }}>Totaal</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '16px' }}>Alles onbeperkt</div>

                        <div style={{ marginBottom: '16px' }}>
                            <span style={{ fontSize: '2rem', fontWeight: 700 }} className="text-gradient">€24,99</span>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>/mnd</span>
                        </div>

                        <div style={{ flex: 1, marginBottom: '16px' }}>
                            {[
                                'Alle vakken onbeperkt',
                                'Examenvoorspeller (alle vakken)',
                                'Persoonlijk AI-leerplan',
                                '24/7 AI-coach & analyses',
                            ].map((f, i) => (
                                <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '8px', fontSize: '0.9rem' }}>
                                    <span style={{ color: '#22d3ee' }}>✓</span>
                                    <span>{f}</span>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={() => onUpgrade('totaal')}
                            className="button"
                            style={{
                                width: '100%',
                                height: '44px',
                                background: 'linear-gradient(135deg, #22d3ee 0%, #06b6d4 100%)',
                                boxShadow: '0 4px 16px rgba(34, 211, 238, 0.3)',
                            }}
                        >
                            {currentTier === 'focus' ? 'Upgrade naar Totaal' : 'Kies Totaal'}
                        </button>
                    </div>
                </div>

                <button onClick={onClose} className="button-tertiary" style={{ width: '100%' }}>
                    Ga door met de {currentTier === 'free' ? 'gratis' : 'huidige'} versie
                </button>
            </div>
        </div>
    );
};

export default UpgradeModal;
