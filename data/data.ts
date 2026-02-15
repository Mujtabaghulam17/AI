export interface Question {
  id: number;
  examen_id: string;
  vraag_nummer: number;
  tekst_naam: string;
  vraag_passage?: string;
  vraag_tekst: string;
  vraag_type: string;
  kern_vaardigheid: string;
  max_score: number;
  correctie_model: string;
  difficulty: 1 | 2 | 3;
  context_id?: number;
  options?: string[];
  correct_option?: string;
}

export interface AiFeedback {
    positive_reinforcement: string;
    core_mistake: string;
    detailed_explanation: string;
}

export interface MasteryScore {
  correct: number;
  total: number;
}

export interface PlannerTask {
    description: string;
    completed: boolean;
    xpAwarded?: boolean;
    infoType?: 'syllabus' | 'components';
}
export interface PlannerWeek {
    week_number: number;
    theme: string;
    tasks: PlannerTask[];
}
export interface StudyPlan {
    weeks: PlannerWeek[];
}

export interface Mistake {
    questionId: number;
    userAnswer: string;
    aiFeedback: string;
    repetitionLevel: number;
    nextReviewDate: string; 
}

export interface ChatMessage {
    role: 'user' | 'model' | 'system';
    text: string;
}

export interface SessionProposal {
    focusSkill: string;
    newQuestionsCount: number;
    introMessage: string;
}

export interface ActiveSession {
    questions: Question[];
    currentIndex: number;
}

export interface Badge {
    id: string;
    name: string;
    description: string;
    icon: string;
}

export interface MasterySessionContent {
  explanation: string;
  guided_example: {
    question: string;
    thinking_process: string;
  };
  practice_questions: {
    question: string;
    options: string[];
    correct_option: string;
    feedback_correct: string;
    feedback_incorrect: string;
  }[];
  final_tip: string;
}

export interface Quest {
    description: string;
    type: 'answer_questions' | 'answer_skill' | 'do_repetition' | 'use_zen_zone';
    target: number;
    current: number;
    completed: boolean;
    xp: number;
    skill?: string;
}

export interface DailyQuests {
    date: string;
    quests: Quest[];
}

export interface ProgressHistoryEntry {
    date: string;
    avgMastery: number;
}

export interface Flashcard {
    id: number;
    question: string;
    answer: string;
}

export interface FlashcardDeck {
    id: number;
    title: string;
    cards: Flashcard[];
}

export interface MoodEntry {
    week: number;
    year: number;
    rating: number; // 1 to 5
    focus: string;
}

export interface SubjectSpecificData {
    masteryScores: { [key: string]: MasteryScore };
    answeredIds: number[];
    mistakes: Mistake[];
    studyPlan: StudyPlan | null;
    examDate: string;
    dailyQuests: DailyQuests | null;
    progressHistory: ProgressHistoryEntry[];
    flashcardDecks: FlashcardDeck[];
    freeAnalysisUsed: boolean;
    lastPulseCheck?: { week: number; year: number; };
    moodHistory?: MoodEntry[];
}

export interface ExamSimulationState {
    questions: Question[];
    answers: string[];
    currentIndex: number;
    startTime: number;
    flags: boolean[];
}

export interface ExamResult {
    questions: Question[];
    userAnswers: string[];
    results: { isCorrect: boolean; feedback: string; skill: string }[];
    score: number;
    startTime: number;
    endTime: number;
}

export interface User {
  name: string;
  picture: string;
  email?: string;
}

export interface SquadMember {
    id: number;
    name: string;
    rank: number;
    xp: number;
    avatar: string;
}

export interface SquadActivity {
    id: number;
    avatar: string;
    text: string;
    timestamp: string;
}

export interface SquadGoal {
    title: string;
    description: string;
    current: number;
    target: number;
    reward: string;
}

export interface SquadData {
    squadName: string;
    squadGoal: SquadGoal | null;
    members: SquadMember[];
    activityFeed: SquadActivity[];
}


export const FREE_QUESTION_IDS_NL = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
export const FREE_QUESTION_IDS_EN = [101, 102, 103, 104, 105, 106, 107, 108, 109, 110];
export const FREE_QUESTION_IDS_NK = [201, 202, 203, 204, 205, 206, 207, 208, 209, 210];
export const FREE_QUESTION_IDS_BIO = [301, 302, 303, 304, 305, 306, 307, 308, 309, 310];
export const FREE_QUESTION_IDS_ECO = [401, 402, 403, 404, 405, 406, 407, 408, 409, 410];
export const FREE_QUESTION_IDS_GS = [501, 502, 503, 504, 505, 506, 507, 508, 509, 510];
export const FREE_QUESTION_IDS_SK = [601, 602, 603, 604, 605, 606, 607, 608, 609, 610];
export const FREE_QUESTION_IDS_BECO = [701, 702, 703, 704, 705, 706, 707, 708, 709, 710];
export const FREE_QUESTION_IDS_WISA = [801, 802, 803, 804, 805, 806, 807, 808, 809, 810];
export const FREE_QUESTION_IDS_WISB = [901, 902, 903, 904, 905, 906, 907, 908, 909, 910];
export const FREE_QUESTION_IDS_FR = [1001, 1002, 1003, 1004, 1005, 1006, 1007, 1008, 1009, 1010];
export const FREE_QUESTION_IDS_DE = [1101, 1102, 1103, 1104, 1105, 1106, 1107, 1108, 1109, 1110];


export const dutchExamQuestions: Question[] = [
  // VWO_Nederlands_2023_T1
  {
    id: 1,
    examen_id: 'VWO_Nederlands_2023_T1',
    vraag_nummer: 5,
    tekst_naam: 'De Plicht om te Vergeten',
    vraag_passage: 'De historicus en de journalist delen een fundamenteel doel: het reconstrueren van het verleden. Waar de journalist zich echter richt op de actualiteit en de korte termijn, neemt de historicus de lange lijnen en diepere context in ogenschouw. Beide disciplines vereisen een kritische houding ten opzichte van bronnen, maar de historicus heeft het voordeel van afstand, wat een objectiever oordeel mogelijk maakt.',
    vraag_tekst: 'Welke functie heeft de tweede zin ("Waar de journalist...") ten opzichte van de eerste zin in deze passage?',
    vraag_type: 'Functievraag',
    kern_vaardigheid: 'Argumentatieanalyse',
    max_score: 2,
    correctie_model: 'De tweede zin nuanceert of contrasteert de bewering in de eerste zin door de verschillen tussen de historicus en de journalist te benadrukken. Kernwoorden: contrast, tegenstelling, verschil, nuancering.',
    difficulty: 2,
  },
  {
    id: 2,
    examen_id: 'VWO_Nederlands_2023_T1',
    vraag_nummer: 6,
    tekst_naam: 'De Plicht om te Vergeten',
    vraag_tekst: 'Wat is de hoofdgedachte van de passage in de vorige vraag?',
    vraag_type: 'Hoofdgedachtevraag',
    kern_vaardigheid: 'Argumentatieanalyse',
    max_score: 1,
    correctie_model: 'De kern is dat historici en journalisten overeenkomsten hebben in hun doel, maar verschillen in hun methode en perspectief.',
    difficulty: 1,
    context_id: 1,
  },
   {
    id: 3,
    examen_id: 'VWO_Nederlands_2023_T1',
    vraag_nummer: 10,
    tekst_naam: 'Digitale Dilemma\'s',
    vraag_passage: 'Het "recht om vergeten te worden" is een complex juridisch concept. Enerzijds beschermt het de privacy van individuen door hen in staat te stellen verouderde of irrelevante informatie online te laten verwijderen. Anderzijds kan het botsen met het recht op vrijheid van meningsuiting en de publieke toegang tot informatie.',
    vraag_tekst: 'Welk principe staat op gespannen voet met het "recht om vergeten te worden" volgens de tekst?',
    vraag_type: 'Meerkeuzevraag',
    kern_vaardigheid: 'Argumentatieanalyse',
    max_score: 1,
    correctie_model: 'Het juiste antwoord is "Vrijheid van meningsuiting", omdat de tekst expliciet stelt dat het recht om vergeten te worden kan "botsen met het recht op vrijheid van meningsuiting".',
    difficulty: 1,
    options: [
      'Het recht op privacy',
      'Het auteursrecht',
      'Vrijheid van meningsuiting',
      'Het recht op een eerlijk proces'
    ],
    correct_option: 'Vrijheid van meningsuiting'
  },
  // VWO_Nederlands_2024_T1
  {
    id: 4,
    examen_id: 'VWO_Nederlands_2024_T1',
    vraag_nummer: 1,
    tekst_naam: 'De Ironie van de Vooruitgang',
    vraag_passage: 'De technologische vooruitgang heeft ons leven onmiskenbaar comfortabeler gemaakt. We zijn beter verbonden, gezonder en productiever dan ooit tevoren. Toch knaagt er een gevoel van onbehagen. De constante stroom van informatie leidt tot overprikkeling, en de perfecte levens die op sociale media worden geëtaleerd, creëren een onrealistische standaard. We hebben meer, maar zijn we ook gelukkiger?',
    vraag_tekst: 'Welk woord beschrijft het beste de toon van de auteur ten opzichte van technologische vooruitgang?',
    vraag_type: 'Toonvraag',
    kern_vaardigheid: 'Tekstbegrip',
    max_score: 1,
    correctie_model: 'De toon is kritisch, sceptisch of ambivalent. De auteur erkent de voordelen, maar legt de nadruk op de negatieve keerzijdes.',
    difficulty: 2,
  },
  {
    id: 5,
    examen_id: 'VWO_Nederlands_2024_T1',
    vraag_nummer: 2,
    tekst_naam: 'De Ironie van de Vooruitgang',
    vraag_tekst: 'Wat is de belangrijkste tegenstelling die in deze passage wordt beschreven?',
    vraag_type: 'Analysevraag',
    kern_vaardigheid: 'Argumentatieanalyse',
    max_score: 2,
    correctie_model: 'De tegenstelling tussen materieel comfort/technologische vooruitgang en mentaal welzijn/geluk.',
    difficulty: 2,
    context_id: 4,
  },
  {
    id: 6,
    examen_id: 'VWO_Nederlands_2024_T1',
    vraag_nummer: 3,
    tekst_naam: 'De Ironie van de Vooruitgang',
    vraag_tekst: 'De laatste zin is een retorische vraag. Wat is het doel van deze vraag?',
    vraag_type: 'Functievraag',
    kern_vaardigheid: 'Stijl en Retorica',
    max_score: 1,
    correctie_model: 'Het doel is om de lezer aan het denken te zetten en de hoofdgedachte van de tekst te benadrukken: dat materiële vooruitgang niet automatisch leidt tot meer geluk.',
    difficulty: 3,
    context_id: 4
  },
  // VWO_Nederlands_2022_T2
  {
    id: 7,
    examen_id: 'VWO_Nederlands_2022_T2',
    vraag_nummer: 12,
    tekst_naam: 'De Robot als Collega',
    vraag_passage: '(1) De introductie van AI op de werkvloer leidt onvermijdelijk tot banenverlies. (2) Echter, dit is een kortzichtige visie. (3) Nieuwe technologie creëert historisch gezien altijd nieuwe soorten banen die we ons nu nog niet kunnen voorstellen. (4) De focus moet dus niet liggen op het tegenhouden van technologie, maar op het omscholen van de beroepsbevolking.',
    vraag_tekst: 'Welk argument wordt in zin (3) gebruikt om de stelling in zin (2) te onderbouwen?',
    vraag_type: 'Argumentatievraag',
    kern_vaardigheid: 'Argumentatieanalyse',
    max_score: 2,
    correctie_model: 'Een argument op basis van een historische vergelijking of analogie.',
    difficulty: 3,
  },
  {
    id: 8,
    examen_id: 'VWO_Nederlands_2022_T2',
    vraag_nummer: 13,
    tekst_naam: 'De Robot als Collega',
    vraag_tekst: 'Citeer de zinsnede uit de passage die de conclusie van de auteur bevat.',
    vraag_type: 'Citeervraag',
    kern_vaardigheid: 'Argumentatieanalyse',
    max_score: 1,
    correctie_model: '"De focus moet dus niet liggen op het tegenhouden van technologie, maar op het omscholen van de beroepsbevolking."',
    difficulty: 1,
    context_id: 7,
  },
  // VWO_Nederlands_2021_T1
  {
    id: 9,
    examen_id: 'VWO_Nederlands_2021_T1',
    vraag_nummer: 8,
    tekst_naam: 'Taal en Denken',
    vraag_passage: 'De Sapir-Whorfhypothese stelt dat de taal die we spreken onze manier van denken en waarnemen beïnvloedt. Een extreme interpretatie hiervan, het linguïstisch determinisme, claimt dat taal ons denken volledig bepaalt. De meeste moderne linguïsten hangen echter een gematigdere versie aan: linguïstische relativiteit, die stelt dat taal ons denken weliswaar stuurt en vormt, maar niet volledig vastlegt.',
    vraag_tekst: 'Leg in eigen woorden het verschil uit tussen linguïstisch determinisme en linguïstische relativiteit.',
    vraag_type: 'Uitlegvraag',
    kern_vaardigheid: 'Argumentatieanalyse',
    max_score: 3,
    correctie_model: 'Determinisme stelt dat taal het denken 100% bepaalt (je kunt niet denken wat je taal niet kan uitdrukken). Relativiteit stelt dat taal het denken beïnvloedt en makkelijker maakt om over bepaalde dingen te denken, maar het niet onmogelijk maakt om buiten de taal te denken.',
    difficulty: 3,
  },
  {
    id: 10,
    examen_id: 'VWO_Nederlands_2023_T2',
    vraag_nummer: 4,
    tekst_naam: 'De kracht van verveling',
    vraag_passage: 'Verveling wordt vaak gezien als een negatieve toestand, een leegte die we zo snel mogelijk moeten vullen met afleiding. Toch pleiten sommige psychologen voor een herwaardering. Zij stellen dat juist in momenten van verveling de creativiteit wordt aangewakkerd en de geest ruimte krijgt om nieuwe verbindingen te leggen. Het is de ongestructureerde tijd die ons brein nodig heeft om tot diepere inzichten te komen.',
    vraag_tekst: 'Welke van de onderstaande beweringen geeft de mening van de "sommige psychologen" het beste weer?',
    vraag_type: 'Meerkeuzevraag',
    kern_vaardigheid: 'Tekstbegrip',
    max_score: 1,
    correctie_model: 'Het juiste antwoord is "Verveling kan een positief effect hebben op de creativiteit", omdat dit direct aansluit bij de stelling dat verveling creativiteit aanwakkert.',
    difficulty: 1,
    options: [
        'Verveling is een leegte die altijd gevuld moet worden.',
        'Verveling is een symptoom van een gebrek aan discipline.',
        'Verveling kan een positief effect hebben op de creativiteit.',
        'Verveling is schadelijk voor de mentale gezondheid.'
    ],
    correct_option: 'Verveling kan een positief effect hebben op de creativiteit.'
  },
  {
    id: 11,
    examen_id: 'VWO_Nederlands_2023_T2',
    vraag_nummer: 5,
    tekst_naam: 'De kracht van verveling',
    vraag_tekst: 'Wat is de functie van de laatste zin van de passage ("Het is de ongestructureerde tijd...")?',
    vraag_type: 'Functievraag',
    kern_vaardigheid: 'Argumentatieanalyse',
    max_score: 2,
    correctie_model: 'De zin geeft een verklaring voor of een toelichting op de bewering in de voorgaande zin (dat verveling de creativiteit aanwakkert).',
    difficulty: 2,
    context_id: 10
  },
  {
    id: 12,
    examen_id: 'VWO_Nederlands_2022_T1',
    vraag_nummer: 1,
    tekst_naam: 'Het filterbubbel-effect',
    vraag_passage: 'Algoritmes van sociale media zijn ontworpen om ons te geven wat we willen. Ze leren van onze clicks en likes, en serveren ons vervolgens content die naadloos aansluit bij onze bestaande overtuigingen. Hoewel dit comfortabel is, creëert het een gevaarlijke "filterbubbel": een persoonlijk informatie-universum waarin we nauwelijks nog worden blootgesteld aan afwijkende meningen. Dit kan leiden tot polarisatie en een verminderd begrip voor anderen.',
    vraag_tekst: 'Welk woord beschrijft het beste de houding van de auteur ten opzichte van de filterbubbel?',
    vraag_type: 'Toonvraag',
    kern_vaardigheid: 'Tekstbegrip',
    max_score: 1,
    correctie_model: 'De houding is waarschuwend of kritisch. De auteur benadrukt de gevaren ("gevaarlijke", "polarisatie").',
    difficulty: 2
  },
  {
    id: 13,
    examen_id: 'VWO_Nederlands_2022_T1',
    vraag_nummer: 2,
    tekst_naam: 'Het filterbubbel-effect',
    vraag_tekst: 'Leg uit waarom de auteur het comfort van algoritmes paradoxaal noemt in de context van de hele passage.',
    vraag_type: 'Uitlegvraag',
    kern_vaardigheid: 'Argumentatieanalyse',
    max_score: 2,
    correctie_model: 'Het is paradoxaal omdat het comfort op de korte termijn (alleen zien wat je leuk vindt) leidt tot een gevaar op de lange termijn (polarisatie, onbegrip). Het positieve gevoel heeft dus een negatieve keerzijde.',
    difficulty: 3,
    context_id: 12
  },
  {
    id: 14,
    examen_id: 'VWO_Nederlands_2021_T2',
    vraag_nummer: 15,
    tekst_naam: 'De waarde van literatuur',
    vraag_passage: 'In een tijdperk van snelle informatie en korte aandachtsspannes lijkt het lezen van complexe literatuur een anachronisme. Waarom zou je je door een dichtbundel worstelen als je ook een samenvatting kunt kijken? Toch is het juist deze inspanning die literatuur waardevol maakt. Het dwingt tot vertraging, tot zorgvuldig interpreteren en tot het verplaatsen in een ander perspectief. Deze vaardigheden zijn in onze huidige maatschappij crucialer dan ooit.',
    vraag_tekst: 'Welk argument gebruikt de auteur om de waarde van literatuur te verdedigen?',
    vraag_type: 'Argumentatievraag',
    kern_vaardigheid: 'Argumentatieanalyse',
    max_score: 2,
    correctie_model: 'Het argument is dat de inspanning die literatuur vereist, essentiële vaardigheden traint (zoals vertragen, interpreteren, perspectief nemen) die zeer relevant zijn in de moderne tijd.',
    difficulty: 2
  },
  {
    id: 15,
    examen_id: 'VWO_Nederlands_2021_T2',
    vraag_nummer: 16,
    tekst_naam: 'De waarde van literatuur',
    vraag_tekst: 'Citeer de zinsnede die de tegenstelling beschrijft waarmee de auteur de passage opent.',
    vraag_type: 'Citeervraag',
    kern_vaardigheid: 'Tekstbegrip',
    max_score: 1,
    correctie_model: '"complexe literatuur een anachronisme" versus "snelle informatie en korte aandachtsspannes". (Een van beide of de combinatie is goed).',
    difficulty: 1,
    context_id: 14
  }
];

