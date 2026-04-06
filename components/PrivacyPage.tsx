import React from 'react';

interface LegalPageProps {
    onBack: () => void;
}

const PrivacyPage: React.FC<LegalPageProps> = ({ onBack }) => {
    const sectionStyle: React.CSSProperties = {
        marginBottom: '32px',
    };

    const headingStyle: React.CSSProperties = {
        fontSize: '1.25rem',
        fontWeight: 600,
        marginBottom: '12px',
        color: 'white',
    };

    const textStyle: React.CSSProperties = {
        color: 'rgba(255,255,255,0.7)',
        lineHeight: '1.7',
        fontSize: '0.95rem',
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 100%)',
            padding: '40px 20px',
        }}>
            <div style={{
                maxWidth: '800px',
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
                        marginBottom: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                    }}
                >
                    ← Terug
                </button>

                <h1 style={{
                    fontSize: '2rem',
                    fontWeight: 700,
                    marginBottom: '8px',
                    background: 'linear-gradient(135deg, #22d3ee, #a78bfa)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                }}>
                    Privacy Policy
                </h1>
                <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '16px' }}>
                    Laatst bijgewerkt: February 2026
                </p>
                <p style={{
                    color: 'rgba(34, 211, 238, 0.8)',
                    background: 'rgba(34, 211, 238, 0.1)',
                    padding: '16px',
                    borderRadius: '12px',
                    marginBottom: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                }}>
                    🔒 AVG/GDPR Compliant
                </p>

                <div style={{
                    background: 'rgba(255,255,255,0.02)',
                    borderRadius: '16px',
                    padding: '32px',
                    border: '1px solid rgba(255,255,255,0.05)',
                }}>
                    <div style={sectionStyle}>
                        <h2 style={headingStyle}>1. Welke gegevens verzamelen wij?</h2>
                        <p style={textStyle}>
                            <strong>Account gegevens:</strong> Naam, e-mailadres (via Firebase Authentication)<br />
                            <strong>Studiegegevens:</strong> Beantwoorde vragen, scores, voortgang<br />
                            <strong>Gebruiksgegevens:</strong> Sessieduur, gekozen vakken<br />
                            <strong>Technische gegevens:</strong> Browser type, IP-adres (geanonimiseerd)
                        </p>
                    </div>

                    <div style={sectionStyle}>
                        <h2 style={headingStyle}>2. Waarvoor gebruiken wij je gegevens?</h2>
                        <p style={textStyle}>
                            • Personaliseren van je leerervaring<br />
                            • Genereren van AI-gestuurde feedback<br />
                            • Bijhouden van je voortgang en statistieken<br />
                            • Verbeteren van onze dienstverlening<br />
                            • Contact bij belangrijke updates
                        </p>
                    </div>

                    <div style={sectionStyle}>
                        <h2 style={headingStyle}>3. Rechtsgrondslag (AVG Art. 6)</h2>
                        <p style={textStyle}>
                            • <strong>Uitvoering overeenkomst:</strong> Je accountgegevens zijn nodig om de dienst te leveren<br />
                            • <strong>Gerechtvaardigd belang:</strong> Analytics voor verbetering (geanonimiseerd)<br />
                            • <strong>Toestemming:</strong> Marketing emails (optioneel, opt-in)
                        </p>
                    </div>

                    <div style={sectionStyle}>
                        <h2 style={headingStyle}>4. Delen met derden</h2>
                        <p style={textStyle}>
                            Wij delen je gegevens alleen met:<br />
                            • <strong>Firebase/Google:</strong> Authenticatie, database opslag en analytics<br />
                            • <strong>Stripe:</strong> Betalingsverwerking (PCI-DSS compliant)<br />
                            • <strong>Google AI:</strong> AI-feedback (data wordt niet opgeslagen door Google)<br /><br />
                            Wij verkopen nooit je gegevens aan derden.
                        </p>
                    </div>

                    <div style={sectionStyle}>
                        <h2 style={headingStyle}>5. Cookies & Tracking</h2>
                        <p style={textStyle}>
                            • <strong>Essentiële cookies:</strong> Login sessie, voorkeuren (altijd aan)<br />
                            • <strong>Analytics cookies:</strong> Anonieme gebruiksstatistieken (opt-out mogelijk)<br /><br />
                            Wij gebruiken geen advertising cookies of tracking pixels.
                        </p>
                    </div>

                    <div style={sectionStyle}>
                        <h2 style={headingStyle}>6. Jouw rechten (AVG)</h2>
                        <p style={textStyle}>
                            Je hebt recht op:<br />
                            • <strong>Inzage:</strong> Vraag een kopie van je gegevens<br />
                            • <strong>Rectificatie:</strong> Corrigeer onjuiste gegevens<br />
                            • <strong>Verwijdering:</strong> "Recht om vergeten te worden"<br />
                            • <strong>Beperking:</strong> Beperk verwerking<br />
                            • <strong>Dataportabiliteit:</strong> Ontvang je data in leesbaar formaat<br />
                            • <strong>Bezwaar:</strong> Tegen verwerking op basis van gerechtvaardigd belang<br /><br />
                            Neem contact op via <strong>privacy@glowexamen.nl</strong>
                        </p>
                    </div>

                    <div style={sectionStyle}>
                        <h2 style={headingStyle}>7. Bewaartermijnen</h2>
                        <p style={textStyle}>
                            • Actieve accounts: Zolang je account actief is<br />
                            • Na verwijdering: 30 dagen (daarna permanent verwijderd)<br />
                            • Betalingsgegevens: 7 jaar (wettelijke verplichting)
                        </p>
                    </div>

                    <div style={sectionStyle}>
                        <h2 style={headingStyle}>8. Beveiliging</h2>
                        <p style={textStyle}>
                            • Alle data-overdracht via HTTPS/TLS<br />
                            • Wachtwoorden en inlogsessies worden beheerd door Firebase Authentication<br />
                            • Toegang tot productiedata beperkt tot noodzakelijk personeel<br />
                            • Regelmatige security audits
                        </p>
                    </div>

                    <div style={sectionStyle}>
                        <h2 style={headingStyle}>9. Minderjarigen</h2>
                        <p style={textStyle}>
                            GlowExamen is bedoeld voor examenleerlingen (16+). Voor gebruikers onder 16 is toestemming van een ouder/voogd vereist.
                        </p>
                    </div>

                    <div style={sectionStyle}>
                        <h2 style={headingStyle}>10. Contact & Klachten</h2>
                        <p style={textStyle}>
                            <strong>Privacy vragen:</strong> privacy@glowexamen.nl<br /><br />
                            Je kunt ook een klacht indienen bij de Autoriteit Persoonsgegevens (AP):<br />
                            <a href="https://autoriteitpersoonsgegevens.nl" style={{ color: '#22d3ee' }}>autoriteitpersoonsgegevens.nl</a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPage;
