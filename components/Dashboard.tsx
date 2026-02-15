
import React, { useState, useEffect, useRef } from 'react';
import StudyPlanner from './StudyPlanner.tsx';
import DailyQuests from './DailyQuests.tsx';
import Logo from './Logo.tsx';
import ProgressReport from './ProgressReport.tsx';
import StudySquad from './StudySquad.tsx';
import FlashcardsView from './FlashcardsView.tsx';
import SummaryHub from './SummaryHub.tsx';
import ProactiveGreeting from './ProactiveGreeting.tsx';
import ParentDashboard from './ParentDashboard.tsx';
import { generateContentWithRetry } from '../api/gemini.ts';
import { Type } from "@google/genai";
import type { MasteryScore, StudyPlan, Mistake, PlannerWeek, Badge, DailyQuests as DailyQuestsType, Quest, ProgressHistoryEntry, FlashcardDeck, ChatMessage, User, SquadData } from '../data/data.ts';

type Subject = 'Nederlands' | 'Engels' | 'Natuurkunde' | 'Biologie' | 'Economie' | 'Geschiedenis' | 'Scheikunde' | 'Bedrijfseconomie' | 'Wiskunde A' | 'Wiskunde B' | 'Frans' | 'Duits' | 'Wiskunde' | 'Nask 1' | 'Nask 2' | 'Aardrijkskunde' | 'Maatschappijkunde';
type ExamLevel = 'VMBO' | 'HAVO' | 'VWO';
type DashboardTab = 'sessie' | 'planner' | 'voortgang' | 'squad' | 'flashcards' | 'tools';

interface DashboardProps {
    masteryScores: { [key: string]: MasteryScore };
    onStartSession: (focusSkill?: string) => void;
    isGeneratingSession: boolean;
    onReset: () => void;
    studyStreak: number;
    level: number;
    xp: number;
    xpForNextLevel: number;
    examDate: string;
    setExamDate: (date: string) => void;
    studyPlan: StudyPlan | null;
    generatePlan: () => void;
    updatePlan: () => void;
    isGeneratingPlan: boolean;
    onToggleTask: (weekIndex: number, taskIndex: number) => void;
    onReviewWeek: (week: PlannerWeek) => void;
    onShowInfo: (infoType: 'syllabus' | 'components') => void;
    onStartActionableTask: (weekIndex: number, taskIndex: number, actionType: string, context?: string) => void;
    repetitionQueue: Mistake[];
    onStartRepetition: () => void;
    onOpenChat: (context?: { type: string, data: any } | null, mode?: 'default' | 'question_generation', systemInstructionOverride?: string) => void;
    onOpenChatForQuestionGeneration: () => void;
    onOpenZenZone: () => void;
    isPremium: boolean;
    onUpgrade: (reason: string) => void;
    onAnalyzeMistakes: () => void;
    hasMistakes: boolean;
    currentSubject: Subject;
    examLevel: ExamLevel;
    onSubjectChange: (subject: Subject) => void;
    answerLimitReached: boolean;
    dailyAnswers: { count: number, date: string };
    theme: 'light' | 'dark';
    setTheme: (theme: 'light' | 'dark') => void;
    allBadges: Badge[];
    earnedBadges: string[];
    dailyQuests: DailyQuestsType | null;
    onGenerateDailyQuests: () => void;
    isGeneratingQuests: boolean;
    onStartQuest: (quest: Quest) => void;
    onStartExam: () => void;
    onOpenUploadModal: () => void;
    progressHistory: ProgressHistoryEntry[];
    flashcardDecks: FlashcardDeck[];
    onAddFlashcardDeck: (deck: FlashcardDeck) => void;
    onCreateDeckFromSummary: (summaryText: string) => Promise<FlashcardDeck | null>;
    onGenerateProgressAnalysis: () => Promise<string>;
    onOpenAuthModal: () => void;
    proactiveInsight: { greeting: string; suggestion: string; action: string; context?: string } | null;
    onProactiveAction: (action: string, context?: string) => void;
    onShareDeck: (deck: FlashcardDeck) => void;
    squadData: SquadData;
    user: User | null;
    onLogout: () => void;
    onLogoClick: () => void;
    onOpenSquadOfficeHours: () => void;
    onGenerateParentTips: () => void;
    parentTip: string;
    isGeneratingParentTip: boolean;
    onOpenExamPredictor?: () => void;
}

const DAILY_ANSWER_LIMIT_FREE = 15;

