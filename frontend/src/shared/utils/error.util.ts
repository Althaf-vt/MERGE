import type { ApiResponse } from '../types/api-response.types';

interface RawRtkErrorData extends Omit<ApiResponse<unknown>, 'message' | 'error'> {
    message?: string | string[];
    error?: { code?: string; message?: string } | string;
}

interface RtkQueryError {
    data?: RawRtkErrorData;
}

const isRtkQueryError = (err: unknown): err is RtkQueryError => {
    return typeof err === 'object' && err !== null && 'data' in err;
};

// Extracts the domain error message (including validation arrays) or falls back to a default string.
export const getErrorMessage = (err: unknown, fallback: string): string => {
    if (isRtkQueryError(err) && err.data) {
        const { error, message } = err.data;

        if (typeof error === 'object' && error !== null && typeof error.message === 'string') {
            return error.message;
        }
        if (typeof message === 'string') {
            return message;
        }
        if (Array.isArray(message)) {
            return message.join(' • ');
        }
        if (typeof error === 'string') {
            return error;
        }
    }
    return fallback;
};

// Extracts the domain error code if available.
export const getErrorCode = (err: unknown): string | undefined => {
    if (isRtkQueryError(err) && err.data) {
        const { error } = err.data;
        if (typeof error === 'object' && error !== null) {
            return error.code;
        }
    }
    return undefined;
};