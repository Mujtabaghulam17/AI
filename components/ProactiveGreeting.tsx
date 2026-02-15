import React from 'react';

interface ProactiveGreetingProps {
    insight: {
        greeting: string;
        suggestion: string;
        action: string;
        context?: string;
    };
    onAction: (action: string, context?: string) => void;
}

const ProactiveGreeting: React.FC<ProactiveGreetingProps> = ({ insight, onAction }) => {
    const { greeting, suggestion, action, context } = insight;

    const getButtonText = () => {
        switch(action) {
            case 'start_booster': return 'Start Booster Sessie';
            case 'start_repetition': return 'Start Herhaling';
            default: return 'Start Nu';
        }
    };

    return (
        <div className="proactive-greeting">
            <div className="proactive-greeting-icon">👋</div>
            <div className="proactive-greeting-content">
                <h3>{greeting}</h3>
                <p>{suggestion}</p>
                <button className="button" style={{width: 'auto'}} onClick={() => onAction(action, context)}>
                    {getButtonText()}
                </button>
            </div>
        </div>
    );
};

export default ProactiveGreeting;