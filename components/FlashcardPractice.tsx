import React, { useState } from 'react';
import type { FlashcardDeck } from '../data/data.ts';

interface FlashcardPracticeProps {
    deck: FlashcardDeck;
    onBack: () => void;
}

const FlashcardPractice: React.FC<FlashcardPracticeProps> = ({ deck, onBack }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    
    if (!deck.cards || deck.cards.length === 0) {
        return (
            <div className="card">
                <h3>Leeg Deck</h3>
                <p>Dit deck heeft geen kaarten. Voeg kaarten toe om te oefenen.</p>
                <button className="button" onClick={onBack}>Terug naar overzicht</button>
            </div>
        );
    }
    
    const card = deck.cards[currentIndex];
    
    const handleNext = () => {
        setIsFlipped(false);
        setTimeout(() => {
            setCurrentIndex(prev => (prev + 1) % deck.cards.length);
        }, 300); // Wait for flip back animation
    };

    return (
        <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2>Oefenen: {deck.title}</h2>
                <span style={{fontWeight: 600}}>{currentIndex + 1} / {deck.cards.length}</span>
            </div>

            <div className="flashcard-practice-container">
                <div className={`flashcard ${isFlipped ? 'is-flipped' : ''}`} onClick={() => setIsFlipped(!isFlipped)}>
                    <div className="flashcard-inner">
                        <div className="flashcard-front">
                            <p style={{fontSize: '1.2rem'}}>{card.question}</p>
                        </div>
                        <div className="flashcard-back">
                             <p>{card.answer}</p>
                        </div>
                    </div>
                </div>

                <div className="flashcard-controls">
                    {isFlipped ? (
                        <>
                            <button className="button" onClick={handleNext}>Volgende Kaart</button>
                        </>
                    ) : (
                        <button className="button" onClick={() => setIsFlipped(true)}>Toon Antwoord</button>
                    )}
                </div>
            </div>

             <button className="button-tertiary" onClick={onBack} style={{marginTop: '24px'}}>Terug naar alle decks</button>
        </div>
    );
};

export default FlashcardPractice;