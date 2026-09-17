import { Inject, Injectable } from "@nestjs/common";
import { IAdminRefreshTokenUseCase } from "../interfaces/admin-refresh-token.use-case.interface";
import { ADMIN_REPOSITORY, IAdminRepository } from "../../domain/interfaces/admin-repository.interface";
import { ITokenservice, TOKEN_SERVICE } from "../../../../shared/domain/interfaces/token-service.interface";
import { AdminAggregate } from "../../domain/entities/admin.entity";
import { AdminStatus } from "../../domain/enums/admin.enums";
import { DomainException } from "../../../../shared/domain/exceptions/domain.exception";
import { ErrorCode } from "../../../../shared/domain/enums/error-code.enum";

@Injectable()
export class AdminRefreshTokenUsecase implements IAdminRefreshTokenUseCase {
    constructor(
        @Inject(ADMIN_REPOSITORY) private readonly _adminRepository: IAdminRepository,
        @Inject(TOKEN_SERVICE) private readonly _tokenService: ITokenservice,
    ) { }

    async execute(token: string): Promise<{ accessToken: string; refreshToken: string; admin: AdminAggregate; }> {
        const payload = this._tokenService.verifyRefreshToken(token);

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

        return {
            accessToken: this._tokenService.generateAccessToken(newPayload),
            refreshToken: this._tokenService.generateRefreshToken(newPayload),
            admin: admin,
        };
    }
}