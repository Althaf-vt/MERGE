import { Injectable } from "@nestjs/common";
import { IAdminInviteService } from "../../domain/interfaces/admin-invite.interface";
import Redis from "ioredis";
import { EmailVO } from "../../../../shared/domain/value-objects/email.vo";

@Injectable()
export class AdminRedisInviteService implements IAdminInviteService {
    private readonly _redis: Redis;
    private readonly _prefix = 'admin:invite';

    constructor() {
        this._redis = new Redis(process.env.REDIS_URI || 'redis://localhost:6379');
    }

    private _getKey(token: string): string {
        return `${this._prefix}:${token}`;
    }

    async storeInviteToken(email: EmailVO, token: string, ttlSeconds: number): Promise<void> {
        await this._redis.set(this._getKey(token), email.getValue(), 'EX', ttlSeconds);
    }

    async verifyAndRetriveInvite(token: string): Promise<string | null> {
        return await this._redis.get(this._getKey(token));
    }

    async deleteInviteToken(token: string): Promise<void> {
        await this._redis.del(this._getKey(token));
    }
}