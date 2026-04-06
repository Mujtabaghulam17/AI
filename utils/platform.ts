type NativePlatform = 'web' | 'ios' | 'android';

declare global {
    interface Window {
        Capacitor?: {
            getPlatform?: () => string;
            isNativePlatform?: () => boolean;
        };
    }
}

const getCapacitor = () => {
    if (typeof window === 'undefined') return null;
    return window.Capacitor ?? null;
};

export const getPlatform = (): NativePlatform => {
    const capacitor = getCapacitor();
    const platform = capacitor?.getPlatform?.();

    if (platform === 'ios' || platform === 'android') {
        return platform;
    }

    if (capacitor?.isNativePlatform?.()) {
        return /iphone|ipad|ipod/i.test(navigator.userAgent) ? 'ios' : 'android';
    }

    return 'web';
};

export const isNativePlatform = (): boolean => getPlatform() !== 'web';
export const isIOS = (): boolean => getPlatform() === 'ios';
export const isAndroid = (): boolean => getPlatform() === 'android';

export const applyPlatformBodyClass = (): void => {
    if (typeof document === 'undefined') return;

    const platform = getPlatform();
    const body = document.body;

    body.classList.remove('native-shell', 'platform-web', 'platform-ios', 'platform-android');
    body.classList.add(`platform-${platform}`);

    if (platform !== 'web') {
        body.classList.add('native-shell');
    }
};
