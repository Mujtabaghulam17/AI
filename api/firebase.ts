import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { getAnalytics, isSupported } from "firebase/analytics";
import {
    getAuth,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    onAuthStateChanged,
    signOut,
    sendPasswordResetEmail,
    updateProfile,
    type Auth,
    type User as FirebaseUser
} from 'firebase/auth';

// Helper function to safely get environment variables
// Works in both Vite (import.meta.env) and Node/Build (process.env) environments
const getEnv = (key: string, fallbackKey?: string): string | undefined => {
    try {
        // @ts-ignore
        if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
            // @ts-ignore
            return import.meta.env[key];
        }
    } catch (e) {
        // Ignore errors accessing import.meta
    }

    try {
        // @ts-ignore
        if (typeof process !== 'undefined' && process.env) {
            // @ts-ignore
            if (process.env[key]) return process.env[key];
            // @ts-ignore
            if (fallbackKey && process.env[fallbackKey]) return process.env[fallbackKey];
        }
    } catch (e) {
        // Ignore errors accessing process
    }

    return undefined;
};

const firebaseConfig = {
    apiKey: getEnv('VITE_FIREBASE_API_KEY', 'FIREBASE_API_KEY'),
    authDomain: getEnv('VITE_FIREBASE_AUTH_DOMAIN', 'FIREBASE_AUTH_DOMAIN'),
    projectId: getEnv('VITE_FIREBASE_PROJECT_ID', 'FIREBASE_PROJECT_ID'),
    storageBucket: getEnv('VITE_FIREBASE_STORAGE_BUCKET', 'FIREBASE_STORAGE_BUCKET'),
    messagingSenderId: getEnv('VITE_FIREBASE_MESSAGING_SENDER_ID', 'FIREBASE_MESSAGING_SENDER_ID'),
    appId: getEnv('VITE_FIREBASE_APP_ID', 'FIREBASE_APP_ID'),
    measurementId: getEnv('VITE_FIREBASE_MEASUREMENT_ID', 'FIREBASE_MEASUREMENT_ID')
};

// Initialize Firebase
let app: ReturnType<typeof initializeApp> | null = null;
let db: ReturnType<typeof getFirestore> | null = null;
let auth: Auth | null = null;
let analytics: ReturnType<typeof getAnalytics> | null = null;
const googleProvider = new GoogleAuthProvider();

const initializeFirebase = async () => {
    try {
        // Check if crucial config is present
        if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
            console.warn("⚠️ Firebase config missing. Check your Environment Variables.");
            return false;
        }

        app = initializeApp(firebaseConfig);
        db = getFirestore(app);
        auth = getAuth(app);

        // Initialize analytics only in browser and if supported
        if (typeof window !== 'undefined') {
            const analyticsSupported = await isSupported();
            if (analyticsSupported) {
                analytics = getAnalytics(app);
            }
        }

        console.log("✅ Firebase initialized successfully");
        return true;
    } catch (error) {
        console.error("❌ Firebase initialization failed.", error);
        return false;
    }
};

// Initialize on module load
initializeFirebase();

export { db, auth, googleProvider };
export {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    onAuthStateChanged,
    signOut,
    sendPasswordResetEmail,
    updateProfile
};
export type { FirebaseUser };

// User data types
export interface UserFirestoreData {
    email?: string;
    name?: string;
    isPremium: boolean;
    stripeCustomerId?: string;
    subscriptionId?: string;
    subscriptionStatus?: 'active' | 'canceled' | 'past_due' | 'trialing';
    level: number;
    xp: number;
    studyStreak: number;
    earnedBadges: string[];
    subjectData: any; // Using any for flexibility with the complex subject data structure
    globalPulseCheck: { year: number; week: number } | null;
    createdAt: string;
    updatedAt: string;
}

/**
 * Get user data from Firestore
 */
export const getUserDataFromFirestore = async (userId: string): Promise<UserFirestoreData | null> => {
    if (!db) {
        console.warn("Firestore not initialized, cannot get user data");
        return null;
    }

    try {
        const docRef = doc(db, "users", userId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return docSnap.data() as UserFirestoreData;
        } else {
            return null;
        }
    } catch (error: any) {
        // Only log as error if it's not a permission issue (expected when Firestore rules aren't set)
        if (error?.code === 'permission-denied') {
            console.warn("⚠️ Firestore permissions not configured, using localStorage fallback");
        } else {
            console.error("Error getting user document:", error);
        }
        return null;
    }
};

/**
 * Save user data to Firestore (creates or merges)
 */
export const saveUserDataToFirestore = async (userId: string, data: Partial<UserFirestoreData>): Promise<boolean> => {
    if (!db) {
        console.warn("Firestore not initialized, cannot save user data");
        return false;
    }

    try {
        const docRef = doc(db, "users", userId);
        await setDoc(docRef, {
            ...data,
            updatedAt: new Date().toISOString()
        }, { merge: true });
        return true;
    } catch (error: any) {
        if (error?.code === 'permission-denied') {
            // Expected when Firestore rules aren't configured - localStorage fallback handles this
            return false;
        }
        console.error("Error writing user document:", error);
        return false;
    }
};

/**
 * Update premium status in Firestore
 */
export const updatePremiumStatus = async (
    userId: string,
    isPremium: boolean,
    stripeCustomerId?: string,
    subscriptionId?: string,
    subscriptionStatus?: 'active' | 'canceled' | 'past_due' | 'trialing'
): Promise<boolean> => {
    if (!db) {
        console.warn("Firestore not initialized, cannot update premium status");
        return false;
    }

    try {
        const docRef = doc(db, "users", userId);
        await updateDoc(docRef, {
            isPremium,
            ...(stripeCustomerId && { stripeCustomerId }),
            ...(subscriptionId && { subscriptionId }),
            ...(subscriptionStatus && { subscriptionStatus }),
            updatedAt: new Date().toISOString()
        });
        console.log(`✅ Premium status updated: ${isPremium}`);
        return true;
    } catch (error) {
        console.error("Error updating premium status:", error);
        return false;
    }
};

/**
 * Create initial user document on first login
 */
export const createUserDocument = async (userId: string, email?: string, name?: string): Promise<boolean> => {
    if (!db) {
        console.warn("Firestore not initialized, cannot create user document");
        return false;
    }

    try {
        const existing = await getUserDataFromFirestore(userId);
        if (existing) {
            // User already exists, just update last login
            await saveUserDataToFirestore(userId, { email, name });
            return true;
        }

        // Create new user document
        const initialData: UserFirestoreData = {
            email,
            name,
            isPremium: false,
            level: 1,
            xp: 0,
            studyStreak: 0,
            earnedBadges: [],
            subjectData: {},
            globalPulseCheck: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        await saveUserDataToFirestore(userId, initialData);
        console.log("✅ Created new user document");
        return true;
    } catch (error) {
        console.error("Error creating user document:", error);
        return false;
    }
};
