import React, { useState } from 'react';
import CreateDeckModal from './CreateDeckModal.tsx';
import FlashcardPractice from './FlashcardPractice.tsx';
import type { FlashcardDeck } from '../data/data.ts';

interface FlashcardsViewProps {
    decks: FlashcardDeck[];
    onAddDeck: (deck: FlashcardDeck) => void;
    onMagicCreate: (title: string, keywords: string) => Promise<FlashcardDeck | null>;
    onShareDeck: (deck: FlashcardDeck) => void;
    onDeleteDeck?: (deckId: number) => void;
}

const FlashcardsView: React.FC<FlashcardsViewProps> = ({ decks, onAddDeck, onMagicCreate, onShareDeck, onDeleteDeck }) => {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [practiceDeck, setPracticeDeck] = useState<FlashcardDeck | null>(null);

    if (practiceDeck) {
        return <FlashcardPractice deck={practiceDeck} onBack={() => setPracticeDeck(null)} />;
    }

    const deckColors = ['#22d3ee', '#a78bfa', '#f472b6', '#34d399', '#fbbf24', '#fb923c', '#60a5fa', '#e879f9'];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ margin: 0 }}>📇 Mijn Flashcard Decks</h2>
                <button onClick={() => setIsCreateModalOpen(true)} style={{
                    padding: '10px 20px',
                    borderRadius: '10px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #22d3ee, #a78bfa)',
                    color: '#0f0f1a',
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                }}>
                    + Nieuw Deck
                </button>
            </div>

            {decks.length === 0 ? (
                <div style={{
                    textAlign: 'center',
                    padding: '50px 20px',
                    borderRadius: '16px',
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px dashed rgba(255,255,255,0.1)',
                }}>
                    <div style={{ fontSize: '3.5rem', marginBottom: '12px' }}>📇</div>
                    <h3 style={{ margin: '0 0 8px', fontSize: '1.1rem' }}>Begin met Flashcards</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', maxWidth: '340px', margin: '0 auto 20px', lineHeight: 1.5 }}>
                        Maak je eerste deck of laat AI automatisch kaarten genereren op basis van je vak en onderwerp.
                    </p>
                    <button onClick={() => setIsCreateModalOpen(true)} style={{
                        padding: '12px 28px',
                        borderRadius: '10px',
                        border: 'none',
                        background: 'linear-gradient(135deg, #22d3ee, #a78bfa)',
                        color: '#0f0f1a',
                        fontWeight: 700,
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                    }}>
                        ✨ Maak je Eerste Deck
                    </button>
                </div>
            ) : (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                    gap: '12px',
                }}>
                    {decks.map((deck, idx) => {
                        const color = deckColors[idx % deckColors.length];
                        return (
                            <div key={deck.id} style={{
                                padding: '18px',
                                borderRadius: '14px',
                                background: `${color}06`,
                                border: `1px solid ${color}18`,
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                position: 'relative',
                            }}
                                onClick={() => setPracticeDeck(deck)}
                                onMouseEnter={e => {
                                    (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
                                    (e.currentTarget as HTMLDivElement).style.borderColor = `${color}40`;
                                }}
                                onMouseLeave={e => {
                                    (e.currentTarget as HTMLDivElement).style.transform = '';
                                    (e.currentTarget as HTMLDivElement).style.borderColor = `${color}18`;
                                }}
                            >
                                {/* Card count badge */}
                                <div style={{
                                    position: 'absolute',
                                    top: '12px',
                                    right: '12px',
                                    fontSize: '0.7rem',
                                    fontWeight: 700,
                                    padding: '2px 8px',
                                    borderRadius: '6px',
                                    background: `${color}15`,
                                    color: color,
                                }}>
                                    {deck.cards.length} kaarten
                                </div>

                                <div style={{
                                    width: '36px',
                                    height: '36px',
                                    borderRadius: '10px',
                                    background: `${color}15`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '1.2rem',
                                    marginBottom: '12px',
                                }}>📇</div>

                                <h3 style={{
                                    margin: '0 0 6px',
                                    fontSize: '0.95rem',
                                    fontWeight: 700,
                                    paddingRight: '60px',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                }}>{deck.title}</h3>

                                <p style={{
                                    margin: 0,
                                    fontSize: '0.78rem',
                                    color: 'var(--subtle-text)',
                                }}>Tap om te oefenen →</p>

                                <div style={{
                                    display: 'flex',
                                    gap: '6px',
                                    marginTop: '12px',
                                }}>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onShareDeck(deck);
                                        }}
                                        style={{
                                            padding: '6px 12px',
                                            borderRadius: '6px',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            background: 'transparent',
                                            color: 'var(--text-muted)',
                                            cursor: 'pointer',
                                            fontSize: '0.75rem',
                                        }}
                                    >
                                        Deel
                                    </button>
                                    {onDeleteDeck && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (confirm('Weet je zeker dat je dit deck wilt verwijderen?')) {
                                                    onDeleteDeck(deck.id);
                                                }
                                            }}
                                            style={{
                                                padding: '6px 10px',
                                                borderRadius: '6px',
                                                border: '1px solid rgba(248, 113, 113, 0.2)',
                                                background: 'transparent',
                                                color: '#f87171',
                                                cursor: 'pointer',
                                                fontSize: '0.75rem',
                                            }}
                                        >
                                            🗑
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
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