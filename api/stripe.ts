import { loadStripe, Stripe } from '@stripe/stripe-js';
import { getPaymentLinkForTier } from '../utils/subscriptionTiers';
import type { SubscriptionTier } from '../utils/subscriptionTiers';

// Get Stripe publishable key from environment
const getStripeKey = (): string => {
    try {
        // @ts-ignore
        if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_STRIPE_PUBLISHABLE_KEY) {
            // @ts-ignore
            return import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
        }
    } catch (e) { }

    try {
        // @ts-ignore
        if (typeof process !== 'undefined' && process.env?.VITE_STRIPE_PUBLISHABLE_KEY) {
            // @ts-ignore
            return process.env.VITE_STRIPE_PUBLISHABLE_KEY;
        }
    } catch (e) { }

    return '';
};

const stripePublishableKey = getStripeKey();

let stripePromise: Promise<Stripe | null> | null = null;

/**
 * Get Stripe instance (lazy loaded)
 */
export const getStripe = (): Promise<Stripe | null> => {
    if (!stripePublishableKey) {
        console.warn("⚠️ Stripe publishable key not configured");
        return Promise.resolve(null);
    }

    if (!stripePromise) {
        stripePromise = loadStripe(stripePublishableKey);
    }
    return stripePromise;
};

/**
 * Redirect to Stripe Checkout using Payment Links
 * Since stripe.redirectToCheckout is deprecated (removed Sep 2025),
 * we use Stripe Payment Links created from the Dashboard.
 */
export const redirectToCheckout = async (options: {
    userId: string;
    userEmail?: string;
    plan?: 'focus' | 'totaal';
    priceId?: string;
    successUrl?: string;
    cancelUrl?: string;
}): Promise<{ error?: string }> => {
    // Get payment link based on selected plan
    const plan = options.plan || 'focus';
    const paymentLink = getPaymentLinkForTier(plan);

    if (paymentLink) {
        try {
            // Build Payment Link URL with prefilled email and client_reference_id
            const url = new URL(paymentLink);
            if (options.userEmail) {
                url.searchParams.set('prefilled_email', options.userEmail);
            }
            url.searchParams.set('client_reference_id', options.userId);

            // Also store plan in localStorage as a fallback (survives redirects, unlike sessionStorage)
            localStorage.setItem('glowexamen_pending_plan', plan);
            localStorage.setItem('glowexamen_pending_user', options.userId);

            window.location.href = url.toString();
            return {};
        } catch (err: any) {
            console.error("Payment Link redirect error:", err);
            return { error: err.message || "Kon niet doorverwijzen naar betaalpagina." };
        }
    }

    return { error: "Stripe Payment Link is niet geconfigureerd. Stel VITE_STRIPE_PAYMENT_LINK in via het Stripe Dashboard." };
};

/**
 * Get Stripe Payment Link URL from environment
 */
const getPaymentLink = (): string => {
    try {
        // @ts-ignore
        if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_STRIPE_PAYMENT_LINK) {
            // @ts-ignore
            return import.meta.env.VITE_STRIPE_PAYMENT_LINK;
        }
    } catch (e) { }

    try {
        // @ts-ignore
        if (typeof process !== 'undefined' && process.env?.VITE_STRIPE_PAYMENT_LINK) {
            // @ts-ignore
            return process.env.VITE_STRIPE_PAYMENT_LINK;
        }
    } catch (e) { }

    return '';
};

/**
 * Get Stripe price ID from environment
 */
const getPriceId = (): string => {
    try {
        // @ts-ignore
        if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_STRIPE_PRICE_ID) {
            // @ts-ignore
            return import.meta.env.VITE_STRIPE_PRICE_ID;
        }
    } catch (e) { }

    try {
        // @ts-ignore
        if (typeof process !== 'undefined' && process.env?.VITE_STRIPE_PRICE_ID) {
            // @ts-ignore
            return process.env.VITE_STRIPE_PRICE_ID;
        }
    } catch (e) { }

    return '';
};

/**
 * Check if Stripe is configured
 */
export const isStripeConfigured = (): boolean => {
    return !!getPaymentLink() || (!!stripePublishableKey && !!getPriceId());
};

/**
 * Check for pending payment on page load.
 * 
 * Detection strategy (in priority order):
 * 1. URL contains `?payment=success` — Stripe redirect with custom after_completion URL
 * 2. URL path matches Stripe success pattern — some Payment Links redirect back automatically
 * 3. localStorage has pending_plan — user was redirected to Stripe and came back
 * 
 * The webhook (Layer 2) is the source of truth, this is for immediate UI feedback.
 */
export const checkPendingPayment = (): {
    success: boolean;
    plan?: 'focus' | 'totaal';
    userId?: string;
    canceled?: boolean;
} => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('payment');
    const planFromUrl = urlParams.get('plan') as 'focus' | 'totaal' | null;

    // Strategy 1: Explicit success params in URL
    if (paymentStatus === 'success') {
        const plan = planFromUrl || getPendingPlanFromStorage();
        const userId = localStorage.getItem('glowexamen_pending_user') || undefined;
        clearPendingPaymentData();
        // Clear URL params
        window.history.replaceState({}, document.title, window.location.pathname);
        return { success: true, plan: plan || 'focus', userId };
    }

    // Strategy 2: Payment canceled
    if (paymentStatus === 'canceled') {
        clearPendingPaymentData();
        window.history.replaceState({}, document.title, window.location.pathname);
        return { success: false, canceled: true };
    }

    return { success: false };
};

/** Read pending plan from localStorage (survives Stripe redirects) */
const getPendingPlanFromStorage = (): 'focus' | 'totaal' | null => {
    const plan = localStorage.getItem('glowexamen_pending_plan');
    if (plan === 'focus' || plan === 'totaal') return plan;
    return null;
};

/** Clear all pending payment data from localStorage */
const clearPendingPaymentData = (): void => {
    localStorage.removeItem('glowexamen_pending_plan');
    localStorage.removeItem('glowexamen_pending_user');
};
