import * as admin from 'firebase-admin';
import type { BillingProvider, UserFirestoreData } from './firebase';
import type { SubscriptionTier } from '../utils/subscriptionTiers';

if (!admin.apps.length) {
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
        ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
        : undefined;

    if (serviceAccount) {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
        });
    } else {
        admin.initializeApp();
    }
}

const db = admin.firestore();

type RevenueCatEventType =
    | 'TEST'
    | 'INITIAL_PURCHASE'
    | 'RENEWAL'
    | 'CANCELLATION'
    | 'UNCANCELLATION'
    | 'NON_RENEWING_PURCHASE'
    | 'SUBSCRIPTION_PAUSED'
    | 'EXPIRATION'
    | 'BILLING_ISSUE'
    | 'PRODUCT_CHANGE'
    | 'TRANSFER'
    | 'SUBSCRIPTION_EXTENDED'
    | 'TEMPORARY_ENTITLEMENT_GRANT'
    | 'REFUND_REVERSED'
    | 'INVOICE_ISSUANCE'
    | 'VIRTUAL_CURRENCY_TRANSACTION'
    | 'EXPERIMENT_ENROLLMENT'
    | string;

type RevenueCatStore =
    | 'APP_STORE'
    | 'PLAY_STORE'
    | 'STRIPE'
    | 'RC_BILLING'
    | 'TEST_STORE'
    | 'PROMOTIONAL'
    | 'AMAZON'
    | 'MAC_APP_STORE'
    | 'PADDLE'
    | 'ROKU'
    | string;

interface RevenueCatWebhookEvent {
    id: string;
    type: RevenueCatEventType;
    app_user_id?: string;
    original_app_user_id?: string;
    aliases?: string[];
    transferred_to?: string[];
    transferred_from?: string[];
    entitlement_ids?: string[] | null;
    product_id?: string | null;
    store?: RevenueCatStore;
    environment?: 'SANDBOX' | 'PRODUCTION' | string;
    event_timestamp_ms?: number;
    purchased_at_ms?: number | null;
    expiration_at_ms?: number | null;
    cancel_reason?: string | null;
    expiration_reason?: string | null;
    period_type?: 'TRIAL' | 'INTRO' | 'NORMAL' | 'PROMOTIONAL' | 'PREPAID' | string | null;
}

interface RevenueCatWebhookBody {
    api_version?: string;
    event?: RevenueCatWebhookEvent;
}

const ACTIVE_SYNC_EVENT_TYPES = new Set<RevenueCatEventType>([
    'INITIAL_PURCHASE',
    'RENEWAL',
    'NON_RENEWING_PURCHASE',
    'UNCANCELLATION',
    'TRANSFER',
    'SUBSCRIPTION_EXTENDED',
    'TEMPORARY_ENTITLEMENT_GRANT',
    'REFUND_REVERSED',
]);

const PASSIVE_SYNC_EVENT_TYPES = new Set<RevenueCatEventType>([
    'CANCELLATION',
    'BILLING_ISSUE',
    'EXPIRATION',
]);

const IGNORED_EVENT_TYPES = new Set<RevenueCatEventType>([
    'TEST',
    'SUBSCRIBER_ALIAS',
    'SUBSCRIPTION_PAUSED',
    'PRODUCT_CHANGE',
    'INVOICE_ISSUANCE',
    'VIRTUAL_CURRENCY_TRANSACTION',
    'EXPERIMENT_ENROLLMENT',
]);

const getFirstEnv = (...keys: string[]): string => {
    for (const key of keys) {
        const value = process.env[key];
        if (value) return value;
    }
    return '';
};

const parseCsvEnv = (...keys: string[]): string[] => {
    const value = getFirstEnv(...keys);
    if (!value) return [];
    return value.split(',').map(part => part.trim()).filter(Boolean);
};

