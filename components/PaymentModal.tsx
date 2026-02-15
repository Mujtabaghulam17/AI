import React, { useState, useEffect } from 'react';
import { redirectToCheckout, isStripeConfigured } from '../api/stripe';
import { useAuth0 } from '../auth/FirebaseAuthProvider';
import { getUserIdFromAuth } from '../utils/userSync';

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onPaymentSuccess: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, onPaymentSuccess }) => {
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');
    const { user } = useAuth0();
    const stripeConfigured = isStripeConfigured();

    useEffect(() => {
        if (isOpen) {
            setStatus('idle');
            setErrorMessage('');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');
        setErrorMessage('');

        // Check if Stripe is configured
        if (!stripeConfigured) {
            // Demo mode - simulate payment for testing
            console.warn("⚠️ Stripe not configured, using demo mode");
            setTimeout(() => {
                setStatus('success');
            }, 2000);
            setTimeout(() => {
                onPaymentSuccess();
            }, 3500);
            return;
        }

        // Real Stripe checkout
        const userId = getUserIdFromAuth(user as any);

        if (!userId) {
            setStatus('error');
            setErrorMessage('Je moet ingelogd zijn om te betalen.');
            return;
        }

        const result = await redirectToCheckout({
            userId,
            userEmail: user?.email,
        });

        if (result.error) {
            setStatus('error');
            setErrorMessage(result.error);
        }
        // If no error, user was redirected to Stripe
    };

    const renderContent = () => {
        if (status === 'success') {
            return (
                <div className="payment-success-view">
                    <div className="success-checkmark">
                        <svg viewBox="0 0 52 52">
                            <circle cx="26" cy="26" r="25" fill="none" />
                            <path fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
                        </svg>
                    </div>
                    <h2>Betaling Geslaagd!</h2>
                    <p>Welkom bij Premium. Je hebt nu volledige toegang.</p>
                </div>
            );
        }

        if (status === 'error') {
            return (
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                    <span style={{ fontSize: '48px' }} role="img" aria-label="Error">❌</span>
                    <h2 style={{ color: 'var(--text-main)', marginTop: '16px' }}>Er ging iets mis</h2>
                    <p style={{ color: 'var(--subtle-text)' }}>{errorMessage}</p>
                    <button
                        onClick={() => setStatus('idle')}
                        className="button"
                        style={{ marginTop: '16px' }}
                    >
                        Probeer opnieuw
                    </button>
                </div>
            );
        }

        return (
            <form onSubmit={handleSubmit}>
                <div style={{ textAlign: 'center', margin: '16px 0 32px 0' }}>
                    <p style={{ color: 'var(--subtle-text)', margin: '0' }}>Totaalbedrag</p>
                    <strong style={{ fontSize: '36px' }}>€14,99</strong>
                    <span style={{ color: 'var(--subtle-text)' }}>/maand</span>
                </div>

                {!stripeConfigured && (
                    <div style={{
                        background: 'rgba(255, 193, 7, 0.1)',
                        border: '1px solid rgba(255, 193, 7, 0.3)',
                        borderRadius: '8px',
                        padding: '12px',
                        marginBottom: '16px',
                        fontSize: '13px',
                        color: 'var(--subtle-text)'
                    }}>
                        ⚠️ Demo modus - Configureer <code>VITE_STRIPE_PAYMENT_LINK</code> in je .env.local
                    </div>
                )}

                <button type="submit" className="button" disabled={status === 'loading'}>
                    {status === 'loading' ? <div className="button-spinner"></div> : 'Betaal Veilig met Stripe'}
                </button>

                <p className="payment-disclaimer" style={{ marginTop: '12px', fontSize: '13px' }}>
                    Je wordt doorgestuurd naar Stripe. Ondersteunde methoden zijn o.a. iDEAL, Credit Card en Bancontact.
                </p>

                {status !== 'loading' && (
                    <button
                        type="button"
                        onClick={onClose}
                        className="button-tertiary"
                        style={{ marginTop: '12px' }}
                    >
                        Annuleren
                    </button>
                )}
            </form>
        );
    };


    return (
        <div className="modal-overlay">
            <div className="card modal-content payment-modal-content" onClick={(e) => e.stopPropagation()}>
                {status !== 'success' && (
                    <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                        <h2 style={{ color: 'var(--primary-color)' }}>Rond je Upgrade af</h2>
                        <p style={{ color: 'var(--subtle-text)' }}>Verzeker je van premium toegang.</p>
                    </div>
                )}
                {renderContent()}
            </div>
        </div>
    );
};

export default PaymentModal;
