import React from 'react';

interface OuderDashboardProps {
    onBack: () => void;
    studentName: string;
    // Stats that a parent would see
    stats: {
        hoursThisWeek: number;
        averageScore: number;
        activeSubjects: string[];
        lastActive: string;
        totalQuestions: number;
        streak: number;
    };
}

const OuderDashboard: React.FC<OuderDashboardProps> = ({ onBack, studentName, stats }) => {
    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 100%)',
            padding: '40px 20px',
        }}>
            <div style={{
                maxWidth: '900px',
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

                {/* Header */}
                <div style={{ marginBottom: '40px' }}>
                    <div style={{
                        fontSize: '0.9rem',
                        color: '#22d3ee',
                        marginBottom: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                    }}>
                        <span>👨‍👩‍👧</span>
                        <span>Ouder Dashboard</span>
                    </div>
                    <h1 style={{
                        fontSize: '2rem',
                        fontWeight: 700,
                        marginBottom: '8px',
                    }}>
                        Voortgang van {studentName}
                    </h1>
                    <p style={{ color: 'rgba(255,255,255,0.5)' }}>
                        Laatste activiteit: {stats.lastActive}
                    </p>
                </div>

                {/* Stats Grid */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '20px',
                    marginBottom: '40px',
                }}>
                    {/* Hours Studied */}
                    <div style={{
                        background: 'rgba(255,255,255,0.03)',
                        borderRadius: '16px',
                        padding: '24px',
                        border: '1px solid rgba(255,255,255,0.06)',
                    }}>
                        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', marginBottom: '8px' }}>
                            Deze week gestudeerd
                        </div>
                        <div style={{
                            fontSize: '2.5rem',
                            fontWeight: 700,
                            background: 'linear-gradient(135deg, #22d3ee, #a78bfa)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                        }}>
                            {stats.hoursThisWeek}u
                        </div>
                        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', marginTop: '4px' }}>
                            uur
                        </div>
                    </div>

                    {/* Average Score */}
                    <div style={{
                        background: 'rgba(255,255,255,0.03)',
                        borderRadius: '16px',
                        padding: '24px',
                        border: '1px solid rgba(255,255,255,0.06)',
                    }}>
                        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', marginBottom: '8px' }}>
                            Gemiddelde score
                        </div>
                        <div style={{
                            fontSize: '2.5rem',
                            fontWeight: 700,
                            color: stats.averageScore >= 70 ? '#22c55e' : stats.averageScore >= 50 ? '#eab308' : '#ef4444',
                        }}>
                            {stats.averageScore}%
                        </div>
                        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', marginTop: '4px' }}>
                            {stats.averageScore >= 70 ? 'Goed bezig!' : stats.averageScore >= 50 ? 'Kan beter' : 'Meer oefenen'}
                        </div>
                    </div>

                    {/* Study Streak */}
                    <div style={{
                        background: 'rgba(255,255,255,0.03)',
                        borderRadius: '16px',
                        padding: '24px',
                        border: '1px solid rgba(255,255,255,0.06)',
                    }}>
                        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', marginBottom: '8px' }}>
                            Studie streak
                        </div>
                        <div style={{
                            fontSize: '2.5rem',
                            fontWeight: 700,
                            color: '#f59e0b',
                        }}>
                            🔥 {stats.streak}
                        </div>
                        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', marginTop: '4px' }}>
                            dagen achter elkaar
                        </div>
                    </div>

                    {/* Total Questions */}
                    <div style={{
                        background: 'rgba(255,255,255,0.03)',
                        borderRadius: '16px',
                        padding: '24px',
                        border: '1px solid rgba(255,255,255,0.06)',
                    }}>
                        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', marginBottom: '8px' }}>
                            Totaal beantwoord
                        </div>
                        <div style={{
                            fontSize: '2.5rem',
                            fontWeight: 700,
                        }}>
                            {stats.totalQuestions}
                        </div>
                        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', marginTop: '4px' }}>
                            vragen
                        </div>
                    </div>
                </div>

                {/* Active Subjects */}
                <div style={{
                    background: 'rgba(255,255,255,0.03)',
                    borderRadius: '16px',
                    padding: '24px',
                    border: '1px solid rgba(255,255,255,0.06)',
                    marginBottom: '40px',
                }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '16px' }}>
                        📚 Actieve vakken
                    </h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                        {stats.activeSubjects.length > 0 ? stats.activeSubjects.map((subject, i) => (
                            <div
                                key={i}
                                style={{
                                    background: 'rgba(34, 211, 238, 0.1)',
                                    border: '1px solid rgba(34, 211, 238, 0.2)',
                                    borderRadius: '8px',
                                    padding: '10px 16px',
                                    color: '#22d3ee',
                                    fontSize: '0.95rem',
                                }}
                            >
                                {subject}
                            </div>
                        )) : (
                            <p style={{ color: 'rgba(255,255,255,0.5)' }}>
                                Nog geen vakken geselecteerd
                            </p>
                        )}
                    </div>
                </div>

                {/* Weekly Progress Chart Placeholder */}
                <div style={{
                    background: 'rgba(255,255,255,0.03)',
                    borderRadius: '16px',
                    padding: '24px',
                    border: '1px solid rgba(255,255,255,0.06)',
                    marginBottom: '40px',
                }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '16px' }}>
                        📈 Weekoverzicht
                    </h3>
                    <div style={{
                        display: 'flex',
                        alignItems: 'flex-end',
                        justifyContent: 'space-between',
                        height: '120px',
                        paddingTop: '20px',
                    }}>
                        {['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo'].map((day, i) => {
                            // Fake data for demo
                            const heights = [60, 80, 45, 90, 70, 30, 0];
                            return (
                                <div key={day} style={{ textAlign: 'center', flex: 1 }}>
                                    <div style={{
                                        width: '32px',
                                        height: `${heights[i]}%`,
                                        background: i === 6
                                            ? 'rgba(255,255,255,0.1)'
                                            : 'linear-gradient(180deg, #22d3ee, #06b6d4)',
                                        borderRadius: '6px 6px 0 0',
                                        margin: '0 auto 8px',
                                        minHeight: '4px',
                                    }} />
                                    <div style={{
                                        color: 'rgba(255,255,255,0.5)',
                                        fontSize: '0.8rem'
                                    }}>
                                        {day}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Support Section */}
                <div style={{
                    background: 'linear-gradient(135deg, rgba(34, 211, 238, 0.05), rgba(167, 139, 250, 0.05))',
                    borderRadius: '16px',
                    padding: '24px',
                    border: '1px solid rgba(34, 211, 238, 0.1)',
                    textAlign: 'center',
                }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '8px' }}>
                        💬 Vragen of feedback?
                    </h3>
                    <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '16px' }}>
                        We helpen u graag. Neem gerust contact op.
                    </p>
                    <a
                        href="mailto:support@glowexamen.nl"
                        style={{
                            display: 'inline-block',
                            padding: '12px 24px',
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '8px',
                            color: 'white',
                            textDecoration: 'none',
                        }}
                    >
                        Contact Support
                    </a>
                </div>

                {/* Privacy Notice */}
                <div style={{
                    marginTop: '40px',
                    padding: '16px',
                    background: 'rgba(255,255,255,0.02)',
                    borderRadius: '8px',
                    textAlign: 'center',
                }}>
                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>
                        🔒 Uw gegevens worden veilig verwerkt conform de AVG.
                        <br />
                        Alleen basisstatistieken zijn zichtbaar voor ouders.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default OuderDashboard;
