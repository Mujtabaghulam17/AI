import type { AnsweredEntry, SubjectSpecificData } from '../data/data';

// ─── Constants ──────────────────────────────────────────────────────────────

/** Questions become re-eligible after 30 days */
const RE_ELIGIBLE_DAYS = 30;
const RE_ELIGIBLE_MS = RE_ELIGIBLE_DAYS * 24 * 60 * 60 * 1000;

/** Maximum entries to keep per subject (prevents infinite growth) */
const MAX_ENTRIES_PER_SUBJECT = 2000;

// ─── Core Functions ─────────────────────────────────────────────────────────

/**
 * Record a question as answered with a timestamp.
 * Also maintains the legacy answeredIds array for backward compat.
 * Automatically caps entries at MAX_ENTRIES_PER_SUBJECT.
 */
export function recordAnswered(
    data: SubjectSpecificData,
    questionId: number | string
): SubjectSpecificData {
    const now = Date.now();
    const entries = data.answeredEntries || [];

    // Add the new entry
    const updatedEntries = [...entries, { id: questionId, timestamp: now }];

    // Cap at max entries — remove oldest first
    const capped = updatedEntries.length > MAX_ENTRIES_PER_SUBJECT
        ? updatedEntries.slice(updatedEntries.length - MAX_ENTRIES_PER_SUBJECT)
        : updatedEntries;

    // Also maintain legacy answeredIds (keep last 2000)
    const updatedIds = [...data.answeredIds, questionId];
    const cappedIds = updatedIds.length > MAX_ENTRIES_PER_SUBJECT
        ? updatedIds.slice(updatedIds.length - MAX_ENTRIES_PER_SUBJECT)
        : updatedIds;

    return {
        ...data,
        answeredIds: cappedIds,
        answeredEntries: capped,
    };
}

/**
 * Get the set of question IDs that should be excluded from the question pool.
 * Questions answered more than RE_ELIGIBLE_DAYS ago become available again.
 * Falls back to legacy answeredIds if no timestamped entries exist.
 */
export function getRecentlyAnsweredIds(data: SubjectSpecificData): Set<number | string> {
    const entries = data.answeredEntries;

    // Fallback: if no timestamped entries, use legacy answeredIds
    if (!entries || entries.length === 0) {
        return new Set(data.answeredIds);
    }

    const cutoff = Date.now() - RE_ELIGIBLE_MS;
    const recentIds = new Set<number | string>();

    for (const entry of entries) {
        if (entry.timestamp > cutoff) {
            recentIds.add(entry.id);
        }
    }

    return recentIds;
}

/**
 * Clean up old entries from answeredEntries.
 * Removes entries older than RE_ELIGIBLE_DAYS.
 * Call periodically (e.g., on app load) to keep data lean.
 */
export function cleanupOldEntries(data: SubjectSpecificData): SubjectSpecificData {
    const entries = data.answeredEntries;
    if (!entries || entries.length === 0) return data;

    const cutoff = Date.now() - RE_ELIGIBLE_MS;
    const cleaned = entries.filter(e => e.timestamp > cutoff);

    // Also clean up legacy answeredIds to match
    const cleanedIds = new Set(cleaned.map(e => e.id));
    const filteredIds = data.answeredIds.filter(id => cleanedIds.has(id));

    return {
        ...data,
        answeredIds: filteredIds,
        answeredEntries: cleaned,
    };
}

/**
 * Migrate legacy answeredIds to timestamped entries.
 * Assigns current timestamp to all existing entries (they'll expire in 30 days).
 * Only runs if answeredEntries doesn't exist yet.
 */
export function migrateToTimestampedEntries(data: SubjectSpecificData): SubjectSpecificData {
    // Already migrated
    if (data.answeredEntries && data.answeredEntries.length > 0) {
        return data;
    }

    // Nothing to migrate
    if (data.answeredIds.length === 0) {
        return { ...data, answeredEntries: [] };
    }

    // Migrate: assign current timestamp to all existing entries
    const now = Date.now();
    const entries: AnsweredEntry[] = data.answeredIds.map(id => ({
        id,
        timestamp: now,
    }));

    // Cap at max
    const capped = entries.length > MAX_ENTRIES_PER_SUBJECT
        ? entries.slice(entries.length - MAX_ENTRIES_PER_SUBJECT)
        : entries;

    return {
        ...data,
        answeredEntries: capped,
    };
}

/**
 * Get stats about the answered questions pool.
 */
export function getAnsweredStats(data: SubjectSpecificData): {
    totalAnswered: number;
    recentlyAnswered: number;
    expiringSoon: number; // will become available within 7 days
} {
    const entries = data.answeredEntries || [];
    const now = Date.now();
    const cutoff = now - RE_ELIGIBLE_MS;
    const soonCutoff = now - RE_ELIGIBLE_MS + (7 * 24 * 60 * 60 * 1000);

    const recentlyAnswered = entries.filter(e => e.timestamp > cutoff).length;
    const expiringSoon = entries.filter(e => e.timestamp > cutoff && e.timestamp <= soonCutoff).length;

    return {
        totalAnswered: entries.length,
        recentlyAnswered,
        expiringSoon,
    };
}
