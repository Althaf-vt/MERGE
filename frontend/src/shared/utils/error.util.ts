const isObject = (val: unknown): val is Record<string, unknown> => {
    return typeof val === 'object' && val !== null;
};

/**
 * Robustly extracts the backend domain error message from any caught error:
 * - DomainException structure: { error: { code: string, message: string } }
 * - NestJS Validation error structure: { message: string | string[], error?: string }
 * - NestJS HttpException: { message: string, statusCode: number }
 * - RTK Query unwrap error: { status: number, data: ... }
 * - RTK Query wrapped mutation error: { error: { data: ... } }
 * - FetchBaseQuery network error: { status: 'FETCH_ERROR', error: string }
 * - Standard Error: { message: string }
 * - Plain string error
 */
export const getErrorMessage = (
    err: unknown,
    fallback: string = 'An unexpected error occurred. Please try again.'
): string => {
    if (!err) return fallback;

    let target: unknown = err;

    // Handle wrapped RTK mutation result: { error: { data: ... } }
    if (isObject(target) && 'error' in target && isObject((target as { error: unknown }).error)) {
        target = (target as { error: unknown }).error;
    }

    if (isObject(target)) {
        // 1. Inspect data payload if present (RTK Query API response)
        if ('data' in target && target.data) {
            const data = target.data;

            if (isObject(data)) {
                // DomainException format: { error: { code: string, message: string } }
                if ('error' in data && isObject(data.error) && typeof data.error.message === 'string') {
                    return data.error.message;
                }

                // NestJS string or array message: { message: string | string[] }
                if ('message' in data) {
                    if (typeof data.message === 'string' && data.message.trim().length > 0) {
                        return data.message;
                    }
                    if (Array.isArray(data.message) && data.message.length > 0) {
                        return data.message.join(' • ');
                    }
                }

                // String error property: { error: string }
                if ('error' in data && typeof data.error === 'string' && data.error.trim().length > 0) {
                    return data.error;
                }
            } else if (typeof data === 'string' && data.trim().length > 0) {
                return data;
            }
        }

        // 2. FetchBaseQuery network or status errors: { status: 'FETCH_ERROR', error: string }
        if ('error' in target && typeof target.error === 'string' && target.error.trim().length > 0) {
            return target.error;
        }

        // 3. Standard JS Error or SerializedError: { message: string }
        if ('message' in target && typeof target.message === 'string' && target.message.trim().length > 0) {
            return target.message;
        }
    }

    // 4. Plain string error
    if (typeof err === 'string' && err.trim().length > 0) {
        return err;
    }

    return fallback;
};

/**
 * Extracts the domain error code if available.
 */
export const getErrorCode = (err: unknown): string | undefined => {
    if (!err) return undefined;

    let target: unknown = err;
    if (isObject(target) && 'error' in target && isObject((target as { error: unknown }).error)) {
        target = (target as { error: unknown }).error;
    }

    if (isObject(target) && 'data' in target && target.data && isObject(target.data)) {
        const error = target.data.error;
        if (isObject(error) && typeof error.code === 'string') {
            return error.code;
        }
    }
    return undefined;
};
