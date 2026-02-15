import React, { useState } from 'react';
import Badges from './Badges.tsx';
import type { MasteryScore, ProgressHistoryEntry, Badge } from '../data/data.ts';

interface ProgressReportProps {
    masteryScores: { [key: string]: MasteryScore };
    progressHistory: ProgressHistoryEntry[];
    onGenerateAnalysis: () => Promise<string>;
    allBadges: Badge[];
    earnedBadges: string[];
}

const ProgressChart = ({ history }: { history: ProgressHistoryEntry[] }) => {
    // Demo data shown when user has no data yet
    const showDemo = history.length < 2;
    const demoHistory: ProgressHistoryEntry[] = [
        { date: '2026-02-01', avgMastery: 45 },
        { date: '2026-02-03', avgMastery: 52 },
        { date: '2026-02-05', avgMastery: 58 },
        { date: '2026-02-07', avgMastery: 67 },
        { date: '2026-02-09', avgMastery: 73 },
        { date: '2026-02-11', avgMastery: 78 },
    ];

    const displayHistory = showDemo ? demoHistory : history;

    const PADDING = 20;
    const SVG_WIDTH = 500;
    const SVG_HEIGHT = 200;
    const chartWidth = SVG_WIDTH - PADDING * 2;
    const chartHeight = SVG_HEIGHT - PADDING * 2;

    const points = displayHistory.map((entry, index) => {
        const x = (index / (displayHistory.length - 1)) * chartWidth + PADDING;
        const y = chartHeight - (entry.avgMastery / 100) * chartHeight + PADDING;
        return { x, y, value: entry.avgMastery };
    });

    const pathD = points.map((p, i) => (i === 0 ? 'M' : 'L') + `${p.x} ${p.y}`).join(' ');

    return (
        <div>
            {showDemo && (
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '12px',
                    padding: '8px 12px',
                    background: 'rgba(34, 211, 238, 0.1)',
                    borderRadius: '8px',
                    border: '1px dashed rgba(34, 211, 238, 0.3)',
                }}>
                    <span style={{ color: '#22d3ee', fontSize: '0.85rem', fontWeight: 500 }}>
                        ✨ Voorbeeld: Zo ziet je voortgang eruit na 1 week oefenen
                    </span>
                </div>
            )}
            <svg viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`} style={{ opacity: showDemo ? 0.7 : 1 }}>
                <line className="grid-line" x1={PADDING} y1={SVG_HEIGHT - PADDING} x2={SVG_WIDTH - PADDING} y2={SVG_HEIGHT - PADDING} />
                <line className="grid-line" x1={PADDING} y1={PADDING} x2={PADDING} y2={SVG_HEIGHT - PADDING} />
                <text className="axis-label" x={PADDING - 10} y={PADDING + 5} textAnchor="end">100%</text>
                <text className="axis-label" x={PADDING - 10} y={SVG_HEIGHT - PADDING + 5} textAnchor="end">0%</text>

                <path d={pathD} className="data-line" />
                {points.map((p, i) => (
                    <circle key={i} cx={p.x} cy={p.y} r="3" className="data-point" />
                ))}
            </svg>
        </div>
    );
};

const ProgressReport: React.FC<ProgressReportProps> = ({ masteryScores, progressHistory, onGenerateAnalysis, allBadges, earnedBadges }) => {
    const [analysis, setAnalysis] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleGenerate = async () => {
        setIsLoading(true);
        const result = await onGenerateAnalysis();
        setAnalysis(result);
        setIsLoading(false);
    };

    const allScores = Object.values(masteryScores) as MasteryScore[];
    const totalCorrect = allScores.reduce((sum, s) => sum + s.correct, 0);
    const totalAnswered = allScores.reduce((sum, s) => sum + s.total, 0);
    const overallMastery = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;

    return (
        <div className="progress-report-container">
            <h2>Mijn Voortgangsrapport</h2>
            <div className="progress-report-grid" style={{ marginTop: '24px' }}>
                <div className="card">
                    <h3>Gemiddelde Beheersing</h3>
                    <p className="exam-score">{overallMastery}%</p>
                    <p style={{ color: 'var(--subtle-text)', marginTop: '-8px' }}>{totalCorrect} van de {totalAnswered} vragen correct</p>
                </div>
                <div className="card">
                    <h3>AI Analyse</h3>
                    {isLoading ? (
                        <div className="spinner" style={{ width: '32px', height: '32px' }}></div>
                    ) : analysis ? (
                        <p style={{ fontStyle: 'italic' }}>{analysis}</p>
                    ) : (
                        <button className="button-tertiary" onClick={handleGenerate}>Genereer inzicht in mijn leercurve</button>
                    )}
                </div>
            </div>
            <div className="card" style={{ marginTop: '24px' }}>
                <h3>Voortgang Over Tijd</h3>
                <div className="chart-container">
                    <ProgressChart history={progressHistory} />
                </div>
            </div>
            <div className="card" style={{ marginTop: '24px' }}>
                <h3 style={{ marginBottom: '16px' }}>Scores per Vaardigheid</h3>
                {Object.keys(masteryScores).length > 0 ? (
                    Object.entries(masteryScores).map(([skill, score]: [string, MasteryScore]) => {
                        const percentage = score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0;
                        return (
                            <div className="skill-progress" key={skill}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                    <span style={{ fontWeight: 600 }}>{skill}</span>
                                    <span style={{ fontWeight: 500, color: 'var(--subtle-text)' }}>{score.correct}/{score.total} ({percentage}%)</span>
                                </div>
                                <div className="progress-bar">
                                    <div className="progress-fill skill-progress-fill" style={{ width: `${percentage}%` }}></div>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <p style={{ textAlign: 'center', color: 'var(--subtle-text)' }}>Nog geen data. Start een sessie!</p>
                )}
            </div>
            <div style={{ marginTop: '24px' }}>
                <Badges allBadges={allBadges} earnedBadges={earnedBadges} />
            </div>
        </div>
    );
};

export default ProgressReport;