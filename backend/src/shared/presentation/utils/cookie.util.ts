import { CookieOptions, Response } from 'express';

export const COOKIE_NAMES = {
    USER_REFRESH_TOKEN: 'refreshToken',
    ADMIN_REFRESH_TOKEN: 'adminRefreshToken',
} as const;

export const DEFAULT_COOKIE_MAX_AGE = Number(process.env.REFRESH_TOKEN_MAX_AGE) || 7 * 24 * 60 * 60 * 1000;

export const DEFAULT_COOKIE_OPTIONS: Readonly<CookieOptions> = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: DEFAULT_COOKIE_MAX_AGE,
};

export class CookieUtil {
    // Sets an authentication or session cookie with strict security defaults.
    //Allows partial overrides (e.g., { sameSite: 'lax' } for OAuth or Handoff flows).
    static setAuthCookie(
        res: Response,
        name: string,
        value: string,
        overrides?: Partial<CookieOptions>
    ): void {
        res.cookie(name, value, {
            ...DEFAULT_COOKIE_OPTIONS,
            ...overrides,
        });
    }


    // Clears a cookie matching the exact security attributes (including path: '/')
    // to guarantee that the browser reliably deletes it across all nested paths.
    static clearAuthCookie(
        res: Response,
        name: string,
        overrides?: Partial<CookieOptions>
    ): void {
        const { maxAge: _, ...clearOptions } = DEFAULT_COOKIE_OPTIONS;
        res.clearCookie(name, {
            ...clearOptions,
            ...overrides,
        });
    }
}

