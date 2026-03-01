import { saveUserDataToFirestore, getUserDataFromFirestore, createUserDocument, UserFirestoreData } from '../api/firebase';

// Debounce timer reference
let syncDebounceTimer: ReturnType<typeof setTimeout> | null = null;

// Queue for offline changes
let pendingChanges: Partial<UserFirestoreData> = {};

// Last sync timestamp
let lastSyncTime = 0;

// Minimum time between syncs (5 seconds)
const MIN_SYNC_INTERVAL = 5000;

/**
 * Debounced sync to Firestore
 * Batches multiple rapid changes into a single write
 */
export const debouncedSync = (userId: string, data: Partial<UserFirestoreData>, delay: number = 2000): void => {
    // Merge with pending changes
    pendingChanges = { ...pendingChanges, ...data };

    // Clear existing timer
    if (syncDebounceTimer) {
        clearTimeout(syncDebounceTimer);
    }

    // Set new timer
    syncDebounceTimer = setTimeout(async () => {
        const now = Date.now();

        // Respect minimum sync interval
        if (now - lastSyncTime < MIN_SYNC_INTERVAL) {
            // Reschedule
            debouncedSync(userId, {}, MIN_SYNC_INTERVAL - (now - lastSyncTime));
            return;
        }

        // Perform sync
        const success = await saveUserDataToFirestore(userId, pendingChanges);

        if (success) {
            lastSyncTime = now;
            pendingChanges = {};
            console.log("📤 Data synced to Firestore");
        } else {
            console.warn("⚠️ Sync failed, will retry on next change");
        }
    }, delay);
};

/**
 * Force immediate sync (use sparingly)
 */
export const forceSync = async (userId: string, data: Partial<UserFirestoreData>): Promise<boolean> => {
    // Clear pending timer
    if (syncDebounceTimer) {
        clearTimeout(syncDebounceTimer);
        syncDebounceTimer = null;
    }

    // Merge with pending changes
    const allData = { ...pendingChanges, ...data };

    const success = await saveUserDataToFirestore(userId, allData);

    if (success) {
        lastSyncTime = Date.now();
        pendingChanges = {};
    }

    return success;
};

/**
 * Load user data from Firestore and merge with localStorage
 * Server data takes precedence for conflicts
 */
export const loadAndMergeUserData = async (
    userId: string,
    email?: string,
    name?: string
): Promise<{
    data: UserFirestoreData | null;
    isNewUser: boolean;
}> => {
    // First, ensure user document exists
    await createUserDocument(userId, email, name);

    // Load from Firestore
    const serverData = await getUserDataFromFirestore(userId);

    if (!serverData) {
        return { data: null, isNewUser: true };
    }

    // Check if this is essentially a new user (no progress)
    const isNewUser = serverData.level === 1 &&
        serverData.xp === 0 &&
        Object.keys(serverData.subjectData || {}).length === 0;

    return { data: serverData, isNewUser };
};

/**
 * Sync critical data immediately (like premium status)
 */
export const syncCriticalData = async (
    userId: string,
    data: Pick<UserFirestoreData, 'isPremium' | 'subscriptionTier' | 'stripeCustomerId' | 'subscriptionId' | 'subscriptionStatus'>
): Promise<boolean> => {
    return forceSync(userId, data);
};

/**
 * Get user ID from Auth0 user object
 * Normalizes the ID to be Firestore-safe
 */
export const getUserIdFromAuth = (user: { sub?: string; email?: string } | null): string | null => {
    if (!user) return null;

    // Auth0 uses 'sub' as the unique identifier
    // It looks like: "auth0|abc123" or "google-oauth2|123456"
    const rawId = user.sub || user.email;

    if (!rawId) return null;

    // Make Firestore-safe (replace special characters)
    return rawId.replace(/[|/]/g, '_');
};

/**
 * Prepare data for Firestore sync from app state.
 * 
 * NOTE: subscriptionTier, isPremium, and primarySubject are intentionally
 * EXCLUDED here. They must only be updated via updateSubscriptionTier()
 * (from payment success or webhook), never by the general debounced sync.
 * Otherwise the default 'free' value overwrites Firestore on page load.
 */
export const prepareDataForSync = (appState: {
    level: number;
    xp: number;
    studyStreak: number;
    earnedBadges: string[];
    subjectData: any;
    globalPulseCheck: { year: number; week: number } | null;
}): Partial<UserFirestoreData> => {
    return {
        level: appState.level,
        xp: appState.xp,
        studyStreak: appState.studyStreak,
        earnedBadges: appState.earnedBadges,
        subjectData: appState.subjectData,
        globalPulseCheck: appState.globalPulseCheck,
    };
};
