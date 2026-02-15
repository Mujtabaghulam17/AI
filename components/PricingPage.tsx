import React from 'react';

interface PricingPageProps {
    onBack: () => void;
    onUpgrade: (plan: 'focus' | 'totaal' | 'gezin') => void;
    isPremium: boolean;
    currentPlan?: 'starter' | 'focus' | 'totaal' | 'gezin';
}

const plans = [
    {
        id: 'starter' as const,
        name: 'Starter',
        price: 0,
        tagline: 'Probeer het uit',
        features: [
            { text: '5 vragen per dag', included: true },
            { text: '1 vak naar keuze', included: true },
            { text: 'Ouder Dashboard', included: false },
            { text: 'Zen Mode', included: false },
        ],
        cta: 'Start gratis',
        popular: false,
    },
    {
        id: 'focus' as const,
        name: 'Focus',
        price: 14.99,
        tagline: 'Je struikelvak',
        features: [
            { text: 'Onbeperkt 1 vak', included: true },
            { text: 'Zen Mode', included: true },
            { text: 'Ouder Dashboard', included: true },
            { text: 'Meerdere vakken', included: false },
        ],
        cta: 'Kies 1 vak',
        popular: false,
    },
    {
        id: 'totaal' as const,
        name: 'Totaal',
        price: 24.99,
        tagline: 'Alles onbeperkt',
        features: [
            { text: 'Alle vakken', included: true },
            { text: 'VWO / HAVO / VMBO', included: true },
            { text: 'Persoonlijk leerplan', included: true },
            { text: '24/7 coach', included: true },
        ],
        cta: 'Start 7 dagen gratis',
        popular: true,
    },
    {
        id: 'gezin' as const,
        name: 'Gezin',
        price: 64.99,
        tagline: 'Tot 3 kinderen',
        features: [
            { text: '3 accounts', included: true },
            { text: 'Alle niveaus', included: true },
            { text: 'Centraal dashboard', included: true },
            { text: 'Alle features', included: true },
        ],
        cta: 'Kies gezinsplan',
        popular: false,
    },
];

