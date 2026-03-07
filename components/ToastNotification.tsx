import React, { useState, useEffect, useCallback, createContext, useContext, useRef } from 'react';

// ─── Types ────────────────────────────────
type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
    id: number;
    message: string;
    type: ToastType;
    duration: number;
}

interface ToastContextType {
    showToast: (message: string, type?: ToastType, duration?: number) => void;
}

// ─── Context ──────────────────────────────
const ToastContext = createContext<ToastContextType>({
    showToast: () => {},
});

export const useToast = () => useContext(ToastContext);

// ─── Styles ───────────────────────────────
const typeConfig: Record<ToastType, { bg: string; border: string; icon: string }> = {
    success: { bg: 'rgba(52, 211, 153, 0.12)', border: 'rgba(52, 211, 153, 0.3)', icon: '\u2705' },
    error:   { bg: 'rgba(248, 113, 113, 0.12)', border: 'rgba(248, 113, 113, 0.3)', icon: '\u274C' },
    warning: { bg: 'rgba(251, 191, 36, 0.12)', border: 'rgba(251, 191, 36, 0.3)', icon: '\u26A0\uFE0F' },
    info:    { bg: 'rgba(96, 165, 250, 0.12)', border: 'rgba(96, 165, 250, 0.3)', icon: '\u2139\uFE0F' },
};

// ─── Single Toast ─────────────────────────
const ToastItem: React.FC<{ toast: Toast; onDismiss: (id: number) => void }> = ({ toast, onDismiss }) => {
    const [isExiting, setIsExiting] = useState(false);
    const config = typeConfig[toast.type];

    useEffect(() => {
        const exitTimer = setTimeout(() => setIsExiting(true), toast.duration - 300);
        const removeTimer = setTimeout(() => onDismiss(toast.id), toast.duration);
        return () => {
            clearTimeout(exitTimer);
            clearTimeout(removeTimer);
        };
    }, [toast.id, toast.duration, onDismiss]);

    return (
        <div
            role="alert"
            aria-live="polite"
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '12px 18px',
                borderRadius: '12px',
                background: config.bg,
                border: `1px solid ${config.border}`,
                backdropFilter: 'blur(20px)',
                color: '#ffffff',
                fontSize: '0.85rem',
                lineHeight: 1.4,
                maxWidth: '380px',
                width: '100%',
                boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                transform: isExiting ? 'translateX(120%)' : 'translateX(0)',
                opacity: isExiting ? 0 : 1,
                transition: 'all 0.3s ease',
                cursor: 'pointer',
            }}
            onClick={() => onDismiss(toast.id)}
        >
            <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>{config.icon}</span>
            <span style={{ flex: 1 }}>{toast.message}</span>
            <button
                aria-label="Sluiten"
                style={{
                    background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)',
                    cursor: 'pointer', fontSize: '1rem', padding: '0 2px', flexShrink: 0,
                }}
            >
                &times;
            </button>
        </div>
    );
};

// ─── Provider ─────────────────────────────
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);
    const counterRef = useRef(0);

    const showToast = useCallback((message: string, type: ToastType = 'info', duration = 4000) => {
        const id = ++counterRef.current;
        setToasts(prev => [...prev.slice(-4), { id, message, type, duration }]); // max 5 toasts
    }, []);

    const dismissToast = useCallback((id: number) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            {/* Toast container */}
            {toasts.length > 0 && (
                <div
                    aria-label="Meldingen"
                    style={{
                        position: 'fixed',
                        top: '20px',
                        right: '20px',
                        zIndex: 99999,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                        pointerEvents: 'none',
                    }}
                >
                    {toasts.map(toast => (
                        <div key={toast.id} style={{ pointerEvents: 'auto' }}>
                            <ToastItem toast={toast} onDismiss={dismissToast} />
                        </div>
                    ))}
                </div>
            )}
        </ToastContext.Provider>
    );
};

export default ToastProvider;
