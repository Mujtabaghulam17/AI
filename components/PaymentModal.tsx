import React, { useState, useEffect } from 'react';
import { redirectToCheckout, isStripeConfigured } from '../api/stripe';
import { useAuth0 } from '../auth/FirebaseAuthProvider';
import type { BillingProvider } from '../api/firebase';
import { getNativeBillingOffer, getNativeBillingProvider, getNativeStoreLabel, isNativeBillingSupported, isNativePurchaseCancelledError, purchaseNativePlan, restoreNativePurchases, type NativeBillingOffer } from '../api/nativeBilling';
import { getTierDisplayInfo, type SubscriptionTier } from '../utils/subscriptionTiers';
import { isNativePlatform } from '../utils/platform';

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onPaymentSuccess: (result: {
        tier: SubscriptionTier;
        provider?: BillingProvider | null;
        productIdentifier?: string | null;
    }) => void;
    selectedPlan?: 'focus' | 'totaal';
}

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, onPaymentSuccess, selectedPlan = 'focus' }) => {
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');
    const [isRestoring, setIsRestoring] = useState(false);
    const [nativeOffer, setNativeOffer] = useState<NativeBillingOffer | null>(null);
    const [isLoadingNativeOffer, setIsLoadingNativeOffer] = useState(false);
    const { user, firebaseUser } = useAuth0();
    const stripeConfigured = isStripeConfigured();
    const planInfo = getTierDisplayInfo(selectedPlan);
    const isNativeApp = isNativePlatform();
    const nativeBillingEnabled = isNativeBillingSupported();
    const storeLabel = getNativeStoreLabel();

    useEffect(() => {
        if (isOpen) {
            setStatus('idle');
            setErrorMessage('');
            setIsRestoring(false);
        }
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen || !isNativeApp) {
            setNativeOffer(null);
            return;
        }

        if (!nativeBillingEnabled) {
            setNativeOffer(null);
            return;
        }

        let cancelled = false;

        const loadNativeOffer = async () => {
            setIsLoadingNativeOffer(true);
            try {
                const offer = await getNativeBillingOffer(selectedPlan, firebaseUser?.uid);
                if (!cancelled) {
                    setNativeOffer(offer);
                }
            } catch (error) {
                console.error('Failed to load native billing offer', error);
                if (!cancelled) {
                    setNativeOffer(null);
                }
            } finally {
                if (!cancelled) {
                    setIsLoadingNativeOffer(false);
                }
            }
        };

        void loadNativeOffer();

        return () => {
            cancelled = true;
        };
    }, [firebaseUser?.uid, isNativeApp, isOpen, nativeBillingEnabled, selectedPlan]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');
        setErrorMessage('');

        if (isNativeApp) {
            if (!nativeBillingEnabled) {
                setStatus('error');
                setErrorMessage(`${storeLabel} billing is nog niet geconfigureerd voor deze build.`);
                return;
            }

            const userId = firebaseUser?.uid;
            if (!userId) {
                setStatus('error');
                setErrorMessage('Log eerst in om een abonnement in de app te kopen of te herstellen.');
                return;
            }

            try {
                const result = await purchaseNativePlan(selectedPlan, userId);
                if (result.tier === 'free') {
                    setStatus('error');
                    setErrorMessage(`De aankoop via ${storeLabel} is afgerond, maar er is nog geen actief abonnement gevonden.`);
                    return;
                }

                setStatus('success');
                onPaymentSuccess({
                    tier: result.tier,
                    provider: getNativeBillingProvider(),
                    productIdentifier: result.productIdentifier,
                });
            } catch (error) {
                if (isNativePurchaseCancelledError(error)) {
                    setStatus('idle');
                    return;
                }

                setStatus('error');
                setErrorMessage(error instanceof Error ? error.message : `Aankoop via ${storeLabel} is mislukt.`);
            }
            return;
        }

        // Check if Stripe is configured
        if (!stripeConfigured) {
            // Demo mode - simulate payment for testing
            console.warn("⚠️ Stripe not configured, using demo mode");
            setTimeout(() => {
                setStatus('success');
            }, 2000);
            setTimeout(() => {
                onPaymentSuccess({
                    tier: selectedPlan,
                    provider: 'stripe',
                });
            }, 3500);
            return;
        }

        // Real Stripe checkout
        const userId = firebaseUser?.uid;

        if (!userId) {
            setStatus('error');
            setErrorMessage('Je moet ingelogd zijn om te betalen.');
            return;
        }

        const result = await redirectToCheckout({
            userId,
            userEmail: user?.email,
            plan: selectedPlan,
        });

        if (result.error) {
            setStatus('error');
            setErrorMessage(result.error);
        }
        // If no error, user was redirected to Stripe
    };

    const handleRestorePurchases = async () => {
        const userId = firebaseUser?.uid;
        if (!userId) {
            setStatus('error');
            setErrorMessage('Log eerst in om eerdere aankopen te herstellen.');
            return;
        }

        setIsRestoring(true);
        setErrorMessage('');

        try {
            const result = await restoreNativePurchases(userId);
            if (result.tier === 'free') {
                setStatus('error');
                setErrorMessage(`Geen actieve aankopen gevonden in ${storeLabel}. Heb je via de website betaald? Log dan in met hetzelfde GlowExamen-account.`);
                return;
            }

            setStatus('success');
            onPaymentSuccess({
                tier: result.tier,
                provider: getNativeBillingProvider(),
                productIdentifier: result.productIdentifier,
            });
        } catch (error) {
            setStatus('error');
            setErrorMessage(error instanceof Error ? error.message : `Herstellen via ${storeLabel} is mislukt.`);
        } finally {
            setIsRestoring(false);
        }
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
                    <h2>{isNativeApp ? 'Aankoop Geslaagd!' : 'Betaling Geslaagd!'}</h2>
                    <p>
                        Welkom bij {planInfo.name}. Je hebt nu {selectedPlan === 'totaal' ? 'volledige' : 'Focus'} toegang.
                        {isNativeApp ? ` Je abonnement wordt beheerd via ${storeLabel}.` : ''}
                    </p>
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

        if (isNativeApp) {
            if (!nativeBillingEnabled) {
                return (
                    <div style={{ textAlign: 'center', padding: '12px 0 4px' }}>
                        <h2 style={{ color: 'var(--text-main)', marginBottom: '12px' }}>{storeLabel} billing nog niet actief</h2>
                        <p style={{ color: 'var(--subtle-text)', marginBottom: '12px' }}>
                            Deze mobiele build heeft nog geen RevenueCat/API-sleutels voor store billing.
                        </p>
                        <p style={{ color: 'var(--subtle-text)', marginBottom: '20px', fontSize: '14px' }}>
                            Bestaande web-abonnementen blijven werken zodra je inlogt met hetzelfde account.
                        </p>
                        <button type="button" onClick={onClose} className="button">
                            Sluiten
                        </button>
                    </div>
                );
            }

            if (isLoadingNativeOffer) {
                return (
                    <div style={{ textAlign: 'center', padding: '20px 0' }}>
                        <div className="button-spinner" style={{ margin: '0 auto 16px' }}></div>
                        <p style={{ color: 'var(--subtle-text)' }}>Aanbieding laden uit {storeLabel}...</p>
                    </div>
                );
            }

            if (!nativeOffer) {
                return (
                    <div style={{ textAlign: 'center', padding: '12px 0 4px' }}>
                        <h2 style={{ color: 'var(--text-main)', marginBottom: '12px' }}>Geen store-aanbod gevonden</h2>
                        <p style={{ color: 'var(--subtle-text)', marginBottom: '20px' }}>
                            RevenueCat heeft nog geen gekoppeld {selectedPlan}-pakket voor deze app-build.
                        </p>
                        <button type="button" onClick={onClose} className="button">
                            Sluiten
                        </button>
                    </div>
                );
            }

            return (
                <form onSubmit={handleSubmit}>
                    <div style={{ textAlign: 'center', margin: '16px 0 32px 0' }}>
                        <div style={{
                            display: 'inline-block',
                            background: selectedPlan === 'totaal'
                                ? 'linear-gradient(135deg, rgba(34, 211, 238, 0.1), rgba(167, 139, 250, 0.1))'
                                : 'rgba(255,255,255,0.05)',
                            border: selectedPlan === 'totaal'
                                ? '1px solid rgba(34, 211, 238, 0.3)'
                                : '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '12px',
                            padding: '4px 16px',
                            marginBottom: '12px',
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            color: selectedPlan === 'totaal' ? '#22d3ee' : 'var(--text-muted)',
                        }}>
                            {planInfo.name}
                        </div>
                        <p style={{ color: 'var(--subtle-text)', margin: '0' }}>Prijs via {storeLabel}</p>
                        <strong style={{ fontSize: '36px' }}>{nativeOffer.priceString}</strong>
                        <div style={{ color: 'var(--subtle-text)', marginTop: '8px', fontSize: '14px' }}>
                            {nativeOffer.title}
                        </div>
                    </div>

                    <button type="submit" className="button" disabled={status === 'loading' || isRestoring} style={{
                        background: selectedPlan === 'totaal'
                            ? 'linear-gradient(135deg, #22d3ee 0%, #06b6d4 100%)'
                            : undefined,
                    }}>
                        {status === 'loading' ? <div className="button-spinner"></div> : `Koop via ${storeLabel}`}
                    </button>

                    <button
                        type="button"
                        onClick={handleRestorePurchases}
                        disabled={status === 'loading' || isRestoring}
                        className="button button-secondary"
                        style={{ marginTop: '12px' }}
                    >
                        {isRestoring ? <div className="button-spinner"></div> : 'Herstel aankopen'}
                    </button>

                    <p className="payment-disclaimer" style={{ marginTop: '12px', fontSize: '13px' }}>
                        Aankopen en abonnementen worden beheerd via {storeLabel}. Gebruik hetzelfde GlowExamen-account op elk apparaat.
                    </p>

                    <button
                        type="button"
                        onClick={onClose}
                        className="button-tertiary"
                        style={{ marginTop: '12px' }}
                        disabled={status === 'loading' || isRestoring}
                    >
                        Annuleren
                    </button>
                </form>
            );
        }

        return (
            <form onSubmit={handleSubmit}>
                <div style={{ textAlign: 'center', margin: '16px 0 32px 0' }}>
                    <div style={{
                        display: 'inline-block',
                        background: selectedPlan === 'totaal'
                            ? 'linear-gradient(135deg, rgba(34, 211, 238, 0.1), rgba(167, 139, 250, 0.1))'
                            : 'rgba(255,255,255,0.05)',
                        border: selectedPlan === 'totaal'
                            ? '1px solid rgba(34, 211, 238, 0.3)'
                            : '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '12px',
                        padding: '4px 16px',
                        marginBottom: '12px',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        color: selectedPlan === 'totaal' ? '#22d3ee' : 'var(--text-muted)',
                    }}>
                        {planInfo.name}
                    </div>
                    <p style={{ color: 'var(--subtle-text)', margin: '0' }}>Totaalbedrag</p>
                    <strong style={{ fontSize: '36px' }}>{planInfo.label.replace('/mnd', '')}</strong>
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
                        ⚠️ Betalingen zijn tijdelijk niet beschikbaar. Probeer het later opnieuw.
                    </div>
                )}

                <button type="submit" className="button" disabled={status === 'loading'} style={{
                    background: selectedPlan === 'totaal'
                        ? 'linear-gradient(135deg, #22d3ee 0%, #06b6d4 100%)'
                        : undefined,
                }}>
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
                        <p style={{ color: 'var(--subtle-text)' }}>
                            {isNativeApp
                                ? nativeBillingEnabled
                                    ? `Je aankoop wordt verwerkt via ${storeLabel}.`
                                    : 'Je huidige web-abonnement blijft gewoon werken in de app.'
                                : `Verzeker je van ${selectedPlan === 'totaal' ? 'volledige' : 'Focus'} toegang.`}
                        </p>
                    </div>
                )}
                {renderContent()}
            </div>
        </div>
    );
};

export default PaymentModal;
