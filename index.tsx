
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { FirebaseAuthProvider } from './auth/FirebaseAuthProvider';
import ErrorBoundary from './components/ErrorBoundary';
import { ToastProvider } from './components/ToastNotification';
import { initSentry } from './utils/sentry';

// Initialize Sentry error tracking (requires VITE_SENTRY_DSN env var)
initSentry();

// Ensure root element exists before trying to create root
const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');

const root = ReactDOM.createRoot(rootElement);

root.render(
    <React.StrictMode>
        <ErrorBoundary>
            <ToastProvider>
                <FirebaseAuthProvider>
                    <App />
                </FirebaseAuthProvider>
            </ToastProvider>
        </ErrorBoundary>
    </React.StrictMode>
);
