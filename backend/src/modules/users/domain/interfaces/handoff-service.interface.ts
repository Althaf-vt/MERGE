import { Param } from "@nestjs/common";

export const HANDOFF_SERVICE = Symbol('HANDOFF_SERVICE');

export interface IHandoffSessionService{
    // Generate a temp, expiring UUID linked to the desktop user's account
    createSession(userId: string, ttlSeconds: number): Promise<string>;

    // Returns the userId linked to the scanned qr code, or null if the qr expired
    validateSession(sessionId: string): Promise<string | null>;

    // Destroys the session immediately after use to prevent replay attacks
    deleteSession(sessionId: string): Promise<void>;
}
