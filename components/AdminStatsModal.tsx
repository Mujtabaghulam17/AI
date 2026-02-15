import React from 'react';
import type { SubjectSpecificData, MasteryScore } from '../data/data.ts';

type Subject = 'Nederlands' | 'Engels' | 'Natuurkunde' | 'Biologie' | 'Economie' | 'Geschiedenis' | 'Scheikunde' | 'Bedrijfseconomie' | 'Wiskunde A' | 'Wiskunde B' | 'Frans' | 'Duits';

interface AdminStatsModalProps {
    isOpen: boolean;
    onClose: () => void;
    subjectData: { [key in Subject]: SubjectSpecificData };
    level: number;
    xp: number;
}

const AdminStatsModal: React.FC<AdminStatsModalProps> = ({ isOpen, onClose, subjectData, level, xp }) => {
    if (!isOpen) return null;

    // Calculate statistics
    const allSubjectData = Object.values(subjectData) as SubjectSpecificData[];

    const allAnsweredIds = allSubjectData.flatMap(data => data.answeredIds);
    const totalAnsweredQuestions = allAnsweredIds.length;
    const uniqueAnsweredQuestions = new Set(allAnsweredIds).size;
    
    const allMasteryScores = allSubjectData.flatMap(data => Object.values(data.masteryScores)) as MasteryScore[];
    const totalCorrect = allMasteryScores.reduce((sum, score) => sum + score.correct, 0);
    const totalAttempts = allMasteryScores.reduce((sum, score) => sum + score.total, 0);
    const overallMastery = totalAttempts > 0 ? ((totalCorrect / totalAttempts) * 100).toFixed(1) : 'N/A';
    
    const totalMistakes = allSubjectData.reduce((sum, data) => sum + data.mistakes.length, 0);

    const allSkills: { [key: string]: { correct: number, total: number } } = {};
    allSubjectData.forEach(data => {
        Object.entries(data.masteryScores).forEach(([skill, score]) => {
            if (!allSkills[skill]) {
                allSkills[skill] = { correct: 0, total: 0 };
            }
            allSkills[skill].correct += score.correct;
            allSkills[skill].total += score.total;
        });
    });

    const mostDifficultSkill = Object.entries(allSkills)
        .filter(([, score]) => score.total > 3) // Only consider skills with a few attempts
        .sort(([, a], [, b]) => (a.correct / a.total) - (b.correct / b.total))
        [0];

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="card modal-content" onClick={e => e.stopPropagation()} style={{maxWidth: '600px'}}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ color: 'var(--primary-color)' }}>Admin Statistieken</h2>
                    <button onClick={onClose} className="chat-close-btn" aria-label="Sluiten">&times;</button>
                </div>

                <p style={{color: 'var(--subtle-text)'}}>Live KPI's van de huidige gebruikerssessie.</p>

                <ul className="admin-stats-list">
                    <li>
                        <span>Totaal Beantwoorde Vragen</span>
                        <span>{totalAnsweredQuestions}</span>
                    </li>
                    <li>
                        <span>Unieke Vragen Beantwoord</span>
                        <span>{uniqueAnsweredQuestions}</span>
                    </li>
                    <li>
                        <span>Gemiddelde Beheersing</span>
                        <span>{overallMastery}%</span>
                    </li>
                    <li>
                        <span>Totaal Aantal Fouten</span>
                        <span>{totalMistakes}</span>
                    </li>
                     <li>
                        <span>Huidig Gebruikerslevel</span>
                        <span>{level} ({xp} XP)</span>
                    </li>
                    {mostDifficultSkill && (
                         <li>
                            <span>Moeilijkste Vaardigheid</span>
                            <span>{mostDifficultSkill[0]} ({( (mostDifficultSkill[1].correct / mostDifficultSkill[1].total) * 100).toFixed(0)}%)</span>
                        </li>
                    )}
                </ul>

                <button onClick={onClose} className="button" style={{marginTop: '24px'}}>Sluiten</button>
            </div>
        </div>
    );
};

export default AdminStatsModal;