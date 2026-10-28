import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as jwt from 'jsonwebtoken';
import { ITokenPayload, ITokenservice } from "../../../domain/interfaces/token-service.interface";
import { DomainException } from "../../../domain/exceptions/domain.exception";
import { ErrorCode } from "../../../domain/enums/error-code.enum";
import { EnvConfig } from "../../config/env.config";

@Injectable()
export class JwtTokenService implements ITokenservice {
    private readonly _accessSecret: string;
    private readonly _refreshSecret: string;
    private readonly _accessExpiration: jwt.SignOptions['expiresIn'];
    private readonly _refreshExpiration: jwt.SignOptions['expiresIn'];

    constructor(private readonly _jwtService: JwtService) {
        const accessSecret = EnvConfig.jwt.accessSecret;
        const refreshSecret = EnvConfig.jwt.refreshSecret;

        if (!accessSecret || !refreshSecret) {
            throw new Error('JWT_ACCESS_SECRET and JWT_REFRESH_SECRET must be defined in environment configuration.');
        }

        this._accessSecret = accessSecret;
        this._refreshSecret = refreshSecret;
        this._accessExpiration = EnvConfig.jwt.accessExpiration as jwt.SignOptions['expiresIn'];
        this._refreshExpiration = EnvConfig.jwt.refreshExpiration as jwt.SignOptions['expiresIn'];
    }

    generateAccessToken(payload: ITokenPayload): string {
        return this._jwtService.sign(payload, {
            secret: this._accessSecret,
            expiresIn: this._accessExpiration,
        });
    }

    generateRefreshToken(payload: ITokenPayload): string {
        return this._jwtService.sign(payload, {
            secret: this._refreshSecret,
            expiresIn: this._refreshExpiration,
        });
    }

    verifyAccessToken(token: string): ITokenPayload {
        try {
            return this._jwtService.verify<ITokenPayload>(token, {
                secret: this._accessSecret,
            });
        } catch (error) {
            throw new DomainException(ErrorCode.TOKEN_INVALID, 'Invalid or expired access token');
        }
    }

    verifyRefreshToken(token: string): ITokenPayload {
        try {
            return this._jwtService.verify<ITokenPayload>(token, {
                secret: this._refreshSecret,
            });
        } catch (error) {
            throw new DomainException(ErrorCode.TOKEN_INVALID, 'Invalid or expired refresh token');
        }
    }
}