export const englishExamQuestions: Question[] = [
  {
    id: 101,
    examen_id: 'VWO_English_2023_T1',
    vraag_nummer: 1,
    tekst_naam: 'The Gig Economy',
    vraag_passage: 'The rise of the gig economy, facilitated by digital platforms, has been lauded by some as the future of work, offering flexibility and autonomy. Critics, however, point to the precarious nature of such employment, highlighting the lack of benefits, job security, and consistent income that traditional jobs provide. The debate essentially revolves around whether this model empowers or exploits its workforce.',
    vraag_tekst: 'What is the main function of the second sentence ("Critics, however...")?',
    vraag_type: 'Function Question',
    kern_vaardigheid: 'Argument Analysis',
    max_score: 2,
    correctie_model: 'To present a contrasting view or counterargument to the positive perspective mentioned in the first sentence.',
    difficulty: 2,
  },
  {
    id: 102,
    examen_id: 'VWO_English_2023_T1',
    vraag_nummer: 2,
    tekst_naam: 'The Gig Economy',
    vraag_tekst: 'Which of the following best summarizes the central issue discussed in the passage?',
    vraag_type: 'Multiple Choice',
    kern_vaardigheid: 'Text Comprehension',
    max_score: 1,
    correctie_model: 'The correct answer is "The controversy over whether the gig economy is beneficial or detrimental to workers," as it captures the two opposing viewpoints.',
    difficulty: 1,
    context_id: 101,
    options: [
        'The technological innovation of digital platforms.',
        'The difference between flexibility and autonomy.',
        'The controversy over whether the gig economy is beneficial or detrimental to workers.',
        'The decline of traditional employment models.'
    ],
    correct_option: 'The controversy over whether the gig economy is beneficial or detrimental to workers.'
  },
  {
    id: 103,
    examen_id: 'VWO_English_2024_T1',
    vraag_nummer: 5,
    tekst_naam: 'On Reading',
    vraag_passage: 'In an age of information overload, the act of deep reading – the slow, immersive journey through a complex text – has become an act of rebellion. It requires a level of sustained focus that our digitally conditioned minds are increasingly losing. This is not merely a nostalgic plea for the past; it is a serious concern about the potential erosion of critical thinking and empathy, skills that are cultivated in the quiet space between the reader and the page.',
    vraag_tekst: 'What is the author’s tone regarding the decline of deep reading?',
    vraag_type: 'Tone Question',
    kern_vaardigheid: 'Text Comprehension',
    max_score: 1,
    correctie_model: 'The tone is concerned or alarmed. Words like "rebellion", "losing", "serious concern", and "erosion" indicate a negative and worried perspective.',
    difficulty: 2
  },
  {
    id: 104,
    examen_id: 'VWO_English_2024_T1',
    vraag_nummer: 6,
    tekst_naam: 'On Reading',
    vraag_tekst: 'According to the author, what two key skills are threatened by the loss of deep reading?',
    vraag_type: 'Analysis Question',
    kern_vaardigheid: 'Argument Analysis',
    max_score: 2,
    correctie_model: 'The two skills are critical thinking and empathy.',
    difficulty: 1,
    context_id: 103
  },
  {
    id: 105,
    examen_id: 'VWO_English_2022_T2',
    vraag_nummer: 10,
    tekst_naam: 'Urban Green Spaces',
    vraag_passage: 'The integration of green spaces into urban environments is often framed purely in aesthetic terms – parks make cities look nicer. This perspective, however, overlooks their vital ecological and psychological functions. They mitigate the urban heat island effect, improve air quality, and provide crucial habitats for wildlife. Furthermore, studies consistently show that access to nature reduces stress and improves mental well-being for city dwellers.',
    vraag_tekst: 'What is the primary purpose of this passage?',
    vraag_type: 'Purpose Question',
    kern_vaardigheid: 'Argument Analysis',
    max_score: 2,
    correctie_model: 'To argue that the benefits of urban green spaces extend far beyond simple aesthetics, encompassing important ecological and psychological advantages.',
    difficulty: 3
  },
  {
    id: 106,
    examen_id: 'VWO_English_2022_T2',
    vraag_nummer: 11,
    tekst_naam: 'Urban Green Spaces',
    vraag_tekst: 'Cite the phrase that describes the limited, common view of urban green spaces that the author wishes to correct.',
    vraag_type: 'Citation Question',
    kern_vaardigheid: 'Text Comprehension',
    max_score: 1,
    correctie_model: '"framed purely in aesthetic terms".',
    difficulty: 1,
    context_id: 105
  },
  {
    id: 107,
    examen_id: 'VWO_English_2021_T1',
    vraag_nummer: 15,
    tekst_naam: 'The Paradox of Choice',
    vraag_passage: 'Modern consumer society operates on the assumption that more choice is always better. From breakfast cereals to streaming services, we are inundated with options. Yet, psychologist Barry Schwartz argues this abundance can be debilitating. Confronted with too many choices, people can experience "analysis paralysis," becoming so overwhelmed that they fail to make any decision at all. Even when they do choose, they are often less satisfied, haunted by the possibility that a different choice might have been better.',
    vraag_tekst: 'Explain in your own words what "analysis paralysis" is.',
    vraag_type: 'Explanation Question',
    kern_vaardigheid: 'Text Comprehension',
    max_score: 2,
    correctie_model: 'It is the state of being unable to make a decision because there are too many options to choose from.',
    difficulty: 2
  },
  {
    id: 108,
    examen_id: 'VWO_English_2021_T1',
    vraag_nummer: 16,
    tekst_naam: 'The Paradox of Choice',
    vraag_tekst: 'What is the paradox mentioned in the title?',
    vraag_type: 'Analysis Question',
    kern_vaardigheid: 'Argument Analysis',
    max_score: 2,
    correctie_model: 'The paradox is that while we believe more choice is good, it can actually lead to negative outcomes like indecision and dissatisfaction.',
    difficulty: 3,
    context_id: 107
  },
  {
    id: 109,
    examen_id: 'VWO_English_2023_T2',
    vraag_nummer: 4,
    tekst_naam: 'Fact vs. Opinion',
    vraag_passage: 'The line between fact and opinion has become dangerously blurred in the digital age. A fact is a statement that can be verified as true or false through objective evidence. An opinion, conversely, is a personal belief or judgment that cannot be proven or disproven. The failure to distinguish between the two is a cornerstone of misinformation, allowing unsubstantiated claims to be presented with the same authority as established facts.',
    vraag_tekst: 'What is the key difference between a fact and an opinion, according to the text?',
    vraag_type: 'Explanation Question',
    kern_vaardigheid: 'Argument Analysis',
    max_score: 2,
    correctie_model: 'A fact can be objectively verified (proven true or false), whereas an opinion is a personal belief and cannot be proven.',
    difficulty: 1
  },
  {
    id: 110,
    examen_id: 'VWO_English_2023_T2',
    vraag_nummer: 5,
    tekst_naam: 'Fact vs. Opinion',
    vraag_tekst: 'Which word could best replace "conversely" in the second sentence?',
    vraag_type: 'Multiple Choice',
    kern_vaardigheid: 'Vocabulary',
    max_score: 1,
    correctie_model: 'The correct answer is "on the other hand," as it signals a contrast between the definition of a fact and the definition of an opinion.',
    difficulty: 2,
    context_id: 109,
    options: [
        'Similarly',
        'Therefore',
        'On the other hand',
        'For example'
    ],
    correct_option: 'On the other hand'
  },
  {
    id: 111,
    examen_id: 'VWO_English_2020_T1',
    vraag_nummer: 12,
    tekst_naam: 'The Impostor Syndrome',
    vraag_passage: 'Impostor syndrome is a psychological pattern in which an individual doubts their skills, talents, or accomplishments and has a persistent internalized fear of being exposed as a "fraud". Despite external evidence of their competence, those experiencing impostor syndrome remain convinced that they are undeserving of all they have achieved. They often attribute their successes to luck or to deceiving others into thinking they are more intelligent than they perceive themselves to be.',
    vraag_tekst: 'What is the core belief of someone experiencing impostor syndrome?',
    vraag_type: 'Comprehension Question',
    kern_vaardigheid: 'Text Comprehension',
    max_score: 1,
    correctie_model: 'They believe they are a fraud and do not deserve their success or accomplishments.',
    difficulty: 2
  },
  {
    id: 112,
    examen_id: 'VWO_English_2020_T1',
    vraag_nummer: 13,
    tekst_naam: 'The Impostor Syndrome',
    vraag_tekst: 'How do people with impostor syndrome explain their successes, according to the text?',
    vraag_type: 'Analysis Question',
    kern_vaardigheid: 'Text Comprehension',
    max_score: 2,
    correctie_model: 'They attribute them to external factors like luck or to their ability to deceive others.',
    difficulty: 2,
    context_id: 111
  },
  {
    id: 113,
    examen_id: 'VWO_English_2019_T2',
    vraag_nummer: 8,
    tekst_naam: 'Confirmation Bias',
    vraag_passage: '(1) Confirmation bias is the tendency to search for, interpret, favour, and recall information in a way that confirms or supports one\'s pre-existing beliefs or hypotheses. (2) It is a type of cognitive bias and a systematic error of inductive reasoning. (3) For example, a person who believes that left-handed people are more creative may pay special attention to creative left-handed individuals while ignoring the vast number of non-creative left-handers. (4) This mental shortcut is powerful and can lead to holding onto false beliefs firmly.',
    vraag_tekst: 'What function does sentence (3) have in the paragraph?',
    vraag_type: 'Function Question',
    kern_vaardigheid: 'Argument Analysis',
    max_score: 1,
    correctie_model: 'It provides a specific example to illustrate the concept of confirmation bias defined in the previous sentences.',
    difficulty: 1
  },
  {
    id: 114,
    examen_id: 'VWO_English_2019_T2',
    vraag_nummer: 9,
    tekst_naam: 'Confirmation Bias',
    vraag_tekst: 'Based on the passage, what is a negative consequence of confirmation bias?',
    vraag_type: 'Comprehension Question',
    kern_vaardigheid: 'Argument Analysis',
    max_score: 1,
    correctie_model: 'It can lead to holding onto false beliefs.',
    difficulty: 2,
    context_id: 113
  },
  {
    id: 115,
    examen_id: 'VWO_English_2018_T1',
    vraag_nummer: 2,
    tekst_naam: 'The Art of Persuasion',
    vraag_passage: 'Aristotle outlined three primary modes of persuasion over two thousand years ago: ethos, pathos, and logos. Ethos appeals to authority and credibility; we trust experts. Pathos appeals to emotion, seeking to evoke a feeling in the audience. Logos appeals to logic and reason, using facts and figures to construct a sound argument. A truly persuasive message, Aristotle argued, must skillfully weave all three together.',
    vraag_tekst: 'Which mode of persuasion would a scientific paper primarily rely on?',
    vraag_type: 'Application Question',
    kern_vaardigheid: 'Argument Analysis',
    max_score: 1,
    correctie_model: 'Logos, because a scientific paper is based on logic, reason, facts, and figures.',
    difficulty: 2
  }
];

