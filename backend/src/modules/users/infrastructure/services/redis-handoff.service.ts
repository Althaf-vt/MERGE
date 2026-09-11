import { Inject, Injectable } from "@nestjs/common";
import { IHandoffSessionService } from "../../application/interfaces/handoff-service.interface";
import Redis from "ioredis";
import { randomUUID } from 'crypto';

export const REDIS_CLIENT = 'REDIS_CLIENT';

@Injectable()
export class RedisHandoffService implements IHandoffSessionService{
    private static readonly _PREFIX = 'handoff:';

    constructor(
        @Inject(REDIS_CLIENT) private readonly _redisClient: Redis
    ) {}

    private _buildKey(sessionId: string): string {
        return `${RedisHandoffService._PREFIX}${sessionId}`;
    }

    async createSession(userId: string, ttlSeconds: number): Promise<string> {
        // Generate a secure, random UUID for the QR code
        const sessionId = randomUUID();

        // Store it in Redis mapping the UUID to the User's ID.
        // 'EX' automatically deletes this record after ttlSeconds
        // Allow driver errors to propagate; the use-case or global filter handles presentation errors
        await this._redisClient.set(this._buildKey(sessionId), userId, 'EX', ttlSeconds);

        return sessionId;
    }

    async validateSession(sessionId: string): Promise<string | null> {
        // Retrieves the userId using the session UUID
        // If the TTL has expired, Redis automatically returns null.
        return await this._redisClient.get(this._buildKey(sessionId));
    }

    async deleteSession(sessionId: string): Promise<void> {
        // Immediately destroys the token to prevent replay attacks
        await this._redisClient.del(this._buildKey(sessionId));
    }
}