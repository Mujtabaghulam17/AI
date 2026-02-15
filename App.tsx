import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GoogleGenAI, Chat, Modality, Type } from "@google/genai";
import Welcome from './components/Welcome.tsx';
import Dashboard from './components/Dashboard.tsx';
import QuestionCard from './components/QuestionCard.tsx';
import LoadingCard from './components/LoadingCard.tsx';
import FeedbackCard from './components/FeedbackCard.tsx';
import RepetitionCard from './components/RepetitionCard.tsx';
import ChatModal from './components/ChatModal.tsx';
import UpgradeModal from './components/UpgradeModal.tsx';
import PaymentModal from './components/PaymentModal.tsx';
import ZenZoneModal from './components/ZenZoneModal.tsx';
import MindfulMoment from './components/MindfulMoment.tsx';
import ConceptExplanationModal from './components/ConceptExplanationModal.tsx';
import WeekReviewModal from './components/WeekReviewModal.tsx';
import AnalysisModal from './components/MistakeAnalysisModal.tsx';
import ThinkingProcessModal from './components/ThinkingProcessModal.tsx';
import MasterySessionModal from './components/MasterySessionModal.tsx';
import SessionProposalModal from './components/SessionProposalModal.tsx';
import InfoModal from './components/InfoModal.tsx';
import WeakSpotBoosterModal from './components/WeakSpotBoosterModal.tsx';
import ExamStartModal from './components/ExamStartModal.tsx';
import ExamSimulation from './components/ExamSimulation.tsx';
import ExamResults from './components/ExamResults.tsx';
import UploadAnalysisModal from './components/UploadAnalysisModal.tsx';
import AuthModal from './components/AuthModal.tsx';
import PulseCheckModal from './components/PulseCheckModal.tsx';
import OralPracticeModal from './components/OralPracticeModal.tsx';
import TutorInterventionModal from './components/TutorInterventionModal.tsx';
import SessionSummaryModal from './components/SessionSummaryModal.tsx';
import BurnoutGuardModal from './components/BurnoutGuardModal.tsx';
import GamedayModal from './components/GamedayModal.tsx';
import AdminStatsModal from './components/AdminStatsModal.tsx';
import FeatureFeedbackModal from './components/FeatureFeedbackModal.tsx';
import ExamPredictorModal from './components/ExamPredictorModal.tsx';
import SessionHeader from './components/SessionHeader.tsx';
import OnboardingModal from './components/OnboardingModal.tsx';
import TermsPage from './components/TermsPage.tsx';
import PrivacyPage from './components/PrivacyPage.tsx';
import PricingPage from './components/PricingPage.tsx';
import OuderDashboard from './components/OuderDashboard.tsx';
import GlobalStyles from './styles/GlobalStyles.tsx';
import { getInitialState, repetitionSchedule } from './utils/helpers.ts';
import { generateContentWithRetry, cleanAndParseJSON, ai } from './api/gemini.ts';
import { decode, decodeAudioData } from './utils/audio.ts';
import { debouncedSync, loadAndMergeUserData, getUserIdFromAuth, prepareDataForSync, forceSync } from './utils/userSync.ts';
import { checkPendingPayment } from './api/stripe.ts';
import { updateSubscriptionTier } from './api/firebase.ts';
import { type SubscriptionTier, isPaidTier, isAiLimitReached, isChatLimitReached, canAccessSubject, canUseExamPredictor, DAILY_AI_LIMIT_FREE, DAILY_CHAT_LIMIT_FREE } from './utils/subscriptionTiers';
import {
    dutchExamQuestions, englishExamQuestions, natuurkundeExamQuestions, biologieExamQuestions, economieExamQuestions,
    geschiedenisExamQuestions, scheikundeExamQuestions, bedrijfseconomieExamQuestions, wiskundeAExamQuestions, wiskundeBExamQuestions,
    fransExamQuestions, duitsExamQuestions,
    FREE_QUESTION_IDS_NL, FREE_QUESTION_IDS_EN, FREE_QUESTION_IDS_NK, FREE_QUESTION_IDS_BIO, FREE_QUESTION_IDS_ECO,
    FREE_QUESTION_IDS_GS, FREE_QUESTION_IDS_SK, FREE_QUESTION_IDS_BECO, FREE_QUESTION_IDS_WISA, FREE_QUESTION_IDS_WISB,
    FREE_QUESTION_IDS_FR, FREE_QUESTION_IDS_DE
} from './data/data.ts';
import { examInfo, getExamProgramSummary, getCEDomains } from './data/examInfo.ts';
import { allBadges } from './data/badges.ts';
import { mockSquadData } from './data/mockSquad.ts';
import { useAuth0 } from './auth/FirebaseAuthProvider.tsx';
import type { Question, MasteryScore, StudyPlan, Mistake, ChatMessage, PlannerTask, PlannerWeek, MasterySessionContent, SubjectSpecificData, SessionProposal, ActiveSession, Badge, DailyQuests, Quest, ExamSimulationState, ExamResult, FlashcardDeck, ProgressHistoryEntry, User, MoodEntry, SquadData, AiFeedback } from './data/data.ts';

const CHAT_MESSAGE_LIMIT_FREE = DAILY_CHAT_LIMIT_FREE;
const DAILY_ANSWER_LIMIT_FREE = DAILY_AI_LIMIT_FREE;
const MODEL_NAME = 'gemini-2.0-flash';

type Subject = 'Nederlands' | 'Engels' | 'Natuurkunde' | 'Biologie' | 'Economie' | 'Geschiedenis' | 'Scheikunde' | 'Bedrijfseconomie' | 'Wiskunde A' | 'Wiskunde B' | 'Frans' | 'Duits' | 'Wiskunde' | 'Nask 1' | 'Nask 2' | 'Aardrijkskunde' | 'Maatschappijkunde';
type ExamLevel = 'VMBO' | 'HAVO' | 'VWO';
type MainView = 'WELCOME' | 'DASHBOARD' | 'QUESTION' | 'LOADING' | 'FEEDBACK' | 'REPETITION' | 'MINDFUL_MOMENT' | 'EXAM_SIMULATION' | 'TERMS' | 'PRIVACY' | 'PRICING' | 'OUDER_DASHBOARD';

const SUBJECTS_BY_LEVEL: Record<ExamLevel, Subject[]> = {
    'VWO': ['Nederlands', 'Engels', 'Wiskunde A', 'Wiskunde B', 'Natuurkunde', 'Scheikunde', 'Biologie', 'Economie', 'Bedrijfseconomie', 'Geschiedenis', 'Frans', 'Duits'],
    'HAVO': ['Nederlands', 'Engels', 'Wiskunde A', 'Wiskunde B', 'Natuurkunde', 'Scheikunde', 'Biologie', 'Economie', 'Bedrijfseconomie', 'Geschiedenis', 'Frans', 'Duits'],
    'VMBO': ['Nederlands', 'Engels', 'Wiskunde', 'Nask 1', 'Nask 2', 'Biologie', 'Economie', 'Geschiedenis', 'Aardrijkskunde', 'Duits', 'Maatschappijkunde'],
};

const getWeekNumber = (d: Date): [number, number] => {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    return [d.getUTCFullYear(), weekNo];
}

const getTodayISO = () => {
    return new Date().toISOString().split('T')[0];
}

