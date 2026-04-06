import Stripe from 'stripe';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin (only once)
if (!admin.apps.length) {
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
        ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
        : undefined;

    if (serviceAccount) {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
        });
    } else {
        // Fallback: use default credentials (works in Google Cloud environments)
        admin.initializeApp();
    }
}

const db = admin.firestore();

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2026-01-28.clover',
});

// Map Stripe Price IDs to subscription tiers
// Update these with your actual Price IDs from Stripe Dashboard
const PRICE_TO_TIER: Record<string, 'focus' | 'totaal'> = {
    [process.env.STRIPE_PRICE_ID_FOCUS || 'price_focus']: 'focus',
    [process.env.STRIPE_PRICE_ID_TOTAAL || 'price_totaal']: 'totaal',
};

/**
 * Determine subscription tier from Stripe checkout session
 */
function getTierFromSession(session: Stripe.Checkout.Session): 'focus' | 'totaal' {
    // Strategy 1: Check the price ID from line items
    const lineItems = (session as any).line_items?.data;
    if (lineItems && lineItems.length > 0) {
        const priceId = lineItems[0].price?.id;
        if (priceId && PRICE_TO_TIER[priceId]) {
            return PRICE_TO_TIER[priceId];
        }
    }

    // Strategy 2: Check the amount to determine tier
    const amount = session.amount_total;
    if (amount) {
        // €24.99 = 2499 cents
        if (amount >= 2400) return 'totaal';
        // €14.99 = 1499 cents
        return 'focus';
    }

    // Default to focus
    return 'focus';
}

function getPriceIdFromSession(session: Stripe.Checkout.Session): string | null {
    const lineItems = (session as any).line_items?.data;
    return lineItems?.[0]?.price?.id || null;
}

/**
 * Vercel Serverless Function: Stripe Webhook Handler
 * 
 * Receives Stripe webhook events and updates Firestore accordingly.
 * This is the secure, server-side source of truth for subscription status.
 * 
 * Events handled:
 * - checkout.session.completed: User completed payment → activate subscription
 * - customer.subscription.updated: Subscription changed → update tier
 * - customer.subscription.deleted: Subscription canceled → downgrade to free
 */
export default async function handler(req: any, res: any) {
    // Only accept POST requests
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
        console.error('❌ STRIPE_WEBHOOK_SECRET not configured');
        return res.status(500).json({ error: 'Webhook secret not configured' });
    }

    let event: Stripe.Event;

    try {
        // Verify the webhook signature (prevents spoofing)
        const rawBody = req.body;
        event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
    } catch (err: any) {
        console.error(`❌ Webhook signature verification failed: ${err.message}`);
        return res.status(400).json({ error: `Webhook Error: ${err.message}` });
    }

    console.log(`📩 Received Stripe event: ${event.type}`);

    try {
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session;
                const userId = session.client_reference_id;
                const customerId = session.customer as string;
                const subscriptionId = session.subscription as string;

                if (!userId) {
                    console.error('❌ No client_reference_id in session');
                    return res.status(400).json({ error: 'Missing client_reference_id' });
                }

                // Determine tier from the session
                const tier = getTierFromSession(session);
                const priceId = getPriceIdFromSession(session);

                console.log(`✅ Checkout completed: user=${userId}, tier=${tier}, customer=${customerId}`);

                // Update Firestore
                await db.collection('users').doc(userId).update({
                    subscriptionTier: tier,
                    isPremium: true,
                    stripeCustomerId: customerId || null,
                    subscriptionId: subscriptionId || null,
                    subscriptionStatus: 'active',
                    billingProvider: 'stripe',
                    billingProductId: priceId,
                    updatedAt: new Date().toISOString(),
                });

                console.log(`✅ Firestore updated for user ${userId}`);
                break;
            }

            case 'customer.subscription.updated': {
                const subscription = event.data.object as Stripe.Subscription;
                const customerId = subscription.customer as string;

                // Find user by stripeCustomerId
                const userSnapshot = await db.collection('users')
                    .where('stripeCustomerId', '==', customerId)
                    .limit(1)
                    .get();

                if (userSnapshot.empty) {
                    console.warn(`⚠️ No user found for Stripe customer ${customerId}`);
                    break;
                }

                const userDoc = userSnapshot.docs[0];
                const priceId = subscription.items.data[0]?.price?.id;
                const tier = (priceId && PRICE_TO_TIER[priceId]) || 'focus';

                await userDoc.ref.update({
                    subscriptionTier: tier,
                    isPremium: true,
                    subscriptionStatus: subscription.status,
                    billingProvider: 'stripe',
                    billingProductId: priceId || null,
                    updatedAt: new Date().toISOString(),
                });

                console.log(`✅ Subscription updated for user ${userDoc.id}: tier=${tier}, status=${subscription.status}`);
                break;
            }

            case 'customer.subscription.deleted': {
                const subscription = event.data.object as Stripe.Subscription;
                const customerId = subscription.customer as string;

                const userSnapshot = await db.collection('users')
                    .where('stripeCustomerId', '==', customerId)
                    .limit(1)
                    .get();

                if (userSnapshot.empty) {
                    console.warn(`⚠️ No user found for Stripe customer ${customerId}`);
                    break;
                }

                const userDoc = userSnapshot.docs[0];

                await userDoc.ref.update({
                    subscriptionTier: 'free',
                    isPremium: false,
                    subscriptionStatus: 'canceled',
                    billingProvider: 'stripe',
                    billingProductId: null,
                    updatedAt: new Date().toISOString(),
                });

                console.log(`✅ Subscription canceled for user ${userDoc.id}`);
                break;
            }

            default:
                console.log(`ℹ️ Unhandled event type: ${event.type}`);
        }

        return res.status(200).json({ received: true });
    } catch (err: any) {
        console.error(`❌ Error processing webhook: ${err.message}`);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

// Vercel config: disable body parsing so we can verify the raw webhook signature
export const config = {
    api: {
        bodyParser: false,
    },
};
