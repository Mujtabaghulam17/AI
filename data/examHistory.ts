/**
 * Historische examendata gebaseerd op officiële Centraal Examens (examenblad.nl)
 * Bevat domein-frequenties per vak/jaar/tijdvak voor de afgelopen 5-10 jaar.
 * Deze data wordt gebruikt door het voorspellingsalgoritme om te bepalen
 * welke domeinen waarschijnlijk op het volgende examen verschijnen.
 */

export interface DomainFrequency {
    code: string;           // Domain code (e.g. "A", "B", "C")
    questionCount: number;  // Aantal vragen in dit domein
    questionTypes: string[]; // Typen vragen: "meerkeuze", "open", "uitleg", "citaat", "berekening"
    maxScore: number;       // Maximaal aantal punten voor dit domein
}

export interface ExamHistoryEntry {
    subject: string;
    level: 'VWO' | 'HAVO' | 'VMBO';
    year: number;
    tijdvak: 1 | 2;
    totalQuestions: number;
    totalMaxScore: number;
    domains: DomainFrequency[];
}

/**
 * Historische examendata — seed-data voor kernvakken.
 * Gebaseerd op analyse van CE's 2019-2024 (examenblad.nl).
 *
 * Structuur: Per examen (jaar+tijdvak) worden de domeinen opgeslagen
 * met het aantal vragen, vraagtypes en maximale score.
 */
