import { Inject, Injectable } from "@nestjs/common";
import { IAdminRefreshTokenUseCase } from "../interfaces/admin-refresh-token.use-case.interface";
import { ADMIN_REPOSITORY, IAdminRepository } from "../../domain/interfaces/admin-repository.interface";
import { ITokenservice, TOKEN_SERVICE } from "../../../../shared/domain/interfaces/token-service.interface";
import { ADMIN_SESSION_SERVICE, IAdminSessionService } from "../../domain/interfaces/admin-session.interface"; // <-- IMPORT THIS
import { AdminAggregate } from "../../domain/entities/admin.entity";
import { AdminStatus } from "../../domain/enums/admin.enums";
import { DomainException } from "../../../../shared/domain/exceptions/domain.exception";
import { ErrorCode } from "../../../../shared/domain/enums/error-code.enum";

@Injectable()
export class AdminRefreshTokenUsecase implements IAdminRefreshTokenUseCase {
    constructor(
        @Inject(ADMIN_REPOSITORY) private readonly _adminRepository: IAdminRepository,
        @Inject(TOKEN_SERVICE) private readonly _tokenService: ITokenservice,
        @Inject(ADMIN_SESSION_SERVICE) private readonly _sessionService: IAdminSessionService, // <-- INJECT THIS
    ) { }

    async execute(token: string): Promise<{ accessToken: string; refreshToken: string; admin: AdminAggregate; }> {
        const payload = this._tokenService.verifyRefreshToken(token);

        // 1. STRICT CHECK: Does the Redis session still exist?
        const hasSession = await this._sessionService.hasValidSession(payload.userId);
        if (!hasSession) {
            throw new DomainException(ErrorCode.UNAUTHORIZED, "Session was forcefully terminated. Please log in again.");
        }

        const admin = await this._adminRepository.findById(payload.userId);

        if (!admin || admin.status !== AdminStatus.ACTIVE) {
            throw new DomainException(ErrorCode.INVALID_CREDENTIALS, "Admin account is inactive or deleted.");
        }

        const newPayload = {
            userId: admin.id!,
            email: admin.email.getValue(),
            role: admin.role,
            permissions: admin.permissions,
        };
        
        // 2. Keep the session alive for another 7 days
        const ttlSeconds = parseInt(process.env.JWT_REFRESH_EXPIRATION_SECONDS || '604800', 10);
        await this._sessionService.createSession(admin.id!, ttlSeconds);

        return {
            accessToken: this._tokenService.generateAccessToken(newPayload),
            refreshToken: this._tokenService.generateRefreshToken(newPayload),
            admin: admin,
        };
    }
}