import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { IHandoffSessionService } from "../../domain/interfaces/handoff-service.interface";
import Redis from "ioredis";
import { randomUUID } from 'crypto';
import { InternalServerError } from "@aws-sdk/client-textract";


@Injectable()
export class RedisHandoffService implements IHandoffSessionService{
    private readonly redisClient: Redis;
    private readonly PREFIX = 'handoff:';

    constructor(){
        // Connects to the existing Docker Redis instance.
        // Uses env variables with sensible fallbacks.
        this.redisClient = new Redis({
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
            await this.redisClient.set(`${this.PREFIX}${sessionId}`,userId, 'EX', ttlSeconds)

            return sessionId;
        } catch (error) {
            throw new InternalServerErrorException("Failed to generate secure handoff session");
        }
    }

    async validateSession(sessionId: string): Promise<string | null> {
        // Retrieves the userId using the session UUID
        // If the TTL has expired, Redis automatically returns null.
        return await this.redisClient.get(`${this.PREFIX}${sessionId}`);
    }

    async deleteSession(sessionId: string): Promise<void> {
        // Immediately destroys the token to prevent replay attacks
        await this.redisClient.del(`${this.PREFIX}${sessionId}`);
    }
}