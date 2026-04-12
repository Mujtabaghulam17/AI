import * as admin from 'firebase-admin';

if (!admin.apps.length) {
    const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    const serviceAccount = raw ? JSON.parse(raw.replace(/\\n/g, '\n')) : undefined;

    if (serviceAccount) {
        admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
    } else {
        admin.initializeApp();
    }
}

const db = admin.firestore();

export default async function handler(req: any, res: any) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        if (!process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
            return res.status(500).json({ error: 'FIREBASE_SERVICE_ACCOUNT_KEY not set' });
        }
        const usersSnap = await db.collection('users').get();
        const users = usersSnap.docs.map(d => d.data());

        const now = new Date();
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();

        // Subscription breakdown
        const tiers: Record<string, number> = { free: 0, focus: 0, totaal: 0, gezin: 0 };
        for (const u of users) {
            const tier = u.subscriptionTier || (u.isPremium ? 'focus' : 'free');
            tiers[tier] = (tiers[tier] || 0) + 1;
        }

        // New users
        const newLast7 = users.filter(u => u.createdAt >= sevenDaysAgo).length;
        const newLast30 = users.filter(u => u.createdAt >= thirtyDaysAgo).length;

        // Active users (updatedAt afgelopen 7/30 dagen)
        const activeLast7 = users.filter(u => u.updatedAt >= sevenDaysAgo).length;
        const activeLast30 = users.filter(u => u.updatedAt >= thirtyDaysAgo).length;

        // Paid users
        const paidUsers = users.filter(u => u.subscriptionTier && u.subscriptionTier !== 'free');
        const conversionRate = users.length > 0
            ? ((paidUsers.length / users.length) * 100).toFixed(1)
            : '0';

        // Billing provider breakdown
        const billing: Record<string, number> = { stripe: 0, app_store: 0, play_store: 0, none: 0 };
        for (const u of users) {
            const provider = u.billingProvider || 'none';
            billing[provider] = (billing[provider] || 0) + 1;
        }

        // Top vakken
        const vakken: Record<string, number> = {};
        for (const u of users) {
            if (u.primarySubject) {
                vakken[u.primarySubject] = (vakken[u.primarySubject] || 0) + 1;
            }
        }
        const topVakken = Object.entries(vakken)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([vak, count]) => ({ vak, count }));

        // Level verdeling
        const levels: Record<string, number> = { VMBO: 0, HAVO: 0, VWO: 0 };
        for (const u of users) {
            const level = u.onboardingData?.level;
            if (level && levels[level] !== undefined) levels[level]++;
        }

        // Gemiddelde XP en streak
        const totalXP = users.reduce((sum, u) => sum + (u.xp || 0), 0);
        const totalStreak = users.reduce((sum, u) => sum + (u.studyStreak || 0), 0);

        res.status(200).json({
            generatedAt: now.toISOString(),
            overview: {
                totalUsers: users.length,
                paidUsers: paidUsers.length,
                conversionRate: `${conversionRate}%`,
                newLast7Days: newLast7,
                newLast30Days: newLast30,
                activeLast7Days: activeLast7,
                activeLast30Days: activeLast30,
            },
            subscriptions: tiers,
            billing,
            levels,
            topVakken,
            averages: {
                xp: users.length > 0 ? Math.round(totalXP / users.length) : 0,
                studyStreak: users.length > 0 ? Math.round(totalStreak / users.length) : 0,
            },
        });
    } catch (error: any) {
        console.error('Analytics error:', error);
        res.status(500).json({ error: error.message });
    }
}