export const natuurkundeExamQuestions: Question[] = [
  {
    id: 201,
    examen_id: 'VWO_Natuurkunde_2023_T1',
    vraag_nummer: 1,
    tekst_naam: 'Mechanica',
    vraag_passage: 'Een bal met een massa van 0.5 kg wordt vanaf de grond recht omhoog geschoten met een beginsnelheid van 20 m/s. De luchtweerstand wordt verwaarloosd. (g = 9.81 m/s²)',
    vraag_tekst: 'Bereken de maximale hoogte die de bal bereikt.',
    vraag_type: 'Berekeningsvraag',
    kern_vaardigheid: 'Energie en Beweging',
    max_score: 3,
    correctie_model: 'Gebruik de wet van behoud van energie: E_kinetisch = E_potentieel. 0.5 * m * v² = m * g * h. h = v² / (2 * g) = 20² / (2 * 9.81) = 20.4 meter.',
    difficulty: 2,
  },
   {
    id: 202,
    examen_id: 'VWO_Natuurkunde_2023_T1',
    vraag_nummer: 2,
    tekst_naam: 'Elektriciteit',
    vraag_tekst: 'Drie weerstanden (R1=10Ω, R2=20Ω, R3=30Ω) zijn in serie geschakeld op een spanningsbron van 12V. Wat is de totale stroomsterkte in de schakeling?',
    vraag_type: 'Berekeningsvraag',
    kern_vaardigheid: 'Schakelingen',
    max_score: 3,
    correctie_model: 'Eerst de totale weerstand (Rv) berekenen: Rv = R1 + R2 + R3 = 10 + 20 + 30 = 60Ω. Dan de stroom (I) met de wet van Ohm: I = U / Rv = 12V / 60Ω = 0.2A.',
    difficulty: 1,
  },
   {
    id: 203,
    examen_id: 'VWO_Natuurkunde_2022_T2',
    vraag_nummer: 5,
    tekst_naam: 'Trillingen',
    vraag_passage: 'Een massa van 200 gram hangt aan een veer met een veerconstante van 50 N/m. De massa wordt 10 cm uit de evenwichtsstand getrokken en losgelaten.',
    vraag_tekst: 'Bereken de trillingstijd van het massa-veersysteem.',
    vraag_type: 'Berekeningsvraag',
    kern_vaardigheid: 'Trillingen en Golven',
    max_score: 2,
    correctie_model: 'Gebruik de formule T = 2π * √(m/C). T = 2π * √(0.200 kg / 50 N/m) ≈ 0.397 s.',
    difficulty: 2,
  },
  {
    id: 204,
    examen_id: 'VWO_Natuurkunde_2022_T2',
    vraag_nummer: 6,
    tekst_naam: 'Trillingen',
    vraag_tekst: 'Wat gebeurt er met de trillingstijd als de massa wordt verdubbeld?',
    vraag_type: 'Redeneervraag',
    kern_vaardigheid: 'Trillingen en Golven',
    max_score: 1,
    correctie_model: 'De trillingstijd wordt √2 keer zo groot, omdat de trillingstijd evenredig is met de wortel van de massa.',
    difficulty: 3,
    context_id: 203
  },
  {
    id: 205,
    examen_id: 'VWO_Natuurkunde_2021_T1',
    vraag_nummer: 10,
    tekst_naam: 'Straling',
    vraag_tekst: 'Leg het verschil uit tussen alfa-, bèta- en gammastraling wat betreft hun doordringend vermogen.',
    vraag_type: 'Uitlegvraag',
    kern_vaardigheid: 'Kwantumfysica en Straling',
    max_score: 3,
    correctie_model: 'Alfastraling heeft het kleinste doordringend vermogen (wordt gestopt door een vel papier). Bètastraling heeft een groter doordringend vermogen (gestopt door aluminium). Gammastraling heeft het grootste doordringend vermogen (heeft een dikke laag lood nodig).',
    difficulty: 1,
  },
  {
    id: 206,
    examen_id: 'VWO_Natuurkunde_2021_T1',
    vraag_nummer: 11,
    tekst_naam: 'Straling',
    vraag_passage: 'Radon-222 (²²²Rn) is een radioactief edelgas dat vervalt onder uitzending van alfastraling.',
    vraag_tekst: 'Stel de vervalreactie op voor het verval van Radon-222.',
    vraag_type: 'Reactievergelijking',
    kern_vaardigheid: 'Kwantumfysica en Straling',
    max_score: 2,
    correctie_model: '²²²₈₆Rn → ²¹⁸₈₄Po + ⁴₂He (of α). Het massagetal neemt met 4 af en het atoomnummer met 2, wat resulteert in Polonium-218.',
    difficulty: 2,
  },
  {
    id: 207,
    examen_id: 'VWO_Natuurkunde_2020_T2',
    vraag_nummer: 3,
    tekst_naam: 'Magnetisme',
    vraag_passage: 'Een rechte stroomdraad waar een stroom I van 5,0 A doorheen loopt, bevindt zich in een homogeen magnetisch veld B van 0,20 T. De draad maakt een hoek van 90° met de veldlijnen. De lengte van de draad in het veld is 15 cm.',
    vraag_tekst: 'Bereken de grootte van de lorentzkracht die op de draad werkt.',
    vraag_type: 'Berekeningsvraag',
    kern_vaardigheid: 'Elektriciteit en Magnetisme',
    max_score: 2,
    correctie_model: 'Gebruik F_L = B * I * l * sin(α). F_L = 0.20 T * 5.0 A * 0.15 m * sin(90°) = 0.15 N.',
    difficulty: 2
  },
  {
    id: 208,
    examen_id: 'VWO_Natuurkunde_2020_T2',
    vraag_nummer: 4,
    tekst_naam: 'Magnetisme',
    vraag_tekst: 'Hoe verandert de lorentzkracht als de hoek tussen de draad en de veldlijnen 30° wordt?',
    vraag_type: 'Redeneervraag',
    kern_vaardigheid: 'Elektriciteit en Magnetisme',
    max_score: 1,
    correctie_model: 'De kracht wordt kleiner, omdat sin(30°) kleiner is dan sin(90°). De kracht wordt gehalveerd (0.075 N).',
    difficulty: 2,
    context_id: 207
  },
  {
    id: 209,
    examen_id: 'VWO_Natuurkunde_2019_T1',
    vraag_nummer: 8,
    tekst_naam: 'Optica',
    vraag_passage: 'Een lichtstraal valt vanuit lucht (n=1,00) op een glasplaat (n=1,52) onder een hoek van inval van 45 graden.',
    vraag_tekst: 'Bereken de hoek van breking.',
    vraag_type: 'Berekeningsvraag',
    kern_vaardigheid: 'Golven en Optica',
    max_score: 2,
    correctie_model: 'Gebruik de wet van Snellius: n1 * sin(i) = n2 * sin(r). 1,00 * sin(45°) = 1,52 * sin(r). sin(r) = (1,00 * 0,707) / 1,52 ≈ 0,465. r = arcsin(0,465) ≈ 27,7 graden.',
    difficulty: 2,
  },
  {
    id: 210,
    examen_id: 'VWO_Natuurkunde_2019_T1',
    vraag_nummer: 9,
    tekst_naam: 'Astrofysica',
    vraag_tekst: 'Wat is de voornaamste energiebron van een ster zoals onze zon gedurende het grootste deel van haar leven?',
    vraag_type: 'Kennisvraag',
    kern_vaardigheid: 'Astrofysica',
    max_score: 1,
    correctie_model: 'Kernfusie, specifiek de omzetting van waterstof naar helium in de kern van de ster.',
    difficulty: 1
  }
];
export const biologieExamQuestions: Question[] = [
  {
    id: 301,
    examen_id: 'VWO_Biologie_2023_T1',
    vraag_nummer: 1,
    tekst_naam: 'Ecologie',
    vraag_tekst: 'Leg uit wat het verschil is tussen een ecosysteem en een populatie.',
    vraag_type: 'Uitlegvraag',
    kern_vaardigheid: 'Ecologie',
    max_score: 2,
    correctie_model: 'Een populatie is een groep organismen van dezelfde soort in een bepaald gebied. Een ecosysteem omvat alle levende (biotische) en niet-levende (abiotische) factoren in een gebied, inclusief meerdere populaties.',
    difficulty: 1,
  },
  {
    id: 302,
    examen_id: 'VWO_Biologie_2023_T1',
    vraag_nummer: 2,
    tekst_naam: 'Genetica',
    vraag_tekst: 'Wat is de functie van mRNA tijdens de eiwitsynthese?',
    vraag_type: 'Kennisvraag',
    kern_vaardigheid: 'Moleculaire Biologie',
    max_score: 2,
    correctie_model: 'mRNA (messenger RNA) fungeert als een boodschapper die de genetische code van het DNA in de celkern overbrengt naar de ribosomen in het cytoplasma, waar de code wordt vertaald naar een eiwit.',
    difficulty: 2,
  },
  {
    id: 303,
    examen_id: 'VWO_Biologie_2022_T2',
    vraag_nummer: 4,
    tekst_naam: 'Fotosynthese',
    vraag_tekst: 'Geef de netto reactievergelijking van de fotosynthese.',
    vraag_type: 'Reactievergelijking',
    kern_vaardigheid: 'Stofwisseling',
    max_score: 2,
    correctie_model: '6 CO₂ + 6 H₂O → C₆H₁₂O₆ + 6 O₂.',
    difficulty: 1
  },
  {
    id: 304,
    examen_id: 'VWO_Biologie_2022_T2',
    vraag_nummer: 5,
    tekst_naam: 'Fotosynthese',
    vraag_passage: 'Bij de fotosynthese wordt lichtenergie omgezet in chemische energie. Dit proces vindt plaats in de chloroplasten (bladgroenkorrels).',
    vraag_tekst: 'Noem twee factoren die de snelheid van de fotosynthese kunnen beperken.',
    vraag_type: 'Analysevraag',
    kern_vaardigheid: 'Stofwisseling',
    max_score: 2,
    correctie_model: 'Mogelijke antwoorden zijn: lichtintensiteit, CO₂-concentratie en temperatuur.',
    difficulty: 2,
    context_id: 303
  },
  {
    id: 305,
    examen_id: 'VWO_Biologie_2021_T1',
    vraag_nummer: 8,
    tekst_naam: 'Hormonen',
    vraag_tekst: 'Leg uit hoe het hormoon insuline de bloedsuikerspiegel reguleert.',
    vraag_type: 'Uitlegvraag',
    kern_vaardigheid: 'Regulatie',
    max_score: 2,
    correctie_model: 'Insuline wordt geproduceerd door de alvleesklier als de bloedsuikerspiegel stijgt. Het stimuleert lichaamscellen om glucose op te nemen en de lever om glucose op te slaan als glycogeen, waardoor de bloedsuikerspiegel daalt.',
    difficulty: 3
  },
  {
    id: 306,
    examen_id: 'VWO_Biologie_2021_T1',
    vraag_nummer: 9,
    tekst_naam: 'Hormonen',
    vraag_tekst: 'Welk hormoon heeft een tegengestelde werking aan insuline?',
    vraag_type: 'Kennisvraag',
    kern_vaardigheid: 'Regulatie',
    max_score: 1,
    correctie_model: 'Glucagon.',
    difficulty: 1,
    context_id: 305
  },
  {
    id: 307,
    examen_id: 'VWO_Biologie_2020_T2',
    vraag_nummer: 12,
    tekst_naam: 'Evolutie',
    vraag_tekst: 'Wat wordt bedoeld met "natuurlijke selectie"?',
    vraag_type: 'Uitlegvraag',
    kern_vaardigheid: 'Evolutie',
    max_score: 2,
    correctie_model: 'Het proces waarbij organismen die beter zijn aangepast aan hun omgeving een grotere overlevings- en voortplantingskans hebben. Hierdoor worden hun gunstige eigenschappen vaker doorgegeven aan de volgende generatie.',
    difficulty: 2
  },
  {
    id: 308,
    examen_id: 'VWO_Biologie_2020_T2',
    vraag_nummer: 13,
    tekst_naam: 'Evolutie',
    vraag_passage: 'Een populatie kevers leeft op een donkere bodem. Er zijn zowel lichtgekleurde als donkergekleurde kevers. Vogels jagen op deze kevers.',
    vraag_tekst: 'Welke kleur kever zal door natuurlijke selectie waarschijnlijk in aantal toenemen? Leg je antwoord uit.',
    vraag_type: 'Redeneervraag',
    kern_vaardigheid: 'Evolutie',
    max_score: 2,
    correctie_model: 'De donkergekleurde kevers. Zij hebben een betere schutkleur op de donkere bodem en worden minder snel gezien door de vogels. Daardoor hebben ze een grotere overlevingskans en kunnen ze zich vaker voortplanten.',
    difficulty: 2,
    context_id: 307
  },
  {
    id: 309,
    examen_id: 'VWO_Biologie_2019_T1',
    vraag_nummer: 3,
    tekst_naam: 'Immunologie',
    vraag_tekst: 'Leg het verschil uit tussen actieve en passieve immuniteit.',
    vraag_type: 'Uitlegvraag',
    kern_vaardigheid: 'Afweer',
    max_score: 2,
    correctie_model: 'Actieve immuniteit ontstaat wanneer het lichaam zelf antistoffen en geheugencellen aanmaakt na een infectie of vaccinatie. Passieve immuniteit ontstaat door het direct ontvangen van antistoffen (bijv. via de moeder of een injectie), is tijdelijk en er worden geen geheugencellen gevormd.',
    difficulty: 3
  },
  {
    id: 310,
    examen_id: 'VWO_Biologie_2019_T1',
    vraag_nummer: 4,
    tekst_naam: 'Immunologie',
    vraag_tekst: 'Is een vaccinatie een voorbeeld van het verkrijgen van actieve of passieve immuniteit?',
    vraag_type: 'Toepassingsvraag',
    kern_vaardigheid: 'Afweer',
    max_score: 1,
    correctie_model: 'Actieve immuniteit.',
    difficulty: 1,
    context_id: 309
  }
];
export const economieExamQuestions: Question[] = [
  {
    id: 401,
    examen_id: 'VWO_Economie_2023_T1',
    vraag_nummer: 1,
    tekst_naam: 'Vraag en Aanbod',
    vraag_tekst: 'Een stijging van de prijs van koffiebonen leidt tot een hogere prijs voor een kop koffie in een café. Welk effect heeft dit op de vraag- en aanbodcurve voor koffie?',
    vraag_type: 'Analysevraag',
    kern_vaardigheid: 'Marktanalyse',
    max_score: 2,
    correctie_model: 'De aanbodcurve verschuift naar links (of omhoog), omdat de productiekosten zijn gestegen. Bij elke prijs wordt er minder aangeboden. De vraagcurve verandert niet direct door de productiekosten.',
    difficulty: 2,
  },
   {
    id: 402,
    examen_id: 'VWO_Economie_2023_T1',
    vraag_nummer: 2,
    tekst_naam: 'Ruil',
    vraag_tekst: 'Leg het concept van comparatief voordeel uit.',
    vraag_type: 'Uitlegvraag',
    kern_vaardigheid: 'Internationale Handel',
    max_score: 2,
    correctie_model: 'Een land heeft een comparatief voordeel in de productie van een goed als het dat goed kan produceren tegen lagere alternatieve kosten (opportunity costs) dan een ander land. Dit is de basis voor wederzijds voordelige handel.',
    difficulty: 3,
  },
   {
    id: 403,
    examen_id: 'VWO_Economie_2022_T2',
    vraag_nummer: 5,
    tekst_naam: 'Speltheorie',
    vraag_passage: 'Twee bedrijven, A en B, overwegen een reclamecampagne. De opbrengstenmatrix is als volgt (winst A, winst B):\nB wel reclame | B geen reclame\nA wel reclame: (100, 100) | (150, 50)\nA geen reclame: (50, 150) | (80, 80)',
    vraag_tekst: 'Is er in dit spel sprake van een dominante strategie voor bedrijf A? Leg je antwoord uit.',
    vraag_type: 'Analysevraag',
    kern_vaardigheid: 'Speltheorie',
    max_score: 2,
    correctie_model: 'Ja. Als B wel reclame maakt, is 100 (wel) beter dan 50 (geen). Als B geen reclame maakt, is 150 (wel) beter dan 80 (geen). Voor A is "wel reclame maken" dus altijd de beste keuze, ongeacht wat B doet.',
    difficulty: 3
  },
  {
    id: 404,
    examen_id: 'VWO_Economie_2022_T2',
    vraag_nummer: 6,
    tekst_naam: 'Speltheorie',
    vraag_tekst: 'Wat is het Nash-evenwicht in dit spel?',
    vraag_type: 'Analysevraag',
    kern_vaardigheid: 'Speltheorie',
    max_score: 1,
    correctie_model: 'Het Nash-evenwicht is (100, 100), waar beide bedrijven reclame maken. Gegeven de keuze van de ander, heeft geen van beide een prikkel om af te wijken.',
    difficulty: 2,
    context_id: 403
  },
  {
    id: 405,
    examen_id: 'VWO_Economie_2021_T1',
    vraag_nummer: 8,
    tekst_naam: 'Elasticiteit',
    vraag_passage: 'De prijs van een treinkaartje stijgt van €10 naar €12. Hierdoor daalt het aantal verkochte kaartjes van 1000 naar 900.',
    vraag_tekst: 'Bereken de prijselasticiteit van de vraag naar treinkaartjes.',
    vraag_type: 'Berekeningsvraag',
    kern_vaardigheid: 'Marktanalyse',
    max_score: 2,
    correctie_model: 'Procentuele verandering vraag: (900-1000)/1000 * 100% = -10%. Procentuele verandering prijs: (12-10)/10 * 100% = 20%. Elasticiteit = %ΔQ / %ΔP = -10% / 20% = -0,5.',
    difficulty: 2
  },
  {
    id: 406,
    examen_id: 'VWO_Economie_2021_T1',
    vraag_nummer: 9,
    tekst_naam: 'Elasticiteit',
    vraag_tekst: 'Is de vraag naar treinkaartjes in dit geval elastisch of inelastisch? Leg uit.',
    vraag_type: 'Redeneervraag',
    kern_vaardigheid: 'Marktanalyse',
    max_score: 1,
    correctie_model: 'Inelastisch, omdat de elasticiteit (-0,5) tussen -1 en 0 ligt. De vraag reageert dus relatief zwak op de prijsverandering.',
    difficulty: 1,
    context_id: 405
  },
  {
    id: 407,
    examen_id: 'VWO_Economie_2020_T2',
    vraag_nummer: 10,
    tekst_naam: 'Risico en Verzekeren',
    vraag_tekst: 'Wat is het concept van "averechtse selectie" in de context van verzekeringen?',
    vraag_type: 'Uitlegvraag',
    kern_vaardigheid: 'Risico en Informatie',
    max_score: 2,
    correctie_model: 'Averechtse selectie treedt op wanneer juist de mensen met een hoog risico (de "slechte risico\'s") zich verzekeren, terwijl mensen met een laag risico de premie te hoog vinden en afhaken. Dit drijft de gemiddelde kosten voor de verzekeraar op.',
    difficulty: 3
  },
  {
    id: 408,
    examen_id: 'VWO_Economie_2020_T2',
    vraag_nummer: 11,
    tekst_naam: 'Risico en Verzekeren',
    vraag_tekst: 'Noem een maatregel die een verzekeraar kan nemen om averechtse selectie tegen te gaan.',
    vraag_type: 'Kennisvraag',
    kern_vaardigheid: 'Risico en Informatie',
    max_score: 1,
    correctie_model: 'Mogelijke antwoorden: premiedifferentiatie (verschillende premies voor verschillende risicogroepen), bonus-malussysteem, of een verplichte verzekering.',
    difficulty: 2,
    context_id: 407
  },
  {
    id: 409,
    examen_id: 'VWO_Economie_2019_T1',
    vraag_nummer: 3,
    tekst_naam: 'Conjunctuur',
    vraag_tekst: 'Leg uit wat het verschil is tussen een recessie en een depressie.',
    vraag_type: 'Uitlegvraag',
    kern_vaardigheid: 'Conjunctuur',
    max_score: 1,
    correctie_model: 'Een recessie is een periode van ten minste twee opeenvolgende kwartalen met negatieve economische groei. Een depressie is een langdurige en diepe recessie.',
    difficulty: 1
  },
  {
    id: 410,
    examen_id: 'VWO_Economie_2019_T1',
    vraag_nummer: 4,
    tekst_naam: 'Conjunctuur',
    vraag_tekst: 'Welk type overheidsbeleid kan worden ingezet om een recessie tegen te gaan? Noem een voorbeeld.',
    vraag_type: 'Kennisvraag',
    kern_vaardigheid: 'Conjunctuur',
    max_score: 1,
    correctie_model: 'Anticyclisch begrotingsbeleid. Voorbeeld: de overheid verhoogt haar bestedingen (bijv. aan infrastructuur) of verlaagt de belastingen om de vraag te stimuleren.',
    difficulty: 2,
    context_id: 409
  }
];

