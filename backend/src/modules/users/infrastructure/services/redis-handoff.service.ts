import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { IHandoffSessionService } from "../../domain/interfaces/handoff-service.interface";
import Redis from "ioredis";
import { randomUUID } from 'crypto';
import { InternalServerError } from "@aws-sdk/client-textract";


@Injectable()
export class RedisHandoffService implements IHandoffSessionService{
    private readonly _redisClient: Redis;
    private readonly _PREFIX = 'handoff:';

    constructor(){
        // Connects to the existing Docker Redis instance.
        // Uses env variables with sensible fallbacks.
        this._redisClient = new Redis({
            host: process.env.REDIS_HOST || 'localhost',
            port: Number(process.env.REDIS_PORT) || 6379
        });
    }

    async createSession(userId: string, ttlSeconds: number): Promise<string> {
        try {
            // Generate a secure, random UUID for the QR code
            const sessionId = randomUUID();

            // Store it in Redis mapping the UUID to the User's ID.
            // 'EX' automatically deletes this record after ttlSeconds
            await this._redisClient.set(`${this._PREFIX}${sessionId}`,userId, 'EX', ttlSeconds)

            return sessionId;
        } catch (error) {
            throw new InternalServerErrorException("Failed to generate secure handoff session");
        }
    }

    async validateSession(sessionId: string): Promise<string | null> {
        // Retrieves the userId using the session UUID
        // If the TTL has expired, Redis automatically returns null.
        return await this._redisClient.get(`${this._PREFIX}${sessionId}`);
    }

    async deleteSession(sessionId: string): Promise<void> {
        // Immediately destroys the token to prevent replay attacks
        await this._redisClient.del(`${this._PREFIX}${sessionId}`);
    }
}