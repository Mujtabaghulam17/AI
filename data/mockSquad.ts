import type { SquadData } from './data.ts';

export const mockSquadData: SquadData = {
    squadName: "De ExamenStrijders",
    squadGoal: {
        title: "Beantwoord als team 500 vragen!",
        description: "Werk samen om deze wekelijkse uitdaging te voltooien en verdien een beloning.",
        current: 350,
        target: 500,
        reward: "🏆 +50 XP voor iedereen"
    },
    members: [
        { id: 1, name: "Jij", rank: 1, xp: 1250, avatar: '🚀' },
        { id: 2, name: "Lisa V.", rank: 2, xp: 1180, avatar: '🧠' },
        { id: 3, name: "Daan de W.", rank: 3, xp: 950, avatar: '🔥' },
        { id: 4, name: "Sara El I.", rank: 4, xp: 720, avatar: '💡' }
    ],
    activityFeed: [
        { id: 6, avatar: '📢', text: "Nieuw weekdoel gestart: <strong>Beantwoord als team 500 vragen!</strong> Laten we dit doen!", timestamp: "1 uur geleden" },
        { id: 5, avatar: '🚀', text: "<strong>Jij</strong> heeft het flashcard deck 'Drogredenen' gedeeld.", timestamp: "Zojuist" },
        { id: 1, avatar: '🧠', text: "<strong>Lisa V.</strong> heeft net een Foutloze Sessie badge verdiend! 🎯", timestamp: "5 minuten geleden" },
        { id: 2, avatar: '🔥', text: "<strong>Daan de W.</strong> heeft 15 vragen beantwoord in een studiesessie.", timestamp: "2 uur geleden" },
        { id: 3, avatar: '💡', text: "<strong>Sara El I.</strong> heeft een nieuw flashcard deck 'Begrippen Biologie' aangemaakt.", timestamp: "Gisteren" },
        { id: 4, avatar: '🧠', text: "<strong>Lisa V.</strong> heeft haar 7-daagse study streak behaald!", timestamp: "Gisteren" },
    ]
};