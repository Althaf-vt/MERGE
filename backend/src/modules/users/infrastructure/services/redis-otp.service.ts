import { Injectable } from "@nestjs/common";
import { IOtpService } from "../../domain/interfaces/otp-service.interface";
import { DomainException } from "../../domain/exceptions/domain.exception";
import { ErrorCode } from "../../domain/enums/error-code.enum";
import Redis from "ioredis";

// Injecting OTP storage and verification using Redis.
@Injectable()
export class RedisOtpService implements IOtpService{

    // Redis client used to store and retrieve OTPs 
    private readonly _redis: Redis;

    // Create a connection to the Redis server
    constructor(){
        this._redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
    }

    // Generate a consistent Redis key for each user's registration OTP
    private getKey(email: string): string{
        return `otp:registraction:${email.toLowerCase().trim()}`;
    }

    // Stores an OTP in Redis with a time-to-live to expire it automatically
    async storeRegistrationDraft(email: string, otp: string, passwordHash: string, ttlSeconds: number): Promise<void> {
        const payload = JSON.stringify({otp,passwordHash});
        await this._redis.set(this.getKey(email), payload, 'EX', ttlSeconds);
    }

    // Checks whether the provided OTP matched the stored OTP
    async verifyAndRetrieveDraft(email: string, otp: string): Promise<{passwordHash: string} | null> {
        const key = this.getKey(email);
        const storedData = await this._redis.get(key);

        if(!storedData){
            return null;
        }

        const parsedData = JSON.parse(storedData);

        // Invalid OTP
        if(parsedData.otp !== otp){
            return null;
        }

        return {passwordHash: parsedData.passwordHash}
    }

    // Removed the user's OTP form Redis
    async deleteDraft(email: string): Promise<void> {
        await this._redis.del(this.getKey(email))
    }

    async refreshRegistrationDraft(email: string, newOtp: string, ttlSeconds: number): Promise<void> {
        const key = this.getKey(email);
        const storedData = await this._redis.get(key);

        if(!storedData){
            throw new DomainException(ErrorCode.OTP_EXPIRED, 'Registration session expired. Please register again.');
        }

        const parsedData = JSON.parse(storedData);

        // Re-save with the new OTP but the existing password hash
        const payload = JSON.stringify({
            otp: newOtp,
            passwordHash: parsedData.passwordHash
        })

        await this._redis.set(key, payload, 'EX', ttlSeconds);

    }

    private getResetKey(email: string): string {
        return `otp:reset:${email.toLowerCase().trim()}`;
    }

    async storePasswordResetOtp(email: string, otp: string, ttlSeconds: number): Promise<void> {
        await this._redis.set(this.getResetKey(email), otp, 'EX', ttlSeconds);
    }

    async verifyPasswordResetOtp(email: string, otp: string): Promise<boolean> {
        const storedOtp = await this._redis.get(this.getResetKey(email));
        return storedOtp === otp;
    }

    async deletePasswordResetOtp(email: string): Promise<void> {
        await this._redis.del(this.getResetKey(email));
    }
}