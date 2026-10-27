export const GOOGLE_AUTH_SERVICE = 'GOOGLE_AUTH_SERVICE';

export interface IGoogleAuthService {
    verifyToken(idToken: string): Promise<{ email: string } | null>;
}