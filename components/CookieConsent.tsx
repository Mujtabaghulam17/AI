import React, { useState, useEffect } from 'react';

const CONSENT_KEY = 'glowexamen_cookie_consent';

interface CookieConsentProps {
    onPrivacyClick?: () => void;
}

const CookieConsent: React.FC<CookieConsentProps> = ({ onPrivacyClick }) => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem(CONSENT_KEY);
        if (!consent) {
            // Kleine vertraging zodat de pagina eerst laadt
            const timer = setTimeout(() => setVisible(true), 1500);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem(CONSENT_KEY, JSON.stringify({
            accepted: true,
            analytics: true,
            functional: true,
            timestamp: Date.now(),
        }));
        setVisible(false);
    };

    const handleDecline = () => {
        localStorage.setItem(CONSENT_KEY, JSON.stringify({
            accepted: true,
            analytics: false,
            functional: true,
            timestamp: Date.now(),
        }));
        setVisible(false);
    };

    if (!visible) return null;

    return (
        <div
            role="dialog"
            aria-label="Cookie-instellingen"
            aria-modal="false"
            style={{
                position: 'fixed',
                bottom: '20px',
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 99998,
                width: '94%',
                maxWidth: '520px',
                padding: '20px 24px',
                borderRadius: '16px',
                background: 'rgba(18, 18, 31, 0.95)',
                border: '1px solid rgba(255,255,255,0.1)',
                backdropFilter: 'blur(20px)',
                boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
                color: '#ffffff',
                fontFamily: "'Inter', sans-serif",
                animation: 'slideUp 0.4s ease',
            }}
        >
            <style>{`
                @keyframes slideUp {
                    from { opacity: 0; transform: translateX(-50%) translateY(20px); }
                    to { opacity: 1; transform: translateX(-50%) translateY(0); }
                }
            `}</style>

            <p style={{
                fontSize: '0.85rem',
                lineHeight: 1.6,
                color: '#b4c0d4',
                margin: '0 0 16px',
            }}>
                Wij gebruiken functionele cookies om de app te laten werken en optioneel analytics om de ervaring te verbeteren.{' '}
                <button
                    onClick={onPrivacyClick}
                    style={{
                        background: 'none', border: 'none', color: '#22d3ee',
                        textDecoration: 'underline', cursor: 'pointer', fontSize: 'inherit',
                        padding: 0,
                    }}
                >
                    Privacybeleid
                </button>
            </p>

            <div style={{ display: 'flex', gap: '10px' }}>
                <button
                    onClick={handleAccept}
                    style={{
                        flex: 1,
                        background: '#22d3ee',
                        color: '#0f0f1a',
                        border: 'none',
                        borderRadius: '10px',
                        padding: '10px 16px',
                        fontWeight: 700,
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                    }}
                >
                    Accepteren
                </button>
                <button
                    onClick={handleDecline}
                    style={{
                        flex: 1,
                        background: 'rgba(255,255,255,0.06)',
                        color: '#b4c0d4',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '10px',
                        padding: '10px 16px',
                        fontWeight: 600,
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                    }}
                >
                    Alleen noodzakelijk
                </button>
            </div>
        </div>
    );
};

// Helper: check of analytics geaccepteerd is
export function hasAnalyticsConsent(): boolean {
    try {
        const raw = localStorage.getItem(CONSENT_KEY);
        if (!raw) return false;
        const consent = JSON.parse(raw);
        return consent.analytics === true;
    } catch {
        return false;
    }
}

export default CookieConsent;
