import React, { useState, useEffect } from 'react';

interface ConceptExplanationModalProps {
    isOpen: boolean;
    onClose: () => void;
    conceptName: string;
    explanation: string;
    isLoading: boolean;
    onExplainEli5: (originalExplanation: string) => Promise<string>;
}

const ConceptExplanationModal: React.FC<ConceptExplanationModalProps> = ({ isOpen, onClose, conceptName, explanation, isLoading, onExplainEli5 }) => {
    const [eli5Explanation, setEli5Explanation] = useState('');
    const [isEli5Loading, setIsEli5Loading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setEli5Explanation('');
            setIsEli5Loading(false);
        }
    }, [isOpen, explanation]);

    const handleEli5Click = async () => {
        setIsEli5Loading(true);
        const result = await onExplainEli5(explanation);
        setEli5Explanation(result);
        setIsEli5Loading(false);
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="card modal-content" onClick={(e) => e.stopPropagation()}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ color: 'var(--primary-color)', margin: 0, fontSize: '22px' }}>Uitleg: {conceptName}</h2>
                     <button onClick={onClose} className="chat-close-btn" style={{color: 'var(--subtle-text)', fontSize: '28px', background: 'none', border: 'none', cursor: 'pointer'}} aria-label="Sluiten">&times;</button>
                </div>
                <div className="concept-explanation-content">
                    {isLoading ? (
                        <div style={{ textAlign: 'center', padding: '40px 0' }}>
                            <div className="spinner"></div>
                            <p style={{ marginTop: '16px', color: 'var(--subtle-text)' }}>Een moment, ik schrijf je uitleg...</p>
                        </div>
                    ) : (
                        <>
                            <p style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{explanation}</p>
                            {explanation && !isLoading && !eli5Explanation && (
                                <div style={{marginTop: '16px'}}>
                                    <button onClick={handleEli5Click} disabled={isEli5Loading} className="button-tertiary">
                                        {isEli5Loading ? 'Moment...' : 'Leg eenvoudiger uit'}
                                    </button>
                                </div>
                            )}
                             {isEli5Loading && (
                                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                                    <div className="spinner" style={{width: '24px', height: '24px'}}></div>
                                </div>
                             )}
                            {eli5Explanation && (
                                <div className="ai-feedback" style={{marginTop: '16px'}}>
                                     <h3 style={{marginTop: 0, color: 'var(--primary-color)'}}>Simpel Gezegd...</h3>
                                     <p style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{eli5Explanation}</p>
                                </div>
                            )}
                        </>
                    )}
                </div>
                <button className="button" onClick={onClose} style={{marginTop: '16px'}}>Oké, ik snap het</button>
            </div>
        </div>
    );
};

export default ConceptExplanationModal;