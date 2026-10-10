import { Request } from 'express';

// Strict Payload Definition instead of 'any'
export interface JwtPayload {
    userId: string;
    email: string;
    role: string;
    permissions?: string[];
    sessionId?: string;
}

export interface AuthenticatedRequest extends Request {
    user: JwtPayload;
}