export const geschiedenisExamQuestions: Question[] = [
  {
    id: 501,
    examen_id: 'VWO_Geschiedenis_2023_T1',
    vraag_nummer: 1,
    tekst_naam: 'De Koude Oorlog',
    vraag_tekst: 'Leg uit hoe de Marshallhulp bijdroeg aan de tweedeling van Europa na de Tweede Wereldoorlog.',
    vraag_type: 'Uitlegvraag',
    kern_vaardigheid: 'Historische context',
    max_score: 2,
    correctie_model: 'De Marshallhulp was economische steun van de VS aan Europese landen. De Sovjet-Unie verbood de landen in haar invloedssfeer deze hulp te accepteren, wat de economische en ideologische scheiding tussen Oost- en West-Europa versterkte.',
    difficulty: 2,
  },
  {
    id: 502,
    examen_id: 'VWO_Geschiedenis_2023_T1',
    vraag_nummer: 2,
    tekst_naam: 'De Opstand',
    vraag_tekst: 'Wat was de directe aanleiding voor de Beeldenstorm in 1566?',
    vraag_type: 'Kennisvraag',
    kern_vaardigheid: 'Oorzaak en gevolg',
    max_score: 1,
    correctie_model: 'De directe aanleiding was een hagenpreek van een calvinistische predikant bij Steenvoorde, die de aanwezigen opriep om de katholieke kerken van hun "afgodsbeelden" te zuiveren.',
    difficulty: 1,
  },
  {
    id: 503,
    examen_id: 'VWO_Geschiedenis_2022_T2',
    vraag_nummer: 5,
    tekst_naam: 'Duitsland',
    vraag_passage: 'Bron: Een foto van de Berlijnse Muur in 1985, waarop graffiti met de tekst "Weg mit dem antifaschistischen Schutzwall!" te zien is.',
    vraag_tekst: 'Leg uit waarom de graffiti op de muur ironisch is, gebruikmakend van de term "antifaschistischer Schutzwall".',
    vraag_type: 'Bronanalyse',
    kern_vaardigheid: 'Historisch redeneren',
    max_score: 2,
    correctie_model: 'De term "antifascistische beschermingsmuur" was de officiële, propagandistische naam die de DDR-regering aan de muur gaf. De ironie is dat de graffiti deze propagandaterm gebruikt om juist tegen de muur te protesteren, wat laat zien dat men de term niet geloofde.',
    difficulty: 3
  },
  {
    id: 504,
    examen_id: 'VWO_Geschiedenis_2022_T2',
    vraag_nummer: 6,
    tekst_naam: 'Verlichting',
    vraag_tekst: 'Noem een verlichtingsideaal dat direct leidde tot de Franse Revolutie en leg uit hoe.',
    vraag_type: 'Analysevraag',
    kern_vaardigheid: 'Oorzaak en gevolg',
    max_score: 2,
    correctie_model: 'Een mogelijk antwoord is volkssoevereiniteit (het idee dat de macht bij het volk ligt). Dit stond haaks op het absolutisme van de Franse koning en inspireerde de derde stand om in opstand te komen.',
    difficulty: 2
  },
  {
    id: 505,
    examen_id: 'VWO_Geschiedenis_2021_T1',
    vraag_nummer: 10,
    tekst_naam: 'De Republiek',
    vraag_tekst: 'Waarom wordt de Vrede van Münster (1648) als een belangrijk keerpunt in de geschiedenis van Nederland gezien?',
    vraag_type: 'Kennisvraag',
    kern_vaardigheid: 'Historische context',
    max_score: 1,
    correctie_model: 'Omdat Spanje hiermee de soevereiniteit van de Republiek der Zeven Verenigde Nederlanden officieel erkende, wat het formele einde van de Tachtigjarige Oorlog betekende.',
    difficulty: 1
  },
  {
    id: 506,
    examen_id: 'VWO_Geschiedenis_2021_T1',
    vraag_nummer: 11,
    tekst_naam: 'Koude Oorlog',
    vraag_tekst: 'Wat was de kern van de Trumandoctrine?',
    vraag_type: 'Kennisvraag',
    kern_vaardigheid: 'Historische context',
    max_score: 1,
    correctie_model: 'Het was een Amerikaanse politiek van containment (indamming), gericht op het voorkomen van de verspreiding van het communisme door politieke, economische en militaire steun te geven aan landen die door het communisme werden bedreigd.',
    difficulty: 2
  },
  {
    id: 507,
    examen_id: 'VWO_Geschiedenis_2020_T2',
    vraag_nummer: 3,
    tekst_naam: 'Industriële Revolutie',
    vraag_tekst: 'Leg uit hoe de uitvinding van de stoommachine de Industriële Revolutie versnelde.',
    vraag_type: 'Uitlegvraag',
    kern_vaardigheid: 'Oorzaak en gevolg',
    max_score: 2,
    correctie_model: 'De stoommachine maakte fabrieken onafhankelijk van waterkracht, waardoor ze overal konden worden gebouwd. Daarnaast was de stoommachine de motor achter de trein en het stoomschip, wat het transport van grondstoffen en eindproducten revolutioneerde.',
    difficulty: 2
  },
  {
    id: 508,
    examen_id: 'VWO_Geschiedenis_2020_T2',
    vraag_nummer: 4,
    tekst_naam: 'Duitsland',
    vraag_passage: 'Bron: Een toespraak van Hitler in 1933 waarin hij belooft het "dictaat van Versailles" ongedaan te maken.',
    vraag_tekst: 'Welk kenmerkend aspect van de periode 1900-1950 is het meest van toepassing op deze bron?',
    vraag_type: 'Bronanalyse',
    kern_vaardigheid: 'Kenmerkende aspecten',
    max_score: 1,
    correctie_model: 'Het in praktijk brengen van de totalitaire ideologieën communisme en fascisme/nationaalsocialisme.',
    difficulty: 2
  },
  {
    id: 509,
    examen_id: 'VWO_Geschiedenis_2019_T1',
    vraag_nummer: 8,
    tekst_naam: 'De Republiek',
    vraag_tekst: 'Noem twee redenen waarom de 17e eeuw voor de Republiek der Nederlanden de "Gouden Eeuw" wordt genoemd.',
    vraag_type: 'Kennisvraag',
    kern_vaardigheid: 'Historische context',
    max_score: 2,
    correctie_model: 'Twee van de volgende: economische bloei (handel, VOC), culturele bloei (schilderkunst), en/of wetenschappelijke bloei.',
    difficulty: 1
  },
  {
    id: 510,
    examen_id: 'VWO_Geschiedenis_2019_T1',
    vraag_nummer: 9,
    tekst_naam: 'Dekolonisatie',
    vraag_tekst: 'Leg uit waarom de Tweede Wereldoorlog een katalysator was voor de dekolonisatie in Azië.',
    vraag_type: 'Uitlegvraag',
    kern_vaardigheid: 'Oorzaak en gevolg',
    max_score: 2,
    correctie_model: 'De Japanse bezetting had aangetoond dat de westerse koloniale machten niet onoverwinnelijk waren. Dit versterkte het nationalisme en de onafhankelijkheidsbewegingen in de gekoloniseerde gebieden.',
    difficulty: 3
  }
];