const FOCUS_ENTITLEMENT = getFirstEnv('RC_ENTITLEMENT_FOCUS', 'VITE_RC_ENTITLEMENT_FOCUS') || 'focus';
const TOTAAL_ENTITLEMENT = getFirstEnv('RC_ENTITLEMENT_TOTAAL', 'VITE_RC_ENTITLEMENT_TOTAAL') || 'totaal';
const FOCUS_PRODUCT_IDS = new Set(parseCsvEnv('RC_PRODUCT_IDS_FOCUS'));
const TOTAAL_PRODUCT_IDS = new Set(parseCsvEnv('RC_PRODUCT_IDS_TOTAAL'));

const tierRank: Record<SubscriptionTier, number> = {
    free: 0,
    focus: 1,
    totaal: 2,
};

const getTierFromRevenueCatEvent = (event: RevenueCatWebhookEvent): SubscriptionTier => {
    const entitlements = event.entitlement_ids || [];

    if (entitlements.includes(TOTAAL_ENTITLEMENT)) return 'totaal';
    if (entitlements.includes(FOCUS_ENTITLEMENT)) return 'focus';
    if (event.product_id && TOTAAL_PRODUCT_IDS.has(event.product_id)) return 'totaal';
    if (event.product_id && FOCUS_PRODUCT_IDS.has(event.product_id)) return 'focus';

    return 'free';
};

const getBillingProviderFromStore = (store?: RevenueCatStore): BillingProvider | null => {
    if (store === 'APP_STORE' || store === 'MAC_APP_STORE') return 'app_store';
    if (store === 'PLAY_STORE') return 'play_store';
    return null;
};

const hasActiveAccess = (event: RevenueCatWebhookEvent): boolean => {
    if (event.type === 'EXPIRATION') return false;

    if (typeof event.expiration_at_ms === 'number') {
        return event.expiration_at_ms > Date.now();
    }

    return ACTIVE_SYNC_EVENT_TYPES.has(event.type);
};

const getSubscriptionStatus = (event: RevenueCatWebhookEvent): NonNullable<UserFirestoreData['subscriptionStatus']> => {
    if (event.type === 'BILLING_ISSUE') return 'past_due';
    if (event.type === 'CANCELLATION' || event.type === 'EXPIRATION') return 'canceled';
    if (event.period_type === 'TRIAL' || event.period_type === 'INTRO') return 'trialing';
    return 'active';
};

const getCandidateUserIds = (event: RevenueCatWebhookEvent): string[] => {
    const ids = [
        event.app_user_id,
        event.original_app_user_id,
        ...(event.aliases || []),
        ...(event.transferred_to || []),
    ].filter((value): value is string => Boolean(value));

    return [...new Set(ids)];
};

const findUserDocument = async (candidateIds: string[]) => {
    for (const userId of candidateIds) {
        const ref = db.collection('users').doc(userId);
        const snapshot = await ref.get();
        if (snapshot.exists) {
            return snapshot;
        }
    }

    return null;
};

