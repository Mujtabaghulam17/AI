import React from 'react';

// This is now a generic AnalysisModal
interface AnalysisModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    loadingText: string;
    analysisContent: string;
    isLoading: boolean;
}

const AnalysisModal: React.FC<AnalysisModalProps> = ({ isOpen, onClose, title, loadingText, analysisContent, isLoading }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="card modal-content" onClick={(e) => e.stopPropagation()} style={{maxWidth: '600px'}}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ color: 'var(--primary-color)', margin: 0, fontSize: '22px' }}>{title}</h2>
                     <button onClick={onClose} className="chat-close-btn" style={{color: 'var(--subtle-text)', fontSize: '28px', background: 'none', border: 'none', cursor: 'pointer'}} aria-label="Sluiten">&times;</button>
                </div>
                <div className="review-content" style={{maxHeight: '60vh', overflowY: 'auto', paddingRight: '10px'}}>
                    {isLoading ? (
                        <div style={{ textAlign: 'center', padding: '40px 0' }}>
                            <div className="spinner"></div>
                            <p style={{ marginTop: '16px', color: 'var(--subtle-text)' }}>{loadingText}</p>
                        </div>
                    ) : (
                        <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }} dangerouslySetInnerHTML={{ __html: analysisContent.replace(/### (.*?)\n/g, '<h3>$1</h3>').replace(/\n/g, '<br />') }} />
                    )}
                </div>
                <button className="button" onClick={onClose} style={{marginTop: '16px'}}>Oké, bedankt!</button>
            </div>
        </div>
    );
};

export default AnalysisModal;