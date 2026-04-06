import {
    LOG_LEVEL,
    Purchases,
    STOREKIT_VERSION,
    PURCHASES_ERROR_CODE,
    type CustomerInfo,
    type PurchasesError,
    type PurchasesOffering,
    type PurchasesPackage,
} from '@revenuecat/purchases-capacitor';
import type { BillingProvider } from './firebase';
import type { SubscriptionTier } from '../utils/subscriptionTiers';
import { getPlatform, isIOS, isNativePlatform } from '../utils/platform';

export type PaidSubscriptionTier = Exclude<SubscriptionTier, 'free'>;

export interface NativeBillingOffer {
    plan: PaidSubscriptionTier;
    offeringIdentifier: string;
    packageIdentifier: string;
    productIdentifier: string;
    title: string;
    description: string;
    price: number;
    priceString: string;
    subscriptionPeriod: string | null;
}

const getEnv = (key: string): string => {
    try {
        const metaEnv = (import.meta as any)?.env;
        if (typeof import.meta !== 'undefined' && metaEnv?.[key]) {
            return metaEnv[key];
        }
    } catch (error) { }

    try {
        if (typeof process !== 'undefined' && process.env?.[key]) {
            return process.env[key] as string;
        }
    } catch (error) { }

    return '';
};

const getRevenueCatApiKey = (): string => {
    const platform = getPlatform();
    if (platform === 'ios') return getEnv('VITE_RC_IOS_API_KEY');
    if (platform === 'android') return getEnv('VITE_RC_ANDROID_API_KEY');
    return '';
};

const getOfferingIdentifierForPlan = (plan: PaidSubscriptionTier): string => {
    return getEnv(`VITE_RC_OFFERING_${plan.toUpperCase()}`) || plan;
};

const getEntitlementIdentifierForPlan = (plan: PaidSubscriptionTier): string => {
    return getEnv(`VITE_RC_ENTITLEMENT_${plan.toUpperCase()}`) || plan;
};

const selectPreferredPackage = (offering: PurchasesOffering): PurchasesPackage | null => {
    return offering.monthly
        ?? offering.annual
        ?? offering.sixMonth
        ?? offering.threeMonth
        ?? offering.twoMonth
        ?? offering.weekly
        ?? offering.lifetime
        ?? offering.availablePackages[0]
        ?? null;
};

export const isNativeBillingSupported = (): boolean => {
    return isNativePlatform() && !!getRevenueCatApiKey();
};

export const getNativeBillingProvider = (): BillingProvider | null => {
    if (!isNativePlatform()) return null;
    return isIOS() ? 'app_store' : 'play_store';
};

export const getNativeStoreLabel = (): string => {
    return isIOS() ? 'App Store' : 'Google Play';
};

export const getSubscriptionTierFromCustomerInfo = (customerInfo: CustomerInfo): SubscriptionTier => {
    const totaalEntitlement = customerInfo.entitlements.active[getEntitlementIdentifierForPlan('totaal')];
    if (totaalEntitlement?.isActive) return 'totaal';

    const focusEntitlement = customerInfo.entitlements.active[getEntitlementIdentifierForPlan('focus')];
    if (focusEntitlement?.isActive) return 'focus';

    return 'free';
};

export const getBillingProductIdentifierFromCustomerInfo = (customerInfo: CustomerInfo): string | null => {
    const tier = getSubscriptionTierFromCustomerInfo(customerInfo);
    if (tier === 'free') return null;

    return customerInfo.entitlements.active[getEntitlementIdentifierForPlan(tier)]?.productIdentifier ?? null;
};

const ensureConfiguredUser = async (appUserID?: string | null): Promise<void> => {
    const currentAppUserID = await Purchases.getAppUserID().then(result => result.appUserID).catch(() => null);

    if (appUserID && currentAppUserID !== appUserID) {
        await Purchases.logIn({ appUserID });
        return;
    }

    if (!appUserID && currentAppUserID) {
        await Purchases.logOut();
    }
};

