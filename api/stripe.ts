import { loadStripe, Stripe } from '@stripe/stripe-js';

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
    priceId?: string;
    successUrl?: string;
    cancelUrl?: string;
}): Promise<{ error?: string }> => {
    // First try: Use pre-generated Payment Link from env
    const paymentLink = getPaymentLink();

    if (paymentLink) {
        try {
            // Build Payment Link URL with prefilled email and client_reference_id
            const url = new URL(paymentLink);
            if (options.userEmail) {
                url.searchParams.set('prefilled_email', options.userEmail);
            }
            url.searchParams.set('client_reference_id', options.userId);

            window.location.href = url.toString();
            return {};
        } catch (err: any) {
            console.error("Payment Link redirect error:", err);
            return { error: err.message || "Kon niet doorverwijzen naar betaalpagina." };
        }
    }

    // Fallback: Try constructing a Stripe hosted payment page URL
    const priceId = options.priceId || getPriceId();

    if (!priceId) {
        return { error: "Geen prijsconfiguratie gevonden. Stel VITE_STRIPE_PAYMENT_LINK in via het Stripe Dashboard." };
    }

    // Use Stripe's buy page URL format (requires Payment Link to be created in Dashboard)
    // Without a backend, we redirect to the Stripe payment link
    return { error: "Stripe Payment Link is niet geconfigureerd. Maak een Payment Link aan in je Stripe Dashboard en stel VITE_STRIPE_PAYMENT_LINK in als environment variable." };
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
 * Handle payment success callback (called when user returns from Stripe)
 */
export const handlePaymentSuccess = (sessionId: string): void => {
    // The actual premium status update happens via webhook
    // This is just for immediate UI feedback
    console.log("Payment success callback received, session:", sessionId);

    // Store session ID temporarily for verification
    sessionStorage.setItem('pending_payment_session', sessionId);
};

/**
 * Check for pending payment success on page load
 */
export const checkPendingPayment = (): { success: boolean; sessionId?: string; canceled?: boolean } => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('payment');
    const sessionId = urlParams.get('session_id');

    if (paymentStatus === 'success' && sessionId) {
        // Clear URL params
        window.history.replaceState({}, document.title, window.location.pathname);
        return { success: true, sessionId };
    }

    if (paymentStatus === 'canceled') {
        window.history.replaceState({}, document.title, window.location.pathname);
        return { success: false, canceled: true };
    }

    return { success: false };
};
