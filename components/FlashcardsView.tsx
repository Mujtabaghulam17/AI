import React, { useState } from 'react';
import CreateDeckModal from './CreateDeckModal.tsx';
import FlashcardPractice from './FlashcardPractice.tsx';
import type { FlashcardDeck } from '../data/data.ts';

interface FlashcardsViewProps {
    decks: FlashcardDeck[];
    onAddDeck: (deck: FlashcardDeck) => void;
    onMagicCreate: (title: string, keywords: string) => Promise<FlashcardDeck | null>;
    onShareDeck: (deck: FlashcardDeck) => void;
}

const FlashcardsView: React.FC<FlashcardsViewProps> = ({ decks, onAddDeck, onMagicCreate, onShareDeck }) => {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [practiceDeck, setPracticeDeck] = useState<FlashcardDeck | null>(null);

    if (practiceDeck) {
        return <FlashcardPractice deck={practiceDeck} onBack={() => setPracticeDeck(null)} />;
    }

    return (
        <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2>Mijn Flashcard Decks</h2>
                <button className="button" style={{width: 'auto'}} onClick={() => setIsCreateModalOpen(true)}>+ Nieuw Deck</button>
            </div>

            {decks.length === 0 ? (
                <div className="dashboard-hero">
                    <p>Je hebt nog geen flashcards. Maak je eerste deck om te beginnen met leren!</p>
                </div>
            ) : (
                <div className="flashcard-grid" style={{marginTop: '24px'}}>
                    {decks.map(deck => (
                        <div key={deck.id} className="card flashcard-deck-card">
                            <div onClick={() => setPracticeDeck(deck)} style={{cursor: 'pointer'}}>
                                <h3>{deck.title}</h3>
                                <p style={{color: 'var(--subtle-text)'}}>{deck.cards.length} kaarten</p>
                            </div>
                             <button 
                                className="button-tertiary" 
                                style={{marginTop: '12px', fontSize: '14px'}}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onShareDeck(deck);
                                }}
                            >
                                Deel met Squad
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <CreateDeckModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onAddDeck={onAddDeck}
                onMagicCreate={onMagicCreate}
            />
        </div>
    );
};

export default FlashcardsView;