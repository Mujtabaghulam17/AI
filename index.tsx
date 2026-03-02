
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { FirebaseAuthProvider } from './auth/FirebaseAuthProvider';
import ErrorBoundary from './components/ErrorBoundary';

// Ensure root element exists before trying to create root
const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');

const root = ReactDOM.createRoot(rootElement);

root.render(
    <React.StrictMode>
        <ErrorBoundary>
            <FirebaseAuthProvider>
                <App />
            </FirebaseAuthProvider>
        </ErrorBoundary>
    </React.StrictMode>
);
