import type { ApiResponse } from '../types/api-response.types';

// Extracts the domain error message or falls back to a default string.
export const getErrorMessage = (err: any, fallback: string): string => {
    const response = err?.data as ApiResponse<unknown>;
    return response?.error?.message || response?.message || fallback;
};

// Extracts the domain error code if available.
export const getErrorCode = (err: any): string | undefined => {
    const response = err?.data as ApiResponse<unknown>;
    return response?.error?.code;
};