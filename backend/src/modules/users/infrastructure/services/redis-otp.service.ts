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
    async storeOtp(email: string, otp: string, ttlSeconds: number): Promise<void> {
        await this.redis.set(this.getKey(email), otp, 'EX', ttlSeconds);
    }

    // Checks whether the provided OTP matched the stored OTP
    async verifyOtp(email: string, otp: string): Promise<boolean> {
        const key = this.getKey(email);
        const storedOtp = await this.redis.get(key);

        if(!storedOtp || storedOtp !== otp){
            return false;
        }

        // Removes the OTP immediately after successful verification so it cannot be reused
        await this.redis.del(key); // Invalidate immediately upon successful use
        return true;
    }

    // Removed the user's OTP form Redis
    async deleteOtp(email: string): Promise<void> {
        await this.redis.del(this.getKey(email))
    }
}