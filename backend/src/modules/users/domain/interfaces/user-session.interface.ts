export const USER_SESSION_SERVICE = 'USER_SESSION_SERVICE';

export interface UserSessionData{
    sessionId: string;
    userId: string;
    deviceInfo: string;
    ipAddress: string;
    lastActive: Date;
    createdAt: Date;
}

export interface IUserSessionService{
    createSession(userId: string, deviceInfo: string, ipAddress: string, ttlSeconds: number): Promise<string>;
    getSessions(userId: string): Promise<UserSessionData[]>;
    validateSession(userId: string, sessionId: string): Promise<boolean>;
    revokeSession(userId: string, sessionId: string): Promise<void>;
    revokeAllOtherSessions(userId: string, currentSessionId: string): Promise<void>;
    revokeAllSessions(userId: string): Promise<void>;
}