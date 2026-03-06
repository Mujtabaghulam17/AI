import React, { useMemo } from 'react';
import { SubjectSpecificData, ProgressHistoryEntry, MasteryScore } from '../data/data';

type Subject = string;

interface OuderDashboardProps {
    onBack: () => void;
    studentName: string;
    subjectData: { [key: string]: SubjectSpecificData };
    studyStreak: number;
    currentSubject: Subject;
    onGenerateTip: () => void;
    parentTip: string;
    isGeneratingTip: boolean;
}

const OuderDashboard: React.FC<OuderDashboardProps> = ({ onBack, studentName, subjectData, studyStreak, currentSubject, onGenerateTip, parentTip, isGeneratingTip }) => {
    // Derive all real stats from subjectData
    const derivedStats = useMemo(() => {
        const activeSubjects: { name: string; mastery: number; totalQuestions: number }[] = [];
        let totalQuestionsAll = 0;
        let totalCorrectAll = 0;
        let totalAnsweredAll = 0;

        Object.entries(subjectData).forEach(([subject, data]) => {
            const scores = Object.values(data.masteryScores);
            const totalQ = scores.reduce((sum, s) => sum + s.total, 0);
            const totalC = scores.reduce((sum, s) => sum + s.correct, 0);

            if (totalQ > 0) {
                const mastery = Math.round((totalC / totalQ) * 100);
                activeSubjects.push({ name: subject, mastery, totalQuestions: totalQ });
                totalQuestionsAll += totalQ;
                totalCorrectAll += totalC;
                totalAnsweredAll += totalQ;
            }
        });

        // Sort by most practiced
        activeSubjects.sort((a, b) => b.totalQuestions - a.totalQuestions);

        const averageScore = totalAnsweredAll > 0
            ? Math.round((totalCorrectAll / totalAnsweredAll) * 100)
            : 0;

        // Estimated study time: ~1.5 min per question on average
        const estimatedMinutes = Math.round(totalQuestionsAll * 1.5);
        const estimatedHours = Math.round(estimatedMinutes / 60 * 10) / 10;

        return {
            activeSubjects,
            totalQuestions: totalQuestionsAll,
            averageScore,
            estimatedHours,
        };
    }, [subjectData]);

    // Analyse strengths and weaknesses across all subjects
    const { strengths, weaknesses } = useMemo(() => {
        const allSkills: { skill: string; subject: string; percentage: number; total: number }[] = [];

        Object.entries(subjectData).forEach(([subject, data]) => {
            Object.entries(data.masteryScores).forEach(([skill, score]) => {
                const s = score as MasteryScore;
                if (s.total >= 3) {
                    allSkills.push({
                        skill,
                        subject,
                        percentage: Math.round((s.correct / s.total) * 100),
                        total: s.total,
                    });
                }
            });
        });

        const strengths = allSkills
            .filter(s => s.percentage >= 75)
            .sort((a, b) => b.percentage - a.percentage)
            .slice(0, 5);

        const weaknesses = allSkills
            .filter(s => s.percentage < 55)
            .sort((a, b) => a.percentage - b.percentage)
            .slice(0, 5);

        return { strengths, weaknesses };
    }, [subjectData]);

    // Build weekly chart from progressHistory of all subjects combined
    const weeklyChart = useMemo(() => {
        const today = new Date();
        const dayNames = ['Zo', 'Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za'];
        const last7Days: { label: string; date: string; value: number; hasData: boolean }[] = [];

        for (let i = 6; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            const dayLabel = dayNames[d.getDay()];

            // Collect all progress entries for this date across all subjects
            const entriesForDay: number[] = [];
            Object.values(subjectData).forEach((data) => {
                data.progressHistory.forEach((entry: ProgressHistoryEntry) => {
                    if (entry.date === dateStr) {
                        entriesForDay.push(entry.avgMastery);
                    }
                });
            });

            const avgValue = entriesForDay.length > 0
                ? Math.round(entriesForDay.reduce((s, v) => s + v, 0) / entriesForDay.length)
                : 0;

            last7Days.push({
                label: dayLabel,
                date: dateStr,
                value: avgValue,
                hasData: entriesForDay.length > 0,
            });
        }

        return last7Days;
    }, [subjectData]);

    const maxChartValue = Math.max(...weeklyChart.map(d => d.value), 1);

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
                        Laatste update: {new Date().toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long' })}
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
                            Geschatte studietijd
                        </div>
                        <div style={{
                            fontSize: '2.5rem',
                            fontWeight: 700,
                            background: 'linear-gradient(135deg, #22d3ee, #a78bfa)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                        }}>
                            {derivedStats.estimatedHours}u
                        </div>
                        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', marginTop: '4px' }}>
                            totaal
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
                            color: derivedStats.averageScore >= 70 ? '#22c55e' : derivedStats.averageScore >= 50 ? '#eab308' : '#ef4444',
                        }}>
                            {derivedStats.averageScore}%
                        </div>
                        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', marginTop: '4px' }}>
                            {derivedStats.averageScore >= 70 ? 'Goed bezig!' : derivedStats.averageScore >= 50 ? 'Kan beter' : 'Meer oefenen'}
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
                            {studyStreak}
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
                            {derivedStats.totalQuestions}
                        </div>
                        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', marginTop: '4px' }}>
                            vragen over {derivedStats.activeSubjects.length} vakken
                        </div>
                    </div>
                </div>

                {/* Per-subject breakdown */}
                <div style={{
                    background: 'rgba(255,255,255,0.03)',
                    borderRadius: '16px',
                    padding: '24px',
                    border: '1px solid rgba(255,255,255,0.06)',
                    marginBottom: '40px',
                }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '20px' }}>
                        📚 Voortgang per vak
                    </h3>
                    {derivedStats.activeSubjects.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {derivedStats.activeSubjects.map((subject) => (
                                <div key={subject.name} style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '16px',
                                }}>
                                    <div style={{
                                        width: '120px',
                                        fontSize: '0.95rem',
                                        color: subject.name === currentSubject ? '#22d3ee' : 'rgba(255,255,255,0.8)',
                                        fontWeight: subject.name === currentSubject ? 600 : 400,
                                        flexShrink: 0,
                                    }}>
                                        {subject.name}
                                    </div>
                                    <div style={{
                                        flex: 1,
                                        height: '12px',
                                        background: 'rgba(255,255,255,0.06)',
                                        borderRadius: '6px',
                                        overflow: 'hidden',
                                    }}>
                                        <div style={{
                                            height: '100%',
                                            width: `${subject.mastery}%`,
                                            background: subject.mastery >= 70
                                                ? 'linear-gradient(90deg, #22c55e, #16a34a)'
                                                : subject.mastery >= 50
                                                    ? 'linear-gradient(90deg, #eab308, #ca8a04)'
                                                    : 'linear-gradient(90deg, #ef4444, #dc2626)',
                                            borderRadius: '6px',
                                            transition: 'width 0.5s ease',
                                        }} />
                                    </div>
                                    <div style={{
                                        width: '50px',
                                        textAlign: 'right',
                                        fontSize: '0.9rem',
                                        fontWeight: 600,
                                        color: subject.mastery >= 70 ? '#22c55e' : subject.mastery >= 50 ? '#eab308' : '#ef4444',
                                    }}>
                                        {subject.mastery}%
                                    </div>
                                    <div style={{
                                        width: '60px',
                                        textAlign: 'right',
                                        fontSize: '0.8rem',
                                        color: 'rgba(255,255,255,0.4)',
                                    }}>
                                        {subject.totalQuestions} vr.
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p style={{ color: 'rgba(255,255,255,0.5)', textAlign: 'center', padding: '20px' }}>
                            Nog geen vakken geoefend. De voortgang verschijnt hier zodra uw kind begint met oefenen.
                        </p>
                    )}
                </div>

                {/* Weekly Progress Chart — Real data */}
                <div style={{
                    background: 'rgba(255,255,255,0.03)',
                    borderRadius: '16px',
                    padding: '24px',
                    border: '1px solid rgba(255,255,255,0.06)',
                    marginBottom: '40px',
                }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '16px' }}>
                        📈 Weekoverzicht (gemiddelde beheersing)
                    </h3>
                    {weeklyChart.some(d => d.hasData) ? (
                        <div style={{
                            display: 'flex',
                            alignItems: 'flex-end',
                            justifyContent: 'space-between',
                            height: '140px',
                            paddingTop: '20px',
                        }}>
                            {weeklyChart.map((day) => {
                                const barHeight = day.hasData ? Math.max((day.value / maxChartValue) * 100, 5) : 0;
                                return (
                                    <div key={day.date} style={{ textAlign: 'center', flex: 1 }}>
                                        {day.hasData && (
                                            <div style={{
                                                fontSize: '0.75rem',
                                                color: 'rgba(255,255,255,0.6)',
                                                marginBottom: '4px',
                                            }}>
                                                {day.value}%
                                            </div>
                                        )}
                                        <div style={{
                                            width: '32px',
                                            height: `${barHeight}%`,
                                            background: day.hasData
                                                ? day.value >= 70
                                                    ? 'linear-gradient(180deg, #22c55e, #16a34a)'
                                                    : day.value >= 50
                                                        ? 'linear-gradient(180deg, #eab308, #ca8a04)'
                                                        : 'linear-gradient(180deg, #ef4444, #dc2626)'
                                                : 'rgba(255,255,255,0.05)',
                                            borderRadius: '6px 6px 0 0',
                                            margin: '0 auto 8px',
                                            minHeight: day.hasData ? '8px' : '4px',
                                            transition: 'height 0.3s ease',
                                        }} />
                                        <div style={{
                                            color: 'rgba(255,255,255,0.5)',
                                            fontSize: '0.8rem',
                                        }}>
                                            {day.label}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div style={{
                            height: '120px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'rgba(255,255,255,0.4)',
                        }}>
                            Nog geen oefendata deze week. Data verschijnt na het oefenen.
                        </div>
                    )}
                </div>

                {/* Strengths & Weaknesses */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '20px',
                    marginBottom: '40px',
                }}>
                    {/* Sterke punten */}
                    <div style={{
                        background: 'rgba(255,255,255,0.03)',
                        borderRadius: '16px',
                        padding: '24px',
                        border: '1px solid rgba(34, 197, 94, 0.15)',
                    }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '16px', color: '#22c55e' }}>
                            Sterke punten
                        </h3>
                        {strengths.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {strengths.map((s, i) => (
                                    <div key={i} style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        padding: '8px 12px',
                                        background: 'rgba(34, 197, 94, 0.06)',
                                        borderRadius: '8px',
                                    }}>
                                        <div>
                                            <div style={{ fontSize: '0.9rem', fontWeight: 500 }}>{s.skill}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>{s.subject}</div>
                                        </div>
                                        <div style={{ color: '#22c55e', fontWeight: 600, fontSize: '0.9rem' }}>{s.percentage}%</div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem' }}>
                                Nog niet genoeg data. Sterke punten verschijnen na meer oefening.
                            </p>
                        )}
                    </div>

                    {/* Werkpunten */}
                    <div style={{
                        background: 'rgba(255,255,255,0.03)',
                        borderRadius: '16px',
                        padding: '24px',
                        border: '1px solid rgba(234, 179, 8, 0.15)',
                    }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '16px', color: '#eab308' }}>
                            Aandachtspunten
                        </h3>
                        {weaknesses.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {weaknesses.map((s, i) => (
                                    <div key={i} style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        padding: '8px 12px',
                                        background: 'rgba(234, 179, 8, 0.06)',
                                        borderRadius: '8px',
                                    }}>
                                        <div>
                                            <div style={{ fontSize: '0.9rem', fontWeight: 500 }}>{s.skill}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>{s.subject}</div>
                                        </div>
                                        <div style={{ color: '#eab308', fontWeight: 600, fontSize: '0.9rem' }}>{s.percentage}%</div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem' }}>
                                Geen specifieke werkpunten gevonden. Goed bezig!
                            </p>
                        )}
                    </div>
                </div>

                {/* AI Pedagogische Tips */}
                <div style={{
                    background: 'rgba(255,255,255,0.03)',
                    borderRadius: '16px',
                    padding: '24px',
                    border: '1px solid rgba(167, 139, 250, 0.15)',
                    marginBottom: '40px',
                }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '8px' }}>
                        💡 Tips voor ouders
                    </h3>
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', marginBottom: '16px' }}>
                        Ontvang AI-gegenereerde pedagogische tips op basis van de voortgang van uw kind.
                    </p>
                    <button
                        onClick={onGenerateTip}
                        disabled={isGeneratingTip}
                        style={{
                            padding: '12px 24px',
                            background: isGeneratingTip ? 'rgba(167, 139, 250, 0.1)' : 'linear-gradient(135deg, rgba(167, 139, 250, 0.2), rgba(34, 211, 238, 0.2))',
                            border: '1px solid rgba(167, 139, 250, 0.3)',
                            borderRadius: '10px',
                            color: 'white',
                            cursor: isGeneratingTip ? 'not-allowed' : 'pointer',
                            fontSize: '0.95rem',
                            fontWeight: 500,
                            transition: 'all 0.2s ease',
                        }}
                    >
                        {isGeneratingTip ? 'Tips genereren...' : 'Genereer Pedagogische Tips'}
                    </button>
                    {parentTip && (
                        <div style={{
                            marginTop: '16px',
                            padding: '16px',
                            background: 'rgba(167, 139, 250, 0.06)',
                            borderRadius: '10px',
                            border: '1px solid rgba(167, 139, 250, 0.1)',
                            lineHeight: 1.7,
                            whiteSpace: 'pre-wrap',
                            color: 'rgba(255,255,255,0.85)',
                            fontSize: '0.95rem',
                        }}>
                            {parentTip}
                        </div>
                    )}
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