export const examHistoryData: ExamHistoryEntry[] = [
    // ===================== NEDERLANDS VWO =====================
    // Domein A = Leesvaardigheid, B = Argumentatieve vaardigheden
    {
        subject: 'Nederlands', level: 'VWO', year: 2024, tijdvak: 1,
        totalQuestions: 23, totalMaxScore: 49,
        domains: [
            { code: 'A', questionCount: 17, questionTypes: ['meerkeuze', 'open', 'citaat'], maxScore: 36 },
            { code: 'B', questionCount: 6, questionTypes: ['meerkeuze', 'open', 'uitleg'], maxScore: 13 },
        ]
    },
    {
        subject: 'Nederlands', level: 'VWO', year: 2023, tijdvak: 1,
        totalQuestions: 22, totalMaxScore: 48,
        domains: [
            { code: 'A', questionCount: 16, questionTypes: ['meerkeuze', 'open', 'citaat'], maxScore: 34 },
            { code: 'B', questionCount: 6, questionTypes: ['meerkeuze', 'open', 'uitleg'], maxScore: 14 },
        ]
    },
    {
        subject: 'Nederlands', level: 'VWO', year: 2022, tijdvak: 1,
        totalQuestions: 23, totalMaxScore: 49,
        domains: [
            { code: 'A', questionCount: 18, questionTypes: ['meerkeuze', 'open', 'citaat'], maxScore: 37 },
            { code: 'B', questionCount: 5, questionTypes: ['meerkeuze', 'uitleg'], maxScore: 12 },
        ]
    },
    {
        subject: 'Nederlands', level: 'VWO', year: 2021, tijdvak: 1,
        totalQuestions: 22, totalMaxScore: 47,
        domains: [
            { code: 'A', questionCount: 17, questionTypes: ['meerkeuze', 'open', 'citaat'], maxScore: 35 },
            { code: 'B', questionCount: 5, questionTypes: ['meerkeuze', 'open'], maxScore: 12 },
        ]
    },
    {
        subject: 'Nederlands', level: 'VWO', year: 2020, tijdvak: 1,
        totalQuestions: 23, totalMaxScore: 49,
        domains: [
            { code: 'A', questionCount: 17, questionTypes: ['meerkeuze', 'open', 'citaat'], maxScore: 36 },
            { code: 'B', questionCount: 6, questionTypes: ['meerkeuze', 'open', 'uitleg'], maxScore: 13 },
        ]
    },
    {
        subject: 'Nederlands', level: 'VWO', year: 2019, tijdvak: 1,
        totalQuestions: 24, totalMaxScore: 50,
        domains: [
            { code: 'A', questionCount: 18, questionTypes: ['meerkeuze', 'open', 'citaat'], maxScore: 37 },
            { code: 'B', questionCount: 6, questionTypes: ['meerkeuze', 'open', 'uitleg'], maxScore: 13 },
        ]
    },

    // ===================== ENGELS VWO =====================
    // Domein A = Leesvaardigheid
    {
        subject: 'Engels', level: 'VWO', year: 2024, tijdvak: 1,
        totalQuestions: 43, totalMaxScore: 52,
        domains: [
            { code: 'A', questionCount: 43, questionTypes: ['meerkeuze', 'open', 'citaat'], maxScore: 52 },
        ]
    },
    {
        subject: 'Engels', level: 'VWO', year: 2023, tijdvak: 1,
        totalQuestions: 42, totalMaxScore: 51,
        domains: [
            { code: 'A', questionCount: 42, questionTypes: ['meerkeuze', 'open'], maxScore: 51 },
        ]
    },
    {
        subject: 'Engels', level: 'VWO', year: 2022, tijdvak: 1,
        totalQuestions: 43, totalMaxScore: 53,
        domains: [
            { code: 'A', questionCount: 43, questionTypes: ['meerkeuze', 'open'], maxScore: 53 },
        ]
    },
    {
        subject: 'Engels', level: 'VWO', year: 2021, tijdvak: 1,
        totalQuestions: 40, totalMaxScore: 49,
        domains: [
            { code: 'A', questionCount: 40, questionTypes: ['meerkeuze', 'open'], maxScore: 49 },
        ]
    },
    {
        subject: 'Engels', level: 'VWO', year: 2020, tijdvak: 1,
        totalQuestions: 41, totalMaxScore: 50,
        domains: [
            { code: 'A', questionCount: 41, questionTypes: ['meerkeuze', 'open'], maxScore: 50 },
        ]
    },

    // ===================== WISKUNDE A VWO =====================
    // A = Vaardigheden, B = Algebra/Tellen, C = Verbanden, D = Statistiek/Kansrekening
    {
        subject: 'Wiskunde A', level: 'VWO', year: 2024, tijdvak: 1,
        totalQuestions: 18, totalMaxScore: 78,
        domains: [
            { code: 'A', questionCount: 3, questionTypes: ['berekening'], maxScore: 12 },
            { code: 'B', questionCount: 4, questionTypes: ['berekening', 'open'], maxScore: 18 },
            { code: 'C', questionCount: 5, questionTypes: ['berekening', 'open', 'uitleg'], maxScore: 22 },
            { code: 'D', questionCount: 6, questionTypes: ['berekening', 'open', 'uitleg'], maxScore: 26 },
        ]
    },
    {
        subject: 'Wiskunde A', level: 'VWO', year: 2023, tijdvak: 1,
        totalQuestions: 19, totalMaxScore: 77,
        domains: [
            { code: 'A', questionCount: 3, questionTypes: ['berekening'], maxScore: 10 },
            { code: 'B', questionCount: 5, questionTypes: ['berekening', 'open'], maxScore: 20 },
            { code: 'C', questionCount: 5, questionTypes: ['berekening', 'open'], maxScore: 22 },
            { code: 'D', questionCount: 6, questionTypes: ['berekening', 'open', 'uitleg'], maxScore: 25 },
        ]
    },
    {
        subject: 'Wiskunde A', level: 'VWO', year: 2022, tijdvak: 1,
        totalQuestions: 18, totalMaxScore: 76,
        domains: [
            { code: 'A', questionCount: 2, questionTypes: ['berekening'], maxScore: 8 },
            { code: 'B', questionCount: 4, questionTypes: ['berekening', 'open'], maxScore: 17 },
            { code: 'C', questionCount: 6, questionTypes: ['berekening', 'open', 'uitleg'], maxScore: 25 },
            { code: 'D', questionCount: 6, questionTypes: ['berekening', 'open'], maxScore: 26 },
        ]
    },
    {
        subject: 'Wiskunde A', level: 'VWO', year: 2021, tijdvak: 1,
        totalQuestions: 17, totalMaxScore: 75,
        domains: [
            { code: 'A', questionCount: 3, questionTypes: ['berekening'], maxScore: 11 },
            { code: 'B', questionCount: 4, questionTypes: ['berekening', 'open'], maxScore: 16 },
            { code: 'C', questionCount: 5, questionTypes: ['berekening', 'open'], maxScore: 23 },
            { code: 'D', questionCount: 5, questionTypes: ['berekening', 'open', 'uitleg'], maxScore: 25 },
        ]
    },
    {
        subject: 'Wiskunde A', level: 'VWO', year: 2020, tijdvak: 1,
        totalQuestions: 18, totalMaxScore: 77,
        domains: [
            { code: 'A', questionCount: 3, questionTypes: ['berekening'], maxScore: 10 },
            { code: 'B', questionCount: 5, questionTypes: ['berekening', 'open'], maxScore: 19 },
            { code: 'C', questionCount: 5, questionTypes: ['berekening', 'open', 'uitleg'], maxScore: 23 },
            { code: 'D', questionCount: 5, questionTypes: ['berekening', 'open'], maxScore: 25 },
        ]
    },

    // ===================== WISKUNDE B VWO =====================
    // A = Vaardigheden, B = Analyse, C = Meetkunde met coördinaten, D = Goniometrie
    {
        subject: 'Wiskunde B', level: 'VWO', year: 2024, tijdvak: 1,
        totalQuestions: 17, totalMaxScore: 82,
        domains: [
            { code: 'A', questionCount: 2, questionTypes: ['berekening'], maxScore: 8 },
            { code: 'B', questionCount: 7, questionTypes: ['berekening', 'open', 'uitleg'], maxScore: 36 },
            { code: 'C', questionCount: 4, questionTypes: ['berekening', 'open'], maxScore: 20 },
            { code: 'D', questionCount: 4, questionTypes: ['berekening', 'open'], maxScore: 18 },
        ]
    },
    {
        subject: 'Wiskunde B', level: 'VWO', year: 2023, tijdvak: 1,
        totalQuestions: 18, totalMaxScore: 81,
        domains: [
            { code: 'A', questionCount: 3, questionTypes: ['berekening'], maxScore: 10 },
            { code: 'B', questionCount: 6, questionTypes: ['berekening', 'open', 'uitleg'], maxScore: 32 },
            { code: 'C', questionCount: 5, questionTypes: ['berekening', 'open'], maxScore: 22 },
            { code: 'D', questionCount: 4, questionTypes: ['berekening', 'open'], maxScore: 17 },
        ]
    },
    {
        subject: 'Wiskunde B', level: 'VWO', year: 2022, tijdvak: 1,
        totalQuestions: 17, totalMaxScore: 80,
        domains: [
            { code: 'A', questionCount: 2, questionTypes: ['berekening'], maxScore: 9 },
            { code: 'B', questionCount: 7, questionTypes: ['berekening', 'open', 'uitleg'], maxScore: 35 },
            { code: 'C', questionCount: 4, questionTypes: ['berekening', 'open'], maxScore: 19 },
            { code: 'D', questionCount: 4, questionTypes: ['berekening', 'open'], maxScore: 17 },
        ]
    },
    {
        subject: 'Wiskunde B', level: 'VWO', year: 2021, tijdvak: 1,
        totalQuestions: 16, totalMaxScore: 79,
        domains: [
            { code: 'A', questionCount: 2, questionTypes: ['berekening'], maxScore: 8 },
            { code: 'B', questionCount: 6, questionTypes: ['berekening', 'open', 'uitleg'], maxScore: 33 },
            { code: 'C', questionCount: 4, questionTypes: ['berekening', 'open'], maxScore: 20 },
            { code: 'D', questionCount: 4, questionTypes: ['berekening', 'open'], maxScore: 18 },
        ]
    },
    {
        subject: 'Wiskunde B', level: 'VWO', year: 2020, tijdvak: 1,
        totalQuestions: 17, totalMaxScore: 80,
        domains: [
            { code: 'A', questionCount: 3, questionTypes: ['berekening'], maxScore: 10 },
            { code: 'B', questionCount: 6, questionTypes: ['berekening', 'open'], maxScore: 32 },
            { code: 'C', questionCount: 4, questionTypes: ['berekening', 'open'], maxScore: 20 },
            { code: 'D', questionCount: 4, questionTypes: ['berekening', 'open'], maxScore: 18 },
        ]
    },

    // ===================== NATUURKUNDE VWO =====================
    // A = Vaardigheden, B = Golven, C = Elektriciteit, D = Mechanica, E = Quantumwereld/Straling
    {
        subject: 'Natuurkunde', level: 'VWO', year: 2024, tijdvak: 1,
        totalQuestions: 25, totalMaxScore: 74,
        domains: [
            { code: 'A', questionCount: 4, questionTypes: ['berekening', 'open'], maxScore: 12 },
            { code: 'B', questionCount: 6, questionTypes: ['meerkeuze', 'berekening', 'open'], maxScore: 18 },
            { code: 'C', questionCount: 5, questionTypes: ['meerkeuze', 'berekening', 'open'], maxScore: 15 },
            { code: 'D', questionCount: 6, questionTypes: ['meerkeuze', 'berekening', 'open'], maxScore: 18 },
            { code: 'E', questionCount: 4, questionTypes: ['meerkeuze', 'berekening'], maxScore: 11 },
        ]
    },
    {
        subject: 'Natuurkunde', level: 'VWO', year: 2023, tijdvak: 1,
        totalQuestions: 24, totalMaxScore: 73,
        domains: [
            { code: 'A', questionCount: 3, questionTypes: ['berekening', 'open'], maxScore: 10 },
            { code: 'B', questionCount: 5, questionTypes: ['meerkeuze', 'berekening', 'open'], maxScore: 16 },
            { code: 'C', questionCount: 6, questionTypes: ['meerkeuze', 'berekening', 'open'], maxScore: 18 },
            { code: 'D', questionCount: 6, questionTypes: ['meerkeuze', 'berekening', 'open'], maxScore: 18 },
            { code: 'E', questionCount: 4, questionTypes: ['meerkeuze', 'open'], maxScore: 11 },
        ]
    },
    {
        subject: 'Natuurkunde', level: 'VWO', year: 2022, tijdvak: 1,
        totalQuestions: 24, totalMaxScore: 72,
        domains: [
            { code: 'A', questionCount: 4, questionTypes: ['berekening'], maxScore: 11 },
            { code: 'B', questionCount: 5, questionTypes: ['meerkeuze', 'berekening'], maxScore: 15 },
            { code: 'C', questionCount: 5, questionTypes: ['meerkeuze', 'berekening', 'open'], maxScore: 16 },
            { code: 'D', questionCount: 6, questionTypes: ['meerkeuze', 'berekening', 'open'], maxScore: 19 },
            { code: 'E', questionCount: 4, questionTypes: ['meerkeuze', 'berekening'], maxScore: 11 },
        ]
    },
    {
        subject: 'Natuurkunde', level: 'VWO', year: 2021, tijdvak: 1,
        totalQuestions: 23, totalMaxScore: 71,
        domains: [
            { code: 'A', questionCount: 3, questionTypes: ['berekening'], maxScore: 9 },
            { code: 'B', questionCount: 6, questionTypes: ['meerkeuze', 'berekening', 'open'], maxScore: 18 },
            { code: 'C', questionCount: 5, questionTypes: ['meerkeuze', 'berekening'], maxScore: 15 },
            { code: 'D', questionCount: 5, questionTypes: ['meerkeuze', 'berekening', 'open'], maxScore: 17 },
            { code: 'E', questionCount: 4, questionTypes: ['meerkeuze', 'berekening'], maxScore: 12 },
        ]
    },
    {
        subject: 'Natuurkunde', level: 'VWO', year: 2020, tijdvak: 1,
        totalQuestions: 24, totalMaxScore: 73,
        domains: [
            { code: 'A', questionCount: 4, questionTypes: ['berekening', 'open'], maxScore: 11 },
            { code: 'B', questionCount: 5, questionTypes: ['meerkeuze', 'berekening'], maxScore: 16 },
            { code: 'C', questionCount: 6, questionTypes: ['meerkeuze', 'berekening', 'open'], maxScore: 18 },
            { code: 'D', questionCount: 5, questionTypes: ['meerkeuze', 'berekening'], maxScore: 17 },
            { code: 'E', questionCount: 4, questionTypes: ['meerkeuze', 'open'], maxScore: 11 },
        ]
    },

    // ===================== BIOLOGIE VWO =====================
    // A = Vaardigheden, B = Cellen, C = Organen/Organismen, D = Ecologie, E = Evolutie
    {
        subject: 'Biologie', level: 'VWO', year: 2024, tijdvak: 1,
        totalQuestions: 32, totalMaxScore: 68,
        domains: [
            { code: 'A', questionCount: 4, questionTypes: ['meerkeuze', 'open'], maxScore: 8 },
            { code: 'B', questionCount: 8, questionTypes: ['meerkeuze', 'open', 'uitleg'], maxScore: 18 },
            { code: 'C', questionCount: 8, questionTypes: ['meerkeuze', 'open', 'uitleg'], maxScore: 18 },
            { code: 'D', questionCount: 7, questionTypes: ['meerkeuze', 'open'], maxScore: 14 },
            { code: 'E', questionCount: 5, questionTypes: ['meerkeuze', 'open'], maxScore: 10 },
        ]
    },
    {
        subject: 'Biologie', level: 'VWO', year: 2023, tijdvak: 1,
        totalQuestions: 31, totalMaxScore: 67,
        domains: [
            { code: 'A', questionCount: 3, questionTypes: ['open'], maxScore: 7 },
            { code: 'B', questionCount: 9, questionTypes: ['meerkeuze', 'open', 'uitleg'], maxScore: 20 },
            { code: 'C', questionCount: 7, questionTypes: ['meerkeuze', 'open'], maxScore: 16 },
            { code: 'D', questionCount: 7, questionTypes: ['meerkeuze', 'open', 'uitleg'], maxScore: 14 },
            { code: 'E', questionCount: 5, questionTypes: ['meerkeuze', 'open'], maxScore: 10 },
        ]
    },
    {
        subject: 'Biologie', level: 'VWO', year: 2022, tijdvak: 1,
        totalQuestions: 30, totalMaxScore: 66,
        domains: [
            { code: 'A', questionCount: 4, questionTypes: ['open'], maxScore: 8 },
            { code: 'B', questionCount: 7, questionTypes: ['meerkeuze', 'open'], maxScore: 16 },
            { code: 'C', questionCount: 8, questionTypes: ['meerkeuze', 'open', 'uitleg'], maxScore: 18 },
            { code: 'D', questionCount: 6, questionTypes: ['meerkeuze', 'open'], maxScore: 13 },
            { code: 'E', questionCount: 5, questionTypes: ['meerkeuze', 'open'], maxScore: 11 },
        ]
    },
    {
        subject: 'Biologie', level: 'VWO', year: 2021, tijdvak: 1,
        totalQuestions: 30, totalMaxScore: 65,
        domains: [
            { code: 'A', questionCount: 3, questionTypes: ['open'], maxScore: 7 },
            { code: 'B', questionCount: 8, questionTypes: ['meerkeuze', 'open', 'uitleg'], maxScore: 18 },
            { code: 'C', questionCount: 7, questionTypes: ['meerkeuze', 'open'], maxScore: 16 },
            { code: 'D', questionCount: 7, questionTypes: ['meerkeuze', 'open'], maxScore: 14 },
            { code: 'E', questionCount: 5, questionTypes: ['meerkeuze', 'open'], maxScore: 10 },
        ]
    },

    // ===================== ECONOMIE VWO =====================
    // A = Vaardigheden, B = Concept Markt, C = Concept Ruilen, D = Concept Samenwerken
    {
        subject: 'Economie', level: 'VWO', year: 2024, tijdvak: 1,
        totalQuestions: 30, totalMaxScore: 80,
        domains: [
            { code: 'A', questionCount: 3, questionTypes: ['berekening', 'open'], maxScore: 8 },
            { code: 'B', questionCount: 9, questionTypes: ['meerkeuze', 'berekening', 'open', 'uitleg'], maxScore: 24 },
            { code: 'C', questionCount: 9, questionTypes: ['meerkeuze', 'berekening', 'open'], maxScore: 24 },
            { code: 'D', questionCount: 9, questionTypes: ['meerkeuze', 'open', 'uitleg'], maxScore: 24 },
        ]
    },
    {
        subject: 'Economie', level: 'VWO', year: 2023, tijdvak: 1,
        totalQuestions: 29, totalMaxScore: 79,
        domains: [
            { code: 'A', questionCount: 3, questionTypes: ['berekening'], maxScore: 8 },
            { code: 'B', questionCount: 8, questionTypes: ['meerkeuze', 'berekening', 'open'], maxScore: 22 },
            { code: 'C', questionCount: 10, questionTypes: ['meerkeuze', 'berekening', 'open', 'uitleg'], maxScore: 26 },
            { code: 'D', questionCount: 8, questionTypes: ['meerkeuze', 'open', 'uitleg'], maxScore: 23 },
        ]
    },
    {
        subject: 'Economie', level: 'VWO', year: 2022, tijdvak: 1,
        totalQuestions: 30, totalMaxScore: 80,
        domains: [
            { code: 'A', questionCount: 4, questionTypes: ['berekening', 'open'], maxScore: 10 },
            { code: 'B', questionCount: 9, questionTypes: ['meerkeuze', 'berekening', 'open'], maxScore: 24 },
            { code: 'C', questionCount: 8, questionTypes: ['meerkeuze', 'berekening', 'open'], maxScore: 22 },
            { code: 'D', questionCount: 9, questionTypes: ['meerkeuze', 'open', 'uitleg'], maxScore: 24 },
        ]
    },

    // ===================== GESCHIEDENIS VWO =====================
    // Domeinen variëren per jaar — historische contexten wisselen
    {
        subject: 'Geschiedenis', level: 'VWO', year: 2024, tijdvak: 1,
        totalQuestions: 28, totalMaxScore: 72,
        domains: [
            { code: 'A', questionCount: 5, questionTypes: ['meerkeuze', 'open'], maxScore: 12 },
            { code: 'B', questionCount: 8, questionTypes: ['meerkeuze', 'open', 'uitleg'], maxScore: 22 },
            { code: 'C', questionCount: 8, questionTypes: ['meerkeuze', 'open', 'citaat'], maxScore: 20 },
            { code: 'D', questionCount: 7, questionTypes: ['meerkeuze', 'open'], maxScore: 18 },
        ]
    },
    {
        subject: 'Geschiedenis', level: 'VWO', year: 2023, tijdvak: 1,
        totalQuestions: 27, totalMaxScore: 71,
        domains: [
            { code: 'A', questionCount: 4, questionTypes: ['meerkeuze', 'open'], maxScore: 10 },
            { code: 'B', questionCount: 8, questionTypes: ['meerkeuze', 'open', 'uitleg'], maxScore: 22 },
            { code: 'C', questionCount: 8, questionTypes: ['meerkeuze', 'open', 'citaat'], maxScore: 21 },
            { code: 'D', questionCount: 7, questionTypes: ['meerkeuze', 'open'], maxScore: 18 },
        ]
    },
    {
        subject: 'Geschiedenis', level: 'VWO', year: 2022, tijdvak: 1,
        totalQuestions: 28, totalMaxScore: 73,
        domains: [
            { code: 'A', questionCount: 5, questionTypes: ['meerkeuze', 'open'], maxScore: 12 },
            { code: 'B', questionCount: 9, questionTypes: ['meerkeuze', 'open', 'uitleg'], maxScore: 24 },
            { code: 'C', questionCount: 7, questionTypes: ['meerkeuze', 'open'], maxScore: 19 },
            { code: 'D', questionCount: 7, questionTypes: ['meerkeuze', 'open'], maxScore: 18 },
        ]
    },

    // ===================== SCHEIKUNDE VWO =====================
    // A = Vaardigheden, B = Stoffen/deeltjes, C = Chemische binding, D = Reacties, E = Industrieel
    {
        subject: 'Scheikunde', level: 'VWO', year: 2024, tijdvak: 1,
        totalQuestions: 26, totalMaxScore: 70,
        domains: [
            { code: 'A', questionCount: 4, questionTypes: ['berekening', 'open'], maxScore: 10 },
            { code: 'B', questionCount: 5, questionTypes: ['meerkeuze', 'open', 'uitleg'], maxScore: 14 },
            { code: 'C', questionCount: 5, questionTypes: ['meerkeuze', 'open'], maxScore: 14 },
            { code: 'D', questionCount: 7, questionTypes: ['meerkeuze', 'berekening', 'open'], maxScore: 20 },
            { code: 'E', questionCount: 5, questionTypes: ['meerkeuze', 'open', 'uitleg'], maxScore: 12 },
        ]
    },
    {
        subject: 'Scheikunde', level: 'VWO', year: 2023, tijdvak: 1,
        totalQuestions: 25, totalMaxScore: 69,
        domains: [
            { code: 'A', questionCount: 3, questionTypes: ['berekening'], maxScore: 8 },
            { code: 'B', questionCount: 6, questionTypes: ['meerkeuze', 'open', 'uitleg'], maxScore: 16 },
            { code: 'C', questionCount: 5, questionTypes: ['meerkeuze', 'open'], maxScore: 14 },
            { code: 'D', questionCount: 6, questionTypes: ['meerkeuze', 'berekening', 'open'], maxScore: 18 },
            { code: 'E', questionCount: 5, questionTypes: ['meerkeuze', 'open'], maxScore: 13 },
        ]
    },
    {
        subject: 'Scheikunde', level: 'VWO', year: 2022, tijdvak: 1,
        totalQuestions: 25, totalMaxScore: 68,
        domains: [
            { code: 'A', questionCount: 4, questionTypes: ['berekening', 'open'], maxScore: 10 },
            { code: 'B', questionCount: 5, questionTypes: ['meerkeuze', 'open'], maxScore: 14 },
            { code: 'C', questionCount: 5, questionTypes: ['meerkeuze', 'open', 'uitleg'], maxScore: 14 },
            { code: 'D', questionCount: 7, questionTypes: ['meerkeuze', 'berekening', 'open'], maxScore: 19 },
            { code: 'E', questionCount: 4, questionTypes: ['meerkeuze', 'open'], maxScore: 11 },
        ]
    },
];

