
import React from 'react';
import Logo from './Logo.tsx';

interface WelcomeProps {
  onContinue: () => void;
  onTerms?: () => void;
  onPrivacy?: () => void;
  onPricing?: () => void;
}

// Modern icon components with gradient backgrounds
const FeatureIcon = ({ gradient, children }: { gradient: string; children: React.ReactNode }) => (
  <div style={{
    width: '52px',
    height: '52px',
    borderRadius: '14px',
    background: gradient,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '16px',
    boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
  }}>
    {children}
  </div>
);

// SVG Icons
const AIIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'white' }}>
    <path d="M12 2L2 7l10 5 10-5-10-5z" />
    <path d="M2 17l10 5 10-5" />
    <path d="M2 12l10 5 10-5" />
  </svg>
);

const BrainIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'white' }}>
    <path d="M12 4.5a2.5 2.5 0 0 0-4.96-.46 2.5 2.5 0 0 0-1.98 3 2.5 2.5 0 0 0-1.32 4.24 3 3 0 0 0 .34 5.58 2.5 2.5 0 0 0 2.96 3.08A2.5 2.5 0 0 0 12 19.5a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 12 4.5" />
    <path d="m15.7 10.4-.9.4" /><path d="m9.2 13.2-.9.4" /><path d="m13.6 15.7-.4-.9" />
    <path d="m10.8 9.2-.4-.9" /><path d="m15.7 13.5-.9-.4" /><path d="m9.2 10.9-.9-.4" />
    <path d="m10.4 15.7.4-.9" /><path d="m13.1 9.2.4-.9" />
  </svg>
);

const CalendarIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'white' }}>
    <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
    <line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" />
    <line x1="3" x2="21" y1="10" y2="10" /><path d="m9 16 2 2 4-4" />
  </svg>
);

const ZenIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'white' }}>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 16v-4" /><path d="M12 8h.01" /><path d="M8 14s1.5 2 4 2 4-2 4-2" />
  </svg>
);

const SimIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'white' }}>
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const ChartIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'white' }}>
    <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" /><line x1="2" y1="20" x2="22" y2="20" />
  </svg>
);

const ParentIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'white' }}>
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const CrossIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const Welcome: React.FC<WelcomeProps> = ({ onContinue, onTerms, onPrivacy, onPricing }) => {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '90vh',
      width: '100%',
      padding: '24px',
    }}>
      <div className="card welcome-card" style={{
        maxWidth: '960px',
        width: '100%',
        padding: '56px 48px',
        textAlign: 'center',
        background: 'linear-gradient(145deg, rgba(26, 26, 46, 0.95) 0%, rgba(20, 20, 38, 0.98) 100%)',
        backdropFilter: 'blur(40px)',
        border: '1px solid rgba(255,255,255,0.12)',
        boxShadow: '0 25px 80px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)',
      }}>

        {/* Header Section */}
        <div style={{ marginBottom: '40px' }}>
          <div className="welcome-logo-container" style={{
            height: '60px',
            marginBottom: '36px',
            display: 'flex',
            justifyContent: 'center',
            animation: 'fadeInDown 0.6s ease-out'
          }}>
            <Logo style={{ maxWidth: '280px', height: '100%' }} />
          </div>

          <h1 style={{
            fontSize: 'clamp(2.2rem, 5vw, 3.2rem)',
            lineHeight: '1.15',
            marginBottom: '20px',
            fontWeight: 800,
            letterSpacing: '-0.03em',
          }}>
            De AI-examentrainer voor jouw<br />
            <span className="text-gradient">Nederlandse eindexamen.</span>
          </h1>

          <p className="welcome-subtitle" style={{
            fontSize: '1.15rem',
            marginBottom: '32px',
            color: 'var(--text-muted)',
            maxWidth: '540px',
            marginLeft: 'auto',
            marginRight: 'auto',
            lineHeight: '1.7'
          }}>
            Geen generieke AI tutor. Gewoon de enige AI-trainer die de CvTE-syllabi kent,
            echte CE-vragen gebruikt en ook je mentale voorbereiding regelt.
          </p>

          {/* Trust Badge Bar */}
          <div className="trust-bar" style={{
            display: 'flex',
            justifyContent: 'center',
            flexWrap: 'wrap',
            gap: '10px',
            marginBottom: '36px',
          }}>
            {[
              { label: 'CvTE-bronnen', color: '#22d3ee' },
              { label: 'VWO / HAVO / VMBO', color: '#a855f7' },
              { label: 'AVG-compliant', color: '#10b981' },
              { label: '100% Nederlands', color: '#f97316' },
              { label: 'Gratis starten', color: '#ec4899' },
            ].map((badge) => (
              <span key={badge.label} style={{
                padding: '6px 14px',
                borderRadius: '20px',
                border: `1px solid ${badge.color}40`,
                background: `${badge.color}12`,
                color: badge.color,
                fontSize: '0.8rem',
                fontWeight: 600,
                letterSpacing: '0.02em',
              }}>
                {badge.label}
              </span>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
            <button className="button welcome-cta" onClick={onContinue} style={{
              padding: '18px 52px',
              fontSize: '1.1rem',
              borderRadius: '50px',
              maxWidth: '320px',
              background: 'linear-gradient(135deg, #22d3ee 0%, #06b6d4 100%)',
              boxShadow: '0 8px 32px rgba(34, 211, 238, 0.35), inset 0 1px 0 rgba(255,255,255,0.2)',
              transition: 'all 0.25s ease',
            }}>
              Start Direct →
            </button>
            <p style={{ fontSize: '0.85rem', color: 'rgba(148, 163, 184, 0.7)' }}>
              Gratis proberen • Geen creditcard nodig
            </p>
          </div>
        </div>

        <div style={{
          height: '1px',
          background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.08) 50%, transparent 100%)',
          margin: '48px 0'
        }} />

        {/* Features Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '20px',
          textAlign: 'left',
        }}>
          <div className="feature-box" style={{
            padding: '24px 20px',
            background: 'rgba(255,255,255,0.02)',
            borderRadius: '20px',
            border: '1px solid rgba(255,255,255,0.04)',
            transition: 'all 0.3s ease',
          }}>
            <FeatureIcon gradient="linear-gradient(135deg, #22d3ee 0%, #06b6d4 100%)">
              <AIIcon />
            </FeatureIcon>
            <h3 style={{ fontSize: '1rem', marginBottom: '8px', fontWeight: 600 }}>CE-vragen per vak</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: 0, lineHeight: '1.5' }}>
              435+ echte CE-vragen van CvTE, per vak en niveau — VWO, HAVO en VMBO.
            </p>
          </div>

          <div className="feature-box" style={{
            padding: '24px 20px',
            background: 'rgba(255,255,255,0.02)',
            borderRadius: '20px',
            border: '1px solid rgba(255,255,255,0.04)',
            transition: 'all 0.3s ease',
          }}>
            <FeatureIcon gradient="linear-gradient(135deg, #f97316 0%, #ea580c 100%)">
              <SimIcon />
            </FeatureIcon>
            <h3 style={{ fontSize: '1rem', marginBottom: '8px', fontWeight: 600 }}>Examensimulatie</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: 0, lineHeight: '1.5' }}>
              Getimede proefexamens (2 min/vraag) zoals het echte CE. Inclusief correctiemodel.
            </p>
          </div>

          <div className="feature-box" style={{
            padding: '24px 20px',
            background: 'rgba(255,255,255,0.02)',
            borderRadius: '20px',
            border: '1px solid rgba(255,255,255,0.04)',
            transition: 'all 0.3s ease',
          }}>
            <FeatureIcon gradient="linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)">
              <ChartIcon />
            </FeatureIcon>
            <h3 style={{ fontSize: '1rem', marginBottom: '8px', fontWeight: 600 }}>CE-voorspeller</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: 0, lineHeight: '1.5' }}>
              Welke domeinen komen op jouw examen? Voorspeld op basis van 5 jaar CE-data.
            </p>
          </div>

          <div className="feature-box" style={{
            padding: '24px 20px',
            background: 'rgba(255,255,255,0.02)',
            borderRadius: '20px',
            border: '1px solid rgba(255,255,255,0.04)',
            transition: 'all 0.3s ease',
          }}>
            <FeatureIcon gradient="linear-gradient(135deg, #ec4899 0%, #db2777 100%)">
              <ZenIcon />
            </FeatureIcon>
            <h3 style={{ fontSize: '1rem', marginBottom: '8px', fontWeight: 600 }}>Zen Zone</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: 0, lineHeight: '1.5' }}>
              Ademhalingsoefeningen, burnout-detectie en Gameday Protocol voor examendag.
            </p>
          </div>

          <div className="feature-box" style={{
            padding: '24px 20px',
            background: 'rgba(255,255,255,0.02)',
            borderRadius: '20px',
            border: '1px solid rgba(255,255,255,0.04)',
            transition: 'all 0.3s ease',
          }}>
            <FeatureIcon gradient="linear-gradient(135deg, #10b981 0%, #059669 100%)">
              <BrainIcon />
            </FeatureIcon>
            <h3 style={{ fontSize: '1rem', marginBottom: '8px', fontWeight: 600 }}>Adaptieve AI</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: 0, lineHeight: '1.5' }}>
              Leert van je fouten en past vragen aan op jouw zwakke punten.
            </p>
          </div>

          <div className="feature-box" style={{
            padding: '24px 20px',
            background: 'rgba(255,255,255,0.02)',
            borderRadius: '20px',
            border: '1px solid rgba(255,255,255,0.04)',
            transition: 'all 0.3s ease',
          }}>
            <FeatureIcon gradient="linear-gradient(135deg, #f59e0b 0%, #d97706 100%)">
              <CalendarIcon />
            </FeatureIcon>
            <h3 style={{ fontSize: '1rem', marginBottom: '8px', fontWeight: 600 }}>Studieplanner</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: 0, lineHeight: '1.5' }}>
              AI-gegenereerd weekplan tot aan jouw examendatum. Aangepast als je achterloopt.
            </p>
          </div>

          <div className="feature-box" style={{
            padding: '24px 20px',
            background: 'rgba(255,255,255,0.02)',
            borderRadius: '20px',
            border: '1px solid rgba(255,255,255,0.04)',
            transition: 'all 0.3s ease',
          }}>
            <FeatureIcon gradient="linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)">
              <ParentIcon />
            </FeatureIcon>
            <h3 style={{ fontSize: '1rem', marginBottom: '8px', fontWeight: 600 }}>Ouder Dashboard</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: 0, lineHeight: '1.5' }}>
              Voortgang, scores en studietijd inzichtelijk voor ouders. Met AI-tips.
            </p>
          </div>

          <div className="feature-box" style={{
            padding: '24px 20px',
            background: 'rgba(255,255,255,0.02)',
            borderRadius: '20px',
            border: '1px solid rgba(255,255,255,0.04)',
            transition: 'all 0.3s ease',
          }}>
            <FeatureIcon gradient="linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)">
              <AIIcon />
            </FeatureIcon>
            <h3 style={{ fontSize: '1rem', marginBottom: '8px', fontWeight: 600 }}>12+ Vakken</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: 0, lineHeight: '1.5' }}>
              Wiskunde, Engels, Biologie, Economie, Geschiedenis en meer — voor elk vak op jouw niveau.
            </p>
          </div>
        </div>

        {/* Social Proof Stats */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '48px',
          margin: '48px 0',
          flexWrap: 'wrap',
        }}>
          {[
            { value: '435+', label: 'CE-vragen' },
            { value: '12+', label: 'Vakken' },
            { value: '3', label: 'Niveaus' },
            { value: '5+', label: 'Jaar CE-data' },
          ].map((stat) => (
            <div key={stat.label} style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: '2rem',
                fontWeight: 700,
                background: 'linear-gradient(135deg, #22d3ee, #a78bfa)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>{stat.value}</div>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Comparison Section */}
        <div style={{
          margin: '64px 0',
          padding: '48px 0',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}>
          <h2 style={{ textAlign: 'center', fontSize: '1.8rem', fontWeight: 700, marginBottom: '12px' }}>
            Niet een AI tutor.{' '}
            <span style={{
              background: 'linear-gradient(135deg, #22d3ee, #a78bfa)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              De CE-examentrainer.
            </span>
          </h2>
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '40px' }}>
            Generieke AI tutors kennen het Nederlandse CE-systeem niet. Wij wel.
          </p>

          <div className="comparison-grid" style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '16px',
            maxWidth: '760px',
            margin: '0 auto',
          }}>
            {/* Headers */}
            <div style={{
              padding: '16px 20px',
              background: 'rgba(255,255,255,0.03)',
              borderRadius: '12px',
              fontWeight: 700,
              fontSize: '0.95rem',
              textAlign: 'center',
              color: 'rgba(148,163,184,0.8)',
              border: '1px solid rgba(255,255,255,0.06)',
            }}>
              Generieke AI Tutor
            </div>
            <div style={{
              padding: '16px 20px',
              background: 'linear-gradient(135deg, rgba(34,211,238,0.08), rgba(168,85,247,0.08))',
              borderRadius: '12px',
              fontWeight: 700,
              fontSize: '0.95rem',
              textAlign: 'center',
              color: '#22d3ee',
              border: '1px solid rgba(34,211,238,0.25)',
            }}>
              GlowExamen
            </div>

            {/* Rows */}
            {[
              ['Upload eigen materiaal', 'Ingebakken CE-vragen per vak/niveau'],
              ['Internationale markt', 'Alleen NL: VWO / HAVO / VMBO'],
              ['Geen examensimulatie', 'Getimede examensimulatie (2 min/vraag)'],
              ['Geen historische CE-data', 'CE-domeinvoorspeller 2019–2024'],
              ['Geen mentale begeleiding', 'Zen Zone + burnout-detectie'],
              ['Geen ouder-dashboard', 'Ouder Dashboard met AI-tips'],
              ['Placeholder statistieken', '435+ verifieerbare CE-vragen'],
            ].map(([left, right], i) => (
              <React.Fragment key={i}>
                <div style={{
                  padding: '14px 20px',
                  background: 'rgba(255,255,255,0.01)',
                  borderRadius: '10px',
                  fontSize: '0.9rem',
                  color: 'rgba(148,163,184,0.7)',
                  border: '1px solid rgba(255,255,255,0.04)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                }}>
                  <span style={{ color: 'rgba(239,68,68,0.7)', flexShrink: 0 }}><CrossIcon /></span>
                  {left}
                </div>
                <div style={{
                  padding: '14px 20px',
                  background: 'rgba(34,211,238,0.04)',
                  borderRadius: '10px',
                  fontSize: '0.9rem',
                  color: 'rgba(255,255,255,0.85)',
                  border: '1px solid rgba(34,211,238,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                }}>
                  <span style={{ color: '#22d3ee', flexShrink: 0 }}><CheckIcon /></span>
                  {right}
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Pricing Section */}
        <div style={{ margin: '64px 0' }}>
          <h2 style={{
            textAlign: 'center',
            fontSize: '1.8rem',
            fontWeight: 700,
            marginBottom: '8px'
          }}>
            Simpel.{' '}
            <span style={{
              background: 'linear-gradient(135deg, #22d3ee, #a78bfa)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>Eerlijk.</span>
          </h2>
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '40px' }}>
            Maandelijks opzegbaar. Geen verrassingen.
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '16px',
            maxWidth: '1000px',
            margin: '0 auto'
          }}>
            {/* Starter Plan */}
            <div style={{
              padding: '24px',
              background: 'rgba(255,255,255,0.02)',
              borderRadius: '16px',
              border: '1px solid rgba(255,255,255,0.06)',
            }}>
              <div style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '4px' }}>Starter</div>
              <div style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '4px' }}>€0<span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>/mnd</span></div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>Probeer het uit</p>
              <ul style={{ listStyle: 'none', padding: 0, margin: '16px 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                <li style={{ padding: '6px 0' }}>✓ 5 vragen per dag</li>
                <li style={{ padding: '6px 0' }}>✓ 1 vak naar keuze</li>
                <li style={{ padding: '6px 0', color: 'rgba(255,255,255,0.3)' }}>× Ouder Dashboard</li>
                <li style={{ padding: '6px 0', color: 'rgba(255,255,255,0.3)' }}>× Zen Zone</li>
              </ul>
              <button onClick={onContinue} style={{
                width: '100%',
                padding: '12px',
                borderRadius: '10px',
                border: '1px solid rgba(255,255,255,0.15)',
                background: 'transparent',
                color: 'white',
                fontSize: '0.9rem',
                fontWeight: 500,
                cursor: 'pointer',
              }}>
                Start gratis
              </button>
            </div>

            {/* Focus Plan */}
            <div style={{
              padding: '24px',
              background: 'rgba(255,255,255,0.02)',
              borderRadius: '16px',
              border: '1px solid rgba(255,255,255,0.06)',
            }}>
              <div style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '4px' }}>Focus</div>
              <div style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '4px' }}>€14,99<span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>/mnd</span></div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>Je struikelvak</p>
              <ul style={{ listStyle: 'none', padding: 0, margin: '16px 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                <li style={{ padding: '6px 0' }}>✓ Onbeperkt 1 vak</li>
                <li style={{ padding: '6px 0' }}>✓ Zen Zone</li>
                <li style={{ padding: '6px 0' }}>✓ Ouder Dashboard</li>
                <li style={{ padding: '6px 0', color: 'rgba(255,255,255,0.3)' }}>× Meerdere vakken</li>
              </ul>
              <button onClick={onPricing} style={{
                width: '100%',
                padding: '12px',
                borderRadius: '10px',
                border: '1px solid rgba(255,255,255,0.15)',
                background: 'rgba(255,255,255,0.05)',
                color: 'white',
                fontSize: '0.9rem',
                fontWeight: 500,
                cursor: 'pointer',
              }}>
                Kies 1 vak
              </button>
            </div>

            {/* Totaal Plan - POPULAR */}
            <div style={{
              padding: '24px',
              background: 'linear-gradient(135deg, rgba(34, 211, 238, 0.08) 0%, rgba(167, 139, 250, 0.08) 100%)',
              borderRadius: '16px',
              border: '2px solid rgba(34, 211, 238, 0.3)',
              position: 'relative',
            }}>
              <div style={{
                position: 'absolute',
                top: '-10px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'linear-gradient(135deg, #22d3ee, #a78bfa)',
                color: 'white',
                padding: '4px 12px',
                borderRadius: '12px',
                fontSize: '0.7rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                whiteSpace: 'nowrap',
              }}>
                Populair
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '4px', marginTop: '6px' }}>Totaal</div>
              <div style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '4px', color: '#22d3ee' }}>€24,99<span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>/mnd</span></div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>Alles onbeperkt</p>
              <ul style={{ listStyle: 'none', padding: 0, margin: '16px 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                <li style={{ padding: '6px 0' }}>✓ <strong style={{ color: 'white' }}>Alle vakken</strong></li>
                <li style={{ padding: '6px 0' }}>✓ VWO / HAVO / VMBO</li>
                <li style={{ padding: '6px 0' }}>✓ Persoonlijk leerplan</li>
                <li style={{ padding: '6px 0' }}>✓ 24/7 coach</li>
              </ul>
              <button onClick={onContinue} style={{
                width: '100%',
                padding: '12px',
                borderRadius: '10px',
                border: 'none',
                background: 'linear-gradient(135deg, #22d3ee 0%, #06b6d4 100%)',
                color: 'white',
                fontSize: '0.9rem',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 4px 16px rgba(34, 211, 238, 0.3)',
              }}>
                Start 7 dagen gratis →
              </button>
            </div>

            {/* Gezin Plan */}
            <div style={{
              padding: '24px',
              background: 'rgba(255,255,255,0.02)',
              borderRadius: '16px',
              border: '1px solid rgba(255,255,255,0.06)',
            }}>
              <div style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '4px' }}>Gezin</div>
              <div style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '4px' }}>€64,99<span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>/mnd</span></div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>Tot 3 kinderen</p>
              <ul style={{ listStyle: 'none', padding: 0, margin: '16px 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                <li style={{ padding: '6px 0' }}>✓ 3 accounts</li>
                <li style={{ padding: '6px 0' }}>✓ Alle niveaus</li>
                <li style={{ padding: '6px 0' }}>✓ Centraal dashboard</li>
                <li style={{ padding: '6px 0' }}>✓ Alle features</li>
              </ul>
              <button onClick={onPricing} style={{
                width: '100%',
                padding: '12px',
                borderRadius: '10px',
                border: '1px solid rgba(255,255,255,0.15)',
                background: 'rgba(255,255,255,0.05)',
                color: 'white',
                fontSize: '0.9rem',
                fontWeight: 500,
                cursor: 'pointer',
              }}>
                Kies gezinsplan
              </button>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: '24px' }}>
            <span style={{ color: '#22d3ee', fontSize: '0.9rem' }}>✨ 7 dagen gratis proberen</span>
            <span style={{ color: 'var(--text-muted)', marginLeft: '12px', fontSize: '0.85rem' }}>• geen creditcard nodig</span>
          </div>
        </div>

        {/* FAQ Section */}
        <div style={{ margin: '48px 0', maxWidth: '640px', marginLeft: 'auto', marginRight: 'auto' }}>
          <h2 style={{ textAlign: 'center', fontSize: '1.5rem', fontWeight: 700, marginBottom: '32px' }}>
            Veelgestelde vragen
          </h2>

          {[
            {
              q: 'Wat is het verschil met een gewone AI tutor?',
              a: 'Een generieke AI tutor (zoals ChatGPT of Astra AI) kent de Nederlandse CE-syllabi niet en heeft geen historische examendata. GlowExamen is specifiek gebouwd rondom de CvTE-examensstructuur: echte CE-vragen per vak en niveau, een domeinvoorspeller op basis van 5 jaar CE-data en examensimulaties conform het echte tijdschema.'
            },
            {
              q: 'Welke vakken en niveaus zijn beschikbaar?',
              a: 'We ondersteunen 12+ vakken voor VWO, HAVO en VMBO. Onder andere: Nederlands, Engels, Wiskunde A/B, Natuurkunde, Scheikunde, Biologie, Economie, Bedrijfseconomie, Geschiedenis, Frans en Duits.'
            },
            {
              q: 'Zijn dit echte CE-examenvragen?',
              a: 'Ja. We gebruiken officiële CE-vragen van het College voor Toetsen en Examens (CvTE), aangevuld met AI-gegenereerde oefenvragen die aansluiten bij de actuele syllabi.'
            },
            {
              q: 'Is GlowExamen AVG-compliant?',
              a: 'Ja. GlowExamen draait op Nederlandse servers en verwerkt persoonsgegevens conform de AVG (GDPR). We slaan geen onnodige data op en delen gegevens nooit met derde partijen voor commerciële doeleinden.'
            },
            {
              q: 'Hoe werkt de AI feedback?',
              a: 'Onze AI analyseert je antwoord, vergelijkt met het correctiemodel en geeft persoonlijke uitleg over wat goed ging en wat beter kan. Foute antwoorden komen terug via spaced repetition.'
            },
            {
              q: 'Kan ik opzeggen wanneer ik wil?',
              a: 'Ja, je kunt je abonnement op elk moment opzeggen. Je houdt toegang tot het einde van je betaalperiode. Geen verborgen kosten.'
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
              <div style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.6' }}>{faq.a}</div>
            </div>
          ))}
        </div>

        {/* Legal & Footer */}
        <div style={{
          marginTop: '64px',
          paddingTop: '32px',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          textAlign: 'center',
        }}>
          <div style={{
            fontSize: '0.85rem',
            color: 'var(--text-muted)',
            marginBottom: '24px',
            padding: '16px',
            background: 'rgba(255,255,255,0.02)',
            borderRadius: '12px',
            maxWidth: '560px',
            margin: '0 auto 24px',
          }}>
            <strong>Juridische informatie:</strong><br />
            Examenvragen zijn afkomstig van het College voor Toetsen en Examens (CvTE) en worden gebruikt voor educatieve doeleinden conform de Auteurswet Art. 16.
          </div>

          {/* AVG / Trust Footer */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '20px',
            flexWrap: 'wrap',
            marginBottom: '20px',
          }}>
            {['Nederlandse servers', 'AVG-compliant', 'Geen reclame', 'Veilig voor minderjarigen'].map((item) => (
              <span key={item} style={{
                fontSize: '0.8rem',
                color: 'rgba(148,163,184,0.6)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}>
                <span style={{ color: '#10b981' }}>✓</span> {item}
              </span>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '24px', justifyContent: 'center', marginBottom: '16px', flexWrap: 'wrap' }}>
            <button onClick={onTerms} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.85rem', cursor: 'pointer', padding: 0 }}>Algemene Voorwaarden</button>
            <button onClick={onPrivacy} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.85rem', cursor: 'pointer', padding: 0 }}>Privacy Policy</button>
            <button onClick={onPricing} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.85rem', cursor: 'pointer', padding: 0 }}>Pricing</button>
            <a href="mailto:support@glowexamen.nl" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.85rem' }}>Contact</a>
          </div>

          <p style={{ fontSize: '0.8rem', color: 'rgba(148, 163, 184, 0.5)', marginTop: '24px' }}>
            © 2026 GlowExamen. Made with love in Nederland. Nederlandse servers — AVG-compliant.
          </p>
        </div>

        {/* Responsive styles */}
        <style>{`
          @keyframes fadeInDown {
            from { opacity: 0; transform: translateY(-20px); }
            to { opacity: 1; transform: translateY(0); }
          }

          .feature-box:hover {
            background: rgba(255,255,255,0.04) !important;
            border-color: rgba(255,255,255,0.08) !important;
            transform: translateY(-4px);
          }

          .welcome-cta:hover {
            transform: translateY(-3px) !important;
            box-shadow: 0 12px 40px rgba(34, 211, 238, 0.45), inset 0 1px 0 rgba(255,255,255,0.2) !important;
          }

          @media (max-width: 900px) {
            .feature-box { grid-column: span 2 !important; }
            .comparison-grid { grid-template-columns: 1fr !important; }
            .comparison-grid > div:nth-child(odd) { display: none; }
          }

          @media (max-width: 600px) {
            .feature-box { grid-column: span 4 !important; }
            .welcome-card { padding: 36px 24px !important; }
            .trust-bar span { font-size: 0.75rem !important; }
          }
        `}</style>
      </div>
    </div>
  );
};

export default Welcome;