export const ensureNativeBillingReady = async (appUserID?: string | null): Promise<boolean> => {
    const apiKey = getRevenueCatApiKey();
    if (!isNativePlatform() || !apiKey) {
        return false;
    }

    const { isConfigured } = await Purchases.isConfigured();

    if (!isConfigured) {
        await Purchases.setLogLevel({
            level: (import.meta as any)?.env?.DEV ? LOG_LEVEL.DEBUG : LOG_LEVEL.INFO,
        });
        await Purchases.configure({
            apiKey,
            appUserID: appUserID ?? undefined,
            storeKitVersion: STOREKIT_VERSION.DEFAULT,
        });
        return true;
    }

    await ensureConfiguredUser(appUserID);
    return true;
};

export const getNativeCustomerInfo = async (): Promise<CustomerInfo | null> => {
    if (!isNativeBillingSupported()) return null;
    const { customerInfo } = await Purchases.getCustomerInfo();
    return customerInfo;
};

export const addNativeBillingCustomerInfoListener = async (
    listener: (customerInfo: CustomerInfo) => void
): Promise<() => Promise<void>> => {
    if (!isNativeBillingSupported()) {
        return async () => { };
    }

    const callbackId = await Purchases.addCustomerInfoUpdateListener(listener);

    return async () => {
        try {
            await Purchases.removeCustomerInfoUpdateListener({
                listenerToRemove: callbackId,
            });
        } catch (error) {
            console.warn('Failed to remove RevenueCat listener', error);
        }
    };
};

export const getNativeBillingOffer = async (
    plan: PaidSubscriptionTier,
    appUserID?: string | null
): Promise<NativeBillingOffer | null> => {
    const isReady = await ensureNativeBillingReady(appUserID);
    if (!isReady) return null;

    const offerings = await Purchases.getOfferings();
    const offering = offerings.all[getOfferingIdentifierForPlan(plan)];
    if (!offering) return null;

    const aPackage = selectPreferredPackage(offering);
    if (!aPackage) return null;

    return {
        plan,
        offeringIdentifier: offering.identifier,
        packageIdentifier: aPackage.identifier,
        productIdentifier: aPackage.product.identifier,
        title: aPackage.product.title,
        description: aPackage.product.description,
        price: aPackage.product.price,
        priceString: aPackage.product.priceString,
        subscriptionPeriod: aPackage.product.subscriptionPeriod,
    };
};

export const purchaseNativePlan = async (
    plan: PaidSubscriptionTier,
    appUserID: string
): Promise<{
    tier: SubscriptionTier;
    productIdentifier: string | null;
    customerInfo: CustomerInfo;
}> => {
    const isReady = await ensureNativeBillingReady(appUserID);
    if (!isReady) {
        throw new Error(`${getNativeStoreLabel()} billing is nog niet geconfigureerd.`);
    }

    const offerings = await Purchases.getOfferings();
    const offering = offerings.all[getOfferingIdentifierForPlan(plan)];
    const aPackage = offering ? selectPreferredPackage(offering) : null;

    if (!aPackage) {
        throw new Error(`Geen ${plan}-aanbod gevonden in RevenueCat.`);
    }

    const result = await Purchases.purchasePackage({
        aPackage,
        googleIsPersonalizedPrice: true,
    });

    return {
        tier: getSubscriptionTierFromCustomerInfo(result.customerInfo),
        productIdentifier: result.productIdentifier || getBillingProductIdentifierFromCustomerInfo(result.customerInfo),
        customerInfo: result.customerInfo,
    };
};

export const restoreNativePurchases = async (appUserID: string): Promise<{
    tier: SubscriptionTier;
    productIdentifier: string | null;
    customerInfo: CustomerInfo;
}> => {
    const isReady = await ensureNativeBillingReady(appUserID);
    if (!isReady) {
        throw new Error(`${getNativeStoreLabel()} billing is nog niet geconfigureerd.`);
    }

    const { customerInfo } = await Purchases.restorePurchases();

    return {
        tier: getSubscriptionTierFromCustomerInfo(customerInfo),
        productIdentifier: getBillingProductIdentifierFromCustomerInfo(customerInfo),
        customerInfo,
    };
};

export const isNativePurchaseCancelledError = (error: unknown): boolean => {
    const purchasesError = error as PurchasesError | null;
    return purchasesError?.code === PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR || purchasesError?.userCancelled === true;
};
