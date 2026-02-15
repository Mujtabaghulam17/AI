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
                // Fallback: copy to clipboard
                await navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`);
                alert('Link gekopieerd naar klembord! Deel met je vrienden 📋');
            }
        } catch (err) {
            console.log('Share cancelled or failed', err);
        }
    };

    const goalProgress = squadGoal ? (squadGoal.current / squadGoal.target) * 100 : 0;

    return (
        <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <h2>Mijn Study Squad: {squadName}</h2>
                <button className="button" style={{ width: 'auto' }} onClick={handleInvite}>+ Nodig Vrienden Uit</button>
            </div>

            {squadGoal && (
                <div className="card squad-goal-card" style={{ marginTop: '24px' }}>
                    <h3>Wekelijks Squad Doel</h3>
                    <p style={{ fontWeight: 600, fontSize: '1.1rem', marginTop: '8px' }}>{squadGoal.title}</p>
                    <div className="squad-goal-progress">
                        <div className="progress-bar">
                            <div className="progress-fill xp-progress-fill" style={{ width: `${goalProgress}%` }}></div>
                        </div>
                        <span style={{ fontWeight: 500, color: 'var(--subtle-text)' }}>{squadGoal.current} / {squadGoal.target}</span>
                    </div>
                    <p style={{ marginTop: '12px' }}><strong>Beloning:</strong> {squadGoal.reward}</p>
                </div>
            )}

            {isPremium && (
                <div className="card" style={{ marginTop: '24px', backgroundColor: 'var(--soft-pink)' }}>
                    <div style={{ textAlign: 'center' }}>
                        <h3 style={{ color: 'var(--primary-color)' }}>Squad Office Hours <span className="pro-badge">PRO</span></h3>
                        <p>Elke week een live, door AI gemodereerde, groepssessie om de moeilijkste onderwerpen samen aan te pakken.</p>
                        <button className="button" style={{ width: 'auto', background: 'var(--primary-color)' }} onClick={onOpenSquadOfficeHours}>
                            Neem deel aan de sessie
                        </button>
                    </div>
                </div>
            )}

            <div className="progress-report-grid" style={{ marginTop: '24px' }}>
                <div className="card">
                    <h3>Wekelijks Leaderboard</h3>
                    <ol className="squad-leaderboard">
                        {members.map(member => (
                            <li key={member.id} className="leaderboard-item">
                                <span className="leaderboard-rank">{member.rank}</span>
                                <div className="leaderboard-avatar">{member.avatar}</div>
                                <span className="leaderboard-name">{member.name}</span>
                                <span className="leaderboard-xp">{member.xp} XP</span>
                            </li>
                        ))}
                    </ol>
                </div>
                <div className="card">
                    <h3>Recente Activiteit</h3>
                    <div className="activity-feed">
                        {activityFeed.map(activity => (
                            <div key={activity.id} className="activity-feed-item">
                                <div className="activity-avatar">{activity.avatar}</div>
                                <div>
                                    <p className="activity-text" dangerouslySetInnerHTML={{ __html: activity.text }} />
                                    <p style={{ fontSize: '12px', color: 'var(--subtle-text)', margin: '2px 0 0 0' }}>{activity.timestamp}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudySquad;