const ThemeToggle = ({ theme, setTheme }: { theme: 'light' | 'dark'; setTheme: (theme: 'light' | 'dark') => void }) => (
    <button
        onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
        className="theme-toggle"
        aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
        {theme === 'light' ?
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
            </svg> :
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5"></circle>
                <line x1="12" y1="1" x2="12" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="23"></line>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                <line x1="1" y1="12" x2="3" y2="12"></line>
                <line x1="21" y1="12" x2="23" y2="12"></line>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
            </svg>
        }
    </button>
);

const Dashboard: React.FC<DashboardProps> = (props) => {
    const {
        masteryScores, onStartSession, isGeneratingSession, onReset, studyStreak, level, xp, xpForNextLevel, examDate, setExamDate, studyPlan, generatePlan, updatePlan, isGeneratingPlan, onToggleTask, onReviewWeek, onShowInfo, onStartActionableTask, repetitionQueue, onStartRepetition, onOpenChat, onOpenChatForQuestionGeneration, onOpenZenZone, isPremium, onUpgrade, onAnalyzeMistakes, hasMistakes, currentSubject, onSubjectChange, answerLimitReached, dailyAnswers, theme, setTheme, allBadges, earnedBadges, dailyQuests, onGenerateDailyQuests, isGeneratingQuests, onStartQuest, onStartExam, onOpenUploadModal, progressHistory, flashcardDecks, onAddFlashcardDeck, onCreateDeckFromSummary, onGenerateProgressAnalysis, onOpenAuthModal, proactiveInsight, onProactiveAction, onShareDeck, squadData, user, onLogout, onLogoClick, onOpenSquadOfficeHours, onGenerateParentTips, parentTip, isGeneratingParentTip, onOpenExamPredictor, examLevel
    } = props;

    const [activeTab, setActiveTab] = useState<DashboardTab>('sessie');
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isSubjectPickerOpen, setIsSubjectPickerOpen] = useState(false);
    const profileRef = useRef<HTMLDivElement>(null);
    const subjectPickerRef = useRef<HTMLDivElement>(null);

    const xpPercentage = xpForNextLevel > 0 ? Math.round((xp / xpForNextLevel) * 100) : 0;

    const SUBJECTS_BY_LEVEL: Record<ExamLevel, Subject[]> = {
        'VWO': ['Nederlands', 'Engels', 'Wiskunde A', 'Wiskunde B', 'Natuurkunde', 'Scheikunde', 'Biologie', 'Economie', 'Bedrijfseconomie', 'Geschiedenis', 'Frans', 'Duits'],
        'HAVO': ['Nederlands', 'Engels', 'Wiskunde A', 'Wiskunde B', 'Natuurkunde', 'Scheikunde', 'Biologie', 'Economie', 'Bedrijfseconomie', 'Geschiedenis', 'Frans', 'Duits'],
        'VMBO': ['Nederlands', 'Engels', 'Wiskunde', 'Nask 1', 'Nask 2', 'Biologie', 'Economie', 'Geschiedenis', 'Aardrijkskunde', 'Duits', 'Maatschappijkunde'],
    };
    const subjects: Subject[] = SUBJECTS_BY_LEVEL[examLevel] || SUBJECTS_BY_LEVEL['VWO'];
    const subjectIcons: { [key in Subject]: string } = {
        'Nederlands': '📖', 'Engels': '🇬🇧', 'Wiskunde A': '📐', 'Wiskunde B': '∫', 'Natuurkunde': '⚛️', 'Scheikunde': '🧪', 'Biologie': '🧬', 'Economie': '📈', 'Bedrijfseconomie': '💼', 'Geschiedenis': '🏛️', 'Frans': '🇫🇷', 'Duits': '🇩🇪', 'Wiskunde': '📐', 'Nask 1': '⚛️', 'Nask 2': '🧪', 'Aardrijkskunde': '🌍', 'Maatschappijkunde': '🏘️'
    };

    const getTodayISO = () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return today.toISOString().split('T')[0];
    }

    useEffect(() => {
        const today = getTodayISO();
        if (!dailyQuests || dailyQuests.date !== today) {
            onGenerateDailyQuests();
        }
    }, [dailyQuests, onGenerateDailyQuests, currentSubject]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
                setIsProfileOpen(false);
            }
            if (subjectPickerRef.current && !subjectPickerRef.current.contains(event.target as Node)) {
                setIsSubjectPickerOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [profileRef, subjectPickerRef]);

    const handleMagicCreateDeck = async (title: string, keywords: string): Promise<FlashcardDeck | null> => {
        const prompt = `Genereer een flashcard deck voor VWO ${currentSubject}.
        - Titel: "${title}"
        - Sleutelwoorden: "${keywords}"

        TAAK: Maak een JSON object met een "cards" array. Elke kaart heeft een "question" en "answer". Genereer 5-7 relevante kaarten. De "question" moet een kernbegrip dat relevant is voor het VWO eindexamen. Het "answer" moet de definitie of uitleg zijn zoals een leerling die moet kennen voor het examen. Zorg voor duidelijke, beknopte vragen en antwoorden.`;
        try {
            const response = await generateContentWithRetry({
                model: 'gemini-2.0-flash',
                contents: prompt,
                config: {
                    responseMimeType: 'application/json',
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            cards: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        question: { type: Type.STRING },
                                        answer: { type: Type.STRING },
                                    },
                                    required: ["question", "answer"]
                                }
                            }
                        },
                        required: ["cards"]
                    }
                }
            });
            const deckData = JSON.parse(response.text || '{"cards":[]}')
            const newDeck: FlashcardDeck = {
                id: Date.now(),
                title,
                cards: deckData.cards
            };
            onAddFlashcardDeck(newDeck);
            return newDeck;
        } catch (e) {
            console.error(e);
            return null;
        }
    };

    const totalAnsweredQuestions = Object.values(masteryScores).reduce((sum: number, score: MasteryScore) => sum + score.total, 0);

    const renderContent = () => {
        if (activeTab === 'voortgang') {
            return <ProgressReport
                masteryScores={masteryScores}
                progressHistory={progressHistory}
                onGenerateAnalysis={onGenerateProgressAnalysis}
                allBadges={allBadges}
                earnedBadges={earnedBadges}
            />;
        }
        if (activeTab === 'squad') {
            return <StudySquad squadData={squadData} onUpgrade={onUpgrade} isPremium={isPremium} onOpenSquadOfficeHours={onOpenSquadOfficeHours} />;
        }
        if (activeTab === 'flashcards') {
            return <FlashcardsView decks={flashcardDecks} onAddDeck={onAddFlashcardDeck} onMagicCreate={handleMagicCreateDeck} onShareDeck={onShareDeck} />;
        }


        // Default focused column layout
        return (
            <div className="dashboard-main-column">
                {activeTab === 'sessie' && (
                    <>
                        {proactiveInsight && (
                            <ProactiveGreeting insight={proactiveInsight} onAction={onProactiveAction} />
                        )}

                        {repetitionQueue.length > 0 && (
                            <div className="card">
                                <h3 style={{ marginBottom: '12px' }}>Gespreide Herhaling</h3>
                                <p style={{ margin: 0, color: 'var(--subtle-text)', fontSize: '14px' }}>
                                    Je hebt {repetitionQueue.length} opgave{repetitionQueue.length > 1 ? 's' : ''} klaarstaan om je geheugen te testen.
                                </p>
                                <button className="button button-secondary" onClick={onStartRepetition} style={{ marginTop: '16px' }}>
                                    Start Herhaling ({repetitionQueue.length})
                                </button>
                            </div>
                        )}

                        <div className="dashboard-hero card">
                            <h2 style={{ marginBottom: '12px' }}>Vandaag: Start je Studiesessie</h2>
                            <p style={{ marginBottom: '16px', color: 'var(--subtle-text)' }}>
                                De AI stelt een persoonlijke sessie voor op basis van jouw voortgang.
                            </p>
                            {!isPremium &&
                                <div className="daily-limit-tracker" style={{ marginBottom: '16px' }}>
                                    <span>Dagelijkse vragen: {dailyAnswers.count}/{DAILY_ANSWER_LIMIT_FREE}</span>
                                    <div className="progress-bar" style={{ height: '8px', marginTop: '8px' }}>
                                        <div className="progress-fill skill-progress-fill" style={{ width: `${(dailyAnswers.count / DAILY_ANSWER_LIMIT_FREE) * 100}%` }}></div>
                                    </div>
                                </div>
                            }
                            <button
                                className="button"
                                onClick={() => onStartSession()}
                                disabled={answerLimitReached || isGeneratingSession}
                            >
                                {isGeneratingSession ? 'Sessie voorbereiden...' : (answerLimitReached ? "Dagelijkse Limiet Bereikt" : "Start Oefensessie")}
                            </button>
                        </div>

                        <DailyQuests
                            quests={dailyQuests}
                            onStartQuest={onStartQuest}
                            isLoading={isGeneratingQuests}
                        />
                    </>
                )}

                {activeTab === 'planner' && (
                    <div className="card">
                        <StudyPlanner
                            examDate={examDate}
                            setExamDate={setExamDate}
                            studyPlan={studyPlan}
                            generatePlan={generatePlan}
                            updatePlan={updatePlan}
                            isGenerating={isGeneratingPlan}
                            onToggleTask={onToggleTask}
                            onReviewWeek={onReviewWeek}
                            onShowInfo={onShowInfo}
                            onStartActionableTask={onStartActionableTask}
                            subject={currentSubject}
                            examLevel={examLevel}
                        />
                    </div>
                )}

                {activeTab === 'tools' && (
                    <div className="card">
                        <h3 style={{ marginBottom: '16px' }}>Slimme Tools</h3>
                        <div className="button-grid-vertical">
                            {onOpenExamPredictor && (
                                <button
                                    className="button button-secondary"
                                    onClick={() => isPremium ? onOpenExamPredictor() : onUpgrade("om examenvragen te laten voorspellen door AI.")}
                                    style={{
                                        background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.15), rgba(34, 211, 238, 0.15))',
                                        border: '1px solid rgba(168, 85, 247, 0.3)',
                                    }}
                                >
                                    🔮 Voorspel Examenvragen <span className="pro-badge">PRO</span>
                                </button>
                            )}
                            <button className="button button-secondary" onClick={() => isPremium ? onStartExam() : onUpgrade("om proefexamens te oefenen.")}>
                                Start Proefexamen <span className="pro-badge">PRO</span>
                            </button>
                            {hasMistakes && (
                                <button className="button button-secondary" onClick={() => isPremium ? onAnalyzeMistakes() : onUpgrade("om je fouten te laten analyseren door AI.")}>
                                    Analyseer Mijn Fouten <span className="pro-badge">PRO</span>
                                </button>
                            )}
                            <button className="button button-secondary" onClick={() => isPremium ? onOpenUploadModal() : onUpgrade("om je samenvattingen te laten analyseren door AI.")}>
                                Analyseer je Samenvatting <span className="pro-badge">PRO</span>
                            </button>
                            <button className="button button-secondary" onClick={() => onOpenChat()}>
                                Chat met GLOW AI
                            </button>
                            <button className="button button-secondary" onClick={onOpenChatForQuestionGeneration}>
                                Genereer Oefenvragen
                            </button>
                            <button className="button button-secondary" onClick={onOpenZenZone}>
                                Ga naar de Zen Zone
                            </button>
                        </div>

                        {/* Samenvatting section within Tools */}
                        <div style={{ marginTop: '20px', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '20px' }}>
                            <h4 style={{ marginBottom: '12px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>📝 Samenvattingen</h4>
                            <SummaryHub
                                currentSubject={currentSubject}
                                onOpenChat={onOpenChat}
                                onCreateDeckFromSummary={onCreateDeckFromSummary}
                                onUpgrade={() => onUpgrade("om ongelimiteerde AI-samenvattingen te genereren.")}
                                isPremium={isPremium}
                            />
                        </div>
                    </div>
                )}

            </div>
        );
    };


    return (
        <div className="dashboard-container">
            <header className="app-header">
                <div className="header-left">
                    <div className="dashboard-logo-container" onClick={onLogoClick} style={{ cursor: 'pointer' }}>
                        <Logo style={{ maxWidth: '100%', height: 'auto' }} />
                        {isPremium && <span className="premium-badge">PRO</span>}
                    </div>
                </div>

                <nav className="header-center-nav">
                    <button onClick={() => setActiveTab('sessie')} className={activeTab === 'sessie' ? 'active' : ''}>
                        <span className="nav-icon">📚</span><span className="nav-label">Vandaag</span>
                    </button>
                    <button onClick={() => setActiveTab('planner')} className={activeTab === 'planner' ? 'active' : ''}>
                        <span className="nav-icon">📋</span><span className="nav-label">Planner</span>
                    </button>
                    <button onClick={() => setActiveTab('voortgang')} className={activeTab === 'voortgang' ? 'active' : ''}>
                        <span className="nav-icon">📊</span><span className="nav-label">Voortgang</span>
                    </button>
                    <button onClick={() => setActiveTab('squad')} className={activeTab === 'squad' ? 'active' : ''}>
                        <span className="nav-icon">👥</span><span className="nav-label">Squad</span>
                    </button>
                    <button onClick={() => setActiveTab('flashcards')} className={activeTab === 'flashcards' ? 'active' : ''}>
                        <span className="nav-icon">🃏</span><span className="nav-label">Flashcards</span>
                    </button>
                    <button onClick={() => setActiveTab('tools')} className={activeTab === 'tools' ? 'active' : ''}>
                        <span className="nav-icon">🛠</span><span className="nav-label">Tools</span>
                    </button>
                </nav>

                <div className="header-right">
                    <div className="subject-picker-container" ref={subjectPickerRef}>
                        <button className="subject-picker-trigger" onClick={() => setIsSubjectPickerOpen(!isSubjectPickerOpen)} aria-expanded={isSubjectPickerOpen} aria-haspopup="true">
                            <span className="subject-picker-icon">{subjectIcons[currentSubject] || '📖'}</span>
                            <span>{currentSubject}</span>
                            <span className="level-badge">{examLevel}</span>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M7 10l5 5 5-5z"></path></svg>
                        </button>
                        {isSubjectPickerOpen && (
                            <div className="subject-picker-dropdown">
                                {subjects.map(subject => (
                                    <button
                                        key={subject}
                                        className={`subject-picker-item ${subject === currentSubject ? 'active' : ''}`}
                                        onClick={() => {
                                            onSubjectChange(subject);
                                            setIsSubjectPickerOpen(false);
                                        }}
                                    >
                                        <span className="subject-picker-icon">{subjectIcons[subject]}</span>
                                        {subject}
                                        {subject === currentSubject && <svg className="checkmark-icon" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"></path></svg>}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    {studyStreak > 0 && (
                        <div className="study-streak" title={`${studyStreak} day streak!`}>
                            <svg width="24" height="24" viewBox="0 0 16 16" fill="currentColor">
                                <path d="M8 16c3.314 0 6-2 6-5.5 0-1.5-.5-4-2.5-6 .25 1.5-1.25 2-1.25 2C11 4 9 .5 6 0c.357 2 .5 4-2 6-1.25 1-2 2.729-2 4.5C2 14 4.686 16 8 16Zm0-1c-1.657 0-3-1-3-2.75 0-.75.25-2 1.25-3C6.125 10 7 10.5 7 10.5c-.375-1.25.5-3.25 2-3.5-.179 1-.25 2 1 3 .625.5 1 1.364 1 2.25C11 14 9.657 15 8 15Z" />
                            </svg>
                            <span>{studyStreak}</span>
                        </div>
                    )}
                    <div className="header-xp-progress">
                        <div className="header-xp-info">
                            <span>Niveau {level}</span>
                            <span style={{ color: 'var(--xp-color)' }}>{xp} / {xpForNextLevel}</span>
                        </div>
                        <div className="progress-bar" style={{ height: '6px' }}>
                            <div className="progress-fill xp-progress-fill" style={{ width: `${xpPercentage}%` }}></div>
                        </div>
                    </div>
                    <ThemeToggle theme={theme} setTheme={setTheme} />
                    {user ? (
                        <div className="user-profile" ref={profileRef}>
                            <button className="user-profile-trigger" onClick={() => setIsProfileOpen(!isProfileOpen)} aria-label="Open user menu" aria-expanded={isProfileOpen}>
                                <img src={user.picture} alt={user.name} className="user-avatar" />
                            </button>
                            {isProfileOpen && (
                                <div className="profile-dropdown">
                                    <div className="profile-dropdown-header">
                                        <strong>{user.name}</strong>
                                        <span className="profile-dropdown-email">{user.email}</span>
                                    </div>
                                    {!isPremium && (
                                        <button
                                            onClick={() => { setIsProfileOpen(false); onUpgrade("voor volledige toegang tot alle PRO features."); }}
                                            className="profile-dropdown-button"
                                            style={{
                                                background: 'linear-gradient(135deg, rgba(34, 211, 238, 0.1) 0%, rgba(167, 139, 250, 0.1) 100%)',
                                                color: '#22d3ee',
                                                fontWeight: 600,
                                            }}
                                        >
                                            ⭐ Upgrade naar PRO
                                        </button>
                                    )}
                                    <button
                                        onClick={() => { setIsProfileOpen(false); setActiveTab('sessie'); /* trigger ouderoverzicht from here */ }}
                                        className="profile-dropdown-button"
                                        style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                                    >
                                        👨‍👩‍👧 Ouderoverzicht
                                    </button>
                                    <button onClick={onLogout} className="profile-dropdown-button">
                                        Log uit
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <button className="button-tertiary auth-button" onClick={onOpenAuthModal}>Inloggen</button>
                    )}
                </div>
            </header>

            <div className="dashboard-content-area">
                {renderContent()}
            </div>
        </div>
    );
};

export default Dashboard;