const PricingPage: React.FC<PricingPageProps> = ({ onBack, onUpgrade, isPremium, currentPlan = 'starter' }) => {
    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 100%)',
            padding: '40px 20px',
        }}>
            <div style={{
                maxWidth: '1200px',
                margin: '0 auto',
            }}>
                <button
                    onClick={onBack}
                    style={{
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '8px',
                        padding: '10px 20px',
                        color: 'white',
                        cursor: 'pointer',
                        marginBottom: '32px',
                    }}
                >
                    ← Terug
                </button>

                <div style={{ textAlign: 'center', marginBottom: '48px' }}>
                    <h1 style={{
                        fontSize: '2.5rem',
                        fontWeight: 700,
                        marginBottom: '12px',
                    }}>
                        Simpel. <span style={{
                            background: 'linear-gradient(135deg, #22d3ee, #a78bfa)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                        }}>Eerlijk.</span>
                    </h1>
                    <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1.1rem' }}>
                        Maandelijks opzegbaar. Geen verrassingen.
                    </p>
                </div>

                {/* 4-Tier Pricing Cards */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                    gap: '24px',
                    marginBottom: '64px',
                }}>
                    {plans.map((plan) => {
                        const isCurrentPlan = currentPlan === plan.id;
                        const canUpgrade = plan.id !== 'starter' && !isCurrentPlan;

                        return (
                            <div
                                key={plan.id}
                                style={{
                                    background: plan.popular
                                        ? 'linear-gradient(135deg, rgba(34, 211, 238, 0.08) 0%, rgba(167, 139, 250, 0.08) 100%)'
                                        : 'rgba(255,255,255,0.02)',
                                    borderRadius: '20px',
                                    padding: '28px',
                                    border: plan.popular
                                        ? '2px solid rgba(34, 211, 238, 0.4)'
                                        : '1px solid rgba(255,255,255,0.06)',
                                    position: 'relative',
                                }}
                            >
                                {plan.popular && (
                                    <div style={{
                                        position: 'absolute',
                                        top: '-12px',
                                        left: '50%',
                                        transform: 'translateX(-50%)',
                                        background: 'linear-gradient(135deg, #22d3ee, #a78bfa)',
                                        color: 'white',
                                        padding: '5px 16px',
                                        borderRadius: '16px',
                                        fontSize: '0.75rem',
                                        fontWeight: 600,
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px',
                                    }}>
                                        Populair
                                    </div>
                                )}

                                <div style={{ fontSize: '1.3rem', fontWeight: 600, marginTop: plan.popular ? '8px' : '0' }}>
                                    {plan.name}
                                </div>

                                <div style={{ marginTop: '16px', marginBottom: '8px' }}>
                                    <span style={{
                                        fontSize: '2.5rem',
                                        fontWeight: 700,
                                        color: plan.popular ? '#22d3ee' : 'white',
                                    }}>
                                        €{plan.price === 0 ? '0' : plan.price.toString().replace('.', ',')}
                                    </span>
                                    <span style={{ color: 'rgba(255,255,255,0.5)', marginLeft: '4px' }}>/mnd</span>
                                </div>

                                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', marginBottom: '20px' }}>
                                    {plan.tagline}
                                </p>

                                <div style={{ marginBottom: '24px' }}>
                                    {plan.features.map((feature, i) => (
                                        <div
                                            key={i}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '10px',
                                                marginBottom: '10px',
                                                color: feature.included ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.35)',
                                            }}
                                        >
                                            <span style={{
                                                color: feature.included ? '#22d3ee' : 'rgba(255,255,255,0.3)',
                                                fontSize: '14px',
                                            }}>
                                                {feature.included ? '✓' : '×'}
                                            </span>
                                            <span style={{ fontSize: '0.95rem' }}>{feature.text}</span>
                                        </div>
                                    ))}
                                </div>

                                <button
                                    onClick={() => canUpgrade ? onUpgrade(plan.id as 'focus' | 'totaal' | 'gezin') : undefined}
                                    style={{
                                        width: '100%',
                                        padding: '14px',
                                        borderRadius: '12px',
                                        border: plan.popular ? 'none' : '1px solid rgba(255,255,255,0.2)',
                                        background: isCurrentPlan
                                            ? 'rgba(255,255,255,0.1)'
                                            : plan.popular
                                                ? 'linear-gradient(135deg, #22d3ee 0%, #06b6d4 100%)'
                                                : 'rgba(255,255,255,0.05)',
                                        color: 'white',
                                        fontSize: '0.95rem',
                                        fontWeight: 500,
                                        cursor: canUpgrade ? 'pointer' : 'default',
                                        boxShadow: plan.popular && !isCurrentPlan ? '0 6px 24px rgba(34, 211, 238, 0.3)' : 'none',
                                    }}
                                >
                                    {isCurrentPlan ? '✓ Huidige plan' : plan.cta}
                                </button>
                            </div>
                        );
                    })}
                </div>

                {/* Trial Notice */}
                <div style={{
                    textAlign: 'center',
                    padding: '20px',
                    background: 'rgba(34, 211, 238, 0.05)',
                    borderRadius: '12px',
                    marginBottom: '48px',
                }}>
                    <span style={{ color: '#22d3ee', fontWeight: 500 }}>✨ 7 dagen gratis proberen</span>
                    <span style={{ color: 'rgba(255,255,255,0.5)', marginLeft: '12px' }}>• geen creditcard nodig</span>
                </div>

                {/* FAQ */}
                <div style={{ maxWidth: '700px', margin: '0 auto' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '24px', textAlign: 'center' }}>
                        Veelgestelde vragen
                    </h2>
                    {[
                        {
                            q: 'Kan ik op elk moment opzeggen?',
                            a: 'Ja! Je kunt maandelijks opzeggen. Je houdt toegang tot het einde van je betaalperiode.'
                        },
                        {
                            q: 'Hoe werkt de 7 dagen gratis trial?',
                            a: 'Start met Totaal of Gezin en probeer 7 dagen gratis. Geen creditcard nodig om te beginnen.'
                        },
                        {
                            q: 'Wat is het verschil tussen Focus en Totaal?',
                            a: 'Focus is perfect als je één struikelvak hebt. Totaal geeft je toegang tot alle vakken en niveaus.'
                        },
                        {
                            q: 'Hoe werkt het Ouder Dashboard?',
                            a: 'Ouders ontvangen een uitnodigingslink en kunnen dan de voortgang, studietijd en scores van hun kind volgen.'
                        },
                    ].map((faq, i) => (
                        <div key={i} style={{
                            padding: '20px',
                            background: 'rgba(255,255,255,0.02)',
                            borderRadius: '12px',
                            marginBottom: '12px',
                            border: '1px solid rgba(255,255,255,0.04)',
                        }}>
                            <div style={{ fontWeight: 600, marginBottom: '8px' }}>{faq.q}</div>
                            <div style={{ color: 'rgba(255,255,255,0.6)', lineHeight: '1.6' }}>{faq.a}</div>
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div style={{
                    marginTop: '64px',
                    textAlign: 'center',
                    color: 'rgba(255,255,255,0.4)',
                    fontSize: '0.85rem',
                }}>
                    <p>Veilig betalen via iDEAL, creditcard of PayPal • Verwerkt door Stripe</p>
                    <p style={{ marginTop: '8px' }}>Wettelijke bedenktijd van 14 dagen na aankoop</p>
                </div>
            </div>
        </div>
    );
};

export default PricingPage;
