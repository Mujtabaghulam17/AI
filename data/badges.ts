import type { Badge } from './data.ts';

export const allBadges: Badge[] = [
    {
        id: 'streak_3',
        name: 'Goeie Start',
        description: 'Studeer 3 dagen op rij.',
        icon: '🌱'
    },
    {
        id: 'streak_7',
        name: 'Vaste Routine',
        description: 'Studeer 7 dagen op rij.',
        icon: '🔥'
    },
    {
        id: 'flawless_session',
        name: 'Foutloze Sessie',
        description: 'Rond een studiesessie van minstens 5 vragen af zonder fouten.',
        icon: '🎯'
    },
    {
        id: 'first_analysis',
        name: 'Zelfreflectie',
        description: 'Gebruik de "Analyseer Mijn Fouten" tool voor de eerste keer.',
        icon: '🤔'
    },
    {
        id: 'master_analyst',
        name: 'Meester-Analist',
        description: 'Behaal een meesterschapsscore van 85% of hoger voor "Argumentatieanalyse".',
        icon: '⚖️'
    },
     {
        id: 'master_comprehension',
        name: 'Tekstkenner',
        description: 'Behaal een meesterschapsscore van 85% of hoger voor "Tekstbegrip".',
        icon: '📖'
    }
];
