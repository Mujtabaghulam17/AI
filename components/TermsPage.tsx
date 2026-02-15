import React from 'react';

interface LegalPageProps {
    onBack: () => void;
}

const TermsPage: React.FC<LegalPageProps> = ({ onBack }) => {
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
                    Algemene Voorwaarden
                </h1>
                <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '40px' }}>
                    Laatst bijgewerkt: February 2026
                </p>

                <div style={{
                    background: 'rgba(255,255,255,0.02)',
                    borderRadius: '16px',
                    padding: '32px',
                    border: '1px solid rgba(255,255,255,0.05)',
                }}>
                    <div style={sectionStyle}>
                        <h2 style={headingStyle}>1. Definities</h2>
                        <p style={textStyle}>
                            <strong>GlowExamen</strong> ("wij", "ons", "onze") is een online leerplatform voor examenleerlingen in Nederland, gevestigd te Nederland.<br /><br />
                            <strong>Gebruiker</strong> ("je", "jouw") is elke persoon die gebruik maakt van onze diensten.<br /><br />
                            <strong>Dienst</strong> verwijst naar alle functionaliteiten van het GlowExamen platform, inclusief oefenvragen, AI-feedback, en studieplannen.
                        </p>
                    </div>

                    <div style={sectionStyle}>
                        <h2 style={headingStyle}>2. Gebruik van de Dienst</h2>
                        <p style={textStyle}>
                            • Je moet minimaal 16 jaar oud zijn om een account aan te maken, of toestemming hebben van een ouder/voogd.<br />
                            • Je bent verantwoordelijk voor het geheimhouden van je accountgegevens.<br />
                            • Je mag de dienst alleen gebruiken voor persoonlijke, educatieve doeleinden.<br />
                            • Het is niet toegestaan om content te kopiëren, distribueren of commercieel te gebruiken.
                        </p>
                    </div>

                    <div style={sectionStyle}>
                        <h2 style={headingStyle}>3. Examenvragen & Content</h2>
                        <p style={textStyle}>
                            Examenvragen zijn afkomstig van het College voor Toetsen en Examens (CvTE) en worden gebruikt voor educatieve doeleinden conform de Auteurswet Art. 16 (citaatrecht voor onderwijsdoeleinden).<br /><br />
                            AI-gegenereerde content is bedoeld als studieondersteuning en vervangt geen officiële examenbundels of docentenbegeleiding.
                        </p>
                    </div>

                    <div style={sectionStyle}>
                        <h2 style={headingStyle}>4. Abonnementen & Betalingen</h2>
                        <p style={textStyle}>
                            • <strong>Gratis plan:</strong> Beperkt tot 15 vragen per dag en 10 AI-berichten.<br />
                            • <strong>PRO abonnement:</strong> €9,99 per maand, maandelijks opzegbaar.<br />
                            • Betalingen worden verwerkt via Stripe (veilig en versleuteld).<br />
                            • Je kunt op elk moment opzeggen via je accountinstellingen.<br />
                            • Restitutie is mogelijk binnen 14 dagen na eerste betaling (wettelijke bedenktijd).
                        </p>
                    </div>

                    <div style={sectionStyle}>
                        <h2 style={headingStyle}>5. Aansprakelijkheid</h2>
                        <p style={textStyle}>
                            GlowExamen is een studietool en garandeert geen specifieke examenresultaten. Wij zijn niet aansprakelijk voor:<br />
                            • Onnauwkeurigheden in AI-gegenereerde feedback<br />
                            • Technische storingen of downtime<br />
                            • Verloren studiedata door overmacht
                        </p>
                    </div>

                    <div style={sectionStyle}>
                        <h2 style={headingStyle}>6. Intellectueel Eigendom</h2>
                        <p style={textStyle}>
                            Alle originele content, inclusief het platform design, AI-modellen, en branding, blijft eigendom van GlowExamen. Examenvragen van het CvTE blijven eigendom van het CvTE.
                        </p>
                    </div>

                    <div style={sectionStyle}>
                        <h2 style={headingStyle}>7. Wijzigingen</h2>
                        <p style={textStyle}>
                            Wij kunnen deze voorwaarden wijzigen. Bij belangrijke wijzigingen sturen wij een e-mail naar geregistreerde gebruikers. Voortgezet gebruik na wijzigingen betekent acceptatie.
                        </p>
                    </div>

                    <div style={sectionStyle}>
                        <h2 style={headingStyle}>8. Contact</h2>
                        <p style={textStyle}>
                            Vragen? Neem contact op via <strong>support@glowexamen.nl</strong>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TermsPage;
