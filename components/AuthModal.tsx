
import React, { useState, useEffect } from 'react';
import { useAuth0 } from '../auth/FirebaseAuthProvider.tsx';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const GoogleIcon = () => (
    <svg width="20" height="20" viewBox="0 0 48 48">
        <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
        <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
        <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
        <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
    </svg>
);

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
    const { loginWithEmail, registerWithEmail, loginWithGoogle, resetPassword, isLoading } = useAuth0();
    const [mode, setMode] = useState<'login' | 'register' | 'reset'>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // Escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) onClose();
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    // Reset form on open/close
    useEffect(() => {
        if (isOpen) {
            setMode('login');
            setEmail('');
            setPassword('');
            setName('');
            setError('');
            setSuccess('');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setSubmitting(true);

        try {
            if (mode === 'reset') {
                const result = await resetPassword(email);
                if (result.error) {
                    setError(result.error);
                } else {
                    setSuccess('Reset-link is verstuurd naar je e-mail!');
                }
            } else if (mode === 'register') {
                const result = await registerWithEmail(email, password, name);
                if (result.error) {
                    setError(result.error);
                } else {
                    onClose();
                }
            } else {
                const result = await loginWithEmail(email, password);
                if (result.error) {
                    setError(result.error);
                } else {
                    onClose();
                }
            }
        } catch (err) {
            setError('Er ging iets mis. Probeer het opnieuw.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleGoogleLogin = async () => {
        setError('');
        setSubmitting(true);
        try {
            const result = await loginWithGoogle();
            if (result.error) {
                setError(result.error);
            } else {
                onClose();
            }
        } catch (err) {
            setError('Google login mislukt.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleClose = () => {
        if (!submitting) onClose();
    };

    return (
        <div className="modal-overlay" onClick={handleClose}>
            <div className="card modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '420px', width: '100%', padding: '32px 28px' }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <h2 style={{ margin: 0, fontSize: '1.5rem' }} className="text-gradient">
                        {mode === 'login' ? 'Welkom terug' : mode === 'register' ? 'Account aanmaken' : 'Wachtwoord resetten'}
                    </h2>
                    <button onClick={handleClose} className="chat-close-btn" aria-label="Sluiten" disabled={submitting}>
                        &times;
                    </button>
                </div>

                <p style={{ color: 'var(--text-muted)', marginBottom: '24px', fontSize: '0.95rem' }}>
                    {mode === 'login'
                        ? 'Log in om je voortgang te bewaren.'
                        : mode === 'register'
                            ? 'Maak gratis een account aan.'
                            : 'Voer je e-mail in voor een reset-link.'}
                </p>

                {/* Google Sign-In */}
                {mode !== 'reset' && (
                    <>
                        <button
                            onClick={handleGoogleLogin}
                            disabled={submitting}
                            className="button button-secondary"
                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '20px' }}
                        >
                            <GoogleIcon />
                            Ga door met Google
                        </button>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
                            <span style={{ color: 'var(--text-muted)', fontSize: '13px', fontWeight: 500 }}>of</span>
                            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
                        </div>
                    </>
                )}

                {/* Email Form */}
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {mode === 'register' && (
                        <input
                            type="text"
                            placeholder="Naam"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            disabled={submitting}
                            style={{ padding: '14px 16px' }}
                        />
                    )}
                    <input
                        type="email"
                        placeholder="E-mailadres"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={submitting}
                        style={{ padding: '14px 16px' }}
                    />
                    {mode !== 'reset' && (
                        <input
                            type="password"
                            placeholder="Wachtwoord"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={6}
                            disabled={submitting}
                            style={{ padding: '14px 16px' }}
                        />
                    )}

                    {error && (
                        <div style={{
                            background: 'rgba(248, 113, 113, 0.1)',
                            border: '1px solid rgba(248, 113, 113, 0.3)',
                            borderRadius: '12px',
                            padding: '12px',
                            color: '#f87171',
                            fontSize: '14px'
                        }}>
                            {error}
                        </div>
                    )}

                    {success && (
                        <div style={{
                            background: 'rgba(52, 211, 153, 0.1)',
                            border: '1px solid rgba(52, 211, 153, 0.3)',
                            borderRadius: '12px',
                            padding: '12px',
                            color: '#34d399',
                            fontSize: '14px'
                        }}>
                            ✅ {success}
                        </div>
                    )}

                    <button type="submit" className="button" disabled={submitting}>
                        {submitting ? (
                            <div className="spinner" style={{ width: '24px', height: '24px' }}></div>
                        ) : (
                            mode === 'login' ? 'Inloggen' : mode === 'register' ? 'Registreren' : 'Verstuur reset-link'
                        )}
                    </button>
                </form>

                {/* Footer Links */}
                <div style={{ marginTop: '20px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {mode === 'login' && (
                        <>
                            <button className="button-tertiary" onClick={() => { setMode('reset'); setError(''); }} style={{ fontSize: '14px' }}>
                                Wachtwoord vergeten?
                            </button>
                            <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                                Nog geen account?{' '}
                                <button className="button-link-style" onClick={() => { setMode('register'); setError(''); }} style={{ fontSize: '14px' }}>
                                    Registreer gratis
                                </button>
                            </span>
                        </>
                    )}
                    {mode === 'register' && (
                        <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                            Al een account?{' '}
                            <button className="button-link-style" onClick={() => { setMode('login'); setError(''); }} style={{ fontSize: '14px' }}>
                                Log in
                            </button>
                        </span>
                    )}
                    {mode === 'reset' && (
                        <button className="button-link-style" onClick={() => { setMode('login'); setError(''); setSuccess(''); }} style={{ fontSize: '14px' }}>
                            ← Terug naar inloggen
                        </button>
                    )}
                </div>

                <p style={{ marginTop: '16px', fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                    Door verder te gaan, ga je akkoord met onze{' '}
                    <a href="#terms" style={{ color: 'var(--primary-color)' }}>Voorwaarden</a>
                    {' '}en{' '}
                    <a href="#privacy" style={{ color: 'var(--primary-color)' }}>Privacybeleid</a>.
                </p>
            </div>
        </div>
    );
};

export default AuthModal;