const App = () => {
    // Enhanced State Initialization to handle day resets IMMEDIATELY on load
    const [chatUsage, setChatUsage] = useState<{ count: number, date: string }>(() => {
        const today = getTodayISO();
        const stored = getInitialState<{ count: number, date: string } | null>('chatUsage', null);
        if (stored && stored.date === today) {
            return stored;
        }
        return { count: 0, date: today };
    });

    const [dailyAnswers, setDailyAnswers] = useState<{ count: number, date: string }>(() => {
        const today = getTodayISO();
        const stored = getInitialState<{ count: number, date: string } | null>('dailyAnswers', null);
        if (stored && stored.date === today) {
            return stored;
        }
        return { count: 0, date: today };
    });

    const [activeSession, setActiveSession] = useState<ActiveSession | null>(() => {
        const saved = getInitialState<ActiveSession | null>('activeSession', null);
        // Safety check: only restore valid sessions
        if (saved && Array.isArray(saved.questions) && saved.questions.length > 0) {
            return saved;
        }
        return null;
    });

    const [currentScreen, setCurrentScreen] = useState<MainView>(() => {
        // If there is a valid active session, go to QUESTION, otherwise WELCOME (auth check happens in useEffect)
        const saved = getInitialState<ActiveSession | null>('activeSession', null);
        return (saved && Array.isArray(saved.questions) && saved.questions.length > 0) ? 'QUESTION' : 'WELCOME';
    });

    const [currentSubject, setCurrentSubject] = useState<Subject>('Nederlands');
    const [theme, setTheme] = useState<'light' | 'dark'>(() => {
        // Check if user has a saved preference
        const saved = getInitialState('theme', null);
        if (saved) return saved;
        // Otherwise detect from system preference (modern browsers)
        if (typeof window !== 'undefined' && window.matchMedia) {
            return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        return 'dark'; // Default to dark mode (modern, easier on eyes)
    });

    const initialSubjectData: { [key in Subject]: SubjectSpecificData } = {
        Nederlands: { masteryScores: {}, answeredIds: [], mistakes: [], studyPlan: null, examDate: '', dailyQuests: null, progressHistory: [], flashcardDecks: [], freeAnalysisUsed: false, lastPulseCheck: undefined, moodHistory: [] },
        Engels: { masteryScores: {}, answeredIds: [], mistakes: [], studyPlan: null, examDate: '', dailyQuests: null, progressHistory: [], flashcardDecks: [], freeAnalysisUsed: false, lastPulseCheck: undefined, moodHistory: [] },
        Natuurkunde: { masteryScores: {}, answeredIds: [], mistakes: [], studyPlan: null, examDate: '', dailyQuests: null, progressHistory: [], flashcardDecks: [], freeAnalysisUsed: false, lastPulseCheck: undefined, moodHistory: [] },
        Biologie: { masteryScores: {}, answeredIds: [], mistakes: [], studyPlan: null, examDate: '', dailyQuests: null, progressHistory: [], flashcardDecks: [], freeAnalysisUsed: false, lastPulseCheck: undefined, moodHistory: [] },
        Economie: { masteryScores: {}, answeredIds: [], mistakes: [], studyPlan: null, examDate: '', dailyQuests: null, progressHistory: [], flashcardDecks: [], freeAnalysisUsed: false, lastPulseCheck: undefined, moodHistory: [] },
        Geschiedenis: { masteryScores: {}, answeredIds: [], mistakes: [], studyPlan: null, examDate: '', dailyQuests: null, progressHistory: [], flashcardDecks: [], freeAnalysisUsed: false, lastPulseCheck: undefined, moodHistory: [] },
        Scheikunde: { masteryScores: {}, answeredIds: [], mistakes: [], studyPlan: null, examDate: '', dailyQuests: null, progressHistory: [], flashcardDecks: [], freeAnalysisUsed: false, lastPulseCheck: undefined, moodHistory: [] },
        Bedrijfseconomie: { masteryScores: {}, answeredIds: [], mistakes: [], studyPlan: null, examDate: '', dailyQuests: null, progressHistory: [], flashcardDecks: [], freeAnalysisUsed: false, lastPulseCheck: undefined, moodHistory: [] },
        'Wiskunde A': { masteryScores: {}, answeredIds: [], mistakes: [], studyPlan: null, examDate: '', dailyQuests: null, progressHistory: [], flashcardDecks: [], freeAnalysisUsed: false, lastPulseCheck: undefined, moodHistory: [] },
        'Wiskunde B': { masteryScores: {}, answeredIds: [], mistakes: [], studyPlan: null, examDate: '', dailyQuests: null, progressHistory: [], flashcardDecks: [], freeAnalysisUsed: false, lastPulseCheck: undefined, moodHistory: [] },
        Frans: { masteryScores: {}, answeredIds: [], mistakes: [], studyPlan: null, examDate: '', dailyQuests: null, progressHistory: [], flashcardDecks: [], freeAnalysisUsed: false, lastPulseCheck: undefined, moodHistory: [] },
        Duits: { masteryScores: {}, answeredIds: [], mistakes: [], studyPlan: null, examDate: '', dailyQuests: null, progressHistory: [], flashcardDecks: [], freeAnalysisUsed: false, lastPulseCheck: undefined, moodHistory: [] },
        Wiskunde: { masteryScores: {}, answeredIds: [], mistakes: [], studyPlan: null, examDate: '', dailyQuests: null, progressHistory: [], flashcardDecks: [], freeAnalysisUsed: false, lastPulseCheck: undefined, moodHistory: [] },
        'Nask 1': { masteryScores: {}, answeredIds: [], mistakes: [], studyPlan: null, examDate: '', dailyQuests: null, progressHistory: [], flashcardDecks: [], freeAnalysisUsed: false, lastPulseCheck: undefined, moodHistory: [] },
        'Nask 2': { masteryScores: {}, answeredIds: [], mistakes: [], studyPlan: null, examDate: '', dailyQuests: null, progressHistory: [], flashcardDecks: [], freeAnalysisUsed: false, lastPulseCheck: undefined, moodHistory: [] },
        Aardrijkskunde: { masteryScores: {}, answeredIds: [], mistakes: [], studyPlan: null, examDate: '', dailyQuests: null, progressHistory: [], flashcardDecks: [], freeAnalysisUsed: false, lastPulseCheck: undefined, moodHistory: [] },
        Maatschappijkunde: { masteryScores: {}, answeredIds: [], mistakes: [], studyPlan: null, examDate: '', dailyQuests: null, progressHistory: [], flashcardDecks: [], freeAnalysisUsed: false, lastPulseCheck: undefined, moodHistory: [] },
    };

    const [subjectData, setSubjectData] = useState<{ [key in Subject]: SubjectSpecificData }>(() => {
        const storedData = getInitialState<{ [key in Subject]?: SubjectSpecificData } | null>('subjectData', null);
        return storedData ? { ...initialSubjectData, ...storedData } as { [key in Subject]: SubjectSpecificData } : initialSubjectData;
    });

    const [globalPulseCheck, setGlobalPulseCheck] = useState<{ year: number, week: number } | null>(() => getInitialState('globalPulseCheck', null));

    const [currentQuestion, setCurrentQuestion] = useState<Question | null>(() => getInitialState('currentQuestion', null));
    const [sessionQuestionCount, setSessionQuestionCount] = useState(() => getInitialState('sessionQuestionCount', 0));
    const [sessionMistakeCount, setSessionMistakeCount] = useState(() => getInitialState('sessionMistakeCount', 0));

    const [nextQuestion, setNextQuestion] = useState<Question | null>(null);
    const [lastAnswer, setLastAnswer] = useState<{ isCorrect: boolean; question: Question | null; aiFeedback: AiFeedback; mindsetTip: string; xpGained: number; userAnswer: string; }>({ isCorrect: false, question: null, aiFeedback: { positive_reinforcement: '', core_mistake: '', detailed_explanation: '' }, mindsetTip: '', xpGained: 0, userAnswer: '' });

    const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
    const [studyStreak, setStudyStreak] = useState(() => getInitialState('studyStreak', 0));
    const [level, setLevel] = useState(() => getInitialState('level', 1));
    const [xp, setXp] = useState(() => getInitialState('xp', 0));

    const [repetitionQueue, setRepetitionQueue] = useState<Mistake[]>([]);
    const [currentRepetitionIndex, setCurrentRepetitionIndex] = useState(0);

    const [isChatOpen, setIsChatOpen] = useState(false);
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
    const [isSendingMessage, setIsSendingMessage] = useState(false);
    const chatSession = useRef<Chat | null>(null);

    const [subscriptionTier, setSubscriptionTier] = useState<SubscriptionTier>(() => getInitialState('subscriptionTier', 'free'));
    const isPremium = isPaidTier(subscriptionTier);
    const [primarySubject, setPrimarySubject] = useState<string>(() => getInitialState('primarySubject', ''));
    const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
    const [upgradeModalReason, setUpgradeModalReason] = useState<string>('');
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<'focus' | 'totaal'>('focus');

    const chatLimitReached = isChatLimitReached(subscriptionTier, chatUsage.count);
    const answerLimitReached = isAiLimitReached(subscriptionTier, dailyAnswers.count);

    const [isZenZoneOpen, setIsZenZoneOpen] = useState(false);
    const [isExamPredictorOpen, setIsExamPredictorOpen] = useState(false);
    const [affirmation, setAffirmation] = useState('');
    const [isGeneratingAffirmation, setIsGeneratingAffirmation] = useState(false);

    const [isConceptModalOpen, setIsConceptModalOpen] = useState(false);
    const [conceptExplanation, setConceptExplanation] = useState('');
    const [isGeneratingExplanation, setIsGeneratingExplanation] = useState(false);
    const [conceptToExplain, setConceptToExplain] = useState<Question | null>(null);

    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [reviewContent, setReviewContent] = useState('');
    const [isGeneratingReview, setIsGeneratingReview] = useState(false);
    const [weekToReview, setWeekToReview] = useState<PlannerWeek | null>(null);

    const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);
    const [analysisContent, setAnalysisContent] = useState('');
    const [isGeneratingAnalysis, setIsGeneratingAnalysis] = useState(false);

    const [isThinkingProcessModalOpen, setIsThinkingProcessModalOpen] = useState(false);
    const [thinkingProcessQuestion, setThinkingProcessQuestion] = useState<{ question: Question, userAnswer: string } | null>(null);

    const [isMasterySessionModalOpen, setIsMasterySessionModalOpen] = useState(false);
    const [skillForMasterySession, setSkillForMasterySession] = useState<string | null>(null);
    const [masterySessionContent, setMasterySessionContent] = useState<MasterySessionContent | null>(null);
    const [isGeneratingMasterySession, setIsGeneratingMasterySession] = useState(false);

    const [isSessionProposalModalOpen, setIsSessionProposalModalOpen] = useState(false);
    const [proposedSession, setProposedSession] = useState<SessionProposal | null>(null);
    const [isGeneratingSession, setIsGeneratingSession] = useState(false);

    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
    const [infoModalData, setInfoModalData] = useState({ title: '', content: '' });

    const [isWeakSpotModalOpen, setIsWeakSpotModalOpen] = useState(false);
    const [earnedBadges, setEarnedBadges] = useState<string[]>(() => getInitialState('earnedBadges', []));

    const [isGeneratingQuests, setIsGeneratingQuests] = useState(false);
    const [isExamStartModalOpen, setIsExamStartModalOpen] = useState(false);
    const [examState, setExamState] = useState<ExamSimulationState | null>(null);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [isAnalyzingUpload, setIsAnalyzingUpload] = useState(false);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [proactiveInsight, setProactiveInsight] = useState<{ greeting: string; suggestion: string; action: string; context?: string } | null>(null);
    const [isPulseCheckModalOpen, setIsPulseCheckModalOpen] = useState(false);
    const [squadData, setSquadData] = useState<SquadData>(mockSquadData);

    const [isExamAnalysisModalOpen, setIsExamAnalysisModalOpen] = useState(false);
    const [examAnalysisResult, setExamAnalysisResult] = useState<ExamResult | null>(null);

    const [isOralPracticeOpen, setIsOralPracticeOpen] = useState(false);
    const [oralPracticeQuestion, setOralPracticeQuestion] = useState<Question | null>(null);

    const [tutorIntervention, setTutorIntervention] = useState<string | null>(null);

    const [isSessionSummaryModalOpen, setIsSessionSummaryModalOpen] = useState(false);
    const [sessionSummaryContent, setSessionSummaryContent] = useState('');
    const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
    const [isBurnoutGuardModalOpen, setIsBurnoutGuardModalOpen] = useState(false);
    const [consecutiveIncorrectAnswers, setConsecutiveIncorrectAnswers] = useState(0);
    const [isGamedayModalOpen, setIsGamedayModalOpen] = useState(false);

    const [isAdminStatsModalOpen, setIsAdminStatsModalOpen] = useState(false);
    const [logoClickCount, setLogoClickCount] = useState(0);
    const [isFeatureFeedbackModalOpen, setIsFeatureFeedbackModalOpen] = useState(false);
    const [feedbackContext, setFeedbackContext] = useState<{ feature: string; } | null>(null);

    const [parentTip, setParentTip] = useState('');
    const [isGeneratingParentTip, setIsGeneratingParentTip] = useState(false);

    // Onboarding state
    const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean>(false);
    const [isOnboardingModalOpen, setIsOnboardingModalOpen] = useState(false);
    const [examLevel, setExamLevel] = useState<ExamLevel>(() =>
        getInitialState('examLevel', 'VWO') as ExamLevel
    );

    const { user, firebaseUser, isAuthenticated, isLoading: isAuthLoading, loginWithRedirect, logout } = useAuth0();

    const xpForNextLevel = 100 * level;
    const currentData = subjectData[currentSubject] || initialSubjectData[currentSubject];

    const questions = (() => {
        switch (currentSubject) {
            case 'Nederlands': return dutchExamQuestions;
            case 'Engels': return englishExamQuestions;
            case 'Natuurkunde': return natuurkundeExamQuestions;
            case 'Biologie': return biologieExamQuestions;
            case 'Economie': return economieExamQuestions;
            case 'Geschiedenis': return geschiedenisExamQuestions;
            case 'Scheikunde': return scheikundeExamQuestions;
            case 'Bedrijfseconomie': return bedrijfseconomieExamQuestions;
            case 'Wiskunde A': return wiskundeAExamQuestions;
            case 'Wiskunde B': return wiskundeBExamQuestions;
            case 'Frans': return fransExamQuestions;
            case 'Duits': return duitsExamQuestions;
            default: return [];
        }
    })();

    const freeQuestionIds = (() => {
        switch (currentSubject) {
            case 'Nederlands': return FREE_QUESTION_IDS_NL;
            case 'Engels': return FREE_QUESTION_IDS_EN;
            case 'Natuurkunde': return FREE_QUESTION_IDS_NK;
            case 'Biologie': return FREE_QUESTION_IDS_BIO;
            case 'Economie': return FREE_QUESTION_IDS_ECO;
            case 'Geschiedenis': return FREE_QUESTION_IDS_GS;
            case 'Scheikunde': return FREE_QUESTION_IDS_SK;
            case 'Bedrijfseconomie': return FREE_QUESTION_IDS_BECO;
            case 'Wiskunde A': return FREE_QUESTION_IDS_WISA;
            case 'Wiskunde B': return FREE_QUESTION_IDS_WISB;
            case 'Frans': return FREE_QUESTION_IDS_FR;
            case 'Duits': return FREE_QUESTION_IDS_DE;
            default: return [];
        }
    })();

    // Handle Daily Quest Generation (and fixes incorrect placeholders)
    const handleGenerateDailyQuests = useCallback(() => {
        const today = getTodayISO();

        // CRITICAL FIX: Check if quests for today already exist and are valid to prevent infinite loops
        const existingQuests = subjectData[currentSubject]?.dailyQuests;
        if (existingQuests && existingQuests.date === today) {
            // Verify if they are "bad" data
            const hasBadData = existingQuests.quests.some(q =>
                q.description.toLowerCase().includes('gevechten') ||
                q.description.toLowerCase().includes('kruiden') ||
                q.description.toLowerCase().includes('gerechten')
            );

            // If data is good for today, STOP execution.
            if (!hasBadData) {
                return;
            }
        }

        // Generate 3 random exam-related quests
        const questTemplates = [
            { description: "Beantwoord 5 vragen correct", type: 'answer_questions' as const, target: 5, xp: 50 },
            { description: "Gebruik de Zen Zone voor focus", type: 'use_zen_zone' as const, target: 1, xp: 25 },
            { description: "Voltooi een korte herhaling", type: 'do_repetition' as const, target: 1, xp: 35 },
            { description: "Oefen een specifieke vaardigheid", type: 'answer_skill' as const, target: 1, xp: 40 },
            { description: "Start een oefensessie", type: 'answer_questions' as const, target: 1, xp: 30 }
        ];

        // Select 3 random unique quests
        const shuffled = questTemplates.sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, 3).map(q => ({
            ...q,
            current: 0,
            completed: false
        }));

        const newDailyQuests: DailyQuests = {
            date: today,
            quests: selected
        };

        setSubjectData(prev => ({
            ...prev,
            [currentSubject]: {
                ...prev[currentSubject],
                dailyQuests: newDailyQuests
            }
        }));
    }, [currentSubject, subjectData]);

    useEffect(() => {
        // Only trigger if data is missing or bad, logic handled in useCallback
        handleGenerateDailyQuests();
    }, [handleGenerateDailyQuests]);

    const updateQuestProgress = (type: string, amount: number = 1) => {
        if (!currentData.dailyQuests) return;

        setSubjectData(prev => {
            const newData = { ...prev };
            const quests = newData[currentSubject].dailyQuests;
            if (quests) {
                let earnedXp = 0;
                quests.quests = quests.quests.map(q => {
                    if (!q.completed && q.type === type) {
                        const newCurrent = q.current + amount;
                        if (newCurrent >= q.target) {
                            earnedXp += q.xp;
                            return { ...q, current: newCurrent, completed: true };
                        }
                        return { ...q, current: newCurrent };
                    }
                    return q;
                });
                if (earnedXp > 0) {
                    // This will be handled by the effect on XP change or manually add XP
                    // For simplicity we add XP directly here but need to ensure setXp is accessible or call addXp via a side effect
                    // Direct state update for XP in this scope:
                    setTimeout(() => addXp(earnedXp), 0);
                }
            }
            return newData;
        });
    };

    // Load user data from Firestore on authentication
    const [isLoadingUserData, setIsLoadingUserData] = useState(false);
    const [firestoreUserId, setFirestoreUserId] = useState<string | null>(null);

    useEffect(() => {
        const loadUserData = async () => {
            if (isAuthenticated && user && !isLoadingUserData) {
                const userId = getUserIdFromAuth(user as any);
                if (!userId || userId === firestoreUserId) return;

                setIsLoadingUserData(true);
                setFirestoreUserId(userId);

                try {
                    const { data, isNewUser } = await loadAndMergeUserData(
                        userId,
                        user.email,
                        user.name
                    );

                    if (data && !isNewUser) {
                        // Load server data into state
                        if (data.level) setLevel(data.level);
                        if (data.xp !== undefined) setXp(data.xp);
                        if (data.studyStreak !== undefined) setStudyStreak(data.studyStreak);
                        if (data.earnedBadges) setEarnedBadges(data.earnedBadges);
                        if (data.subjectData && Object.keys(data.subjectData).length > 0) {
                            setSubjectData(prev => ({ ...prev, ...data.subjectData }));
                        }
                        if (data.globalPulseCheck) setGlobalPulseCheck(data.globalPulseCheck);
                        if (data.subscriptionTier) {
                            setSubscriptionTier(data.subscriptionTier);
                        } else if (data.isPremium !== undefined) {
                            // Legacy migration: convert boolean to tier
                            setSubscriptionTier(data.isPremium ? 'focus' : 'free');
                        }
                        if (data.primarySubject) setPrimarySubject(data.primarySubject);
                        console.log("📥 User data loaded from Firestore");
                    }
                } catch (error) {
                    console.error("Failed to load user data:", error);
                } finally {
                    setIsLoadingUserData(false);
                }
            }
        };

        loadUserData();
    }, [isAuthenticated, user]);

    // Check for payment success on mount
    useEffect(() => {
        const { success, sessionId } = checkPendingPayment();
        if (success && sessionId) {
            console.log("🎉 Payment success detected!");
            // Default to 'focus' when returning from Stripe without specific plan info
            const returnedPlan = sessionStorage.getItem('pending_plan') as 'focus' | 'totaal' || 'focus';
            setSubscriptionTier(returnedPlan);
            sessionStorage.removeItem('pending_plan');

            // Update Firestore with subscription tier
            const userId = getUserIdFromAuth(user as any);
            if (userId) {
                updateSubscriptionTier(userId, returnedPlan);
            }
        }
    }, [user]);

    // Debounced sync to Firestore when data changes
    useEffect(() => {
        const userId = getUserIdFromAuth(user as any);
        if (!userId || !isAuthenticated) return;

        const dataToSync = prepareDataForSync({
            level,
            xp,
            studyStreak,
            earnedBadges,
            subjectData,
            globalPulseCheck,
            isPremium,
            subscriptionTier,
            primarySubject,
        });

        debouncedSync(userId, dataToSync);
    }, [level, xp, studyStreak, earnedBadges, subjectData, globalPulseCheck, isPremium, subscriptionTier, primarySubject, user, isAuthenticated]);

    useEffect(() => {
        if (!isAuthLoading) {
            if (isAuthenticated && firebaseUser) {
                // Check user-specific onboarding status
                const userOnboardingKey = `onboarding_done_${firebaseUser.uid}`;
                const userDoneOnboarding = localStorage.getItem(userOnboardingKey) === 'true';
                setHasCompletedOnboarding(userDoneOnboarding);

                if (!userDoneOnboarding) {
                    // New user — show onboarding
                    setIsOnboardingModalOpen(true);
                    setCurrentScreen('DASHBOARD');
                } else {
                    // Returning user — load their level
                    const savedLevel = localStorage.getItem(`examLevel_${firebaseUser.uid}`);
                    if (savedLevel) {
                        try { setExamLevel(JSON.parse(savedLevel) as ExamLevel); } catch (e) { }
                    }
                    if (currentScreen === 'WELCOME') setCurrentScreen(activeSession ? 'QUESTION' : 'DASHBOARD');
                }
            } else if (!isAuthenticated) {
                if (currentScreen !== 'WELCOME') setCurrentScreen('WELCOME');
            }
        }
    }, [isAuthenticated, isAuthLoading, firebaseUser]);

    useEffect(() => { localStorage.setItem('subjectData', JSON.stringify(subjectData)); }, [subjectData]);
    useEffect(() => { localStorage.setItem('level', JSON.stringify(level)); }, [level]);
    useEffect(() => { localStorage.setItem('xp', JSON.stringify(xp)); }, [xp]);
    useEffect(() => { localStorage.setItem('isPremium', JSON.stringify(isPremium)); localStorage.setItem('subscriptionTier', JSON.stringify(subscriptionTier)); }, [subscriptionTier]);
    useEffect(() => { localStorage.setItem('primarySubject', JSON.stringify(primarySubject)); }, [primarySubject]);
    useEffect(() => { localStorage.setItem('chatUsage', JSON.stringify(chatUsage)); }, [chatUsage]);
    useEffect(() => { localStorage.setItem('dailyAnswers', JSON.stringify(dailyAnswers)); }, [dailyAnswers]);
    useEffect(() => { localStorage.setItem('earnedBadges', JSON.stringify(earnedBadges)); }, [earnedBadges]);
    useEffect(() => { localStorage.setItem('globalPulseCheck', JSON.stringify(globalPulseCheck)); }, [globalPulseCheck]);
    useEffect(() => {
        localStorage.setItem('theme', JSON.stringify(theme));
        document.body.setAttribute('data-theme', theme);
    }, [theme]);

    useEffect(() => {
        if (activeSession) localStorage.setItem('activeSession', JSON.stringify(activeSession));
        else localStorage.removeItem('activeSession');
    }, [activeSession]);

    useEffect(() => {
        if (currentQuestion) localStorage.setItem('currentQuestion', JSON.stringify(currentQuestion));
        else localStorage.removeItem('currentQuestion');
    }, [currentQuestion]);

    useEffect(() => { localStorage.setItem('sessionQuestionCount', JSON.stringify(sessionQuestionCount)); }, [sessionQuestionCount]);
    useEffect(() => { localStorage.setItem('sessionMistakeCount', JSON.stringify(sessionMistakeCount)); }, [sessionMistakeCount]);

    // Real-time date check for long running sessions to reset counters at midnight
    useEffect(() => {
        const interval = setInterval(() => {
            const today = getTodayISO();
            if (dailyAnswers.date !== today) {
                setDailyAnswers({ count: 0, date: today });
            }
            if (chatUsage.date !== today) {
                setChatUsage({ count: 0, date: today });
            }
        }, 60000); // Check every minute
        return () => clearInterval(interval);
    }, [dailyAnswers.date, chatUsage.date]);

    const addXp = useCallback((amount: number) => {
        setXp(currentXp => {
            let newXp = currentXp + amount;
            let newLevel = level;
            while (newXp >= 100 * newLevel) { newXp -= 100 * newLevel; newLevel++; }
            if (newLevel > level) setLevel(newLevel);
            return newXp;
        });
    }, [level]);

    const awardBadge = useCallback((badgeId: string) => {
        setEarnedBadges(prev => !prev.includes(badgeId) ? [...prev, badgeId] : prev);
    }, []);

    const updateStudyStreak = useCallback(() => {
        const today = new Date().toDateString();
        const lastVisit = getInitialState('lastVisitDate', null);
        let currentStreak = getInitialState('studyStreak', 0);

        if (lastVisit !== today) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            if (lastVisit === yesterday.toDateString()) { currentStreak++; addXp(25); } else { currentStreak = 1; }
            localStorage.setItem('studyStreak', JSON.stringify(currentStreak));
            localStorage.setItem('lastVisitDate', JSON.stringify(today));
        }
        setStudyStreak(currentStreak);
    }, [addXp]);

    useEffect(() => {
        updateStudyStreak();
    }, [updateStudyStreak]);

    // PULSE CHECK LOGICA
    useEffect(() => {
        if (currentScreen === 'DASHBOARD' && isAuthenticated && !activeSession) {
            const [year, week] = getWeekNumber(new Date());
            const needsCheck = !globalPulseCheck || globalPulseCheck.year !== year || globalPulseCheck.week !== week;

            if (needsCheck) {
                const timer = setTimeout(() => setIsPulseCheckModalOpen(true), 5000);
                return () => clearTimeout(timer);
            }
        }
    }, [currentScreen, isAuthenticated, globalPulseCheck, activeSession]);

    const calculateRepetitionQueue = useCallback(() => {
        const today = getTodayISO();
        if (currentData && currentData.mistakes) {
            const dueMistakes = currentData.mistakes.filter(m => m.nextReviewDate <= today);
            setRepetitionQueue(dueMistakes);
        } else {
            setRepetitionQueue([]);
        }
    }, [currentData]);

    useEffect(() => { calculateRepetitionQueue(); }, [calculateRepetitionQueue, currentSubject]);

    const handleWelcomeContinue = () => {
        if (isAuthenticated) {
            // Check if this is a new user who needs onboarding
            if (!hasCompletedOnboarding) {
                setIsOnboardingModalOpen(true);
            } else {
                setCurrentScreen('DASHBOARD');
            }
        } else {
            setIsAuthModalOpen(true);
        }
    };

    const openUpgradeModal = (reason: string) => {
        setUpgradeModalReason(reason);
        setIsUpgradeModalOpen(true);
    };

    const handleSelectPlan = (plan: 'focus' | 'totaal') => {
        setSelectedPlan(plan);
        setIsUpgradeModalOpen(false);
        setIsPaymentModalOpen(true);
        // Store pending plan for post-payment redirect
        sessionStorage.setItem('pending_plan', plan);
    };

    const handleGenerateSessionProposal = async (focusSkillOverride?: string) => {
        if (answerLimitReached) {
            openUpgradeModal('om onbeperkt vragen te oefenen.');
            return;
        }
        setIsGeneratingSession(true);
        const masteryScores = currentData.masteryScores || {};
        const weakSkills = Object.entries(masteryScores)
            .filter(([, score]: [string, MasteryScore]) => score.total > 2)
            .map(([skill, score]: [string, MasteryScore]) => ({ skill, score: score.correct / score.total }))
            .sort((a, b) => a.score - b.score);
        const weakestSkill = weakSkills.length > 0 ? weakSkills[0] : null;

        const prompt = `Je bent een expert ${examLevel} ${currentSubject} docent. Maak een korte studiesessie voorstel. JSON output. Focus: ${focusSkillOverride || weakestSkill?.skill || 'Algemeen'}`;

        try {
            const response = await generateContentWithRetry({
                model: MODEL_NAME,
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            focusSkill: { type: Type.STRING },
                            newQuestionsCount: { type: Type.INTEGER },
                            introMessage: { type: Type.STRING },
                        },
                        required: ["focusSkill", "newQuestionsCount", "introMessage"]
                    }
                }
            });
            const proposal = cleanAndParseJSON(response.text || '') as SessionProposal;
            setProposedSession(proposal);
            setIsSessionProposalModalOpen(true);
        } catch (e) {
            alert("Er ging iets mis bij het genereren van je sessie.");
        } finally {
            setIsGeneratingSession(false);
        }
    };

    const handleStartPersonalizedSession = () => {
        if (!proposedSession) return;
        setSessionQuestionCount(0);
        setSessionMistakeCount(0);
        setConsecutiveIncorrectAnswers(0);

        const questionPool = isPremium ? questions : questions.filter(q => freeQuestionIds.includes(q.id));
        const answeredIdsSet = new Set(currentData.answeredIds);
        let availableQuestions = questionPool.filter(q => !answeredIdsSet.has(q.id));
        if (availableQuestions.length === 0 && questionPool.length > 0) availableQuestions = questionPool;

        let sessionQuestions: Question[] = availableQuestions.sort(() => 0.5 - Math.random()).slice(0, proposedSession.newQuestionsCount);

        if (sessionQuestions.length === 0) {
            if (!isPremium) openUpgradeModal('om toegang te krijgen tot meer vragen.');
            else alert("Geen vragen meer beschikbaar.");
            return;
        }

        setActiveSession({ questions: sessionQuestions, currentIndex: 0 });
        setCurrentQuestion(sessionQuestions[0]);
        setCurrentScreen('QUESTION');
        setIsSessionProposalModalOpen(false);
    };

    const handleResetProgress = () => {
        if (window.confirm("Weet je zeker dat je al je voortgang wilt resetten?")) {
            localStorage.clear();
            setSubjectData(initialSubjectData);
            setLevel(1); setXp(0); setStudyStreak(0);
            setGlobalPulseCheck(null);
            setDailyAnswers({ count: 0, date: getTodayISO() });
            setChatUsage({ count: 0, date: getTodayISO() });
            window.location.reload();
        }
    };

    const handleGenerateOrUpdatePlan = async () => {
        if (!currentData.examDate) return;
        setIsGeneratingPlan(true);

        // Calculate weeks until exam
        const today = new Date();
        const examDateObj = new Date(currentData.examDate);
        const weeksUntilExam = Math.max(1, Math.ceil((examDateObj.getTime() - today.getTime()) / (7 * 24 * 60 * 60 * 1000)));
        const planWeeks = Math.min(weeksUntilExam, 12); // Max 12 weken

        // Get exam program for this subject
        const examProgramSummary = getExamProgramSummary(currentSubject, examLevel);

        // Build mastery context
        const masteryContext = Object.entries(currentData.masteryScores || {})
            .filter(([_, score]) => score.total > 0)
            .map(([skill, score]) => `${skill}: ${Math.round((score.correct / score.total) * 100)}%`)
            .join(', ');

        const prompt = `Je bent een expert ${examLevel} ${currentSubject} docent. Maak een gedetailleerd studieplan van ${planWeeks} weken voor een leerling die zich voorbereidt op het Centraal Examen ${currentSubject} ${examLevel} op ${currentData.examDate}.

BELANGRIJK: Het plan MOET gebaseerd zijn op het officiële examenprogramma. Elk domein moet terugkomen in het plan.

=== OFFICIEEL EXAMENPROGRAMMA ${currentSubject.toUpperCase()} ===
${examProgramSummary || 'Geen specifiek programma beschikbaar.'}

${masteryContext ? `=== HUIDIGE BEHEERSING ===
${masteryContext}
Focus extra op zwakke punten.` : ''}

=== INSTRUCTIES ===
- Verdeel ALLE domeinen over de ${planWeeks} weken
- Begin met basisdomeinen, eindig met verdieping en herhaling
- Laatste 1-2 weken: proefexamens en herhaling van zwakke punten
- Elke taak moet specifiek en actionable zijn
- Gebruik de domein-codes (bijv. "B2: Stofwisseling") in de taakbeschrijvingen
- Voeg oefenmomenten toe (bijv. "Start Oefensessie over domein C")
- Maximum 4-5 taken per week

JSON output.`;

        try {
            const response = await generateContentWithRetry({
                model: MODEL_NAME,
                contents: prompt,
                config: { responseMimeType: "application/json", responseSchema: { type: Type.OBJECT, properties: { weeks: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { week_number: { type: Type.INTEGER }, theme: { type: Type.STRING }, tasks: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { description: { type: Type.STRING }, completed: { type: Type.BOOLEAN } }, required: ["description", "completed"] } } }, required: ["week_number", "theme", "tasks"] } } }, required: ["weeks"] } }
            });
            const plan = cleanAndParseJSON(response.text || '') as StudyPlan;

            // Inject static info tasks into the first week
            if (plan && plan.weeks.length > 0) {
                const infoTasks: PlannerTask[] = [
                    { description: "📋 Bekijk het officiële examenprogramma en de syllabus", completed: false, infoType: 'syllabus' },
                    { description: "📊 Overzicht van examenonderdelen en weging", completed: false, infoType: 'components' }
                ];
                plan.weeks[0].tasks = [...infoTasks, ...plan.weeks[0].tasks];
            }

            setSubjectData(prev => ({ ...prev, [currentSubject]: { ...prev[currentSubject], studyPlan: plan } }));
        } catch (e) {
            alert("Kon geen plan genereren.");
        } finally {
            setIsGeneratingPlan(false);
        }
    };

    const handleSendMessage = async (message: string) => {
        if (!chatSession.current || chatLimitReached) return;
        const newHistory = [...chatHistory, { role: 'user', text: message } as ChatMessage];
        setChatHistory(newHistory);
        setIsSendingMessage(true);
        if (!isPremium) setChatUsage(prev => ({ ...prev, count: prev.count + 1 }));

        try {
            const result = await chatSession.current.sendMessage({ message });
            setChatHistory([...newHistory, { role: 'model', text: result.text } as ChatMessage]);
        } catch (e) {
            setChatHistory([...newHistory, { role: 'model', text: "Fout bij verzenden." } as ChatMessage]);
        } finally { setIsSendingMessage(false); }
    };

    const handlePulseCheckSubmit = (rating: number, focus: string) => {
        const [year, week] = getWeekNumber(new Date());
        setGlobalPulseCheck({ year, week });
        if (rating > 0) {
            setSubjectData(prev => ({
                ...prev,
                [currentSubject]: {
                    ...prev[currentSubject],
                    lastPulseCheck: { year, week },
                    moodHistory: [
                        ...(prev[currentSubject].moodHistory || []),
                        { year, week, rating, focus }
                    ]
                }
            }));
        }
        setIsPulseCheckModalOpen(false);
    };

    const handleAnswerSubmit = async (answer: string) => {
        if (!currentQuestion || !activeSession) return;
        setCurrentScreen('LOADING');

        // Update daily quests
        updateQuestProgress('answer_questions');

        if (!isPremium) {
            const today = getTodayISO();
            setDailyAnswers(prev => ({ count: prev.date === today ? prev.count + 1 : 1, date: today }));
        }

        // Timeout wrapper for API calls
        const withTimeout = <T,>(promise: Promise<T>, timeoutMs: number): Promise<T> => {
            return Promise.race([
                promise,
                new Promise<T>((_, reject) =>
                    setTimeout(() => reject(new Error('API Timeout')), timeoutMs)
                )
            ]);
        };

        let isCorrect = false;
        if (currentQuestion.vraag_type === 'Meerkeuzevraag') {
            isCorrect = answer.trim().toLowerCase() === currentQuestion.correct_option?.trim().toLowerCase();
        } else {
            try {
                const gradingPrompt = `Beoordeel antwoord: "${answer}". Vraag: "${currentQuestion.vraag_tekst}". Model: "${currentQuestion.correctie_model}". Geef alleen "CORRECT" of "INCORRECT".`;
                const gradingResponse = await withTimeout(
                    generateContentWithRetry({ model: MODEL_NAME, contents: gradingPrompt }),
                    10000 // 10 second timeout for grading
                );
                isCorrect = (gradingResponse.text || '').trim().toUpperCase().includes('CORRECT');
            } catch (e) {
                console.error("Grading failed:", e);
                isCorrect = answer.length > 5; // Fallback: assume correct if longer answer
            }
        }

        // Robuuste AI Feedback Generatie met Schema
        let aiFeedbackData: AiFeedback = {
            positive_reinforcement: isCorrect ? "Uitstekend!" : "Goed geprobeerd!",
            core_mistake: "",
            detailed_explanation: currentQuestion.correctie_model
        };

        try {
            const feedbackPrompt = `Je bent een vriendelijke, behulpzame docent. Beoordeel dit antwoord van een ${examLevel} leerling.
        
        Vraag: "${currentQuestion.vraag_tekst}"
        Correct antwoord/Model: "${currentQuestion.correctie_model}"
        Antwoord van leerling: "${answer}"
        
        Geef JSON terug met:
        - positive_reinforcement: Een korte, motiverende zin.
        - core_mistake: (Alleen invullen als het fout is) Wat is de kernfout? Anders leeg laten.
        - detailed_explanation: Een duidelijke uitleg waarom het antwoord goed of fout is, en wat het volledige juiste antwoord is.`;

            const feedbackResponse = await withTimeout(
                generateContentWithRetry({
                    model: MODEL_NAME,
                    contents: feedbackPrompt,
                    config: {
                        responseMimeType: 'application/json',
                        responseSchema: {
                            type: Type.OBJECT,
                            properties: {
                                positive_reinforcement: { type: Type.STRING },
                                core_mistake: { type: Type.STRING },
                                detailed_explanation: { type: Type.STRING },
                            },
                            required: ["positive_reinforcement", "detailed_explanation"]
                        }
                    }
                }),
                15000 // 15 second timeout for feedback
            );

            const parsedData = cleanAndParseJSON(feedbackResponse.text || '');
            if (parsedData) {
                // Merge om defaults te behouden indien keys ontbreken (hoewel required hierboven helpt)
                aiFeedbackData = { ...aiFeedbackData, ...parsedData };
            }
        } catch (e) {
            console.error("Fout bij genereren feedback:", e);
            // Fallback blijft behouden - ALWAYS continue to feedback screen
        }

        addXp(isCorrect ? 25 : 10);
        setConsecutiveIncorrectAnswers(isCorrect ? 0 : consecutiveIncorrectAnswers + 1);

        setSubjectData(prev => {
            const newSubjectData = { ...prev };
            const data = newSubjectData[currentSubject];
            const skill = currentQuestion.kern_vaardigheid;
            if (!data.masteryScores[skill]) data.masteryScores[skill] = { correct: 0, total: 0 };
            if (isCorrect) data.masteryScores[skill].correct++;
            data.masteryScores[skill].total++;
            if (!isCorrect && !data.mistakes.some(m => m.questionId === currentQuestion.id)) {
                data.mistakes.push({
                    questionId: currentQuestion.id, userAnswer: answer, aiFeedback: aiFeedbackData.detailed_explanation,
                    repetitionLevel: 0, nextReviewDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
                });
            }
            data.answeredIds.push(currentQuestion.id);
            return newSubjectData;
        });

        setLastAnswer({ isCorrect, question: currentQuestion, aiFeedback: aiFeedbackData, mindsetTip: '', xpGained: isCorrect ? 25 : 10, userAnswer: answer });
        if (!isCorrect && consecutiveIncorrectAnswers >= 2) setIsBurnoutGuardModalOpen(true);

        const nextIndex = activeSession.currentIndex + 1;
        setNextQuestion(nextIndex < activeSession.questions.length ? activeSession.questions[nextIndex] : null);
        setSessionQuestionCount(prev => prev + 1);

        // GUARANTEED transition to feedback screen
        setCurrentScreen('FEEDBACK');
    };

    const handleNextQuestion = () => {
        if (!activeSession) return;
        const nextIndex = activeSession.currentIndex + 1;
        if (nextQuestion) {
            setActiveSession({ ...activeSession, currentIndex: nextIndex });
            setCurrentQuestion(nextQuestion);
            setCurrentScreen('QUESTION');
            setNextQuestion(null);
        } else { setCurrentScreen('DASHBOARD'); setActiveSession(null); }
    };

    const handleExplainConcept = async () => {
        if (!lastAnswer.question) return;
        const concept = lastAnswer.question.kern_vaardigheid;
        setConceptToExplain(lastAnswer.question);
        setIsConceptModalOpen(true);
        setIsGeneratingExplanation(true);
        setConceptExplanation('');

        try {
            const prompt = `Leg het concept "${concept}" uit aan een ${examLevel}-leerling in de context van het vak ${currentSubject}.
        Gebruik de volgende vraag als voorbeeldcontext (zonder het antwoord voor te zeggen): "${lastAnswer.question.vraag_tekst}".
        Houd het beknopt, helder en praktisch.`;

            const response = await generateContentWithRetry({ model: MODEL_NAME, contents: prompt });
            setConceptExplanation(response.text || 'Uitleg niet beschikbaar.');
        } catch (e) {
            setConceptExplanation("Kon de uitleg niet genereren.");
        } finally {
            setIsGeneratingExplanation(false);
        }
    };

    const handleExplainEli5 = async (text: string): Promise<string> => {
        try {
            const prompt = `Herschrijf de volgende uitleg zodat een 10-jarige het begrijpt (ELI5), maar behoud de correcte terminologie waar nodig: "${text}"`;
            const response = await generateContentWithRetry({ model: MODEL_NAME, contents: prompt });
            return response.text || 'Eenvoudigere uitleg niet beschikbaar.';
        } catch (e) {
            return "Kon geen eenvoudigere uitleg genereren.";
        }
    };

    const handleAnalyzeThinkingProcess = () => {
        if (!lastAnswer.question) return;
        setThinkingProcessQuestion({
            question: lastAnswer.question,
            userAnswer: lastAnswer.userAnswer
        });
        setIsThinkingProcessModalOpen(true);
    };

    const processThinkingAnalysis = async (reflections: { deconstruction: string; reasoning: string; }): Promise<string> => {
        const prompt = `Analyseer het denkproces van deze leerling.
    Vraag: ${thinkingProcessQuestion?.question.vraag_tekst}
    Correct Antwoord: ${thinkingProcessQuestion?.question.correctie_model}
    Leerling Deconstructie: ${reflections.deconstruction}
    Leerling Redenering: ${reflections.reasoning}

    Geef feedback op waar de redenering goed ging of waar er een logische fout is gemaakt. Wees opbouwend.`;

        const response = await generateContentWithRetry({ model: MODEL_NAME, contents: prompt });
        return response.text || 'Analyse niet beschikbaar.';
    };

    const handleChatAboutQuestion = () => {
        if (!chatSession.current) {
            chatSession.current = ai.chats.create({ model: MODEL_NAME });
        }
        const contextMsg = `Ik heb een vraag over deze opgave: "${lastAnswer.question?.vraag_tekst}". Mijn antwoord was: "${lastAnswer.userAnswer}". Het juiste antwoord is: "${lastAnswer.question?.correctie_model}". Kun je me helpen begrijpen waarom?`;

        // Open chat modal first to prevent UI freeze feeling
        setIsChatOpen(true);

        // Send initial context message slightly delayed to ensure modal is mounted and session ready
        setTimeout(() => {
            handleSendMessage(contextMsg);
        }, 100);
    };

    const handleGetAnalogy = async (explanation: string, question: Question): Promise<string> => {
        try {
            const prompt = `Geef een heldere analogie of vergelijking uit het dagelijks leven om dit concept uit te leggen: "${question.kern_vaardigheid}". Context: ${explanation}`;
            const response = await generateContentWithRetry({ model: MODEL_NAME, contents: prompt });
            return response.text || 'Analogie niet beschikbaar.';
        } catch (e) { return "Geen analogie beschikbaar."; }
    };

    // Nieuwe handler voor planner acties
    const handlePlannerAction = (weekIndex: number, taskIndex: number, actionType: string, context?: string) => {
        switch (actionType) {
            case 'start_session':
                handleGenerateSessionProposal(context);
                break;
            case 'generate_questions':
                if (!chatSession.current) chatSession.current = ai.chats.create({ model: MODEL_NAME });
                setIsChatOpen(true);
                setTimeout(() => handleSendMessage(`Genereer 5 oefenvragen voor ${currentSubject} over het onderwerp: ${context || 'Algemeen'}`), 100);
                break;
            case 'repetition':
                setCurrentScreen('REPETITION');
                break;
            case 'analyze_mistakes':
                // Fallback if no specific logic
                if (!chatSession.current) chatSession.current = ai.chats.create({ model: MODEL_NAME });
                setIsChatOpen(true);
                setTimeout(() => handleSendMessage("Help me mijn recente fouten te analyseren."), 100);
                break;
            case 'zen_zone':
                setIsZenZoneOpen(true);
                break;
            case 'chat_ai':
                if (!chatSession.current) chatSession.current = ai.chats.create({ model: MODEL_NAME });
                setIsChatOpen(true);
                break;
            default:
                console.log("Onbekende actie:", actionType);
        }
    };

    const handleShowInfo = (infoType: 'syllabus' | 'components') => {
        const info = examInfo[currentSubject]?.[infoType];
        if (info) {
            setInfoModalData(info);
            setIsInfoModalOpen(true);
        }
    };

    if (isAuthLoading) return <><GlobalStyles /><LoadingCard /></>;

    return (
        <>
            <GlobalStyles />
            <div className={`app-wrapper ${currentScreen === 'QUESTION' || currentScreen === 'EXAM_SIMULATION' ? 'focus-mode' : ''}`}>

                {currentScreen === 'WELCOME' && (
                    <Welcome
                        onContinue={handleWelcomeContinue}
                        onTerms={() => setCurrentScreen('TERMS')}
                        onPrivacy={() => setCurrentScreen('PRIVACY')}
                        onPricing={() => setCurrentScreen('PRICING')}
                    />
                )}

                {currentScreen === 'TERMS' && (
                    <TermsPage onBack={() => setCurrentScreen('WELCOME')} />
                )}

                {currentScreen === 'PRIVACY' && (
                    <PrivacyPage onBack={() => setCurrentScreen('WELCOME')} />
                )}

                {currentScreen === 'PRICING' && (
                    <PricingPage
                        onBack={() => setCurrentScreen(isAuthenticated ? 'DASHBOARD' : 'WELCOME')}
                        onUpgrade={(plan) => {
                            handleSelectPlan(plan);
                            setCurrentScreen(isAuthenticated ? 'DASHBOARD' : 'WELCOME');
                        }}
                        isPremium={isPremium}
                        currentTier={subscriptionTier}
                    />
                )}

                {currentScreen === 'OUDER_DASHBOARD' && (
                    <OuderDashboard
                        onBack={() => setCurrentScreen('DASHBOARD')}
                        studentName={user?.name || 'Leerling'}
                        stats={{
                            hoursThisWeek: Math.round((dailyAnswers.count || 0) * 0.1),
                            averageScore: Object.values(currentData.masteryScores).length > 0
                                ? Math.round(Object.values(currentData.masteryScores).reduce((sum, s) => sum + (s.total > 0 ? (s.correct / s.total) * 100 : 0), 0) / Math.max(1, Object.values(currentData.masteryScores).length))
                                : 0,
                            activeSubjects: [currentSubject],
                            lastActive: new Date().toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long' }),
                            totalQuestions: Object.values(currentData.masteryScores).reduce((sum, s) => sum + s.total, 0),
                            streak: studyStreak,
                        }}
                    />
                )}

                {currentScreen === 'DASHBOARD' && (
                    <Dashboard
                        masteryScores={currentData.masteryScores}
                        onStartSession={handleGenerateSessionProposal}
                        isGeneratingSession={isGeneratingSession}
                        onReset={handleResetProgress}
                        studyStreak={studyStreak}
                        level={level}
                        xp={xp}
                        xpForNextLevel={xpForNextLevel}
                        examDate={currentData.examDate}
                        setExamDate={(date) => setSubjectData(prev => ({ ...prev, [currentSubject]: { ...prev[currentSubject], examDate: date } }))}
                        studyPlan={currentData.studyPlan}
                        generatePlan={handleGenerateOrUpdatePlan}
                        updatePlan={handleGenerateOrUpdatePlan}
                        isGeneratingPlan={isGeneratingPlan}
                        onToggleTask={(wi, ti) => {
                            // Toggle task completion in study plan
                            if (currentData.studyPlan) {
                                const updatedPlan = { ...currentData.studyPlan };
                                if (updatedPlan.weeks[wi] && updatedPlan.weeks[wi].tasks[ti]) {
                                    updatedPlan.weeks[wi].tasks[ti].completed = !updatedPlan.weeks[wi].tasks[ti].completed;
                                    if (updatedPlan.weeks[wi].tasks[ti].completed && !updatedPlan.weeks[wi].tasks[ti].xpAwarded) {
                                        addXp(10);
                                        updatedPlan.weeks[wi].tasks[ti].xpAwarded = true;
                                    }
                                    setSubjectData(prev => ({ ...prev, [currentSubject]: { ...prev[currentSubject], studyPlan: updatedPlan } }));
                                }
                            }
                        }}
                        onReviewWeek={(w) => {
                            // Show week review in info modal
                            setInfoModalData({ title: 'Weekoverzicht', content: `Week ${w.week_number}: ${w.theme}. ${w.tasks.filter(t => t.completed).length}/${w.tasks.length} taken voltooid.` });
                            setIsInfoModalOpen(true);
                        }}
                        onShowInfo={handleShowInfo}
                        onStartActionableTask={handlePlannerAction}
                        repetitionQueue={repetitionQueue}
                        onStartRepetition={() => {
                            setCurrentScreen('REPETITION');
                            updateQuestProgress('do_repetition');
                        }}
                        onOpenChat={() => { chatSession.current = ai.chats.create({ model: MODEL_NAME }); setIsChatOpen(true); }}
                        onOpenChatForQuestionGeneration={() => {
                            chatSession.current = ai.chats.create({ model: MODEL_NAME });
                            setChatHistory([{ role: 'model', text: 'Hi! Ik help je graag met het genereren van oefenvragen. Over welk onderwerp binnen ' + currentSubject + ' wil je vragen genereren?' }]);
                            setIsChatOpen(true);
                        }}
                        onOpenZenZone={() => {
                            setIsZenZoneOpen(true);
                            updateQuestProgress('use_zen_zone');
                        }}
                        isPremium={isPremium}
                        onUpgrade={openUpgradeModal}
                        onAnalyzeMistakes={() => {
                            if (!isPremium) {
                                openUpgradeModal('om toegang te krijgen tot de foutenanalyse.');
                                return;
                            }
                            // Open chat with mistake context
                            chatSession.current = ai.chats.create({ model: MODEL_NAME });
                            const mistakesSummary = currentData.mistakes.slice(0, 5).map(m => m.aiFeedback).join('\n');
                            setChatHistory([{ role: 'model', text: `Ik heb je laatste ${currentData.mistakes.length} fouten geanalyseerd. Hier zijn patronen die ik zie:\n\n${mistakesSummary}\n\nWil je dat ik specifieke fouten uitleg of oefenvragen maak?` }]);
                            setIsChatOpen(true);
                        }}
                        hasMistakes={currentData.mistakes.length > 0}
                        currentSubject={currentSubject}
                        onSubjectChange={setCurrentSubject}
                        answerLimitReached={answerLimitReached}
                        dailyAnswers={dailyAnswers}
                        theme={theme}
                        setTheme={setTheme}
                        allBadges={allBadges}
                        earnedBadges={earnedBadges}
                        dailyQuests={currentData.dailyQuests}
                        onGenerateDailyQuests={handleGenerateDailyQuests}
                        isGeneratingQuests={false}
                        onStartQuest={(q) => {
                            // Start the quest based on its type
                            if (q.type === 'answer_questions') {
                                // Trigger session proposal
                                setIsSessionProposalModalOpen(true);
                            } else if (q.type === 'use_zen_zone') {
                                setIsZenZoneOpen(true);
                            } else if (q.type === 'do_repetition' && repetitionQueue.length > 0) {
                                setCurrentScreen('REPETITION');
                            } else {
                                setIsSessionProposalModalOpen(true);
                            }
                        }}
                        onStartExam={() => setIsExamStartModalOpen(true)}
                        onOpenUploadModal={() => setIsUploadModalOpen(true)}
                        progressHistory={currentData.progressHistory}
                        flashcardDecks={currentData.flashcardDecks}
                        onAddFlashcardDeck={() => {
                            if (!isPremium) {
                                openUpgradeModal('om flashcard decks te maken.');
                                return;
                            }
                            // For now, open chat to create deck
                            chatSession.current = ai.chats.create({ model: MODEL_NAME });
                            setChatHistory([{ role: 'model', text: 'Ik help je een flashcard deck maken! Geef me een onderwerp of plak een samenvatting, dan maak ik er automatisch kaarten van.' }]);
                            setIsChatOpen(true);
                        }}
                        onCreateDeckFromSummary={async () => null}
                        onGenerateProgressAnalysis={async () => "Lekker bezig!"}
                        onOpenAuthModal={() => setIsAuthModalOpen(true)}
                        proactiveInsight={proactiveInsight}
                        onProactiveAction={() => {
                            // Execute the proactive insight's suggested action
                            if (proactiveInsight?.action?.includes('break') || proactiveInsight?.action?.includes('Zen')) {
                                setIsZenZoneOpen(true);
                            } else {
                                setIsSessionProposalModalOpen(true);
                            }
                        }}
                        onShareDeck={() => {
                            // Copy share link to clipboard
                            navigator.clipboard.writeText(window.location.origin + '?shared=deck');
                            alert('Link gekopieerd! (Feature komt binnenkort)');
                        }}
                        squadData={squadData}
                        user={user}
                        onLogout={() => logout()}
                        onLogoClick={() => setCurrentScreen('DASHBOARD')}
                        onOpenSquadOfficeHours={() => {
                            setInfoModalData({ title: 'Squad Office Hours', content: 'Elke woensdag van 16:00-17:00 kun je live vragen stellen aan onze docenten. Link komt binnenkort!' });
                            setIsInfoModalOpen(true);
                        }}
                        onGenerateParentTips={async () => {
                            setIsGeneratingParentTip(true);
                            try {
                                const avgMastery = Object.values(currentData.masteryScores).reduce((sum, s) => sum + (s.correct / Math.max(s.total, 1)), 0) / Math.max(Object.keys(currentData.masteryScores).length, 1);
                                const prompt = `Geef 3 korte tips voor ouders over hoe ze hun kind kunnen ondersteunen bij ${currentSubject}. Het kind heeft een gemiddelde beheersing van ${Math.round(avgMastery * 100)}%. Wees positief en praktisch.`;
                                const response = await generateContentWithRetry({ model: MODEL_NAME, contents: prompt });
                                setParentTip(response.text || 'Moedig je kind aan en vier kleine successen!');
                            } catch {
                                setParentTip('Blijf betrokken bij het leerproces en stel open vragen over wat je kind leert.');
                            } finally {
                                setIsGeneratingParentTip(false);
                            }
                        }}
                        parentTip={parentTip}
                        isGeneratingParentTip={isGeneratingParentTip}
                        onOpenExamPredictor={() => setIsExamPredictorOpen(true)}
                        examLevel={examLevel}
                    />
                )}

                {currentScreen === 'QUESTION' && currentQuestion && (
                    <>
                        <SessionHeader
                            currentQuestion={activeSession?.currentIndex !== undefined ? activeSession.currentIndex + 1 : 1}
                            totalQuestions={activeSession?.questions?.length || 1}
                            subject={currentSubject}
                            onPause={() => {
                                if (window.confirm('Wil je de sessie pauzeren? Je voortgang wordt opgeslagen.')) {
                                    // Save current state and go to dashboard
                                    setCurrentScreen('DASHBOARD');
                                }
                            }}
                            onExit={() => {
                                if (window.confirm('Weet je zeker dat je wilt stoppen? Je kunt later verdergaan.')) {
                                    setActiveSession(null);
                                    setCurrentQuestion(null);
                                    setCurrentScreen('DASHBOARD');
                                }
                            }}
                        />
                        <div style={{ paddingTop: '80px' }}>
                            <QuestionCard
                                question={currentQuestion}
                                allQuestions={questions}
                                onSubmit={handleAnswerSubmit}
                                onGetHint={async () => "Denk aan de kern van de tekst."}
                                onOralPractice={() => {
                                    if (currentQuestion) {
                                        // Open thinking process modal for oral practice
                                        setThinkingProcessQuestion({ question: currentQuestion, userAnswer: '' });
                                        setIsThinkingProcessModalOpen(true);
                                    }
                                }}
                                user={user}
                            />
                        </div>
                    </>
                )}

                {currentScreen === 'LOADING' && <LoadingCard />}

                {currentScreen === 'FEEDBACK' && (
                    <FeedbackCard
                        question={lastAnswer.question}
                        isCorrect={lastAnswer.isCorrect}
                        onNext={nextQuestion ? handleNextQuestion : null}
                        onDashboard={() => { setActiveSession(null); setCurrentScreen('DASHBOARD'); }}
                        inSession={!!activeSession}
                        isLastQuestionInSession={!nextQuestion}
                        feedbackData={{ xpGained: lastAnswer.xpGained, aiFeedback: lastAnswer.aiFeedback, mindsetTip: '' }}
                        onOpenChat={handleChatAboutQuestion}
                        onExplainConcept={handleExplainConcept}
                        onAnalyzeThinkingProcess={handleAnalyzeThinkingProcess}
                        answerLimitReached={answerLimitReached}
                        onUpgrade={() => openUpgradeModal('verder te gaan')}
                        onGetSimplifiedExplanation={handleExplainEli5}
                        onGetAnalogy={handleGetAnalogy}
                    />
                )}

                <ChatModal
                    isOpen={isChatOpen} onClose={() => setIsChatOpen(false)}
                    chatHistory={chatHistory} onSendMessage={handleSendMessage}
                    isSending={isSendingMessage} chatLimitReached={chatLimitReached}
                />

                <UpgradeModal isOpen={isUpgradeModalOpen} onClose={() => setIsUpgradeModalOpen(false)} onUpgrade={handleSelectPlan} reason={upgradeModalReason} currentTier={subscriptionTier} />
                <PaymentModal isOpen={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} selectedPlan={selectedPlan} onPaymentSuccess={(plan) => {
                    setSubscriptionTier(plan);
                    // Force sync subscription tier to Firestore immediately
                    const userId = getUserIdFromAuth(user as any);
                    if (userId) {
                        forceSync(userId, { isPremium: true, subscriptionTier: plan });
                    }
                }} />
                <ZenZoneModal isOpen={isZenZoneOpen} onClose={() => setIsZenZoneOpen(false)} affirmation={affirmation} onGenerateAffirmation={async () => {
                    setIsGeneratingAffirmation(true);
                    try {
                        const prompt = `Genereer een korte, motiverende affirmatie voor een ${examLevel} student die studeert voor ${currentSubject}. Max 2 zinnen. Wees warm en bemoedigend.`;
                        const response = await generateContentWithRetry({ model: MODEL_NAME, contents: prompt });
                        setAffirmation(response.text || 'Je bent sterker dan je denkt. Elke stap telt!');
                    } catch {
                        setAffirmation('Je bent sterker dan je denkt. Elke stap telt!');
                    } finally {
                        setIsGeneratingAffirmation(false);
                    }
                }} isGenerating={isGeneratingAffirmation} />
                <ExamPredictorModal isOpen={isExamPredictorOpen} onClose={() => setIsExamPredictorOpen(false)} subject={currentSubject} examLevel={examLevel} />
                <PulseCheckModal isOpen={isPulseCheckModalOpen} onClose={() => handlePulseCheckSubmit(0, 'skipped')} onSubmit={handlePulseCheckSubmit} subject={currentSubject} userName={user?.name || 'Student'} />
                <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
                <ExamStartModal
                    isOpen={isExamStartModalOpen}
                    onClose={() => setIsExamStartModalOpen(false)}
                    onConfirm={() => {
                        setIsExamStartModalOpen(false);
                        // Start exam simulation with available questions
                        const questionPool = isPremium ? questions : questions.filter(q => freeQuestionIds.includes(q.id));
                        const examQuestions = questionPool
                            .sort(() => Math.random() - 0.5)
                            .slice(0, 20);
                        if (examQuestions.length > 0) {
                            setActiveSession({
                                questions: examQuestions,
                                currentIndex: 0
                            });
                            setCurrentQuestion(examQuestions[0]);
                            setCurrentScreen('EXAM_SIMULATION');
                        } else {
                            openUpgradeModal('om toegang te krijgen tot het proefexamen.');
                        }
                    }}
                    questionCount={20}
                    timeLimitMinutes={60}
                />
                {isSessionProposalModalOpen && <SessionProposalModal isOpen={isSessionProposalModalOpen} onClose={() => setIsSessionProposalModalOpen(false)} onStart={handleStartPersonalizedSession} proposal={proposedSession} />}
                {isInfoModalOpen && <InfoModal isOpen={isInfoModalOpen} onClose={() => setIsInfoModalOpen(false)} title={infoModalData.title} content={infoModalData.content} />}

                <ConceptExplanationModal
                    isOpen={isConceptModalOpen}
                    onClose={() => setIsConceptModalOpen(false)}
                    conceptName={conceptToExplain?.kern_vaardigheid || 'Concept'}
                    explanation={conceptExplanation}
                    isLoading={isGeneratingExplanation}
                    onExplainEli5={handleExplainEli5}
                />

                <ThinkingProcessModal
                    isOpen={isThinkingProcessModalOpen}
                    onClose={() => setIsThinkingProcessModalOpen(false)}
                    questionContext={thinkingProcessQuestion}
                    onAnalyze={processThinkingAnalysis}
                />

                {/* Onboarding Modal for New Users */}
                <OnboardingModal
                    isOpen={isOnboardingModalOpen}
                    onComplete={(data) => {
                        // Save onboarding data with user-specific key
                        setHasCompletedOnboarding(true);
                        if (firebaseUser) {
                            localStorage.setItem(`onboarding_done_${firebaseUser.uid}`, 'true');
                            localStorage.setItem(`examLevel_${firebaseUser.uid}`, JSON.stringify(data.level));
                        }
                        // Also save globally for backwards compatibility
                        localStorage.setItem('hasCompletedOnboarding', JSON.stringify(true));

                        // Save exam level
                        setExamLevel(data.level as ExamLevel);
                        localStorage.setItem('examLevel', JSON.stringify(data.level));

                        // Set user's first subject
                        if (data.subjects.length > 0) {
                            setCurrentSubject(data.subjects[0] as any);
                        }

                        // Set exam date for first subject
                        if (data.examDate && data.subjects.length > 0) {
                            setSubjectData(prev => ({
                                ...prev,
                                [data.subjects[0]]: {
                                    ...prev[data.subjects[0] as keyof typeof prev],
                                    examDate: data.examDate
                                }
                            }));
                        }

                        setIsOnboardingModalOpen(false);
                        setCurrentScreen('DASHBOARD');
                    }}
                    userName={user?.name}
                />
            </div>
        </>
    );
};

export default App;