import React from 'react';
import type { ExamResult } from '../data/data.ts';

interface ExamResultsProps {
    results: ExamResult;
    onClose: () => void;
}

const ExamResults: React.FC<ExamResultsProps> = ({ results, onClose }) => {
    const { questions, userAnswers, results: feedback, score } = results;

    const skillScores: { [key: string]: { correct: number, total: number } } = {};
    feedback.forEach(res => {
        if (!skillScores[res.skill]) {
            skillScores[res.skill] = { correct: 0, total: 0 };
        }
        if (res.isCorrect) {
            skillScores[res.skill].correct++;
        }
        skillScores[res.skill].total++;
    });

    return (
        <div className="card">
            <h2>Proefexamen Resultaten</h2>

            <div className="exam-results-summary">
                <p style={{margin: '0', color: 'var(--subtle-text)'}}>Je score</p>
                <p className="exam-score">{Math.round(score)}%</p>
                <p style={{margin: '0', fontWeight: 500}}>
                    {feedback.filter(r => r.isCorrect).length} / {questions.length} vragen correct
                </p>
            </div>

            <div className="card" style={{backgroundColor: 'var(--background-color)'}}>
                <h3 style={{ marginBottom: '16px' }}>Scores per Vaardigheid</h3>
                {Object.entries(skillScores).map(([skill, scores]) => {
                    const percentage = scores.total > 0 ? Math.round((scores.correct / scores.total) * 100) : 0;
                    return (
                        <div className="skill-progress" key={skill} style={{ marginBottom: '16px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                              <span style={{ fontWeight: 600 }}>{skill}</span>
                              <span style={{ fontWeight: 500, color: 'var(--subtle-text)' }}>{scores.correct}/{scores.total} ({percentage}%)</span>
                            </div>
                            <div className="progress-bar" style={{backgroundColor: 'var(--card-background)'}}>
                              <div className="progress-fill skill-progress-fill" style={{ width: `${percentage}%` }}></div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div style={{marginTop: '32px'}}>
                <h3>Gedetailleerde Analyse</h3>
                {questions.map((q, index) => (
                    <div key={q.id} className={`exam-question-review ${feedback[index].isCorrect ? 'correct' : 'incorrect'}`}>
                        <p style={{fontWeight: 600}}>Vraag {index + 1}: {q.vraag_tekst}</p>
                        <div className="review-section" style={{borderTop: 'none', paddingTop: 0, marginTop: 0}}>
                            <h3>Jouw Antwoord</h3>
                            <p className="user-answer" style={{marginTop: 0}}>{userAnswers[index] || "Niet beantwoord"}</p>
                        </div>
                         <div className="correct-model" style={{borderTop: 'none', paddingTop: 0, marginTop: '16px'}}>
                            <h3>Correctiemodel</h3>
                            <p>{q.correctie_model}</p>
                        </div>
                    </div>
                ))}
            </div>

            <button className="button" onClick={onClose} style={{marginTop: '24px'}}>
                Terug naar Dashboard
            </button>
        </div>
    );
};

export default ExamResults;