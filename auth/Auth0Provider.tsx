import React, { useState, useEffect, useContext, createContext } from 'react';
import { createAuth0Client, Auth0Client, PopupLoginOptions } from '@auth0/auth0-spa-js';
import type { User } from '../data/data.ts';

interface Auth0ContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    loginWithRedirect: (options?: any) => Promise<void>;
    loginWithPopup: (options?: PopupLoginOptions) => Promise<void>;
    logout: (options?: any) => void;
}

export const Auth0Context = createContext<Auth0ContextType | null>(null);
export const useAuth0 = () => useContext(Auth0Context)!;

interface Auth0ProviderProps {
    children: React.ReactNode;
    domain: string;
    clientId: string;
    redirectUri: string;
}

export const Auth0Provider: React.FC<Auth0ProviderProps> = ({ children, domain, clientId, redirectUri }) => {
    const [auth0Client, setAuth0Client] = useState<Auth0Client | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const initAuth0 = async () => {
            try {
                const client = await createAuth0Client({
                    domain,
                    clientId,
                    cacheLocation: 'localstorage', // Persist session across page refreshes
                    useRefreshTokens: true, // Use refresh tokens for long-lived sessions
                    authorizationParams: {
                        redirect_uri: redirectUri
                    }
                });
                setAuth0Client(client);

                if (window.location.search.includes('code=') && window.location.search.includes('state=')) {
                    try {
                        await client.handleRedirectCallback();
                        window.history.replaceState({}, document.title, '/');
                    } catch (callbackError: any) {
                        // Invalid state error - clear URL and continue
                        console.warn("Callback handling failed, clearing state:", callbackError.message);
                        window.history.replaceState({}, document.title, '/');
                    }
                }

                const authenticated = await client.isAuthenticated();
                setIsAuthenticated(authenticated);

                if (authenticated) {
                    const userData = await client.getUser();
                    if (userData) {
                        setUser({
                            name: userData.name || userData.email || 'Gebruiker',
                            picture: userData.picture || '',
                            email: userData.email
                        });
                    }
                }
            } catch (error: any) {
                console.error("Auth0 initialization error:", error);

                // Auto-recovery for "Invalid state" error
                if (error.message?.includes('Invalid state')) {
                    console.log("🔄 Clearing corrupted Auth0 state...");
                    // Clear all Auth0-related storage
                    Object.keys(localStorage).forEach(key => {
                        if (key.startsWith('@@auth0') || key.startsWith('a0.')) {
                            localStorage.removeItem(key);
                        }
                    });
                    // Clear URL params and reload
                    if (window.location.search) {
                        window.history.replaceState({}, document.title, '/');
                        window.location.reload();
                    }
                }
            } finally {
                setIsLoading(false);
            }
        };

        initAuth0();
    }, [domain, clientId, redirectUri]);

    const loginWithRedirect = async (options?: any) => {
        if (auth0Client) {
            await auth0Client.loginWithRedirect(options);
        }
    };

    const loginWithPopup = async (options?: PopupLoginOptions) => {
        if (!auth0Client) return;

        setIsLoading(true);
        try {
            // This promise resolves when the popup is closed by the user or after a successful login.
            await auth0Client.loginWithPopup(options);

            // After the popup interaction, we must explicitly re-evaluate the session state.
            const authenticated = await auth0Client.isAuthenticated();
            setIsAuthenticated(authenticated);

            if (authenticated) {
                const userData = await auth0Client.getUser();
                if (userData) {
                    setUser({
                        name: userData.name || userData.email || 'Gebruiker',
                        picture: userData.picture || '',
                        email: userData.email,
                    });
                } else {
                    setUser(null);
                }
            } else {
                setUser(null);
            }
        } catch (error: any) {
            // The most common "error" is the user closing the popup. We can safely ignore this.
            if (error?.error !== 'popup_closed') {
                console.error("Login with popup failed:", error);
            }
            // Ensure state is clean if login fails for any reason.
            setIsAuthenticated(false);
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    };


    const logout = (options?: any) => {
        if (auth0Client) {
            auth0Client.logout(options);
        }
    };

    const contextValue = {
        isAuthenticated,
        user,
        isLoading,
        loginWithRedirect,
        loginWithPopup,
        logout,
    };

    return (
        <Auth0Context.Provider value={contextValue}>
            {children}
        </Auth0Context.Provider>
    );
};
