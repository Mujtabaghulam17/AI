import React, { useState, useEffect } from 'react';
import type { Flashcard, FlashcardDeck } from '../data/data.ts';

interface CreateDeckModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAddDeck: (deck: FlashcardDeck) => void;
    onMagicCreate: (title: string, keywords: string) => Promise<FlashcardDeck | null>;
}

const CreateDeckModal: React.FC<CreateDeckModalProps> = ({ isOpen, onClose, onAddDeck, onMagicCreate }) => {
    const [title, setTitle] = useState('');
    const [keywords, setKeywords] = useState('');
    const [isMagicCreating, setIsMagicCreating] = useState(false);

    // Handle Escape key to close modal
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const handleMagicCreate = async () => {
        if (!title.trim() || !keywords.trim()) {
            alert("Vul een titel en sleutelwoorden in.");
            return;
        }
        setIsMagicCreating(true);
        const newDeck = await onMagicCreate(title, keywords);
        setIsMagicCreating(false);
        if (newDeck) {
            handleClose();
        } else {
            alert("Er ging iets mis met het magisch aanmaken. Probeer het opnieuw.");
        }
    };

    const handleClose = () => {
        setTitle('');
        setKeywords('');
        setIsMagicCreating(false);
        onClose();
    };

    return (
        <div className="modal-overlay" onClick={handleClose}>
            <div className="card modal-content" onClick={e => e.stopPropagation()}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ color: 'var(--primary-color)' }}>Nieuw Flashcard Deck</h2>
                    <button onClick={handleClose} className="chat-close-btn" aria-label="Sluiten">&times;</button>
                </div>

                <div style={{ margin: '24px 0' }}>
                    <label htmlFor="deck-title" style={{ fontWeight: 600, display: 'block', marginBottom: '8px' }}>Titel</label>
                    <input
                        id="deck-title"
                        type="text"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        placeholder="Bijv. 'Drogredenen' of 'Begrippen Ecologie'"
                        className="text-input"
                    />
                </div>
                <div>
                    <label htmlFor="deck-keywords" style={{ fontWeight: 600, display: 'block', marginBottom: '8px' }}>Sleutelwoorden (voor AI)</label>
                    <textarea
                        id="deck-keywords"
                        value={keywords}
                        onChange={e => setKeywords(e.target.value)}
                        placeholder="Voer hier 3-5 sleutelbegrippen in, gescheiden door komma's. Bijvoorbeeld: cirkelredenering, overhaaste generalisatie, persoonlijke aanval"
                        rows={3}
                    />
                    <p style={{ fontSize: '13px', color: 'var(--subtle-text)', margin: '4px 0 0 0' }}>De AI gebruikt dit om je kaarten te genereren.</p>
                </div>

                <div style={{ marginTop: '24px' }}>
                    <button className="button" onClick={handleMagicCreate} disabled={isMagicCreating}>
                        {isMagicCreating ? <div className="button-spinner"></div> : '✨ Magic Create'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreateDeckModal;