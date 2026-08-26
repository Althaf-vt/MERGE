import { Injectable } from "@nestjs/common";
import { IOtpService } from "../../domain/interfaces/otp-service.interface";
import Redis from "ioredis";

// Injecting OTP storage and verification using Redis.
@Injectable()
export class RedisOtpService implements IOtpService{

    // Redis client used to store and retrieve OTPs 
    private readonly redis: Redis;

    // Create a connection to the Redis server
    constructor(){
        this.redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
    }

    // Generate a consistent Redis key for each user's registration OTP
    private getKey(email: string): string{
        return `otp:registraction:${email.toLowerCase().trim()}`;
    }

    // Stores an OTP in Redis with a time-to-live to expire it automatically
    async storeRegistrationDraft(email: string, otp: string, passwordHash: string, ttlSeconds: number): Promise<void> {
        const payload = JSON.stringify({otp,passwordHash});
        await this.redis.set(this.getKey(email), payload, 'EX', ttlSeconds);
    }

    // Checks whether the provided OTP matched the stored OTP
    async verifyAndRetrieveDraft(email: string, otp: string): Promise<{passwordHash: string} | null> {
        const key = this.getKey(email);
        const storedData = await this.redis.get(key);

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
        await this.redis.del(this.getKey(email))
    }
}