export default async function handler(req: any, res: any) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const expectedAuthHeader = process.env.REVENUECAT_WEBHOOK_AUTH;
    if (expectedAuthHeader && req.headers.authorization !== expectedAuthHeader) {
        console.error('❌ Invalid RevenueCat authorization header');
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const body = req.body as RevenueCatWebhookBody;
    const event = body?.event;

    if (!event?.id || !event.type) {
        return res.status(400).json({ error: 'Invalid RevenueCat webhook payload' });
    }

    if (IGNORED_EVENT_TYPES.has(event.type)) {
        return res.status(200).json({ received: true, ignored: event.type });
    }

    if (!ACTIVE_SYNC_EVENT_TYPES.has(event.type) && !PASSIVE_SYNC_EVENT_TYPES.has(event.type)) {
        console.log(`ℹ️ Unhandled RevenueCat event type: ${event.type}`);
        return res.status(200).json({ received: true, ignored: event.type });
    }

    const billingProvider = getBillingProviderFromStore(event.store);
    if (!billingProvider) {
        console.log(`ℹ️ Ignoring RevenueCat event for store ${event.store}`);
        return res.status(200).json({ received: true, ignored: event.store || 'unknown_store' });
    }

    const eventRef = db.collection('billingWebhookEvents').doc(`revenuecat_${event.id}`);
    const candidateUserIds = getCandidateUserIds(event);
    const userSnapshot = await findUserDocument(candidateUserIds);

    if (!userSnapshot) {
        await eventRef.set({
            provider: 'revenuecat',
            eventId: event.id,
            type: event.type,
            candidateUserIds,
            resolvedUserId: null,
            store: event.store || null,
            processedAt: new Date().toISOString(),
            status: 'unresolved_user',
        }, { merge: true });

        console.warn(`⚠️ RevenueCat user not found for event ${event.id}`);
        return res.status(200).json({ received: true, unresolved: true });
    }

    const userRef = userSnapshot.ref;

    try {
        const result = await db.runTransaction(async (transaction) => {
            const processedEvent = await transaction.get(eventRef);
            if (processedEvent.exists) {
                return { duplicate: true };
            }

            const latestUserSnapshot = await transaction.get(userRef);
            const currentData = latestUserSnapshot.data() as Partial<UserFirestoreData> | undefined;
            const currentTier = (currentData?.subscriptionTier || 'free') as SubscriptionTier;
            const currentProvider = currentData?.billingProvider || null;

            const incomingTier = getTierFromRevenueCatEvent(event);
            const effectiveIncomingTier =
                incomingTier === 'free' && currentProvider === billingProvider && currentTier !== 'free'
                    ? currentTier
                    : incomingTier;
            const incomingRank = tierRank[effectiveIncomingTier];
            const currentRank = tierRank[currentTier];
            const sameProvider = !currentProvider || currentProvider === billingProvider;

            if (ACTIVE_SYNC_EVENT_TYPES.has(event.type) && effectiveIncomingTier === 'free') {
                transaction.create(eventRef, {
                    provider: 'revenuecat',
                    eventId: event.id,
                    type: event.type,
                    resolvedUserId: userRef.id,
                    store: event.store || null,
                    productId: event.product_id || null,
                    skippedBecauseOfUnmappedTier: true,
                    processedAt: new Date().toISOString(),
                });
                return { skipped: true };
            }

            if (!sameProvider) {
                if (ACTIVE_SYNC_EVENT_TYPES.has(event.type) && incomingRank > currentRank) {
                    // Allow a higher-tier native subscription to replace a lower-tier provider.
                } else {
                    transaction.create(eventRef, {
                        provider: 'revenuecat',
                        eventId: event.id,
                        type: event.type,
                        resolvedUserId: userRef.id,
                        store: event.store || null,
                        skippedBecauseOfProviderConflict: true,
                        currentProvider,
                        incomingProvider: billingProvider,
                        processedAt: new Date().toISOString(),
                    });
                    return { skipped: true };
                }
            }

            const activeAccess = hasActiveAccess(event);
            const nextTier = activeAccess ? effectiveIncomingTier : 'free';
            const subscriptionStatus = getSubscriptionStatus(event);

            const updateData: Partial<UserFirestoreData> = {
                subscriptionTier: nextTier,
                isPremium: nextTier !== 'free',
                subscriptionStatus,
                billingProvider,
                billingProductId: nextTier === 'free' ? null : (event.product_id || null),
                updatedAt: new Date().toISOString(),
            };

            transaction.set(userRef, updateData, { merge: true });
            transaction.create(eventRef, {
                provider: 'revenuecat',
                eventId: event.id,
                type: event.type,
                resolvedUserId: userRef.id,
                store: event.store || null,
                productId: event.product_id || null,
                incomingTier: effectiveIncomingTier,
                nextTier,
                subscriptionStatus,
                processedAt: new Date().toISOString(),
            });

            return { duplicate: false, skipped: false, nextTier, userId: userRef.id };
        });

        if (result.duplicate) {
            return res.status(200).json({ received: true, duplicate: true });
        }

        if (result.skipped) {
            return res.status(200).json({ received: true, skipped: true });
        }

        console.log(`✅ RevenueCat webhook processed: user=${result.userId}, tier=${result.nextTier}, type=${event.type}`);
        return res.status(200).json({ received: true });
    } catch (error: any) {
        console.error(`❌ RevenueCat webhook failed: ${error.message}`);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
