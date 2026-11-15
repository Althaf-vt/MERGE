import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as jwt from 'jsonwebtoken';
import { ITokenPayload, ITokenservice } from "../../../domain/interfaces/token-service.interface";
import { EnvConfig } from "../../config/env.config";
import { CONFIG_ERROR_MESSAGES } from "../../constants/config-errors.constant";

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
            throw new Error(CONFIG_ERROR_MESSAGES.JWT_SECRETS_REQUIRED);
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

    verifyAccessToken(token: string): ITokenPayload | null {
        try {
            return this._jwtService.verify<ITokenPayload>(token, {
                secret: this._accessSecret,
            });
        } catch {
            return null;
        }
    }

    verifyRefreshToken(token: string): ITokenPayload | null {
        try {
            return this._jwtService.verify<ITokenPayload>(token, {
                secret: this._refreshSecret,
            });
        } catch {
            return null;
        }
    }
}