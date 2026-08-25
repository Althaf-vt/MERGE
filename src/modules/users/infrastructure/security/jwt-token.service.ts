import { Injectable } from "@nestjs/common";
import { ITokenPayload, ITokenservice } from "../../domain/interfaces/token-service.interface";
import { JwtService } from "@nestjs/jwt";

// Implements token generation and verification using JWT.
@Injectable()
export class JwtTokenService implements ITokenservice{

    // Injects NestJS's JwtService for JWT operations.
    constructor(private readonly jwtService: JwtService){}

    generateAccessToken(payload: ITokenPayload): string {
        return this.jwtService.sign(payload,{expiresIn: '15m'});
    }

    generateRefreshToken(payload: ITokenPayload): string {
        return this.jwtService.sign(payload, {expiresIn: '7d'});
    }

    verifyAccessToken(token: string): ITokenPayload {
        return this.jwtService.verify(token);
    }

    verifyRefreshToken(token: string): ITokenPayload {
        return this.jwtService.verify(token);
    }
}