export const scheikundeExamQuestions: Question[] = [
  {
    id: 601,
    examen_id: 'VWO_Scheikunde_2023_T1',
    vraag_nummer: 1,
    tekst_naam: 'Redoxreacties',
    vraag_tekst: 'Geef de halfreactie voor de oxidatie van een ijzer(II)-ion naar een ijzer(III)-ion.',
    vraag_type: 'Reactievergelijking',
    kern_vaardigheid: 'Redoxchemie',
    max_score: 1,
    correctie_model: 'Fe²⁺ → Fe³⁺ + e⁻',
    difficulty: 1,
  },
  {
    id: 602,
    examen_id: 'VWO_Scheikunde_2023_T1',
    vraag_nummer: 2,
    tekst_naam: 'Zuur-Base Chemie',
    vraag_tekst: 'Een oplossing heeft een pH van 3. Bereken de concentratie H₃O⁺-ionen in mol/L.',
    vraag_type: 'Berekeningsvraag',
    kern_vaardigheid: 'Zuren en Basen',
    max_score: 2,
    correctie_model: 'De concentratie H₃O⁺ is 10 tot de macht -pH. Dus [H₃O⁺] = 10⁻³ = 0,001 mol/L.',
    difficulty: 2,
  },
  {
    id: 603,
    examen_id: 'VWO_Scheikunde_2022_T2',
    vraag_nummer: 5,
    tekst_naam: 'Reactiesnelheid',
    vraag_tekst: 'Noem twee factoren die de snelheid van een chemische reactie beïnvloeden.',
    vraag_type: 'Kennisvraag',
    kern_vaardigheid: 'Reactiesnelheid',
    max_score: 1,
    correctie_model: 'Twee van de volgende: temperatuur, concentratie van de reagerende stoffen, verdelingsgraad (oppervlakte), aanwezigheid van een katalysator.',
    difficulty: 1
  },
  {
    id: 604,
    examen_id: 'VWO_Scheikunde_2022_T2',
    vraag_nummer: 6,
    tekst_naam: 'Chemisch Evenwicht',
    vraag_passage: 'Het volgende evenwicht wordt beschouwd: N₂(g) + 3H₂(g) ⇌ 2NH₃(g). De vorming van ammoniak is een exotherme reactie.',
    vraag_tekst: 'Wat gebeurt er met de ligging van het evenwicht als de temperatuur wordt verhoogd? Leg uit.',
    vraag_type: 'Redeneervraag',
    kern_vaardigheid: 'Chemisch Evenwicht',
    max_score: 2,
    correctie_model: 'Het evenwicht verschuift naar links (de kant van de endotherme reactie). Volgens het principe van Le Châtelier zal het systeem de temperatuurstijging tegenwerken door de reactie te bevoordelen die warmte verbruikt.',
    difficulty: 3
  },
  {
    id: 605,
    examen_id: 'VWO_Scheikunde_2021_T1',
    vraag_nummer: 10,
    tekst_naam: 'Koolstofchemie',
    vraag_tekst: 'Wat is een kenmerk van een additiereactie in de organische chemie?',
    vraag_type: 'Kennisvraag',
    kern_vaardigheid: 'Koolstofchemie',
    max_score: 1,
    correctie_model: 'Een dubbele of drievoudige binding in een molecuul wordt verbroken en atomen worden aan het molecuul toegevoegd. Er ontstaat één reactieproduct.',
    difficulty: 2
  },
  {
    id: 606,
    examen_id: 'VWO_Scheikunde_2021_T1',
    vraag_nummer: 11,
    tekst_naam: 'Koolstofchemie',
    vraag_passage: 'Etheen (C₂H₄) reageert met waterstofchloride (HCl).',
    vraag_tekst: 'Geef de reactievergelijking voor deze additiereactie in structuurformules.',
    vraag_type: 'Reactievergelijking',
    kern_vaardigheid: 'Koolstofchemie',
    max_score: 2,
    correctie_model: 'CH₂=CH₂ + HCl → CH₃-CH₂Cl. De dubbele binding van etheen klapt open en H en Cl worden aan de koolstofatomen gebonden, wat chloorethaan vormt.',
    difficulty: 2,
    context_id: 605
  },
  {
    id: 607,
    examen_id: 'VWO_Scheikunde_2020_T2',
    vraag_nummer: 3,
    tekst_naam: 'Molrekenen',
    vraag_tekst: 'Bereken de massa van 0,25 mol water (H₂O). Gegeven: H=1,008 u; O=16,00 u.',
    vraag_type: 'Berekeningsvraag',
    kern_vaardigheid: 'Molrekenen',
    max_score: 2,
    correctie_model: 'Molaire massa van H₂O = 2 * 1,008 + 16,00 = 18,016 g/mol. Massa = aantal mol * molaire massa = 0,25 mol * 18,016 g/mol = 4,5 g.',
    difficulty: 1
  },
  {
    id: 608,
    examen_id: 'VWO_Scheikunde_2020_T2',
    vraag_nummer: 4,
    tekst_naam: 'Redoxchemie',
    vraag_passage: 'Een stuk zinkmetaal wordt in een oplossing van koper(II)sulfaat gelegd.',
    vraag_tekst: 'Stel de totale redoxreactie op die plaatsvindt.',
    vraag_type: 'Reactievergelijking',
    kern_vaardigheid: 'Redoxchemie',
    max_score: 2,
    correctie_model: 'Oxidator: Cu²⁺ + 2e⁻ → Cu. Reductor: Zn → Zn²⁺ + 2e⁻. Totaal: Zn(s) + Cu²⁺(aq) → Zn²⁺(aq) + Cu(s).',
    difficulty: 2
  },
  {
    id: 609,
    examen_id: 'VWO_Scheikunde_2019_T1',
    vraag_nummer: 8,
    tekst_naam: 'Zuren en Basen',
    vraag_passage: 'Je voegt 100 mL van een 0,10 M zoutzuuroplossing (HCl) bij 100 mL van een 0,10 M natronloogoplossing (NaOH).',
    vraag_tekst: 'Wat is de pH van de resulterende oplossing? Leg je antwoord uit.',
    vraag_type: 'Redeneervraag',
    kern_vaardigheid: 'Zuren en Basen',
    max_score: 2,
    correctie_model: 'De pH is 7. Zoutzuur is een sterk zuur en natronloog is een sterke base. Omdat gelijke hoeveelheden mol van beide worden samengevoegd, neutraliseren ze elkaar volledig tot water en zout (NaCl).',
    difficulty: 2
  },
  {
    id: 610,
    examen_id: 'VWO_Scheikunde_2019_T1',
    vraag_nummer: 9,
    tekst_naam: 'Groene Chemie',
    vraag_tekst: 'Noem twee principes van groene chemie.',
    vraag_type: 'Kennisvraag',
    kern_vaardigheid: 'Groene Chemie',
    max_score: 1,
    correctie_model: 'Twee van de volgende: preventie van afval, atoomeconomie, gebruik van hernieuwbare grondstoffen, energie-efficiëntie, etc.',
    difficulty: 1
  }
];

