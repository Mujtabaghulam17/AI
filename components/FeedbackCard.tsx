import React, { useState } from 'react';
import type { Question, AiFeedback } from '../data/data.ts';

interface FeedbackCardProps {
    question: Question | null;
    isCorrect: boolean;
    onNext: (() => void) | null;
    onDashboard: () => void;
    inSession: boolean;
    isLastQuestionInSession: boolean;
    feedbackData: {
        xpGained: number;
        aiFeedback: AiFeedback;
        mindsetTip: string;
    };
    onOpenChat: () => void;
    onExplainConcept: () => void;
    onAnalyzeThinkingProcess: () => void;
    answerLimitReached: boolean;
    onUpgrade: () => void;
    onGetSimplifiedExplanation: (explanation: string) => Promise<string>;
    onGetAnalogy: (explanation: string, question: Question) => Promise<string>;
}

const FeedbackCard: React.FC<FeedbackCardProps> = ({ 
    question, isCorrect, onNext, onDashboard, inSession, isLastQuestionInSession, feedbackData, onOpenChat, onExplainConcept, 
    onAnalyzeThinkingProcess, answerLimitReached, onUpgrade, onGetSimplifiedExplanation, onGetAnalogy
}) => {
  const [simplifiedExplanation, setSimplifiedExplanation] = useState('');
  const [analogy, setAnalogy] = useState('');
  const [isSimplifying, setIsSimplifying] = useState(false);
  const [isGeneratingAnalogy, setIsGeneratingAnalogy] = useState(false);

  if (!question) return null;

  const handleSimplify = async () => {
    if (!feedbackData.aiFeedback.detailed_explanation) return;
    setIsSimplifying(true);
    const result = await onGetSimplifiedExplanation(feedbackData.aiFeedback.detailed_explanation);
    setSimplifiedExplanation(result);
    setIsSimplifying(false);
  };

  const handleGetAnalogy = async () => {
    if (!feedbackData.aiFeedback.detailed_explanation) return;
    setIsGeneratingAnalogy(true);
    const result = await onGetAnalogy(feedbackData.aiFeedback.detailed_explanation, question);
    setAnalogy(result);
    setIsGeneratingAnalogy(false);
  };
    
  return (
    <div className="card">
      <h2 className={isCorrect ? 'feedback-correct' : 'feedback-incorrect'}>
        {isCorrect ? `+${feedbackData.xpGained} XP | Goed gedaan!` : `+${feedbackData.xpGained} XP | Niet helemaal, maar goede poging.`}
      </h2>
      <p style={{color: 'var(--subtle-text)'}}>Je antwoord op de vraag over "{question.tekst_naam}" is beoordeeld.</p>
      
      {feedbackData.aiFeedback && (
        <div className="ai-feedback">
            <h3 style={{marginTop: 0, color: 'var(--primary-color)'}}>AI Feedback</h3>
            {feedbackData.aiFeedback.positive_reinforcement && <p style={{fontStyle: 'italic'}}>"{feedbackData.aiFeedback.positive_reinforcement}"</p>}
            {!isCorrect && feedbackData.aiFeedback.core_mistake && <p><strong>Kernfout:</strong> {feedbackData.aiFeedback.core_mistake}</p>}
            <p>{feedbackData.aiFeedback.detailed_explanation}</p>

            {!isCorrect && (
                <div className="feedback-deep-dive-tools">
                    {!simplifiedExplanation && 
                        <button onClick={handleSimplify} disabled={isSimplifying} className="button-tertiary">
                            {isSimplifying ? 'Moment...' : 'Leg simpeler uit'}
                        </button>}
                    {!analogy && 
                        <button onClick={handleGetAnalogy} disabled={isGeneratingAnalogy} className="button-tertiary">
                            {isGeneratingAnalogy ? 'Moment...' : 'Geef een analogie'}
                        </button>}
                </div>
            )}
        </div>
      )}

      {simplifiedExplanation && 
        <div className="simplified-explanation">
            <h3 style={{marginTop: 0}}>Simpel Gezegd...</h3>
            <p>{simplifiedExplanation}</p>
        </div>
      }
      {analogy && 
        <div className="analogy-explanation">
            <h3 style={{marginTop: 0}}>Een Analogie...</h3>
            <p>{analogy}</p>
        </div>
      }


      {!isCorrect && feedbackData.mindsetTip && (
        <div className="mindset-tip">
            <h3 style={{marginTop: 0, color: 'var(--xp-color)'}}>Mindset Tip</h3>
            <p>{feedbackData.mindsetTip}</p>
        </div>
      )}

      <div className="correct-model">
        <h3>Correctiemodel</h3>
        <p>{question.correctie_model}</p>
      </div>

       <div style={{marginTop: '32px', display: 'flex', gap: '16px', flexDirection: 'column'}}>
        {onNext ? 
            (answerLimitReached ? (
                <button className="button" onClick={onUpgrade}>Daglimiet Bereikt - Upgrade voor Meer</button>
            ) : (
                <button className="button" onClick={onNext}>Volgende Vraag</button>
            )) :
            <p style={{textAlign: 'center', fontWeight: 500}}>Goed werk, je hebt alle beschikbare vragen beantwoord!</p>
        }
        {(!inSession || isLastQuestionInSession) &&
            <button className="button button-secondary" onClick={onDashboard}>Terug naar Dashboard</button>
        }
       </div>

       <div className="feedback-tools-section">
            <h3 className="feedback-tools-title">Hulp & Analyse</h3>
            <div className="button-grid">
                <button className="button button-tertiary" onClick={onOpenChat}>
                    Bespreek met AI
                </button>
                <button className="button button-tertiary" onClick={onExplainConcept}>
                    Leg Concept Uit
                </button>
                <button className="button button-tertiary" onClick={onAnalyzeThinkingProcess}>
                    Analyseer Denkproces
                </button>
            </div>
       </div>
    </div>
  );
};

export default FeedbackCard;