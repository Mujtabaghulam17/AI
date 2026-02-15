import React, { useState, useEffect } from 'react';

const loadingMessages = [
    "De AI analyseert je antwoord op microniveau...",
    "Even de aannames in je redenering controleren...",
    "Perfectie kost tijd. Je feedback wordt voorbereid...",
    "Een moment, de AI vergelijkt je antwoord met duizenden examenantwoorden...",
    "De neurale netwerken zijn aan het werk voor jou...",
];

const LoadingCard = () => {
    const [message, setMessage] = useState(loadingMessages[0]);

    useEffect(() => {
        const intervalId = setInterval(() => {
            setMessage(prevMessage => {
                const currentIndex = loadingMessages.indexOf(prevMessage);
                const nextIndex = (currentIndex + 1) % loadingMessages.length;
                return loadingMessages[nextIndex];
            });
        }, 2500); // Change message every 2.5 seconds

        return () => clearInterval(intervalId);
    }, []);

    return (
        <div className="card" style={{textAlign: 'center'}}>
            <div className="spinner"></div>
            <h2 style={{marginTop: '24px', color: 'var(--text-color)'}}>Je antwoord wordt nagekeken...</h2>
            <p className="loading-message">{message}</p>
        </div>
    );
};

export default LoadingCard;