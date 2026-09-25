export const ADMIN_SESSION_SERVICE = 'ADMIN_SESSION_SERVICE';

export interface IAdminSessionService {
    createSession(adminId: string, token: string, ttlSeconds: number): Promise<void>;
    validateSession(adminId: string, token: string): Promise<boolean>;
    deleteSession(adminId: string): Promise<void>;
}