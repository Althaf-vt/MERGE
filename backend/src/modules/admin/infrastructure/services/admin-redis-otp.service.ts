import { Injectable } from "@nestjs/common";
import { IAdminOtpService } from "../../domain/interfaces/admin-otp.interface";
import Redis from "ioredis";

@Injectable()
export class AdminRedisOtpService implements IAdminOtpService{
    private readonly _redis: Redis;
    private readonly _prefix = 'admin:reset:otp';

    constructor(){
        this._redis = new Redis(process.env.REDIS_URI || 'redis://localhost:6379');
    }

    private _getResetKey(email: string): string {
        return `${this._prefix}:${email.toLowerCase().trim()}`;
    }

    async storePasswordResetOtp(email: string, otp: string, ttlSeconds: number): Promise<void> {
        await this._redis.set(this._getResetKey(email), otp, 'EX', ttlSeconds);
    }

    async verifyPasswordResetOtp(email: string, otp: string): Promise<boolean> {
        const storedOtp = await this._redis.get(this._getResetKey(email));
        return storedOtp === otp;
    }

    async deletePasswordResetOtp(email: string): Promise<void> {
        await this._redis.del(this._getResetKey(email));
    }
}