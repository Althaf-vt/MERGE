import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ITokenPayload, ITokenservice } from "../../domain/interfaces/token-service.interface";
import { JwtService } from "@nestjs/jwt";

// Implements token generation and verification using JWT.
@Injectable()
export class JwtTokenService implements ITokenservice{

    // Injects NestJS's JwtService for JWT operations.
    constructor(private readonly jwtService: JwtService){}

    generateAccessToken(payload: ITokenPayload): string {
        return this.jwtService.sign(payload, {
            secret: process.env.JWT_ACCESS_SECRET || 'fallback-access-secret',
            expiresIn: (process.env.JWT_ACCESS_EXPIRATION || '15m') as any
        })
    }

    generateRefreshToken(payload: ITokenPayload): string {
        return this.jwtService.sign(payload, {
            secret: process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret',
            expiresIn: (process.env.JWT_REFRESH_EXPIRATION || '7d') as any
        });
    }

    verifyAccessToken(token: string): ITokenPayload {
        try {
            return this.jwtService.verify<ITokenPayload>(token, {
                secret: process.env.JWT_ACCESS_SECRET || 'fallback-access-secret',
            });
        } catch (error) {
            throw new UnauthorizedException('Invalid or expired access token');
        }
    }

    verifyRefreshToken(token: string): ITokenPayload {
        try {
            return this.jwtService.verify<ITokenPayload>(token, {
                secret: process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret'
            });
        } catch (error) {
            throw new UnauthorizedException("Invalid or expired refresh token");
        }
    }
}