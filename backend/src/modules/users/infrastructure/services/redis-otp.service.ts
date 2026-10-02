import { Injectable } from "@nestjs/common";
import { IOtpService } from "../../domain/interfaces/otp-service.interface";
import { DomainException } from "../../../../shared/domain/exceptions/domain.exception";
import { ErrorCode } from "../../../../shared/domain/enums/error-code.enum";
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
    private _getKey(email: string): string{
        return `otp:registraction:${email.toLowerCase().trim()}`;
    }

    private _getEmailChangeKey(userId: string): string {
        return `otp:email_change:${userId}`;
    }

    private _getResetKey(email: string): string {
        return `otp:reset:${email.toLowerCase().trim()}`;
    }

    private _getSecurityAuthKey(email: string): string {
        return `otp:security_auth:${email.toLowerCase().trim()}`;
    }

    // Stores an OTP in Redis with a time-to-live to expire it automatically
    async storeRegistrationDraft(email: string, otp: string, passwordHash: string, ttlSeconds: number): Promise<void> {
        const payload = JSON.stringify({otp,passwordHash});
        await this._redis.set(this._getKey(email), payload, 'EX', ttlSeconds);
    }

    // Checks whether the provided OTP matched the stored OTP
    async verifyAndRetrieveDraft(email: string, otp: string): Promise<{passwordHash: string} | null> {
        const key = this._getKey(email);
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
        await this._redis.del(this._getKey(email))
    }

    async refreshRegistrationDraft(email: string, newOtp: string, ttlSeconds: number): Promise<void> {
        const key = this._getKey(email);
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

    async storeSecurityAuthOtp(email: string, otp: string, ttlSeconds: number): Promise<void> {
        await this._redis.set(this._getSecurityAuthKey(email), otp, 'EX', ttlSeconds);
    }

    async verifySecurityAuthOtp(email: string, otp: string): Promise<boolean> {
        const storedOtp = await this._redis.get(this._getSecurityAuthKey(email));
        return storedOtp === otp;
    }

    async deleteSecurityAuthOtp(email: string): Promise<void> {
        await this._redis.del(this._getSecurityAuthKey(email));
    }

    async storeEmailChangeDraft(userId: string, newEmail: string, newOtp: string, ttlSeconds: number): Promise<void> {
        const payload = JSON.stringify({newEmail: newEmail.toLocaleLowerCase().trim(), otp: newOtp});
        this._redis.set(this._getEmailChangeKey(userId), payload, 'EX', ttlSeconds);
    }

    async verifyAndRetrieveEmailChangeDraft(userId: string, submittedOtp: string): Promise<string | null> {
        const key = this._getEmailChangeKey(userId);
        const storedData = await this._redis.get(key);

        if(!storedData) return null;

        const parsedData = JSON.parse(storedData);

        if(parsedData.otp !== submittedOtp){
            return null;
        }

        return parsedData.newEmail;
    }

    async deleteEmailChangeDraft(userId: string): Promise<void> {
        await this._redis.del(this._getEmailChangeKey(userId));
    }
}