/**
 * Subscription Tier System for GlowExamen
 * 
 * Free:   5 AI calls/day, all subjects (limited), no exam predictor
 * Focus:  €14.99/month — unlimited AI, 1 subject (onboarding subject), exam predictor for 1 subject
 * Totaal: €24.99/month — unlimited AI, all subjects, exam predictor for all subjects
 */

export type SubscriptionTier = 'free' | 'focus' | 'totaal';

const TIER_RANK: Record<SubscriptionTier, number> = {
    free: 0,
    focus: 1,
    totaal: 2,
};

// --- Constants ---
export const DAILY_AI_LIMIT_FREE = 5;
export const DAILY_CHAT_LIMIT_FREE = 10;
export const TRIAL_DAYS = 3;

// --- Tier Checks ---

/** Returns true if user has any paid subscription */
export const isPaidTier = (tier: SubscriptionTier): boolean => {
    return tier === 'focus' || tier === 'totaal';
};

// --- Trial Helpers ---

/** Returns true if the account is within the free trial window and not yet paid */
export const isInTrial = (tier: SubscriptionTier, createdAt?: string): boolean => {
    if (isPaidTier(tier)) return false;
    if (!createdAt) return false;
    const created = new Date(createdAt).getTime();
    const trialEnd = created + TRIAL_DAYS * 24 * 60 * 60 * 1000;
    return Date.now() < trialEnd;
};

/** Returns how many full days remain in the trial (0 if expired or paid) */
export const trialDaysLeft = (tier: SubscriptionTier, createdAt?: string): number => {
    if (!isInTrial(tier, createdAt)) return 0;
    const created = new Date(createdAt!).getTime();
    const trialEnd = created + TRIAL_DAYS * 24 * 60 * 60 * 1000;
    return Math.max(0, Math.ceil((trialEnd - Date.now()) / (24 * 60 * 60 * 1000)));
};

export const getTierRank = (tier: SubscriptionTier): number => TIER_RANK[tier];

export const getHigherTier = (left: SubscriptionTier, right: SubscriptionTier): SubscriptionTier => {
    return getTierRank(left) >= getTierRank(right) ? left : right;
};

/** Returns true if user has full access to all subjects */
export const hasFullAccess = (tier: SubscriptionTier): boolean => {
    return tier === 'totaal';
};

/** Check if user can access a specific subject for full features */
export const canAccessSubject = (
    tier: SubscriptionTier,
    subject: string,
    primarySubject?: string
): boolean => {
    if (tier === 'totaal') return true;
    if (tier === 'focus') return subject === primarySubject;
    // Free: can access all subjects for basic practice (but limited by daily AI calls)
    return true;
};

/** Check if user can use the exam predictor for a subject */
export const canUseExamPredictor = (
    tier: SubscriptionTier,
    subject: string,
    primarySubject?: string
): boolean => {
    if (tier === 'totaal') return true;
    if (tier === 'focus') return subject === primarySubject;
    return false; // Free users cannot use exam predictor
};

/** Get the daily AI call limit for a tier */
export const getDailyAiLimit = (tier: SubscriptionTier): number => {
    if (isPaidTier(tier)) return Infinity;
    return DAILY_AI_LIMIT_FREE;
};

/** Get the daily chat message limit for a tier */
export const getDailyChatLimit = (tier: SubscriptionTier): number => {
    if (isPaidTier(tier)) return Infinity;
    return DAILY_CHAT_LIMIT_FREE;
};

/** Check if the daily AI limit has been reached */
export const isAiLimitReached = (tier: SubscriptionTier, dailyCount: number): boolean => {
    const limit = getDailyAiLimit(tier);
    return dailyCount >= limit;
};

/** Check if the daily chat limit has been reached */
export const isChatLimitReached = (tier: SubscriptionTier, dailyCount: number): boolean => {
    const limit = getDailyChatLimit(tier);
    return dailyCount >= limit;
};

// --- Payment Link Helpers ---

const getEnvVar = (key: string): string => {
    try {
        // @ts-ignore
        if (typeof import.meta !== 'undefined' && import.meta.env?.[key]) {
            // @ts-ignore
            return import.meta.env[key];
        }
    } catch (e) { }

    try {
        // @ts-ignore
        if (typeof process !== 'undefined' && process.env?.[key]) {
            // @ts-ignore
            return process.env[key];
        }
    } catch (e) { }

    return '';
};

/** Get the Stripe Payment Link URL for a specific tier */
export const getPaymentLinkForTier = (tier: 'focus' | 'totaal'): string => {
    if (tier === 'focus') {
        return getEnvVar('VITE_STRIPE_PAYMENT_LINK');
    }
    if (tier === 'totaal') {
        return getEnvVar('VITE_STRIPE_PAYMENT_LINK_PRO');
    }
    return '';
};

/** Get display info for a tier */
export const getTierDisplayInfo = (tier: SubscriptionTier) => {
    switch (tier) {
        case 'free':
            return { name: 'Starter', price: 0, label: 'Gratis' };
        case 'focus':
            return { name: 'Focus', price: 14.99, label: '€14,99/mnd' };
        case 'totaal':
            return { name: 'Totaal', price: 24.99, label: '€24,99/mnd' };
    }
};

/** Convert legacy isPremium boolean to a tier */
export const legacyToTier = (isPremium: boolean): SubscriptionTier => {
    return isPremium ? 'focus' : 'free';
};