export const bedrijfseconomieExamQuestions: Question[] = [
  {
    id: 701,
    examen_id: 'VWO_Bedrijfseco_2023_T1',
    vraag_nummer: 1,
    tekst_naam: 'Marketing',
    vraag_tekst: 'Noem de 4 P\'s van de marketingmix.',
    vraag_type: 'Kennisvraag',
    kern_vaardigheid: 'Marketing',
    max_score: 1,
    correctie_model: 'Product, Prijs, Plaats en Promotie.',
    difficulty: 1,
  },
  {
    id: 702,
    examen_id: 'VWO_Bedrijfseco_2023_T1',
    vraag_nummer: 2,
    tekst_naam: 'Financiering',
    vraag_tekst: 'Leg het verschil uit tussen eigen vermogen en vreemd vermogen op de balans van een onderneming.',
    vraag_type: 'Uitlegvraag',
    kern_vaardigheid: 'Financiële analyse',
    max_score: 2,
    correctie_model: 'Eigen vermogen is het geld dat door de eigenaren is ingebracht (aandelenkapitaal, reserves). Vreemd vermogen is geld dat is geleend van externe partijen (leningen, crediteuren) en waarover rente moet worden betaald.',
    difficulty: 2,
  },
  {
    id: 703,
    examen_id: 'VWO_Bedrijfseco_2022_T2',
    vraag_nummer: 5,
    tekst_naam: 'Kosten en Baten',
    vraag_passage: 'Een onderneming produceert widgets. De variabele kosten per widget zijn €5. De totale vaste kosten zijn €10.000 per maand. De verkoopprijs per widget is €15.',
    vraag_tekst: 'Bereken de break-even afzet.',
    vraag_type: 'Berekeningsvraag',
    kern_vaardigheid: 'Kosten-Batenanalyse',
    max_score: 2,
    correctie_model: 'Break-even afzet = Totale Vaste Kosten / (Verkoopprijs - Variabele Kosten per stuk) = 10.000 / (15 - 5) = 1000 widgets.',
    difficulty: 2
  },
  {
    id: 704,
    examen_id: 'VWO_Bedrijfseco_2022_T2',
    vraag_nummer: 6,
    tekst_naam: 'Kosten en Baten',
    vraag_tekst: 'Bereken de winst bij een verkoop van 1500 widgets.',
    vraag_type: 'Berekeningsvraag',
    kern_vaardigheid: 'Kosten-Batenanalyse',
    max_score: 2,
    correctie_model: 'Totale Opbrengst = 1500 * €15 = €22.500. Totale Kosten = (1500 * €5) + €10.000 = €17.500. Winst = TO - TK = €22.500 - €17.500 = €5.000.',
    difficulty: 2,
    context_id: 703
  },
  {
    id: 705,
    examen_id: 'VWO_Bedrijfseco_2021_T1',
    vraag_nummer: 10,
    tekst_naam: 'Verslaggeving',
    vraag_tekst: 'Wat is het doel van een resultatenrekening (winst- en verliesrekening)?',
    vraag_type: 'Kennisvraag',
    kern_vaardigheid: 'Financiële verslaggeving',
    max_score: 1,
    correctie_model: 'Het doel is om een overzicht te geven van de opbrengsten en kosten van een onderneming over een bepaalde periode om zo de winst of het verlies te bepalen.',
    difficulty: 1
  },
  {
    id: 706,
    examen_id: 'VWO_Bedrijfseco_2021_T1',
    vraag_nummer: 11,
    tekst_naam: 'Verslaggeving',
    vraag_tekst: 'Noem twee voorbeelden van vaste activa op een balans.',
    vraag_type: 'Kennisvraag',
    kern_vaardigheid: 'Financiële verslaggeving',
    max_score: 1,
    correctie_model: 'Gebouwen, machines, inventaris, voertuigen.',
    difficulty: 1,
    context_id: 705
  },
  {
    id: 707,
    examen_id: 'VWO_Bedrijfseco_2020_T2',
    vraag_nummer: 3,
    tekst_naam: 'Ondernemingsvormen',
    vraag_tekst: 'Wat is het belangrijkste verschil tussen een eenmanszaak en een besloten vennootschap (bv) met betrekking tot aansprakelijkheid?',
    vraag_type: 'Uitlegvraag',
    kern_vaardigheid: 'Ondernemingsvormen',
    max_score: 2,
    correctie_model: 'Bij een eenmanszaak is de eigenaar hoofdelijk aansprakelijk met zijn privévermogen voor de schulden van de zaak. Een bv is een rechtspersoon, waardoor de eigenaar (aandeelhouder) in principe niet met zijn privévermogen aansprakelijk is.',
    difficulty: 3
  },
  {
    id: 708,
    examen_id: 'VWO_Bedrijfseco_2020_T2',
    vraag_nummer: 4,
    tekst_naam: 'Personeelsbeleid',
    vraag_tekst: 'Leg uit wat het verschil is tussen een primair en een secundair arbeidsvoorwaarde.',
    vraag_type: 'Uitlegvraag',
    kern_vaardigheid: 'Personeelsbeleid',
    max_score: 2,
    correctie_model: 'Primaire arbeidsvoorwaarden zijn de directe beloningen zoals het salaris en vakantiegeld. Secundaire arbeidsvoorwaarden zijn extra\'s die niet direct in geld worden uitgedrukt, zoals een auto van de zaak, een telefoon of opleidingsmogelijkheden.',
    difficulty: 1
  },
  {
    id: 709,
    examen_id: 'VWO_Bedrijfseco_2019_T1',
    vraag_nummer: 8,
    tekst_naam: 'Logistiek',
    vraag_tekst: 'Wat wordt bedoeld met het "Just-In-Time" (JIT) principe in logistiek?',
    vraag_type: 'Kennisvraag',
    kern_vaardigheid: 'Logistiek',
    max_score: 1,
    correctie_model: 'Het JIT-principe houdt in dat goederen of onderdelen precies op het moment dat ze nodig zijn in het productieproces worden aangeleverd. Dit minimaliseert de voorraadkosten.',
    difficulty: 2
  },
  {
    id: 710,
    examen_id: 'VWO_Bedrijfseco_2019_T1',
    vraag_nummer: 9,
    tekst_naam: 'Logistiek',
    vraag_tekst: 'Noem een nadeel van het JIT-principe.',
    vraag_type: 'Analysevraag',
    kern_vaardigheid: 'Logistiek',
    max_score: 1,
    correctie_model: 'Een nadeel is de kwetsbaarheid voor verstoringen in de toeleveringsketen. Een kleine vertraging kan het hele productieproces stilleggen.',
    difficulty: 2,
    context_id: 709
  }
];

export const wiskundeAExamQuestions: Question[] = [
  {
    id: 801,
    examen_id: 'VWO_WiskundeA_2023_T1',
    vraag_nummer: 1,
    tekst_naam: 'Kansrekening',
    vraag_tekst: 'In een vaas zitten 5 rode en 3 blauwe knikkers. Je trekt zonder terugleggen twee knikkers. Wat is de kans op twee rode knikkers?',
    vraag_type: 'Berekeningsvraag',
    kern_vaardigheid: 'Kansrekening',
    max_score: 2,
    correctie_model: 'Kans op eerste rode: 5/8. Kans op tweede rode: 4/7. Totale kans = (5/8) * (4/7) = 20/56 = 5/14.',
    difficulty: 2,
  },
  {
    id: 802,
    examen_id: 'VWO_WiskundeA_2023_T1',
    vraag_nummer: 2,
    tekst_naam: 'Statistiek',
    vraag_tekst: 'Leg het verschil uit tussen de mediaan en het gemiddelde van een dataset.',
    vraag_type: 'Uitlegvraag',
    kern_vaardigheid: 'Statistiek',
    max_score: 2,
    correctie_model: 'Het gemiddelde is de som van alle waarden gedeeld door het aantal waarden. De mediaan is de middelste waarde wanneer de data op volgorde staat. De mediaan is minder gevoelig voor uitschieters.',
    difficulty: 1,
  },
  {
    id: 803,
    examen_id: 'VWO_WiskundeA_2023_T1',
    vraag_nummer: 5,
    tekst_naam: 'Populatiegroei',
    vraag_passage: 'Een populatie bacteriën groeit exponentieel volgens de formule N(t) = 100 * 1.5^t, waarbij N het aantal bacteriën is en t de tijd in uren.',
    vraag_tekst: 'Bereken na hoeveel uur de populatie voor het eerst meer dan 1000 bacteriën telt. Rond je antwoord af op twee decimalen.',
    vraag_type: 'Berekeningsvraag',
    kern_vaardigheid: 'Exponentiële Verbanden',
    max_score: 3,
    correctie_model: 'Los op: 1000 = 100 * 1.5^t => 10 = 1.5^t. t = log(10) / log(1.5) ≈ 5.68 uur.',
    difficulty: 2
  },
  {
    id: 804,
    examen_id: 'VWO_WiskundeA_2023_T1',
    vraag_nummer: 6,
    tekst_naam: 'IQ-scores',
    vraag_passage: 'IQ-scores zijn normaal verdeeld met een gemiddelde van 100 en een standaardafwijking van 15.',
    vraag_tekst: 'Bereken welk percentage van de bevolking een IQ-score heeft tussen de 85 en 115.',
    vraag_type: 'Berekeningsvraag',
    kern_vaardigheid: 'Normale Verdeling',
    max_score: 2,
    correctie_model: 'Dit is het gebied binnen één standaardafwijking van het gemiddelde. Volgens de vuistregels van de normale verdeling is dit ongeveer 68%.',
    difficulty: 1
  },
  {
    id: 805,
    examen_id: 'VWO_WiskundeA_2022_T2',
    vraag_nummer: 3,
    tekst_naam: 'Lineaire Verbanden',
    vraag_passage: 'Een taxibedrijf rekent een starttarief van €3,50 en een tarief van €2,10 per kilometer.',
    vraag_tekst: 'Stel een formule op voor de totale kosten (K) als functie van het aantal gereden kilometers (x).',
    vraag_type: 'Formule opstellen',
    kern_vaardigheid: 'Lineaire Verbanden',
    max_score: 1,
    correctie_model: 'K = 2,10x + 3,50.',
    difficulty: 1
  },
  {
    id: 806,
    examen_id: 'VWO_WiskundeA_2022_T2',
    vraag_nummer: 4,
    tekst_naam: 'Combinatoriek',
    vraag_tekst: 'Op hoeveel manieren kunnen 5 mensen op 5 stoelen op een rij gaan zitten?',
    vraag_type: 'Berekeningsvraag',
    kern_vaardigheid: 'Combinatoriek',
    max_score: 1,
    correctie_model: 'Dit is een permutatie. 5! (5 faculteit) = 5 * 4 * 3 * 2 * 1 = 120 manieren.',
    difficulty: 2
  },
  {
    id: 807,
    examen_id: 'VWO_WiskundeA_2021_T1',
    vraag_nummer: 7,
    tekst_naam: 'Rijen',
    vraag_passage: 'Gegeven is een rekenkundige rij met de eerste term u₁=5 en een verschil v=3.',
    vraag_tekst: 'Geef de directe formule voor deze rij.',
    vraag_type: 'Formule opstellen',
    kern_vaardigheid: 'Rijen',
    max_score: 1,
    correctie_model: 'uₙ = u₁ + (n-1)v = 5 + (n-1)3 = 5 + 3n - 3 = 3n + 2.',
    difficulty: 2
  },
  {
    id: 808,
    examen_id: 'VWO_WiskundeA_2021_T1',
    vraag_nummer: 8,
    tekst_naam: 'Rijen',
    vraag_tekst: 'Bereken de som van de eerste 10 termen van de rij uit de vorige vraag.',
    vraag_type: 'Berekeningsvraag',
    kern_vaardigheid: 'Rijen',
    max_score: 2,
    correctie_model: 'De 10e term is u₁₀ = 3*10 + 2 = 32. Som = 0.5 * n * (u₁ + uₙ) = 0.5 * 10 * (5 + 32) = 5 * 37 = 185.',
    difficulty: 2,
    context_id: 807
  },
  {
    id: 809,
    examen_id: 'VWO_WiskundeA_2020_T2',
    vraag_nummer: 11,
    tekst_naam: 'Statistiek',
    vraag_passage: 'Uit een enquête blijkt dat 60% van de Nederlanders voorstander is van een bepaald plan, met een betrouwbaarheidsinterval van [56%, 64%].',
    vraag_tekst: 'Wat is de foutmarge van deze enquête?',
    vraag_type: 'Analysevraag',
    kern_vaardigheid: 'Statistiek',
    max_score: 1,
    correctie_model: 'De foutmarge is de helft van de breedte van het interval. (64% - 56%) / 2 = 4%.',
    difficulty: 1
  },
  {
    id: 810,
    examen_id: 'VWO_WiskundeA_2020_T2',
    vraag_nummer: 12,
    tekst_naam: 'Hypothesetoetsing',
    vraag_tekst: 'Wat wordt bedoeld met een "Type I fout" bij het toetsen van hypothesen?',
    vraag_type: 'Uitlegvraag',
    kern_vaardigheid: 'Hypothesetoetsing',
    max_score: 1,
    correctie_model: 'Een Type I fout is het onterecht verwerpen van de nulhypothese (H₀), terwijl deze in werkelijkheid waar is.',
    difficulty: 3
  }
];

