import React from 'react';
import type { SquadData } from '../data/data.ts';

interface StudySquadProps {
    isPremium: boolean;
    onUpgrade: (reason: string) => void;
    squadData: SquadData;
    onOpenSquadOfficeHours: () => void;
}

const StudySquad: React.FC<StudySquadProps> = ({ isPremium, onUpgrade, squadData, onOpenSquadOfficeHours }) => {
    const { squadName, members, activityFeed, squadGoal } = squadData;

    const handleInvite = async () => {
        if (!isPremium) {
            onUpgrade('om vrienden uit te nodigen en samen te studeren.');
            return;
        }

        const shareData = {
            title: 'Doe mee met mijn GLOWEXAMEN Squad!',
            text: `Join mijn study squad "${squadName}" op GLOWEXAMEN. Samen oefenen = samen slagen! 💪`,
            url: 'https://glowexamen.nl/join/squad-invite'
        };

        try {
            if (navigator.share && navigator.canShare?.(shareData)) {
                await navigator.share(shareData);
            } else {
                await navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`);
                alert('Link gekopieerd naar klembord! Deel met je vrienden 📋');
            }
        } catch (err) {
            console.log('Share cancelled or failed', err);
        }
    };

    const goalProgress = squadGoal ? Math.min((squadGoal.current / squadGoal.target) * 100, 100) : 0;
    const medals = ['🥇', '🥈', '🥉'];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Header */}
            <div style={{
                padding: '20px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.1), rgba(34, 211, 238, 0.1))',
                border: '1px solid rgba(168, 85, 247, 0.15)',
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                    <div>
                        <h2 style={{ margin: 0, fontSize: '1.2rem' }}>👥 {squadName}</h2>
                        <p style={{ margin: '4px 0 0', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                            {members.length} leden · Samen studeren, samen slagen
                        </p>
                    </div>
                    <button onClick={handleInvite} style={{
                        padding: '10px 20px',
                        borderRadius: '10px',
                        border: 'none',
                        background: 'linear-gradient(135deg, #22d3ee, #a78bfa)',
                        color: '#0f0f1a',
                        fontWeight: 700,
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                    }}>
                        + Nodig Vrienden Uit
                    </button>
                </div>
            </div>

            {/* Squad Goal */}
            {squadGoal && (
                <div style={{
                    padding: '16px 18px',
                    borderRadius: '14px',
                    background: 'rgba(251, 191, 36, 0.05)',
                    border: '1px solid rgba(251, 191, 36, 0.15)',
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <div>
                            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#fbbf24', letterSpacing: '0.5px', marginBottom: '4px' }}>
                                🎯 WEKELIJKS SQUAD DOEL
                            </div>
                            <div style={{ fontSize: '0.95rem', fontWeight: 600 }}>{squadGoal.title}</div>
                        </div>
                        <div style={{
                            fontSize: '1.1rem',
                            fontWeight: 800,
                            color: '#fbbf24',
                        }}>
                            {squadGoal.current}/{squadGoal.target}
                        </div>
                    </div>
                    <div style={{
                        height: '8px',
                        borderRadius: '4px',
                        background: 'rgba(255,255,255,0.06)',
                        overflow: 'hidden',
                    }}>
                        <div style={{
                            height: '100%',
                            borderRadius: '4px',
                            width: `${goalProgress}%`,
                            background: 'linear-gradient(90deg, #fbbf24, #f59e0b)',
                            transition: 'width 0.8s ease',
                        }} />
                    </div>
                    <div style={{ marginTop: '8px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        🏆 Beloning: <strong>{squadGoal.reward}</strong>
                    </div>
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {/* Leaderboard */}
                <div style={{
                    padding: '16px',
                    borderRadius: '14px',
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.06)',
                }}>
                    <h3 style={{ margin: '0 0 14px', fontSize: '0.9rem' }}>🏆 Wekelijks Leaderboard</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {members.map((member, idx) => {
                            const maxXP = members[0]?.xp || 1;
                            const xpWidth = Math.max((member.xp / maxXP) * 100, 8);
                            const isTop3 = idx < 3;
                            return (
                                <div key={member.id} style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    padding: '8px 10px',
                                    borderRadius: '8px',
                                    background: isTop3 ? 'rgba(255,255,255,0.03)' : 'transparent',
                                }}>
                                    <span style={{
                                        fontWeight: 800,
                                        fontSize: isTop3 ? '1.1rem' : '0.82rem',
                                        width: '24px',
                                        textAlign: 'center',
                                        flexShrink: 0,
                                    }}>
                                        {isTop3 ? medals[idx] : member.rank}
                                    </span>
                                    <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>{member.avatar}</span>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{
                                            fontSize: '0.85rem',
                                            fontWeight: isTop3 ? 700 : 500,
                                            marginBottom: '4px',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
                                        }}>{member.name}</div>
                                        <div style={{
                                            height: '4px',
                                            borderRadius: '2px',
                                            background: 'rgba(255,255,255,0.06)',
                                            overflow: 'hidden',
                                        }}>
                                            <div style={{
                                                height: '100%',
                                                width: `${xpWidth}%`,
                                                borderRadius: '2px',
                                                background: idx === 0
                                                    ? 'linear-gradient(90deg, #fbbf24, #f59e0b)'
                                                    : idx === 1
                                                        ? 'linear-gradient(90deg, #94a3b8, #64748b)'
                                                        : idx === 2
                                                            ? 'linear-gradient(90deg, #f59e0b, #d97706)'
                                                            : 'linear-gradient(90deg, #22d3ee, #0891b2)',
                                                transition: 'width 0.5s ease',
                                            }} />
                                        </div>
                                    </div>
                                    <span style={{
                                        fontSize: '0.78rem',
                                        fontWeight: 700,
                                        color: isTop3 ? '#fbbf24' : 'var(--text-muted)',
                                        flexShrink: 0,
                                    }}>
                                        {member.xp} XP
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Activity Feed */}
                <div style={{
                    padding: '16px',
                    borderRadius: '14px',
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.06)',
                }}>
                    <h3 style={{ margin: '0 0 14px', fontSize: '0.9rem' }}>⚡ Recente Activiteit</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {activityFeed.map(activity => (
                            <div key={activity.id} style={{
                                display: 'flex',
                                gap: '10px',
                                padding: '8px 10px',
                                borderRadius: '8px',
                                background: 'rgba(255,255,255,0.02)',
                            }}>
                                <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>{activity.avatar}</span>
                                <div style={{ minWidth: 0 }}>
                                    <p style={{ margin: 0, fontSize: '0.82rem', lineHeight: 1.4 }} dangerouslySetInnerHTML={{ __html: activity.text }} />
                                    <p style={{ fontSize: '0.7rem', color: 'var(--subtle-text)', margin: '3px 0 0' }}>{activity.timestamp}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Squad Office Hours */}
            {isPremium && (
                <div style={{
                    padding: '18px 20px',
                    borderRadius: '14px',
                    background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.08), rgba(34, 211, 238, 0.08))',
                    border: '1px solid rgba(168, 85, 247, 0.15)',
                    textAlign: 'center',
                }}>
                    <h3 style={{ margin: '0 0 6px', fontSize: '0.95rem' }}>
                        📞 Squad Office Hours <span style={{
                            fontSize: '0.65rem', padding: '2px 6px', borderRadius: '4px',
                            background: 'linear-gradient(135deg, #22d3ee, #a78bfa)',
                            color: '#0f0f1a', fontWeight: 800, marginLeft: '6px',
                        }}>PRO</span>
                    </h3>
                    <p style={{ margin: '0 0 14px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        Elke week een live, AI-gemodereerde groepssessie voor de moeilijkste onderwerpen.
                    </p>
                    <button onClick={onOpenSquadOfficeHours} style={{
                        padding: '10px 24px',
                        borderRadius: '10px',
                        border: 'none',
                        background: 'linear-gradient(135deg, #a78bfa, #22d3ee)',
                        color: '#0f0f1a',
                        fontWeight: 700,
                        cursor: 'pointer',
                        fontSize: '0.88rem',
                    }}>
                        Neem deel aan de sessie
                    </button>
                </div>
            )}

            {/* Invite tip */}
            {members.length < 4 && (
                <div style={{
                    padding: '14px 16px',
                    borderRadius: '12px',
                    background: 'rgba(34, 211, 238, 0.04)',
                    border: '1px dashed rgba(34, 211, 238, 0.15)',
                    textAlign: 'center',
                }}>
                    <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                        💡 <strong>Tip:</strong> Nodig meer vrienden uit voor competitievere leaderboards en betere motivatie!
                    </p>
                </div>
            )}
        </div>
    );
};

export default StudySquad;
