import React, { useState } from 'react';

interface PulseCheckModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (rating: number, focus: string) => void;
    subject: string;
    userName: string;
}

const ratings = [
    { emoji: '😟', value: 1, label: 'Gestrest' },
    { emoji: '😕', value: 2, label: 'Onzeker' },
    { emoji: '😐', value: 3, label: 'Oké' },
    { emoji: '🙂', value: 4, label: 'Goed' },
    { emoji: '😊', value: 5, label: 'Zelfverzekerd' },
];

const PulseCheckModal: React.FC<PulseCheckModalProps> = ({ isOpen, onClose, onSubmit, subject, userName }) => {
    const [rating, setRating] = useState(0);
    const [focus, setFocus] = useState('');

    if (!isOpen) return null;

    const handleSubmit = () => {
        if (rating > 0) {
            onSubmit(rating, focus);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="card modal-content" onClick={e => e.stopPropagation()}>
                <div style={{ textAlign: 'center' }}>
                    <span style={{ fontSize: '48px' }} role="img" aria-label="Waving hand">👋</span>
                    <h2 style={{ marginTop: '16px' }}>Hey {userName}, even een check-in.</h2>
                </div>
                
                <div className="pulse-check-question">
                    <label>Hoe voel je je deze week over {subject}?</label>
                    <div className="pulse-check-rating">
                        {ratings.map(r => (
                            <button 
                                key={r.value} 
                                className={`rating-emoji-btn ${rating === r.value ? 'selected' : ''}`}
                                onClick={() => setRating(r.value)}
                            >
                                <span className="rating-emoji">{r.emoji}</span>
                                <span className="rating-label">{r.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="pulse-check-question">
                    <label htmlFor="weekly-focus">Wat is je #1 focuspunt voor deze week?</label>
                    <input
                        id="weekly-focus"
                        type="text"
                        className="text-input"
                        value={focus}
                        onChange={e => setFocus(e.target.value)}
                        placeholder="Bijv. 'Argumentatieanalyse' of 'Meer oefenen met redox'"
                    />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '24px' }}>
                    <button onClick={handleSubmit} className="button" disabled={rating === 0}>
                        Verstuur Feedback
                    </button>
                    <button onClick={onClose} className="button-tertiary">Sla over voor nu</button>
                </div>
            </div>
        </div>
    );
};

export default PulseCheckModal;
