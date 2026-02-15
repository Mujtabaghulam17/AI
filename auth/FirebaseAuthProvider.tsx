import React, { useState, useEffect, useContext, createContext } from 'react';
import {
    auth,
    googleProvider,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    onAuthStateChanged,
    signOut,
    sendPasswordResetEmail,
    updateProfile,
    type FirebaseUser
} from '../api/firebase';
import type { User } from '../data/data.ts';

interface AuthContextType {
    user: User | null;
    firebaseUser: FirebaseUser | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    loginWithEmail: (email: string, password: string) => Promise<{ error?: string }>;
    registerWithEmail: (email: string, password: string, name: string) => Promise<{ error?: string }>;
    loginWithGoogle: () => Promise<{ error?: string }>;
    resetPassword: (email: string) => Promise<{ error?: string }>;
    logout: () => Promise<void>;
    // Backwards compatibility with Auth0 interface
    loginWithRedirect: (options?: any) => Promise<void>;
    loginWithPopup: (options?: any) => Promise<void>;
}

export const Auth0Context = createContext<AuthContextType | null>(null);
export const useAuth0 = () => useContext(Auth0Context)!;

export const FirebaseAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!auth) {
            console.warn("⚠️ Firebase Auth not initialized");
            setIsLoading(false);
            return;
        }

        const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
            if (fbUser) {
                setFirebaseUser(fbUser);
                setUser({
                    name: fbUser.displayName || fbUser.email?.split('@')[0] || 'Gebruiker',
                    picture: fbUser.photoURL || '',
                    email: fbUser.email || undefined,
                });
                setIsAuthenticated(true);
            } else {
                setFirebaseUser(null);
                setUser(null);
                setIsAuthenticated(false);
            }
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const loginWithEmail = async (email: string, password: string): Promise<{ error?: string }> => {
        if (!auth) return { error: 'Firebase niet geïnitialiseerd' };
        try {
            await signInWithEmailAndPassword(auth, email, password);
            return {};
        } catch (err: any) {
            const message = getFirebaseErrorMessage(err.code);
            return { error: message };
        }
    };

    const registerWithEmail = async (email: string, password: string, name: string): Promise<{ error?: string }> => {
        if (!auth) return { error: 'Firebase niet geïnitialiseerd' };
        try {
            const result = await createUserWithEmailAndPassword(auth, email, password);
            await updateProfile(result.user, { displayName: name });
            // Update local state with name
            setUser({
                name: name,
                picture: '',
                email: result.user.email || undefined,
            });
            return {};
        } catch (err: any) {
            const message = getFirebaseErrorMessage(err.code);
            return { error: message };
        }
    };

    const loginWithGoogle = async (): Promise<{ error?: string }> => {
        if (!auth) return { error: 'Firebase niet geïnitialiseerd' };
        try {
            await signInWithPopup(auth, googleProvider);
            return {};
        } catch (err: any) {
            if (err.code === 'auth/popup-closed-by-user') return {};
            const message = getFirebaseErrorMessage(err.code);
            return { error: message };
        }
    };

    const resetPassword = async (email: string): Promise<{ error?: string }> => {
        if (!auth) return { error: 'Firebase niet geïnitialiseerd' };
        try {
            await sendPasswordResetEmail(auth, email);
            return {};
        } catch (err: any) {
            const message = getFirebaseErrorMessage(err.code);
            return { error: message };
        }
    };

    const handleLogout = async () => {
        if (!auth) return;
        await signOut(auth);
    };

    // Backwards compatibility shims
    const loginWithRedirect = async () => {
        await loginWithGoogle();
    };
    const loginWithPopup = async () => {
        await loginWithGoogle();
    };

    const contextValue: AuthContextType = {
        user,
        firebaseUser,
        isAuthenticated,
        isLoading,
        loginWithEmail,
        registerWithEmail,
        loginWithGoogle,
        resetPassword,
        logout: handleLogout,
        loginWithRedirect,
        loginWithPopup,
    };

    return (
        <Auth0Context.Provider value={contextValue}>
            {children}
        </Auth0Context.Provider>
    );
};

function getFirebaseErrorMessage(code: string): string {
    switch (code) {
        case 'auth/user-not-found':
            return 'Geen account gevonden met dit e-mailadres.';
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
            return 'Ongeldig wachtwoord. Probeer het opnieuw.';
        case 'auth/email-already-in-use':
            return 'Dit e-mailadres is al in gebruik.';
        case 'auth/weak-password':
            return 'Wachtwoord moet minimaal 6 tekens zijn.';
        case 'auth/invalid-email':
            return 'Ongeldig e-mailadres.';
        case 'auth/too-many-requests':
            return 'Te veel pogingen. Probeer het later opnieuw.';
        case 'auth/network-request-failed':
            return 'Netwerkfout. Controleer je internetverbinding.';
        case 'auth/popup-blocked':
            return 'Pop-up geblokkeerd. Sta pop-ups toe voor deze site.';
        default:
            return 'Er ging iets mis. Probeer het opnieuw.';
    }
}
