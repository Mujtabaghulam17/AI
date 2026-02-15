
import React from 'react';
import StudyPlanner from './StudyPlanner.tsx';
import type { MasteryScore, StudyPlan } from '../data/data.ts';

interface ParentDashboardProps {
    masteryScores: { [key: string]: MasteryScore };
    studyStreak: number;
    totalAnswered: number;
    onGenerateTip: () => void;
    tip: string;
    isLoadingTip: boolean;
    studyPlan: StudyPlan | null;
}

const ParentDashboard: React.FC<ParentDashboardProps> = ({
    masteryScores,
    studyStreak,
    totalAnswered,
    onGenerateTip,
    tip,
    isLoadingTip,
    studyPlan,
}) => {
    const scoresArray = Object.entries(masteryScores).map(([skill, score]) => {
        const s = score as MasteryScore;
        return {
            skill,
            percentage: s.total > 0 ? (s.correct / s.total) * 100 : 0,
            total: s.total,
        };
    });

    const strengths = scoresArray.filter(s => s.percentage >= 75 && s.total >= 3).sort((a, b) => b.percentage - a.percentage);
    const weaknesses = scoresArray.filter(s => s.percentage < 55 && s.total >= 3).sort((a, b) => a.percentage - b.percentage);

    // Veilige berekening van totalCorrect zonder inline complexe types
    const allScores = Object.values(masteryScores) as MasteryScore[];
    const totalCorrect = allScores.reduce((sum, s) => sum + s.correct, 0);
    
    const overallMastery = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;

    return (
        <div className="progress-report-container">
            <h2>Ouderoverzicht</h2>
            <p className="dashboard-subtitle">Een overzicht van de voortgang en aandachtspunten van uw kind.</p>
            
            <div className="progress-report-grid" style={{ marginTop: '24px' }}>
                <div className="card">
                    <h3>Gemiddelde Beheersing</h3>
                    <p className="exam-score">{overallMastery}%</p>
                    <p style={{ color: 'var(--subtle-text)', marginTop: '-8px' }}>Gebaseerd op {totalAnswered} beantwoorde vragen</p>
                </div>
                <div className="card">
                    <h3>Studiereeks</h3>
                    <p className="exam-score">{studyStreak}<span style={{fontSize: '1.5rem', color: 'var(--subtle-text)'}}> dagen</span></p>
                     <p style={{ color: 'var(--subtle-text)', marginTop: '-8px' }}>Consistentie is de sleutel tot succes</p>
                </div>
            </div>

            <div className="progress-report-grid" style={{ marginTop: '24px' }}>
                <div className="card">
                    <h3 style={{color: 'var(--correct-color)'}}>Sterke Punten ✅</h3>
                    {strengths.length > 0 ? (
                        <ul style={{paddingLeft: '20px'}}>
                            {strengths.slice(0, 3).map(s => <li key={s.skill} style={{fontWeight: 500, marginBottom: '8px'}}>{s.skill}</li>)}
                        </ul>
                    ) : (
                        <p style={{color: 'var(--subtle-text)'}}>Nog niet genoeg data. Blijf oefenen!</p>
                    )}
                </div>
                 <div className="card">
                    <h3 style={{color: 'var(--medium-time-color)'}}>Werkpunten 🎯</h3>
                    {weaknesses.length > 0 ? (
                         <ul style={{paddingLeft: '20px'}}>
                            {weaknesses.slice(0, 3).map(s => <li key={s.skill} style={{fontWeight: 500, marginBottom: '8px'}}>{s.skill}</li>)}
                        </ul>
                    ) : (
                        <p style={{color: 'var(--subtle-text)'}}>Geen specifieke werkpunten gevonden. Goed bezig!</p>
                    )}
                </div>
            </div>

            <div className="card" style={{marginTop: '24px'}}>
                 <h3 style={{marginBottom: '16px'}}>Huidig Studieplan</h3>
                 <StudyPlanner 
                    studyPlan={studyPlan} 
                    readOnly={true}
                />
            </div>

            <div className="card" style={{marginTop: '24px'}}>
                 <h3>Tips voor Ouders</h3>
                 <p>Krijg pedagogisch verantwoorde tips van de AI om uw kind te ondersteunen, gericht op het leerproces, niet op de resultaten.</p>
                 <button className="button" onClick={onGenerateTip} disabled={isLoadingTip}>
                     {isLoadingTip ? <div className="button-spinner" /> : 'Genereer Pedagogische Tip'}
                 </button>
                 {tip && (
                     <div className="ai-feedback" style={{marginTop: '16px'}}>
                        <p style={{whiteSpace: 'pre-wrap'}}>{tip}</p>
                     </div>
                 )}
            </div>

        </div>
    );
};

export default ParentDashboard;
