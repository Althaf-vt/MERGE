import { Injectable } from '@nestjs/common';
import { IAdminSessionService } from '../../domain/interfaces/admin-session.interface';
import Redis from 'ioredis';

@Injectable()
export class AdminRedisSessionService implements IAdminSessionService {
    private readonly _redis: Redis;
    private readonly _prefix = 'admin:session';

    constructor() {
        this._redis = new Redis(process.env.REDIS_URI || 'redis://localhost:6379');
    }

    private _getKey(adminId: string): string {
        return `${this._prefix}:${adminId}`;
    }

    async createSession(adminId: string, ttlSeconds: number): Promise<void> {
        // Set an 'ACTIVE' flag for the duration of the refresh token lifecycle
        await this._redis.set(this._getKey(adminId), 'ACTIVE', 'EX', ttlSeconds);
    }

    async hasValidSession(adminId: string): Promise<boolean> {
        const status = await this._redis.get(this._getKey(adminId));
        return status === 'ACTIVE';
    }

    async deleteSession(adminId: string): Promise<void> {
        await this._redis.del(this._getKey(adminId));
    }
}