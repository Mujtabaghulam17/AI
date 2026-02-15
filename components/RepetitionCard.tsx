import React from 'react';
import type { Mistake, Question } from '../data/data.ts';

interface RepetitionCardProps {
    mistake: Mistake;
    allQuestions: Question[];
    onGotIt: (questionId: number) => void;
    onDashboard: () => void;
    currentIndex: number;
    totalMistakes: number;
}

const RepetitionCard: React.FC<RepetitionCardProps> = ({ mistake, allQuestions, onGotIt, onDashboard, currentIndex, totalMistakes }) => {
    const question = allQuestions.find(q => q.id === mistake.questionId);

    if (!question) {
        return (
             <div className="card">
                <h2>Fout niet gevonden</h2>
                <p>De details van deze vraag konden niet worden geladen.</p>
                <button className="button" onClick={onDashboard}>Terug naar Dashboard</button>
            </div>
        );
    }
    
    let passageToShow = question.vraag_passage;
    if (!passageToShow && question.context_id) {
        const contextQuestion = allQuestions.find(q => q.id === question.context_id);
        if (contextQuestion) {
          passageToShow = contextQuestion.vraag_passage;
        }
    }

    return (
        <div className="card">
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px'}}>
                 <h2 style={{margin: 0}}>Gespreide Herhaling</h2>
                 <span style={{color: 'var(--subtle-text)', fontWeight: 500}}>Onderdeel {currentIndex + 1} van {totalMistakes}</span>
            </div>
           
            {passageToShow && <div className="passage">{passageToShow}</div>}
            <p className="question-text">{question.vraag_tekst}</p>

            <div className="review-section">
                <h3>Jouw Oorspronkelijke Antwoord</h3>
                <p className="user-answer">{mistake.userAnswer}</p>
            </div>
            
            <div className="ai-feedback">
                <h3 style={{marginTop: 0, color: 'var(--primary-color)'}}>AI Feedback</h3>
                <p>{mistake.aiFeedback}</p>
            </div>

            <div className="correct-model">
                <h3>Correctiemodel</h3>
                <p>{question.correctie_model}</p>
            </div>

            <div style={{marginTop: '32px'}}>
                <button className="button" onClick={() => onGotIt(mistake.questionId)}>Oké, ik snap het nu</button>
            </div>
        </div>
    );
};

export default RepetitionCard;