export const wiskundeBExamQuestions: Question[] = [
  {
    id: 901,
    examen_id: 'VWO_WiskundeB_2023_T1',
    vraag_nummer: 1,
    tekst_naam: 'Differentiëren',
    vraag_tekst: 'Gegeven is de functie f(x) = 3x³ - 4x + 2. Bepaal de afgeleide functie f\'(x).',
    vraag_type: 'Berekeningsvraag',
    kern_vaardigheid: 'Differentiëren',
    max_score: 2,
    correctie_model: 'Gebruik de machtsregel. f\'(x) = 3 * 3x² - 4 = 9x² - 4.',
    difficulty: 1,
  },
  {
    id: 902,
    examen_id: 'VWO_WiskundeB_2023_T1',
    vraag_nummer: 2,
    tekst_naam: 'Integreren',
    vraag_tekst: 'Bereken de onbepaalde integraal van g(x) = 2x + 5.',
    vraag_type: 'Berekeningsvraag',
    kern_vaardigheid: 'Integreren',
    max_score: 2,
    correctie_model: 'De integraal G(x) = x² + 5x + C.',
    difficulty: 2,
  },
  {
    id: 903,
    examen_id: 'VWO_WiskundeB_2023_T1',
    vraag_nummer: 8,
    tekst_naam: 'Goniometrie',
    vraag_tekst: 'Los de vergelijking sin(2x) = 0.5 exact op voor x in het interval [0, π].',
    vraag_type: 'Berekeningsvraag',
    kern_vaardigheid: 'Goniometrie',
    max_score: 3,
    correctie_model: '2x = π/6 + k*2π of 2x = 5π/6 + k*2π. Dit geeft x = π/12 + k*π of x = 5π/12 + k*π. Binnen het interval [0, π] zijn de oplossingen x = π/12 en x = 5π/12.',
    difficulty: 3
  },
  {
    id: 904,
    examen_id: 'VWO_WiskundeB_2023_T1',
    vraag_nummer: 9,
    tekst_naam: 'Oppervlakteberekening',
    vraag_passage: 'Gegeven is de functie f(x) = x².',
    vraag_tekst: 'Bereken exact de oppervlakte van het gebied ingesloten door de grafiek van f, de x-as en de lijnen x=0 en x=3.',
    vraag_type: 'Berekeningsvraag',
    kern_vaardigheid: 'Integreren',
    max_score: 2,
    correctie_model: 'De oppervlakte is de integraal van f(x) van 0 tot 3. ∫(x²)dx = [1/3 * x³]. Invullen van de grenzen geeft (1/3 * 3³) - (1/3 * 0³) = 9.',
    difficulty: 2
  },
  {
    id: 905,
    examen_id: 'VWO_WiskundeB_2022_T2',
    vraag_nummer: 3,
    tekst_naam: 'Logaritmen',
    vraag_tekst: 'Los de vergelijking ²log(x) + ²log(x-2) = 3 exact op.',
    vraag_type: 'Berekeningsvraag',
    kern_vaardigheid: 'Logaritmen',
    max_score: 3,
    correctie_model: '²log(x(x-2)) = 3 => x(x-2) = 2³ = 8. x² - 2x - 8 = 0. (x-4)(x+2) = 0. x=4 of x=-2. x=-2 vervalt want logaritme van een negatief getal kan niet. Dus x=4.',
    difficulty: 3
  },
  {
    id: 906,
    examen_id: 'VWO_WiskundeB_2022_T2',
    vraag_nummer: 4,
    tekst_naam: 'Meetkunde',
    vraag_passage: 'Gegeven zijn de punten A(1, 2) en B(5, 4).',
    vraag_tekst: 'Stel een vergelijking op van de lijn door A en B.',
    vraag_type: 'Berekeningsvraag',
    kern_vaardigheid: 'Analytische Meetkunde',
    max_score: 2,
    correctie_model: 'Richtingscoëfficiënt a = (4-2)/(5-1) = 2/4 = 0.5. y = 0.5x + b. Punt A invullen: 2 = 0.5*1 + b => b = 1.5. Dus y = 0.5x + 1.5.',
    difficulty: 1
  },
  {
    id: 907,
    examen_id: 'VWO_WiskundeB_2021_T1',
    vraag_nummer: 7,
    tekst_naam: 'Differentiëren',
    vraag_passage: 'Gegeven is de functie f(x) = ln(x² + 1).',
    vraag_tekst: 'Bepaal de afgeleide f\'(x) met behulp van de kettingregel.',
    vraag_type: 'Berekeningsvraag',
    kern_vaardigheid: 'Differentiëren',
    max_score: 2,
    correctie_model: 'f\'(x) = (1 / (x² + 1)) * 2x = 2x / (x² + 1).',
    difficulty: 2
  },
  {
    id: 908,
    examen_id: 'VWO_WiskundeB_2021_T1',
    vraag_nummer: 8,
    tekst_naam: 'Vectoren',
    vraag_passage: 'Gegeven zijn de vectoren a = (3, 4) en b = (-1, 2).',
    vraag_tekst: 'Bereken het inproduct van a en b.',
    vraag_type: 'Berekeningsvraag',
    kern_vaardigheid: 'Vectoren',
    max_score: 1,
    correctie_model: 'a · b = (3 * -1) + (4 * 2) = -3 + 8 = 5.',
    difficulty: 1
  },
  {
    id: 909,
    examen_id: 'VWO_WiskundeB_2020_T2',
    vraag_nummer: 11,
    tekst_naam: 'Goniometrie',
    vraag_tekst: 'Bewijs de identiteit: tan(x) + 1/tan(x) = 1/(sin(x)cos(x)).',
    vraag_type: 'Bewijsvraag',
    kern_vaardigheid: 'Goniometrie',
    max_score: 2,
    correctie_model: 'Links: sin(x)/cos(x) + cos(x)/sin(x) = (sin²(x) + cos²(x)) / (sin(x)cos(x)). Omdat sin²(x) + cos²(x) = 1, is dit gelijk aan 1/(sin(x)cos(x)).',
    difficulty: 3
  },
  {
    id: 910,
    examen_id: 'VWO_WiskundeB_2020_T2',
    vraag_nummer: 12,
    tekst_naam: 'Limieten',
    vraag_tekst: 'Bereken de limiet van f(x) = (x² - 9) / (x - 3) als x nadert tot 3.',
    vraag_type: 'Berekeningsvraag',
    kern_vaardigheid: 'Limieten',
    max_score: 2,
    correctie_model: 'De teller kan worden ontbonden: (x-3)(x+3). Dus f(x) = x+3 (voor x≠3). De limiet is 3+3=6.',
    difficulty: 2
  }
];

