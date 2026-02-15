import React from 'react';
import type { StudyPlan, PlannerWeek, PlannerTask } from '../data/data.ts';
import { getCEDomains, type ExamDomain } from '../data/examInfo.ts';

interface StudyPlannerProps {
    studyPlan: StudyPlan | null;
    readOnly?: boolean;
    examDate?: string;
    setExamDate?: (date: string) => void;
    generatePlan?: () => void;
    updatePlan?: () => void;
    isGenerating?: boolean;
    onToggleTask?: (weekIndex: number, taskIndex: number) => void;
    onReviewWeek?: (week: PlannerWeek) => void;
    onShowInfo?: (infoType: 'syllabus' | 'components') => void;
    onStartActionableTask?: (weekIndex: number, taskIndex: number, actionType: string, context?: string) => void;
    subject?: string;
    examLevel?: string;
}

const toolActionMap: { [key: string]: string } = {
    'Start Oefensessie': 'start_session',
    'Genereer Oefenvragen': 'generate_questions',
    'Gespreide Herhaling': 'repetition',
    'Analyseer Mijn Fouten': 'analyze_mistakes',
    'Zen Zone': 'zen_zone',
    'GLOW AI': 'chat_ai',
};
const toolKeywords = Object.keys(toolActionMap);

const parseDescriptionForAction = (description: string): { text: string; isAction: boolean; actionType?: string; context?: string }[] => {
    const keywordRegex = new RegExp(`'(${toolKeywords.join('|')})'`, 'i');
    const match = description.match(keywordRegex);

    if (!match) {
        return [{ text: description, isAction: false }];
    }

    const matchedKeyword = match[1];
    const originalKeyword = toolKeywords.find(k => k.toLowerCase() === matchedKeyword.toLowerCase()) || matchedKeyword;

    const actionType = toolActionMap[originalKeyword];
    const parts = description.split(`'${originalKeyword}'`);

    let context: string | undefined = undefined;
    if (actionType === 'start_session') {
        const contextMatch = description.match(/gericht op (het .*)/i);
        context = contextMatch ? contextMatch[1] : undefined;
    }

    return [
        { text: parts[0], isAction: false },
        { text: originalKeyword, isAction: true, actionType, context },
        { text: parts[1] || '', isAction: false }
    ];
};

const renderTask = (
    task: PlannerTask,
    weekIndex: number,
    taskIndex: number,
    props: {
        onToggleTask?: StudyPlannerProps['onToggleTask'],
        onShowInfo?: StudyPlannerProps['onShowInfo'],
        onStartActionableTask?: StudyPlannerProps['onStartActionableTask'],
        readOnly: boolean
    }
) => {
    // Read-only view
    if (props.readOnly) {
        return (
            <div key={taskIndex} className={`planner-task ${task.completed ? 'completed' : ''}`}>
                <span className="task-status-icon">
                    {task.completed ? '✅' : '⚪️'}
                </span>
                <label>{task.description}</label>
            </div>
        );
    }

    // Interactive view starts here
    if (task.infoType && props.onShowInfo) {
        const icon = task.infoType === 'syllabus'
            ? <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>
            : <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20v-6M12 8V4M4 14v-4M20 10V6M7 17v-1M17 14v-4" /></svg>;

        return (
            <div key={taskIndex} className="info-task" onClick={() => props.onShowInfo!(task.infoType!)} role="button" tabIndex={0}>
                {icon}
                <span>{task.description}</span>
            </div>
        );
    }

    const parsedParts = parseDescriptionForAction(task.description);
    const actionPart = parsedParts.find(p => p.isAction);

    if (actionPart && !task.completed && props.onStartActionableTask) {
        return (
            <div key={taskIndex} className="planner-task">
                <span className="task-description">
                    {parsedParts.map((part, i) =>
                        part.isAction ? (
                            <button
                                key={i}
                                className="button-link-style"
                                onClick={() => props.onStartActionableTask!(weekIndex, taskIndex, part.actionType!, part.context)}
                            >
                                {part.text}
                            </button>
                        ) : (
                            <span key={i}>{part.text}</span>
                        )
                    )}
                </span>
            </div>
        );
    }


    return (
        <div key={taskIndex} className={`planner-task ${task.completed ? 'completed' : ''}`}>
            <input
                type="checkbox"
                id={`task-${weekIndex}-${taskIndex}`}
                checked={task.completed}
                onChange={() => props.onToggleTask && props.onToggleTask(weekIndex, taskIndex)}
            />
            <label htmlFor={`task-${weekIndex}-${taskIndex}`}>{task.description}</label>
        </div>
    );
};


