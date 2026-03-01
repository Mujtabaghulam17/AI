import React, { useState, useMemo } from 'react';
import Badges from './Badges.tsx';
import type { MasteryScore, ProgressHistoryEntry, Badge } from '../data/data.ts';

interface ProgressReportProps {
    masteryScores: { [key: string]: MasteryScore };
    progressHistory: ProgressHistoryEntry[];
    onGenerateAnalysis: () => Promise<string>;
    allBadges: Badge[];
    earnedBadges: string[];
    studyStreak?: number;
    level?: number;
}

const ProgressChart = ({ history }: { history: ProgressHistoryEntry[] }) => {
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

    const PADDING = 30;
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
    const areaD = pathD + ` L${points[points.length - 1].x} ${SVG_HEIGHT - PADDING} L${points[0].x} ${SVG_HEIGHT - PADDING} Z`;

    return (
        <div>
            {showDemo && (
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '12px',
                    padding: '8px 12px',
                    background: 'rgba(34, 211, 238, 0.08)',
                    borderRadius: '8px',
                    border: '1px dashed rgba(34, 211, 238, 0.25)',
                }}>
                    <span style={{ color: '#22d3ee', fontSize: '0.82rem', fontWeight: 500 }}>
                        ✨ Voorbeeld: Zo ziet je voortgang eruit na 1 week oefenen
                    </span>
                </div>
            )}
            <svg viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`} style={{ opacity: showDemo ? 0.6 : 1 }}>
                <defs>
                    <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#22d3ee" />
                        <stop offset="100%" stopColor="#a78bfa" />
                    </linearGradient>
                    <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="#a78bfa" stopOpacity="0.02" />
                    </linearGradient>
                </defs>
                {/* Grid lines */}
                {[0, 25, 50, 75, 100].map(v => {
                    const y = chartHeight - (v / 100) * chartHeight + PADDING;
                    return (
                        <g key={v}>
                            <line x1={PADDING} y1={y} x2={SVG_WIDTH - PADDING} y2={y}
                                stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
                            <text x={PADDING - 8} y={y + 4} textAnchor="end"
                                fill="rgba(255,255,255,0.3)" fontSize="10">{v}%</text>
                        </g>
                    );
                })}
                {/* Area fill */}
                <path d={areaD} fill="url(#areaGradient)" />
                {/* Line */}
                <path d={pathD} fill="none" stroke="url(#lineGradient)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                {/* Points */}
                {points.map((p, i) => (
                    <g key={i}>
                        <circle cx={p.x} cy={p.y} r="4" fill="#0f0f1a" stroke="url(#lineGradient)" strokeWidth="2" />
                        {(i === 0 || i === points.length - 1) && (
                            <text x={p.x} y={p.y - 10} textAnchor="middle"
                                fill="#22d3ee" fontSize="10" fontWeight="600">{p.value}%</text>
                        )}
                    </g>
                ))}
            </svg>
        </div>
    );
};

const ProgressReport: React.FC<ProgressReportProps> = ({
    masteryScores, progressHistory, onGenerateAnalysis,
    allBadges, earnedBadges, studyStreak = 0, level = 1
}) => {
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

    const { strongest, weakest } = useMemo(() => {
        const entries = Object.entries(masteryScores)
            .filter(([_, s]) => (s as MasteryScore).total >= 2)
            .map(([skill, s]) => ({ skill, pct: Math.round(((s as MasteryScore).correct / (s as MasteryScore).total) * 100) }))
            .sort((a, b) => b.pct - a.pct);
        return {
            strongest: entries[0] || null,
            weakest: entries.length > 1 ? entries[entries.length - 1] : null,
        };
    }, [masteryScores]);

    const statCards = [
        { label: 'Gemiddeld', value: `${overallMastery}%`, icon: '📊', color: '#22d3ee' },
        { label: 'Beantwoord', value: totalAnswered.toString(), icon: '✍️', color: '#a78bfa' },
        { label: 'Streak', value: `${studyStreak}d`, icon: '🔥', color: '#fbbf24' },
        { label: 'Level', value: level.toString(), icon: '⭐', color: '#34d399' },
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h2 style={{ margin: 0 }}>Mijn Voortgangsrapport</h2>

            {/* Stat cards row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                {statCards.map((stat, i) => (
                    <div key={i} style={{
                        padding: '16px 12px',
                        borderRadius: '12px',
                        background: `${stat.color}08`,
                        border: `1px solid ${stat.color}20`,
                        textAlign: 'center',
                    }}>
                        <div style={{ fontSize: '1.4rem', marginBottom: '4px' }}>{stat.icon}</div>
                        <div style={{
                            fontSize: '1.4rem',
                            fontWeight: 800,
                            color: stat.color,
                            lineHeight: 1.2,
                        }}>{stat.value}</div>
                        <div style={{
                            fontSize: '0.72rem',
                            color: 'var(--text-muted)',
                            fontWeight: 600,
                            marginTop: '4px',
                            letterSpacing: '0.3px',
                        }}>{stat.label}</div>
                    </div>
                ))}
            </div>

            {/* Strongest / Weakest highlights */}
            {(strongest || weakest) && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    {strongest && (
                        <div style={{
                            padding: '14px 16px',
                            borderRadius: '12px',
                            background: 'rgba(52, 211, 153, 0.06)',
                            border: '1px solid rgba(52, 211, 153, 0.15)',
                        }}>
                            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#34d399', letterSpacing: '0.5px', marginBottom: '6px' }}>
                                💪 STERKSTE VAARDIGHEID
                            </div>
                            <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{strongest.skill}</div>
                            <div style={{ fontSize: '0.82rem', color: '#34d399', fontWeight: 700 }}>{strongest.pct}% correct</div>
                        </div>
                    )}
                    {weakest && (
                        <div style={{
                            padding: '14px 16px',
                            borderRadius: '12px',
                            background: 'rgba(248, 113, 113, 0.06)',
                            border: '1px solid rgba(248, 113, 113, 0.15)',
                        }}>
                            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#f87171', letterSpacing: '0.5px', marginBottom: '6px' }}>
                                📌 FOCUS NODIG
                            </div>
                            <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{weakest.skill}</div>
                            <div style={{ fontSize: '0.82rem', color: '#f87171', fontWeight: 700 }}>{weakest.pct}% correct</div>
                        </div>
                    )}
                </div>
            )}

            {/* Progress chart */}
            <div style={{
                padding: '16px',
                borderRadius: '14px',
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.06)',
            }}>
                <h3 style={{ margin: '0 0 12px', fontSize: '0.9rem' }}>Voortgang Over Tijd</h3>
                <ProgressChart history={progressHistory} />
            </div>

            {/* AI Analysis */}
            <div style={{
                padding: '16px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.04), rgba(34, 211, 238, 0.04))',
                border: '1px solid rgba(168, 85, 247, 0.12)',
            }}>
                <h3 style={{ margin: '0 0 10px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    🧠 AI Analyse
                </h3>
                {isLoading ? (
                    <div className="spinner" style={{ width: '28px', height: '28px' }}></div>
                ) : analysis ? (
                    <p style={{ fontStyle: 'italic', margin: 0, fontSize: '0.88rem', lineHeight: 1.55, color: 'var(--text-muted)' }}>{analysis}</p>
                ) : (
                    <button className="button-tertiary" onClick={handleGenerate} style={{ fontSize: '0.85rem' }}>
                        Genereer inzicht in mijn leercurve
                    </button>
                )}
            </div>

            {/* Skills breakdown */}
            <div style={{
                padding: '16px',
                borderRadius: '14px',
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.06)',
            }}>
                <h3 style={{ margin: '0 0 14px', fontSize: '0.9rem' }}>Scores per Vaardigheid</h3>
                {Object.keys(masteryScores).length > 0 ? (
                    Object.entries(masteryScores)
                        .sort(([, a], [, b]) => {
                            const pctA = (a as MasteryScore).total > 0 ? (a as MasteryScore).correct / (a as MasteryScore).total : 0;
                            const pctB = (b as MasteryScore).total > 0 ? (b as MasteryScore).correct / (b as MasteryScore).total : 0;
                            return pctB - pctA;
                        })
                        .map(([skill, score]: [string, MasteryScore]) => {
                            const percentage = score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0;
                            const barColor = percentage >= 70 ? '#34d399' : percentage >= 40 ? '#fbbf24' : '#f87171';
                            return (
                                <div key={skill} style={{ marginBottom: '14px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                        <span style={{ fontWeight: 600, fontSize: '0.88rem' }}>{skill}</span>
                                        <span style={{
                                            fontWeight: 700,
                                            fontSize: '0.82rem',
                                            color: barColor,
                                        }}>{score.correct}/{score.total} ({percentage}%)</span>
                                    </div>
                                    <div style={{
                                        height: '6px',
                                        borderRadius: '3px',
                                        background: 'rgba(255,255,255,0.06)',
                                        overflow: 'hidden',
                                    }}>
                                        <div style={{
                                            height: '100%',
                                            borderRadius: '3px',
                                            width: `${percentage}%`,
                                            background: `linear-gradient(90deg, ${barColor}, ${barColor}cc)`,
                                            transition: 'width 0.5s ease',
                                        }} />
                                    </div>
                                </div>
                            );
                        })
                ) : (
                    <div style={{ textAlign: 'center', padding: '20px', color: 'var(--subtle-text)' }}>
                        <div style={{ fontSize: '2rem', marginBottom: '8px' }}>📚</div>
                        <p style={{ margin: 0, fontSize: '0.88rem' }}>Nog geen data. Start een sessie om je voortgang te zien!</p>
                    </div>
                )}
            </div>

            {/* Badges */}
            <Badges allBadges={allBadges} earnedBadges={earnedBadges} />
        </div>
    );
};

export default ProgressReport;