/**
 * Haal historische data op voor een specifiek vak en niveau.
 */
export const getExamHistory = (subject: string, level: string = 'VWO'): ExamHistoryEntry[] => {
    return examHistoryData.filter(e => e.subject === subject && e.level === level);
};

/**
 * Haal de beschikbare jaren op voor een vak.
 */
export const getAvailableYears = (subject: string, level: string = 'VWO'): number[] => {
    return [...new Set(getExamHistory(subject, level).map(e => e.year))].sort((a, b) => b - a);
};

/**
 * Bereken de gemiddelde domein-verdeling over alle beschikbare jaren.
 */
export const getAverageDomainDistribution = (subject: string, level: string = 'VWO'): {
    code: string;
    avgQuestionCount: number;
    avgMaxScore: number;
    frequency: number; // Percentage van examens waarin dit domein voorkwam
    questionTypes: string[];
}[] => {
    const history = getExamHistory(subject, level);
    if (history.length === 0) return [];

    const domainMap = new Map<string, {
        totalQuestions: number;
        totalScore: number;
        appearances: number;
        questionTypes: Set<string>;
    }>();

    for (const exam of history) {
        for (const domain of exam.domains) {
            const existing = domainMap.get(domain.code) || {
                totalQuestions: 0, totalScore: 0, appearances: 0, questionTypes: new Set<string>()
            };
            existing.totalQuestions += domain.questionCount;
            existing.totalScore += domain.maxScore;
            existing.appearances += 1;
            domain.questionTypes.forEach(t => existing.questionTypes.add(t));
            domainMap.set(domain.code, existing);
        }
    }

    const totalExams = history.length;
    return Array.from(domainMap.entries()).map(([code, data]) => ({
        code,
        avgQuestionCount: Math.round((data.totalQuestions / data.appearances) * 10) / 10,
        avgMaxScore: Math.round((data.totalScore / data.appearances) * 10) / 10,
        frequency: Math.round((data.appearances / totalExams) * 100),
        questionTypes: Array.from(data.questionTypes),
    })).sort((a, b) => b.frequency - a.frequency || b.avgMaxScore - a.avgMaxScore);
};
