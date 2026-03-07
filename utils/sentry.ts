/// <reference types="vite/client" />
import * as Sentry from '@sentry/react';

const SENTRY_DSN = (import.meta as any).env?.VITE_SENTRY_DSN || '';

export function initSentry() {
    if (!SENTRY_DSN) {
        console.warn('[Sentry] Geen DSN gevonden — error tracking uitgeschakeld. Stel VITE_SENTRY_DSN in voor productie.');
        return;
    }

    Sentry.init({
        dsn: SENTRY_DSN,
        environment: (import.meta as any).env?.MODE || 'development',
        // Performance: sample 20% van transacties
        tracesSampleRate: 0.2,
        // Alleen errors in productie
        enabled: (import.meta as any).env?.PROD ?? true,
        // Filters
        beforeSend(event) {
            // Filter spammy errors
            if (event.exception?.values?.some(e =>
                e.value?.includes('ResizeObserver') ||
                e.value?.includes('Loading chunk') ||
                e.value?.includes('ChunkLoadError')
            )) {
                return null;
            }
            return event;
        },
        // User privacy — geen PII
        beforeBreadcrumb(breadcrumb) {
            if (breadcrumb.category === 'console' && breadcrumb.level !== 'error') {
                return null;
            }
            return breadcrumb;
        },
    });
}

export function captureError(error: unknown, context?: Record<string, unknown>) {
    if (SENTRY_DSN) {
        Sentry.captureException(error, { extra: context });
    }
    console.error('[GlowExamen Error]', error, context);
}

export function setUser(userId: string, email?: string) {
    Sentry.setUser({ id: userId, email });
}

export function clearUser() {
    Sentry.setUser(null);
}

export { Sentry };