const StudyPlanner: React.FC<StudyPlannerProps> = (props) => {
    const { examDate, setExamDate, studyPlan, generatePlan, updatePlan, isGenerating, onToggleTask, onReviewWeek, onShowInfo, onStartActionableTask, readOnly = false, subject, examLevel } = props;
    const totalTasks = studyPlan?.weeks.reduce((acc, week) => acc + week.tasks.filter(t => !t.infoType).length, 0) || 0;
    const completedTasks = studyPlan?.weeks.reduce((acc, week) => acc + week.tasks.filter(t => t.completed && !t.infoType).length, 0) || 0;
    const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    const ceDomains = subject ? getCEDomains(subject, examLevel) : [];

    const calculateDaysLeft = () => {
        if (!examDate) return null;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const targetDate = new Date(examDate);
        targetDate.setHours(0, 0, 0, 0);
        const diffTime = targetDate.getTime() - today.getTime();
        return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    };

    const daysLeft = calculateDaysLeft();

    // Domain colors
    const domainColors = ['#22d3ee', '#a78bfa', '#f472b6', '#34d399', '#fbbf24', '#fb923c', '#60a5fa', '#e879f9'];

    return (
        <>
            {!readOnly && <h3 style={{ marginBottom: '4px' }}>📚 Jouw Persoonlijke Studieplanner</h3>}

            {/* Exam Program Domains Overview */}
            {!readOnly && ceDomains.length > 0 && (
                <div style={{
                    marginBottom: '20px',
                    padding: '16px',
                    background: 'rgba(34, 211, 238, 0.04)',
                    borderRadius: '14px',
                    border: '1px solid rgba(34, 211, 238, 0.12)',
                }}>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '12px',
                    }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--cyan)', letterSpacing: '0.5px' }}>
                            📋 EXAMENPROGRAMMA {subject?.toUpperCase()}
                        </span>
                        <a
                            href={`https://www.examenblad.nl/2026/vwo`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textDecoration: 'underline' }}
                        >
                            examenblad.nl ↗
                        </a>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {ceDomains.map((domain, i) => (
                            <div
                                key={domain.code}
                                title={domain.subdomains?.map(s => `${s.code}: ${s.title}`).join('\n')}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    padding: '6px 12px',
                                    borderRadius: '8px',
                                    background: `rgba(${i % 2 === 0 ? '34, 211, 238' : '168, 85, 247'}, 0.08)`,
                                    border: `1px solid rgba(${i % 2 === 0 ? '34, 211, 238' : '168, 85, 247'}, 0.15)`,
                                    fontSize: '0.8rem',
                                    cursor: 'default',
                                }}
                            >
                                <span style={{
                                    color: domainColors[i % domainColors.length],
                                    fontWeight: 800,
                                    fontSize: '0.75rem',
                                }}>
                                    {domain.code}
                                </span>
                                <span style={{ color: 'var(--text-muted)' }}>{domain.title}</span>
                                {domain.subdomains && (
                                    <span style={{
                                        fontSize: '0.65rem',
                                        color: 'var(--subtle-text)',
                                        background: 'rgba(255,255,255,0.05)',
                                        padding: '1px 6px',
                                        borderRadius: '4px',
                                    }}>
                                        {domain.subdomains.length}
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {!studyPlan ? (
                <div>
                    {!readOnly && generatePlan && setExamDate && examDate !== undefined && (
                        <div>
                            <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>
                                De AI maakt een plan op maat, gebaseerd op het <strong>officiële examenprogramma</strong> van {subject || 'dit vak'}.
                            </p>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <input
                                    type="date"
                                    value={examDate}
                                    onChange={e => setExamDate(e.target.value)}
                                    className="date-input"
                                    aria-label="Examendatum"
                                />
                                <button onClick={generatePlan} className="button" disabled={!examDate || isGenerating} style={{ flexShrink: 0, width: 'auto' }}>
                                    {isGenerating ? '⏳ Genereren...' : '✨ Maak Plan'}
                                </button>
                            </div>

                            {/* Demo Plan */}
                            <div style={{
                                marginTop: '24px',
                                padding: '20px',
                                background: 'rgba(34, 211, 238, 0.03)',
                                borderRadius: '14px',
                                border: '1px dashed rgba(34, 211, 238, 0.2)',
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', color: '#22d3ee', fontSize: '0.82rem', fontWeight: 600 }}>
                                    <span>✨</span>
                                    <span>Voorbeeld: Plan gebaseerd op examenprogramma</span>
                                </div>
                                <div style={{ opacity: 0.6 }}>
                                    {ceDomains.slice(0, 3).map((domain, i) => (
                                        <div key={domain.code} style={{ marginBottom: '12px' }}>
                                            <div style={{ fontWeight: 600, marginBottom: '6px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                                Week {i + 1}: Domein {domain.code} — {domain.title}
                                            </div>
                                            {domain.subdomains?.slice(0, 2).map((sub, j) => (
                                                <div key={sub.code} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px', paddingLeft: '8px' }}>
                                                    <span style={{ fontSize: '12px' }}>{j === 0 ? '✅' : '⚪️'}</span>
                                                    <span style={{ color: 'var(--subtle-text)', fontSize: '0.85rem' }}>{sub.code}: {sub.title}</span>
                                                </div>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '8px', fontStyle: 'italic' }}>
                                    📅 Stel je examendatum in om je plan te genereren
                                </p>
                            </div>
                        </div>
                    )}
                    {readOnly && (
                        <p style={{ color: 'var(--subtle-text)' }}>Er is nog geen studieplan aangemaakt voor dit vak.</p>
                    )}
                </div>
            ) : (
                <div>
                    {/* Progress header */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '8px',
                        marginTop: readOnly ? '0px' : '8px'
                    }}>
                        {daysLeft !== null && (
                            <span style={{
                                fontWeight: 700,
                                color: daysLeft <= 7 ? '#f87171' : daysLeft <= 30 ? '#fbbf24' : 'var(--cyan)',
                                fontSize: '0.95rem',
                            }}>
                                {daysLeft === 0 ? '🔥 Vandaag is het examen!' : `📅 ${daysLeft} ${daysLeft === 1 ? 'dag' : 'dagen'} tot het examen`}
                            </span>
                        )}
                        <span style={{ fontWeight: 700, color: progressPercentage === 100 ? '#34d399' : 'var(--text-main)' }}>
                            {progressPercentage === 100 ? '🎉 ' : ''}{progressPercentage}% voltooid
                        </span>
                    </div>
                    <div className="progress-bar">
                        <div className="progress-fill skill-progress-fill" style={{ width: `${progressPercentage}%` }}></div>
                    </div>

                    {/* Week list */}
                    <div style={{ maxHeight: '400px', overflowY: 'auto', marginTop: '16px', paddingRight: '10px' }}>
                        {studyPlan.weeks.map((week, weekIndex) => (
                            <div key={weekIndex} className="planner-week" style={{
                                marginBottom: '16px',
                                padding: '16px',
                                borderRadius: '12px',
                                background: 'rgba(255, 255, 255, 0.02)',
                                border: '1px solid rgba(255, 255, 255, 0.06)',
                            }}>
                                <h4 style={{
                                    marginBottom: '10px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    fontSize: '0.95rem',
                                }}>
                                    <span style={{
                                        background: 'linear-gradient(135deg, var(--cyan), var(--purple))',
                                        color: '#0f0f1a',
                                        fontWeight: 800,
                                        fontSize: '0.7rem',
                                        padding: '2px 8px',
                                        borderRadius: '6px',
                                    }}>
                                        W{week.week_number}
                                    </span>
                                    {week.theme}
                                </h4>
                                {week.tasks.map((task, taskIndex) => renderTask(task, weekIndex, taskIndex, { onToggleTask, onShowInfo, onStartActionableTask, readOnly }))}
                                {!readOnly && onReviewWeek && (
                                    <button className="button-tertiary" onClick={() => onReviewWeek(week)} style={{ marginTop: '8px', fontSize: '13px' }}>
                                        📝 Review Mijn Week
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                    {!readOnly && updatePlan && (
                        <div style={{ marginTop: '12px' }}>
                            <button onClick={updatePlan} className="button button-secondary" disabled={isGenerating}>
                                {isGenerating ? '⏳ Updaten...' : '🔄 Update Plan op Basis van Voortgang'}
                            </button>
                        </div>
                    )}
                </div>
            )}
        </>
    );
};

export default StudyPlanner;
