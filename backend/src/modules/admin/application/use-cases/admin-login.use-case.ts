import { Inject, Injectable } from "@nestjs/common";
import { IAdminLoginUseCase } from "../interfaces/admin-login.use-case.interface";
import { ADMIN_REPOSITORY, IAdminRepository } from "../../domain/interfaces/admin-repository.interface";
import { IPasswordHasher, PASSWORD_HASHER } from "../../../../shared/interfaces/password-hasher.interface";
import { ITokenservice, TOKEN_SERVICE } from "../../../users/domain/interfaces/token-service.interface";
import { AdminAggregate } from "../../domain/entities/admin.entity";
import { AdminLoginDto } from "../dtos/admin-login.dto";
import { EmailVO } from "../../../users/domain/value-objects/email.vo";
import { DomainException } from "../../../users/domain/exceptions/domain.exception";
import { ErrorCode } from "../../../users/domain/enums/error-code.enum";

@Injectable()
export class AdminLoginUseCase implements IAdminLoginUseCase {
    constructor(
        @Inject(ADMIN_REPOSITORY) private readonly _adminRepository: IAdminRepository,
        @Inject(PASSWORD_HASHER) private readonly _passwordHasher: IPasswordHasher,
        @Inject(TOKEN_SERVICE) private readonly _tokenService: ITokenservice,
    ) { }
    async execute(dto: AdminLoginDto): Promise<{ accessToken: string; refreshToken: string; admin: AdminAggregate; }> {
        const emailVo = new EmailVO(dto.email);

        // 1. Fetch admin by exact normalized email
        const admin = await this._adminRepository.findByEmail(emailVo.getValue());

        if (!admin) {
            throw new DomainException(ErrorCode.INVALID_CREDENTIALS, "Invalid email or password.");
        }

        const isPasswordValid = await this._passwordHasher.compare(dto.password, admin.passwordHash);

        if (!isPasswordValid) {
            throw new DomainException(ErrorCode.INVALID_CREDENTIALS, "Invalid email or password.");
        }

        // 2. Domain invariant check (validates if account is active, updates lastLogin)
        admin.recordLogin();
        await this._adminRepository.update(admin);

        const payload = {
            userId: admin.id!,
            email: admin.email.getValue(),
            role: admin.role,
            permissions: admin.permissions,
        };

        return {
            accessToken: this._tokenService.generateAccessToken(payload),
            refreshToken: this._tokenService.generateRefreshToken(payload),
            admin: admin,
        }
    }
}