import type { SerializedError } from '@reduxjs/toolkit';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import i18n from '../lib/i18n';

type ApiError = FetchBaseQueryError | SerializedError | undefined;

// Shape of the `data` field inside our backend's error envelope:
// { success: false, message, errorCode, data, meta }
interface BackendErrorPayload {
    message?: string | string[];
    errorCode?: string;
    // Extra structured info some errors carry for interpolation, e.g.
    // { status: 'INACTIVE' } for ACCOUNT_NOT_ACTIVE — keys here are
    // spread directly into the i18next interpolation options.
    data?: Record<string, unknown> | null;
}

// Fields inside `data` that hold a raw backend enum value and need
// their own translation before being interpolated into a message —
// otherwise a value like "INACTIVE" would leak untranslated into an
// otherwise fully-localized sentence.
const ENUM_FIELDS_TO_TRANSLATE: Record<string, string> = {
    status: 'statusLabels',
};

// Translates any recognized enum-like fields in the interpolation data
// (e.g. { status: 'INACTIVE' } -> { status: 'নিষ্ক্রিয়' }) using the
// matching lookup table in the "errors" namespace. Falls back to the
// raw value if that specific enum value isn't in our lookup table yet.
function translateInterpolationData(
    data: Record<string, unknown>,
): Record<string, unknown> {
    const t = i18n.t;
    const result: Record<string, unknown> = { ...data };

    for (const [field, lookupKey] of Object.entries(ENUM_FIELDS_TO_TRANSLATE)) {
        const value = result[field];
        if (typeof value === 'string') {
            result[field] = t(`${lookupKey}.${value}`, {
                ns: 'errors',
                defaultValue: value,
            });
        }
    }

    return result;
}

// Central error-to-string resolver. Backend sends a stable `errorCode`
// (language-independent) instead of a localized message; this maps that
// code to the correct string in whichever language is currently active,
// via the "errors" namespace. Falls back to the backend's raw `message`
// only if the code is missing or not yet in our translation table —
// that raw message will be in English, since the backend doesn't
// localize it, but it's better than showing nothing.
export function getErrorMessage(error: ApiError, fallback?: string): string {
    const t = i18n.t;
    const defaultFallback = fallback ?? t('generic', { ns: 'errors' });

    if (!error) return defaultFallback;

    if ('status' in error) {
        const data = error.data as BackendErrorPayload | undefined;

        if (data?.errorCode) {
            const interpolationData = translateInterpolationData(data.data ?? {});

            const translated = t(`codes.${data.errorCode}`, {
                ns: 'errors',
                defaultValue: '',
                ...interpolationData,
            });
            if (translated) return translated;
        }

        // No errorCode, or that code isn't in our translation table yet
        // (e.g. backend added a new one before frontend caught up) —
        // fall back to the raw backend message.
        if (data?.message) {
            return Array.isArray(data.message) ? data.message[0] : data.message;
        }

        if (typeof error.status === 'number' && error.status >= 500) {
            return t('server', { ns: 'errors' });
        }
        if (error.status === 'FETCH_ERROR') {
            return t('network', { ns: 'errors' });
        }
        return defaultFallback;
    }

    return error.message ?? defaultFallback;
}