export const ADMIN_SESSION_SERVICE = 'ADMIN_SESSION_SERVICE';

export interface IAdminSessionService {
    createSession(adminId: string, ttlSeconds: number): Promise<void>;
    hasValidSession(adminId: string): Promise<boolean>;
    deleteSession(adminId: string): Promise<void>;
}