export const fransExamQuestions: Question[] = [
    {
    id: 1001,
    examen_id: 'VWO_Frans_2023_T1',
    vraag_nummer: 1,
    tekst_naam: 'Le Monde',
    vraag_passage: 'La technologie a radicalement transformé notre façon de communiquer. Les réseaux sociaux, en particulier, permettent des échanges instantanés à travers le globe. Cependant, certains experts s\'inquiètent de la superficialité de ces interactions numériques par rapport aux conversations en face à face.',
    vraag_tekst: 'Quel est le principal inconvénient des réseaux sociaux mentionné dans le texte ?',
    vraag_type: 'Analysevraag',
    kern_vaardigheid: 'Tekstbegrip',
    max_score: 1,
    correctie_model: 'Le principal inconvénient est la superficialité des interactions numériques.',
    difficulty: 2,
  },
  {
    id: 1002,
    examen_id: 'VWO_Frans_2023_T1',
    vraag_nummer: 2,
    tekst_naam: 'Le télétravail',
    vraag_passage: 'Le télétravail, ou travail à distance, a connu une croissance exponentielle. S\'il offre une flexibilité appréciée, il pose aussi des défis en matière de cohésion d\'équipe et de séparation entre vie professionnelle et vie privée. Les entreprises doivent trouver un équilibre pour en maximiser les bénéfices.',
    vraag_tekst: 'D\'après le texte, quel est l\'un des défis du télétravail ?',
    vraag_type: 'Meerkeuzevraag',
    kern_vaardigheid: 'Tekstbegrip',
    max_score: 1,
    correctie_model: 'La bonne réponse est "Maintenir la cohésion d\'équipe", car le texte mentionne "défis en matière de cohésion d\'équipe".',
    difficulty: 1,
    options: ["Le manque de flexibilité", "Maintenir la cohésion d'équipe", "Une meilleure productivité", "Des coûts plus élevés pour l'entreprise"],
    correct_option: "Maintenir la cohésion d'équipe"
  },
  {
    id: 1003,
    examen_id: 'VWO_Frans_2023_T1',
    vraag_nummer: 3,
    tekst_naam: 'Le télétravail',
    vraag_tekst: 'Que signifie "croissance exponentielle" dans la première phrase?',
    vraag_type: 'Woordenschatvraag',
    kern_vaardigheid: 'Woordenschat',
    max_score: 2,
    correctie_model: 'Une augmentation très rapide et forte.',
    difficulty: 2,
    context_id: 1002
  },
  {
    id: 1004,
    examen_id: 'VWO_Frans_2022_T2',
    vraag_nummer: 5,
    tekst_naam: 'La mode rapide',
    vraag_passage: 'La "fast fashion", ou mode éphémère, est critiquée pour son impact environnemental et social. La production de vêtements à bas coût entraîne une surconsommation et une énorme quantité de déchets textiles. De plus, les conditions de travail dans les usines sont souvent précaires.',
    vraag_tekst: 'Citez deux critiques de la "fast fashion" mentionnées dans le texte.',
    vraag_type: 'Analysevraag',
    kern_vaardigheid: 'Tekstbegrip',
    max_score: 2,
    correctie_model: 'Les deux critiques sont l\'impact environnemental (surconsommation, déchets) et l\'impact social (conditions de travail précaires).',
    difficulty: 2
  },
  {
    id: 1005,
    examen_id: 'VWO_Frans_2022_T2',
    vraag_nummer: 6,
    tekst_naam: 'La mode rapide',
    vraag_tekst: 'Comment pourrait-on traduire "éphémère" dans ce contexte ?',
    vraag_type: 'Woordenschatvraag',
    kern_vaardigheid: 'Woordenschat',
    max_score: 1,
    correctie_model: 'Kortstondig, vergankelijk, niet-blijvend.',
    difficulty: 3,
    context_id: 1004
  },
  {
    id: 1006,
    examen_id: 'VWO_Frans_2021_T1',
    vraag_nummer: 8,
    tekst_naam: 'L\'intelligence artificielle',
    vraag_passage: 'L\'intelligence artificielle (IA) soulève autant d\'espoirs que de craintes. D\'un côté, elle promet des avancées majeures en médecine et en science. De l\'autre, elle fait craindre des pertes d\'emplois massives et des dilemmes éthiques, notamment concernant l\'autonomie des machines.',
    vraag_tekst: 'Quelle est l\'attitude de l\'auteur face à l\'IA ?',
    vraag_type: 'Toonvraag',
    kern_vaardigheid: 'Tekstbegrip',
    max_score: 1,
    correctie_model: 'L\'attitude est nuancée, équilibrée ou ambivalente. L\'auteur présente à la fois les aspects positifs (espoirs) et négatifs (craintes).',
    difficulty: 2
  },
  {
    id: 1007,
    examen_id: 'VWO_Frans_2021_T1',
    vraag_nummer: 9,
    tekst_naam: 'L\'intelligence artificielle',
    vraag_tekst: 'Quel mot du texte est synonyme de "peurs" ?',
    vraag_type: 'Woordenschatvraag',
    kern_vaardigheid: 'Woordenschat',
    max_score: 1,
    correctie_model: 'craintes',
    difficulty: 1,
    context_id: 1006
  },
  {
    id: 1008,
    examen_id: 'VWO_Frans_2020_T2',
    vraag_nummer: 11,
    tekst_naam: 'Le tourisme de masse',
    vraag_passage: 'Des villes comme Venise ou Barcelone souffrent du tourisme de masse. Si cette activité est une source de revenus importante, elle provoque aussi une saturation des infrastructures, une augmentation du coût de la vie pour les habitants et une dégradation du patrimoine. Il est donc impératif de trouver un modèle de tourisme plus durable.',
    vraag_tekst: 'Quel est le problème principal causé par le tourisme de masse selon le texte ?',
    vraag_type: 'Hoofdgedachtevraag',
    kern_vaardigheid: 'Tekstbegrip',
    max_score: 1,
    correctie_model: 'Le problème est que les effets négatifs (saturation, coût de la vie, dégradation) commencent à surpasser les bénéfices économiques, ce qui nécessite un changement vers un modèle durable.',
    difficulty: 3
  },
  {
    id: 1009,
    examen_id: 'VWO_Frans_2020_T2',
    vraag_nummer: 12,
    tekst_naam: 'Le tourisme de masse',
    vraag_tekst: 'Que veut dire "il est donc impératif" ?',
    vraag_type: 'Woordenschatvraag',
    kern_vaardigheid: 'Woordenschat',
    max_score: 1,
    correctie_model: 'Het is dus absoluut noodzakelijk / dringend nodig.',
    difficulty: 2,
    context_id: 1008
  },
  {
    id: 1010,
    examen_id: 'VWO_Frans_2019_T1',
    vraag_nummer: 4,
    tekst_naam: 'L\'alimentation bio',
    vraag_passage: 'La consommation de produits biologiques est en hausse constante. Les consommateurs sont attirés par la promesse d\'aliments plus sains, sans pesticides, et plus respectueux de l\'environnement. Néanmoins, leur prix plus élevé reste un frein majeur pour de nombreux ménages.',
    vraag_tekst: 'Quelle est la principale raison qui empêche certaines personnes d\'acheter des produits bio ?',
    vraag_type: 'Analysevraag',
    kern_vaardigheid: 'Tekstbegrip',
    max_score: 1,
    correctie_model: 'Leur prix plus élevé.',
    difficulty: 1
  }
];

export const duitsExamQuestions: Question[] = [
    {
    id: 1101,
    examen_id: 'VWO_Duits_2023_T1',
    vraag_nummer: 1,
    tekst_naam: 'Die Zeit',
    vraag_passage: 'Die Energiewende ist eine der größten Herausforderungen für Deutschland. Der Übergang zu erneuerbaren Energien wie Wind und Sonne ist politisch gewollt, stellt aber auch hohe Anforderungen an die Netzinfrastruktur und die Speicherkapazitäten.',
    vraag_tekst: 'Was sind laut dem Text zwei große Schwierigkeiten bei der Energiewende?',
    vraag_type: 'Analysevraag',
    kern_vaardigheid: 'Tekstbegrip',
    max_score: 2,
    correctie_model: 'Die zwei Schwierigkeiten sind die Anforderungen an die Netzinfrastruktur und die Speicherkapazitäten.',
    difficulty: 2,
  },
  {
    id: 1102,
    examen_id: 'VWO_Duits_2023_T1',
    vraag_nummer: 2,
    tekst_naam: 'Digitalisierung in der Schule',
    vraag_passage: 'Die Digitalisierung verändert die Schulen grundlegend. Tablets ersetzen schwere Bücher und interaktive Whiteboards den traditionellen Kreidetafelunterricht. Lehrer müssen sich fortbilden, um die neuen Medien pädagogisch sinnvoll einzusetzen. Der größte Vorteil ist der Zugang zu aktuellen Informationen, doch die Gefahr der Ablenkung ist ebenfalls präsent.',
    vraag_tekst: 'Was ist laut dem Text die größte Gefahr der Digitalisierung in der Schule?',
    vraag_type: 'Analysevraag',
    kern_vaardigheid: 'Tekstbegrip',
    max_score: 1,
    correctie_model: 'Die größte Gefahr ist die Ablenkung der Schüler.',
    difficulty: 1
  },
  {
    id: 1103,
    examen_id: 'VWO_Duits_2023_T1',
    vraag_nummer: 3,
    tekst_naam: 'Digitalisierung in der Schule',
    vraag_tekst: 'Welche Aussage über Lehrer wird im Text gemacht?',
    vraag_type: 'Meerkeuzevraag',
    kern_vaardigheid: 'Tekstbegrip',
    max_score: 2,
    correctie_model: 'The correct answer is "Sie müssen lernen, neue Technologien im Unterricht zu nutzen", which corresponds to "Lehrer müssen sich fortbilden...".',
    difficulty: 2,
    context_id: 1102,
    options: ["Sie sind gegen die Digitalisierung.", "Sie brauchen keine neuen Fähigkeiten.", "Sie müssen lernen, neue Technologien im Unterricht zu nutzen.", "Sie finden die traditionelle Methode besser."],
    correct_option: "Sie müssen lernen, neue Technologien im Unterricht zu nutzen."
  },
  {
    id: 1104,
    examen_id: 'VWO_Duits_2022_T2',
    vraag_nummer: 5,
    tekst_naam: 'Der Wert der Arbeit',
    vraag_passage: 'Die Debatte über ein bedingungsloses Grundeinkommen gewinnt an Fahrt. Befürworter argumentieren, es würde Armut bekämpfen und den Menschen mehr Freiheit geben, sich kreativ oder ehrenamtlich zu betätigen. Gegner hingegen warnen vor den immensen Kosten und einer möglichen Abnahme der Arbeitsmotivation.',
    vraag_tekst: 'Nennen Sie ein Argument der Gegner des bedingungslosen Grundeinkommens.',
    vraag_type: 'Analysevraag',
    kern_vaardigheid: 'Tekstbegrip',
    max_score: 1,
    correctie_model: 'Ein Argument ist die Sorge vor den hohen Kosten oder die Befürchtung, dass die Menschen weniger motiviert wären zu arbeiten.',
    difficulty: 2
  },
  {
    id: 1105,
    examen_id: 'VWO_Duits_2022_T2',
    vraag_nummer: 6,
    tekst_naam: 'Der Wert der Arbeit',
    vraag_tekst: 'Was bedeutet "ehrenamtlich" in diesem Kontext?',
    vraag_type: 'Woordenschatvraag',
    kern_vaardigheid: 'Woordenschat',
    max_score: 1,
    correctie_model: 'Vrijwillig / onbetaald (vrijwilligerswerk).',
    difficulty: 2,
    context_id: 1104
  },
  {
    id: 1106,
    examen_id: 'VWO_Duits_2021_T1',
    vraag_nummer: 8,
    tekst_naam: 'Klimawandel',
    vraag_passage: 'Der Klimawandel ist nicht mehr nur eine abstrakte Bedrohung, sondern manifestiert sich bereits heute in Form von Extremwetterereignissen. Hitzewellen, Dürren und Überschwemmungen nehmen weltweit zu. Um die schlimmsten Folgen abzuwenden, ist ein entschlossenes Handeln der internationalen Gemeinschaft erforderlich.',
    vraag_tekst: 'Was meint der Autor mit "abstrake Bedrohung"?',
    vraag_type: 'Uitlegvraag',
    kern_vaardigheid: 'Tekstbegrip',
    max_score: 2,
    correctie_model: 'Eine Bedrohung, die nicht konkret oder greifbar ist, sondern eher theoretisch oder in der fernen Zukunft liegt.',
    difficulty: 3
  },
  {
    id: 1107,
    examen_id: 'VWO_Duits_2021_T1',
    vraag_nummer: 9,
    tekst_naam: 'Klimawandel',
    vraag_tekst: 'Was ist laut dem Text notwendig, um die schlimmsten Folgen des Klimawandels zu verhindern?',
    vraag_type: 'Analysevraag',
    kern_vaardigheid: 'Tekstbegrip',
    max_score: 1,
    correctie_model: 'Ein entschlossenes Handeln der internationalen Gemeinschaft.',
    difficulty: 1,
    context_id: 1106
  },
  {
    id: 1108,
    examen_id: 'VWO_Duits_2020_T2',
    vraag_nummer: 11,
    tekst_naam: 'Soziale Medien',
    vraag_passage: 'Soziale Medien haben die politische Kommunikation revolutioniert. Politiker können direkt mit den Wählern interagieren. Diese Entwicklung hat jedoch auch eine Kehrseite: die schnelle Verbreitung von Falschnachrichten und die Entstehung von Echokammern, in denen nur die eigene Meinung bestätigt wird.',
    vraag_tekst: 'Was ist die "Kehrseite" der sozialen Medien, die im Text genannt wird?',
    vraag_type: 'Analysevraag',
    kern_vaardigheid: 'Tekstbegrip',
    max_score: 2,
    correctie_model: 'Die Kehrseite ist die schnelle Verbreitung von Falschnachrichten und die Entstehung von Echokammern.',
    difficulty: 2
  },
  {
    id: 1109,
    examen_id: 'VWO_Duits_2020_T2',
    vraag_nummer: 12,
    tekst_naam: 'Soziale Medien',
    vraag_tekst: 'Erklären Sie, was eine "Echokammer" ist.',
    vraag_type: 'Uitlegvraag',
    kern_vaardigheid: 'Tekstbegrip',
    max_score: 1,
    correctie_model: 'Eine Umgebung (im Internet), in der man hauptsächlich oder nur mit Meinungen konfrontiert wird, die der eigenen entsprechen.',
    difficulty: 3,
    context_id: 1108
  },
  {
    id: 1110,
    examen_id: 'VWO_Duits_2019_T1',
    vraag_nummer: 4,
    tekst_naam: 'Die Rolle des Sports',
    vraag_passage: 'Sport ist mehr als nur körperliche Betätigung; er ist ein wichtiger sozialer Kitt. In Vereinen lernen Kinder und Jugendliche Teamgeist, Fairness und den Umgang mit Sieg und Niederlage. Darüber hinaus fördert regelmäßige Bewegung die Gesundheit und beugt Krankheiten vor.',
    vraag_tekst: 'Welche zwei Hauptvorteile von Sport werden im Text genannt?',
    vraag_type: 'Analysevraag',
    kern_vaardigheid: 'Tekstbegrip',
    max_score: 2,
    correctie_model: 'Die sozialen Vorteile (Teamgeist, Fairness) und die gesundheitlichen Vorteile (Gesundheitsförderung, Krankheitsvorbeugung).',
    difficulty: 1
  }
];