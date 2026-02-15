import React from 'react';
import type { Badge } from '../data/data.ts';

interface BadgesProps {
    earnedBadges: string[];
    allBadges: Badge[];
}

const Badges: React.FC<BadgesProps> = ({ earnedBadges, allBadges }) => {
    return (
        <div className="card">
            <h3>Mijn Prestaties</h3>
            <div className="badges-container">
                {allBadges.map(badge => {
                    const isEarned = earnedBadges.includes(badge.id);
                    return (
                        <div key={badge.id} className={`badge ${isEarned ? 'earned' : ''}`} title={`${badge.name}: ${badge.description}`}>
                            <div className="badge-icon">{badge.icon}</div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Badges;
