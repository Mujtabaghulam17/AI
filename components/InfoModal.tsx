import React from 'react';

// Renders a simple subset of Markdown for headings, lists, and italics.
const SimpleMarkdownRenderer = ({ content }: { content: string }) => {
    const lines = content.trim().split('\n');
    return (
        <div>
            {lines.map((line: string, index: number) => {
                if (line.startsWith('### ')) {
                    return <h3 key={index} style={{ marginTop: '24px', marginBottom: '8px' }}>{line.substring(4)}</h3>;
                }
                if (line.startsWith('- ')) {
                    return <p key={index} style={{ margin: '4px 0 4px 16px', textIndent: '-16px' }}>• {line.substring(2)}</p>;
                }
                if (line.startsWith('*') && line.endsWith('*')) {
                    return <p key={index} style={{ fontStyle: 'italic', color: 'var(--subtle-text)', marginTop: '16px', fontSize: '14px' }}>{line.substring(1, line.length - 1)}</p>;
                }
                if (line.trim() === '') {
                    return <br key={index} />;
                }
                return <p key={index} style={{ margin: '4px 0' }}>{line}</p>;
            })}
        </div>
    );
};


interface InfoModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    content: string;
}

const InfoModal: React.FC<InfoModalProps> = ({ isOpen, onClose, title, content }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="card modal-content" style={{ maxWidth: '600px' }} onClick={(e) => e.stopPropagation()}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ color: 'var(--primary-color)', margin: 0, fontSize: '22px' }}>{title}</h2>
                    <button onClick={onClose} className="chat-close-btn" style={{ color: 'var(--subtle-text)', fontSize: '28px', background: 'none', border: 'none', cursor: 'pointer' }} aria-label="Sluiten">&times;</button>
                </div>
                <div className="info-modal-content" style={{ marginTop: '16px', maxHeight: '60vh', overflowY: 'auto', paddingRight: '10px' }}>
                    <SimpleMarkdownRenderer content={content} />
                </div>
                <button className="button" onClick={onClose} style={{ marginTop: '24px' }}>Sluiten</button>
            </div>
        </div>
    );
};

export default InfoModal;
