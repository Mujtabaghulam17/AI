import React, { useState } from 'react';
import { ai } from '../api/gemini.ts';
import { Type } from "@google/genai";
import type { FlashcardDeck } from '../data/data.ts';

// Use the same model name as defined in App.tsx
const MODEL_NAME = 'gemini-2.0-flash';

interface SummaryHubProps {
    currentSubject: string;
    onOpenChat: (context: { type: string; data: any; } | null) => void;
    onCreateDeckFromSummary: (summaryText: string) => Promise<FlashcardDeck | null>;
    isPremium: boolean;
    onUpgrade: () => void;
}

interface GeneratedQuestion {
    question: string;
    options: string[];
    correct_option: string;
}

const SummaryHub: React.FC<SummaryHubProps> = ({ currentSubject, onOpenChat, onCreateDeckFromSummary, isPremium, onUpgrade }) => {
    const [topic, setTopic] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [summaryText, setSummaryText] = useState('');
    const [generatedQuestions, setGeneratedQuestions] = useState<GeneratedQuestion[]>([]);
    const [isCreatingDeck, setIsCreatingDeck] = useState(false);

    const handleGenerateSummary = async () => {
        if (!topic.trim()) return;
        if (!isPremium) {
            onUpgrade();
            return;
        }
        setIsLoading(true);
        setError('');
        setSummaryText('');
        setGeneratedQuestions([]);

        const prompt = `Genereer een beknopte, heldere en goed gestructureerde samenvatting voor een VWO-leerling over het volgende onderwerp in het vak ${currentSubject}: "${topic}". Gebruik kopjes en bullet points waar nodig. Houd de toon informatief en toegankelijk.`;
        try {
            let response;
            const maxRetries = 3;
            for (let attempt = 1; attempt <= maxRetries; attempt++) {
                try {
                    response = await ai.models.generateContent({ model: MODEL_NAME, contents: prompt });
                    break; // Success, exit retry loop
                } catch (error) {
                    console.warn(`Error generating summary (attempt ${attempt}/${maxRetries}):`, error);
                    if (attempt === maxRetries) {
                        throw error; // All retries failed, throw to outer catch
                    }
                    // Exponential backoff
                    await new Promise(res => setTimeout(res, 1000 * Math.pow(2, attempt - 1)));
                }
            }

            if (!response || !response.text?.trim()) {
                throw new Error("De AI gaf een leeg antwoord. Probeer het opnieuw met een ander onderwerp.");
            }
            setSummaryText(response.text || '');
        } catch (e: any) {
            console.error("Failed to generate summary after all retries:", e);
            setError(e.message || 'Er ging iets mis bij het genereren van de samenvatting. Probeer het opnieuw.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGenerateQuestions = async () => {
        setIsLoading(true);
        setError(''); // Clear previous errors
        const prompt = `Genereer 2 meerkeuzevragen gebaseerd op de volgende samenvatting. Geef een JSON-object terug met een "questions" array. Elke vraag moet een "question", een array "options" (4 opties), en een "correct_option" (de tekst van het juiste antwoord) hebben.

        Samenvatting: "${summaryText}"`;
        try {
            let response;
            const maxRetries = 3;
            for (let attempt = 1; attempt <= maxRetries; attempt++) {
                try {
                    response = await ai.models.generateContent({
                        model: MODEL_NAME,
                        contents: prompt,
                        config: {
                            responseMimeType: 'application/json',
                            responseSchema: {
                                type: Type.OBJECT,
                                properties: {
                                    questions: {
                                        type: Type.ARRAY,
                                        items: {
                                            type: Type.OBJECT,
                                            properties: {
                                                question: { type: Type.STRING },
                                                options: { type: Type.ARRAY, items: { type: Type.STRING } },
                                                correct_option: { type: Type.STRING }
                                            },
                                            required: ["question", "options", "correct_option"]
                                        }
                                    }
                                },
                                required: ["questions"]
                            }
                        }
                    });
                    break; // Success
                } catch (error) {
                    console.warn(`Error generating questions (attempt ${attempt}/${maxRetries}):`, error);
                    if (attempt === maxRetries) throw error;
                    await new Promise(res => setTimeout(res, 1000 * Math.pow(2, attempt - 1)));
                }
            }

            if (!response) {
                throw new Error("AI response not received for questions after multiple attempts.");
            }
            const data = JSON.parse(response.text || '{"questions":[]}');
            setGeneratedQuestions(data.questions);
        } catch (e) {
            console.error("Failed to generate practice questions after all retries:", e);
            setError('Kon geen oefenvragen genereren.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateFlashcards = async () => {
        setIsCreatingDeck(true);
        const newDeck = await onCreateDeckFromSummary(summaryText);
        if (newDeck) {
            alert(`Flashcard deck "${newDeck.title}" succesvol aangemaakt! Je kunt het vinden onder 'Tools'.`);
        } else {
            alert("Er ging iets mis bij het aanmaken van de flashcards.");
        }
        setIsCreatingDeck(false);
    };

    return (
        <div className="card">
            <h2>AI Studiehub: Samenvattingen</h2>
            <p className="dashboard-subtitle">Krijg direct een samenvatting op maat over elk onderwerp.</p>

            <div className="summary-hub-input-area" style={{ marginTop: '24px' }}>
                <input
                    type="text"
                    value={topic}
                    onChange={e => setTopic(e.target.value)}
                    placeholder="Bijv. 'Argumentatieschema's' of 'Fotosynthese'"
                    className="text-input"
                    onKeyDown={e => e.key === 'Enter' && handleGenerateSummary()}
                />
                <button className="button" onClick={handleGenerateSummary} disabled={isLoading || !topic.trim()}>
                    {isLoading && !summaryText ? 'Genereren...' : 'Genereer Samenvatting'} <span className="pro-badge">PRO</span>
                </button>
            </div>

            <div className="summary-content-area">
                {isLoading && !summaryText && (
                    <div style={{ textAlign: 'center', padding: '20px 0' }}>
                        <div className="spinner"></div>
                        <p style={{ marginTop: '16px', color: 'var(--subtle-text)' }}>De AI schrijft je samenvatting...</p>
                    </div>
                )}
                {error && <p style={{ color: 'var(--incorrect-color)' }}>{error}</p>}
                {summaryText ? (
                    <p style={{ whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>{summaryText}</p>
                ) : !isLoading && (
                    <p style={{ textAlign: 'center', color: 'var(--subtle-text)' }}>Voer een onderwerp in om te beginnen.</p>
                )}
            </div>

            {summaryText && (
                <div className="summary-action-toolbar">
                    <button className="button button-secondary" onClick={handleGenerateQuestions} disabled={isLoading}>
                        Genereer Oefenvragen
                    </button>
                    <button className="button button-secondary" onClick={handleCreateFlashcards} disabled={isCreatingDeck}>
                        {isCreatingDeck ? 'Aanmaken...' : 'Maak Flashcards'}
                    </button>
                    <button className="button button-secondary" onClick={() => onOpenChat({ type: 'summary', data: { summaryText } })}>
                        Bespreek met GLOW AI
                    </button>
                </div>
            )}

            {generatedQuestions.length > 0 && (
                <div className="generated-questions-container">
                    <h3>Oefenvragen</h3>
                    {generatedQuestions.map((q, index) => (
                        <div key={index} className="generated-question card">
                            <p style={{ fontWeight: 600 }}>{q.question}</p>
                            <p style={{ color: 'var(--correct-color)', fontStyle: 'italic' }}>Correct antwoord: {q.correct_option}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SummaryHub;