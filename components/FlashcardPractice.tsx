import React, { useState } from 'react';
import type { FlashcardDeck } from '../data/data.ts';

interface FlashcardPracticeProps {
    deck: FlashcardDeck;
    onBack: () => void;
}

const FlashcardPractice: React.FC<FlashcardPracticeProps> = ({ deck, onBack }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [results, setResults] = useState<(boolean | null)[]>(deck.cards.map(() => null));
    const [showSummary, setShowSummary] = useState(false);

    if (!deck.cards || deck.cards.length === 0) {
        return (
            <div style={{
                padding: '40px 20px',
                textAlign: 'center',
                borderRadius: '14px',
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.06)',
            }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>📭</div>
                <h3 style={{ margin: '0 0 8px' }}>Leeg Deck</h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>Dit deck heeft geen kaarten. Voeg kaarten toe om te oefenen.</p>
                <button className="button" onClick={onBack}>Terug naar overzicht</button>
            </div>
        );
    }

    const card = deck.cards[currentIndex];
    const correctCount = results.filter(r => r === true).length;
    const incorrectCount = results.filter(r => r === false).length;
    const answeredCount = correctCount + incorrectCount;

    const handleScore = (correct: boolean) => {
        const newResults = [...results];
        newResults[currentIndex] = correct;
        setResults(newResults);

        // Auto-advance after short delay
        setTimeout(() => {
            setIsFlipped(false);
            setTimeout(() => {
                if (currentIndex < deck.cards.length - 1) {
                    setCurrentIndex(prev => prev + 1);
                } else {
                    setShowSummary(true);
                }
            }, 200);
        }, 400);
    };

    const handleRestart = () => {
        setCurrentIndex(0);
        setIsFlipped(false);
        setResults(deck.cards.map(() => null));
        setShowSummary(false);
    };

    const handleRestartWrong = () => {
        // Only restart with wrong ones - not implemented with reorder, just restart
        setCurrentIndex(0);
        setIsFlipped(false);
        setResults(deck.cards.map(() => null));
        setShowSummary(false);
    };

    // Summary screen
    if (showSummary) {
        const pct = answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : 0;
        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Score card */}
                <div style={{
                    textAlign: 'center',
                    padding: '32px 20px',
                    borderRadius: '16px',
                    background: 'linear-gradient(135deg, rgba(34, 211, 238, 0.08), rgba(168, 85, 247, 0.08))',
                    border: '1px solid rgba(34, 211, 238, 0.15)',
                }}>
                    <div style={{ fontSize: '3rem', marginBottom: '8px' }}>
                        {pct >= 80 ? '🎉' : pct >= 60 ? '💪' : pct >= 40 ? '📚' : '🔥'}
                    </div>
                    <div style={{
                        fontSize: '2.8rem',
                        fontWeight: 800,
                        background: 'linear-gradient(135deg, #22d3ee, #a78bfa)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                    }}>{pct}%</div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '4px 0 0' }}>
                        {correctCount} goed · {incorrectCount} fout · {deck.cards.length} kaarten
                    </p>
                    <p style={{ color: 'var(--subtle-text)', fontSize: '0.82rem', margin: '8px 0 0' }}>
                        {pct >= 80
                            ? 'Uitstekend! Je beheerst deze stof goed!'
                            : pct >= 60
                                ? 'Goed bezig! Nog een paar kaarten extra oefenen.'
                                : pct >= 40
                                    ? 'Aardig begin! Herhaal dit deck nog een keer.'
                                    : 'Geen zorgen — herhaling is de sleutel!'}
                    </p>
                </div>

                {/* Card results */}
                <div style={{
                    padding: '16px',
                    borderRadius: '14px',
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.06)',
                }}>
                    <h4 style={{ margin: '0 0 12px', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                        OVERZICHT
                    </h4>
                    {deck.cards.map((c, i) => (
                        <div key={i} style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            padding: '8px 10px',
                            marginBottom: '4px',
                            borderRadius: '6px',
                            background: results[i] === true
                                ? 'rgba(52, 211, 153, 0.04)'
                                : results[i] === false
                                    ? 'rgba(248, 113, 113, 0.04)'
                                    : 'transparent',
                        }}>
                            <span style={{ fontSize: '0.9rem' }}>
                                {results[i] === true ? '✅' : results[i] === false ? '❌' : '⚪'}
                            </span>
                            <span style={{
                                flex: 1, fontSize: '0.82rem', color: 'var(--text-muted)',
                                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                            }}>{c.question}</span>
                        </div>
                    ))}
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '10px' }}>
                    {incorrectCount > 0 && (
                        <button onClick={handleRestartWrong} style={{
                            flex: 1, padding: '12px', borderRadius: '10px',
                            border: '1px solid rgba(248, 113, 113, 0.3)',
                            background: 'rgba(248, 113, 113, 0.08)',
                            color: '#f87171', fontWeight: 700, cursor: 'pointer',
                            fontSize: '0.85rem',
                        }}>
                            🔄 Opnieuw oefenen
                        </button>
                    )}
                    <button onClick={onBack} style={{
                        flex: 1, padding: '12px', borderRadius: '10px',
                        border: 'none',
                        background: 'linear-gradient(135deg, #22d3ee, #a78bfa)',
                        color: '#0f0f1a', fontWeight: 700, cursor: 'pointer',
                        fontSize: '0.85rem',
                    }}>
                        Terug naar Decks
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2 style={{ margin: 0, fontSize: '1.1rem' }}>Oefenen: {deck.title}</h2>
                    <p style={{ margin: '4px 0 0', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                        Kaart {currentIndex + 1} van {deck.cards.length}
                        {answeredCount > 0 && ` · ${correctCount}✅ ${incorrectCount}❌`}
                    </p>
                </div>
                <button onClick={onBack} style={{
                    padding: '6px 14px', borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    background: 'transparent', color: 'var(--subtle-text)',
                    cursor: 'pointer', fontSize: '0.8rem',
                }}>✕</button>
            </div>

            {/* Progress dots */}
            <div style={{ display: 'flex', gap: '3px' }}>
                {deck.cards.map((_, i) => (
                    <div key={i} style={{
                        flex: 1,
                        height: '4px',
                        borderRadius: '2px',
                        background: i === currentIndex
                            ? 'linear-gradient(90deg, #22d3ee, #a78bfa)'
                            : results[i] === true
                                ? '#34d399'
                                : results[i] === false
                                    ? '#f87171'
                                    : 'rgba(255,255,255,0.08)',
                        transition: 'all 0.3s ease',
                    }} />
                ))}
            </div>

            {/* Flashcard */}
            <div className="flashcard-practice-container">
                <div
                    className={`flashcard ${isFlipped ? 'is-flipped' : ''}`}
                    onClick={() => setIsFlipped(!isFlipped)}
                    style={{ cursor: 'pointer' }}
                >
                    <div className="flashcard-inner">
                        <div className="flashcard-front" style={{
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            padding: '24px',
                        }}>
                            <div style={{
                                fontSize: '0.7rem',
                                fontWeight: 700,
                                color: 'var(--subtle-text)',
                                letterSpacing: '1px',
                                marginBottom: '12px',
                            }}>VRAAG</div>
                            <p style={{ fontSize: '1.15rem', textAlign: 'center', margin: 0, lineHeight: 1.5 }}>{card.question}</p>
                            <p style={{ fontSize: '0.8rem', color: 'var(--subtle-text)', marginTop: '16px' }}>Tap om het antwoord te zien</p>
                        </div>
                        <div className="flashcard-back" style={{
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            padding: '24px',
                        }}>
                            <div style={{
                                fontSize: '0.7rem',
                                fontWeight: 700,
                                color: '#22d3ee',
                                letterSpacing: '1px',
                                marginBottom: '12px',
                            }}>ANTWOORD</div>
                            <p style={{ fontSize: '1.05rem', textAlign: 'center', margin: 0, lineHeight: 1.5 }}>{card.answer}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Buttons */}
            <div className="flashcard-controls">
                {isFlipped ? (
                    <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
                        <button
                            onClick={() => handleScore(false)}
                            style={{
                                flex: 1,
                                padding: '14px',
                                borderRadius: '10px',
                                border: '1px solid rgba(248, 113, 113, 0.3)',
                                background: 'rgba(248, 113, 113, 0.1)',
                                color: '#f87171',
                                fontWeight: 700,
                                cursor: 'pointer',
                                fontSize: '0.95rem',
                            }}
                        >
                            ❌ Fout
                        </button>
                        <button
                            onClick={() => handleScore(true)}
                            style={{
                                flex: 1,
                                padding: '14px',
                                borderRadius: '10px',
                                border: '1px solid rgba(52, 211, 153, 0.3)',
                                background: 'rgba(52, 211, 153, 0.1)',
                                color: '#34d399',
                                fontWeight: 700,
                                cursor: 'pointer',
                                fontSize: '0.95rem',
                            }}
                        >
                            ✅ Goed
                        </button>
                    </div>
                ) : (
                    <button className="button" onClick={() => setIsFlipped(true)} style={{
                        background: 'linear-gradient(135deg, #22d3ee, #a78bfa)',
                        color: '#0f0f1a',
                        fontWeight: 700,
                        border: 'none',
                    }}>
                        Toon Antwoord
                    </button>
                )}
            </div>
        </div>
    );
};

export default FlashcardPractice;