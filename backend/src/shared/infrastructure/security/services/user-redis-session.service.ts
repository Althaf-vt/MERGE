import { Injectable } from "@nestjs/common";
import { v4 as uuidv4 } from 'uuid';
import Redis from "ioredis";
import { IUserSessionService, UserSessionData } from "../../../domain/interfaces/user-session.interface";

@Injectable()
export class UserRedisSessionService implements IUserSessionService {
    private readonly _redis: Redis;
    private readonly _prefix = 'user:session';

    constructor(){
        this._redis = new Redis(process.env.REDIS_URI || 'redis://localhost:6379');
    }

    private _getUserSetKey(userId: string): string {
        return `${this._prefix}:set:${userId}`;
    }

    private _getSessionKey(sessionId: string): string {
        return `${this._prefix}:data:${sessionId}`;
    }

    async createSession(userId: string, deviceInfo: string, ipAddress: string, ttlSeconds: number): Promise<string> {
        const sessionId = uuidv4();
        const sessinData: UserSessionData = {
            sessionId,
            userId,
            deviceInfo,
            ipAddress,
            lastActive: new Date(),
            createdAt: new Date(),
        };

        const pipeline = this._redis.pipeline();
        pipeline.sadd(this._getUserSetKey(userId), sessionId);
        pipeline.set(this._getSessionKey(sessionId), JSON.stringify(sessinData), 'EX', ttlSeconds);
        await pipeline.exec();

        return sessionId;
    }

    async getSessions(userId: string): Promise<UserSessionData[]> {
        const sessionIds = await this._redis.smembers(this._getUserSetKey(userId));
        if(!sessionIds.length) return [];

        const sessionKeys = sessionIds.map(id => this._getSessionKey(id));
        const rawSessions = await this._redis.mget(sessionKeys);

        const activeSessions: UserSessionData[] = [];
        const expiredSessionIds: string[] = [];

        rawSessions.forEach((raw, index) => {
            if(raw){
                activeSessions.push(JSON.parse(raw));
            }else{
                expiredSessionIds.push(sessionIds[index]);
            }
        });

        // Cleanup expired session from the user's set
        if(expiredSessionIds.length > 0){
            await this._redis.srem(this._getUserSetKey(userId), ...expiredSessionIds);
        }

        // sort by most recently created
        return activeSessions.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    async validateSession(userId: string, sessionId: string): Promise<boolean> {
        const exists = await this._redis.exists(this._getSessionKey(sessionId));
        return exists === 1
    }

    async revokeSession(userId: string, sessionId: string): Promise<void> {
        const pipeline = this._redis.pipeline();
        pipeline.srem(this._getUserSetKey(userId), sessionId);
        pipeline.del(this._getSessionKey(sessionId));
        await pipeline.exec();
    }

    async revokeAllOtherSessions(userId: string, currentSessionId: string): Promise<void> {
        const sessionIds = await this._redis.smembers(this._getUserSetKey(userId));
        const sessionToRemove = sessionIds.filter(id => id !== currentSessionId);

        if(sessionToRemove.length > 0){
            const keysToRemove = sessionToRemove.map(id => this._getSessionKey(id));
            const pipeline = this._redis.pipeline();
            pipeline.srem(this._getUserSetKey(userId), ...sessionToRemove);
            pipeline.del(...keysToRemove);
            await pipeline.exec();
        }
    }

    async revokeAllSessions(userId: string): Promise<void> {
        const sessionIds = await this._redis.smembers(this._getUserSetKey(userId));
        if(sessionIds.length > 0){
            const keysToRemove = sessionIds.map(id => this._getSessionKey(id));
            const pipeline = this._redis.pipeline();
            pipeline.del(this._getUserSetKey(userId));
            pipeline.del(...keysToRemove);
            await pipeline.exec();
        }
    }
}