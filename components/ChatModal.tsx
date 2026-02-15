import React, { useState, useEffect, useRef } from 'react';
import type { ChatMessage } from '../data/data.ts';

interface ChatModalProps {
    isOpen: boolean;
    onClose: () => void;
    chatHistory: ChatMessage[];
    onSendMessage: (message: string) => void;
    isSending: boolean;
    chatLimitReached: boolean;
}

const ChatModal: React.FC<ChatModalProps> = ({ isOpen, onClose, chatHistory, onSendMessage, isSending, chatLimitReached }) => {
    const [message, setMessage] = useState('');
    const chatHistoryRef = useRef<HTMLDivElement>(null);

    // Handle Escape key to close
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) onClose();
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    // Auto-scroll to bottom on new messages
    useEffect(() => {
        if (chatHistoryRef.current) {
            chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
        }
    }, [chatHistory]);

    if (!isOpen) return null;

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (message.trim()) {
            onSendMessage(message);
            setMessage('');
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="card modal-content chat-modal-content" onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth: '600px', height: '70vh', display: 'flex', flexDirection: 'column' }}>
                <div className="chat-header" style={{ flexShrink: 0 }}>
                    <h3>GLOW AI</h3>
                    <button onClick={onClose} className="chat-close-btn" aria-label="Sluit chat">&times;</button>
                </div>
                <div className="chat-history" ref={chatHistoryRef} style={{ flex: 1, overflowY: 'auto', padding: '16px 0' }}>
                    {chatHistory.map((msg, index) => (
                        <div key={index} className={`chat-message ${msg.role}`}>
                            {msg.text}
                            {isSending && msg.role === 'model' && index === chatHistory.length - 1 && <span className="typing-cursor"></span>}
                        </div>
                    ))}
                </div>
                <form onSubmit={handleSend} className="chat-form" style={{ flexShrink: 0 }}>
                    <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder={chatLimitReached ? "Daglimiet bereikt..." : "Stel een vraag..."}
                        className="chat-input"
                        disabled={isSending || chatLimitReached}
                    />
                    <button type="submit" className="button" disabled={!message.trim() || isSending || chatLimitReached} style={{ width: 'auto' }}>
                        Verstuur
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChatModal;