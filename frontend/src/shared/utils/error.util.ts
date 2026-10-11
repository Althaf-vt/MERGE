import type { ApiResponse } from '../types/api-response.types';

interface RtkQueryError {
    data?: ApiResponse<unknown>;
}

const isRtkQueryError = (err: unknown): err is RtkQueryError => {
    return typeof err === 'object' && err !== null && 'data' in err;
};

// Extracts the domain error message or falls back to a default string.
export const getErrorMessage = (err: unknown, fallback: string): string => {
    if (isRtkQueryError(err) && err.data) {
        return err.data.error?.message || err.data.message || fallback;
    }
    return fallback;
};

// Extracts the domain error code if available.
export const getErrorCode = (err: unknown): string | undefined => {
    if (isRtkQueryError(err) && err.data) {
        return err.data.error?.code;
    }
    return undefined;
};