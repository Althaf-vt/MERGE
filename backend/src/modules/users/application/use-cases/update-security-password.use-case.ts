import { Inject, Injectable } from "@nestjs/common";
import { UpdateSecurityPasswordDto } from "../dtos/security-management.dto";
import { IUserRepository, USER_REPOSITORY } from "../../domain/interfaces/user-repository.interface";
import { IPasswordHasher, PASSWORD_HASHER } from "../../../../shared/domain/interfaces/password-hasher.interface";
import { IUserSessionService, USER_SESSION_SERVICE } from "../../../../shared/domain/interfaces/user-session.interface";
import { DomainException } from "../../../../shared/domain/exceptions/domain.exception";
import { ErrorCode } from "../../../../shared/domain/enums/error-code.enum";
import { IUpdateSecurityPasswordUseCase } from "../interfaces/security-management.use-case.interface";

@Injectable()
export class UpdateSecurityPasswordUseCase implements IUpdateSecurityPasswordUseCase {
    constructor(
        @Inject(USER_REPOSITORY) private readonly _userRepository: IUserRepository,
        @Inject(PASSWORD_HASHER) private readonly _passwordHasher: IPasswordHasher,
        @Inject(USER_SESSION_SERVICE) private readonly _sessionService: IUserSessionService,
    ) { }

    async execute(userId: string, dto: UpdateSecurityPasswordDto): Promise<void> {
        const user = await this._userRepository.findById(userId);
        if (!user) {
            throw new DomainException(ErrorCode.USER_NOT_FOUND, 'User not found.');
        }

        if (!user.passwordHash) {
            throw new DomainException(
                ErrorCode.INVALID_CREDENTIALS,
                'Accounts registered through social login do not have a password.'
            );
        }

        const isCurrentValid = await this._passwordHasher.compare(dto.currentPassword, user.passwordHash);
        if (!isCurrentValid) {
            throw new DomainException(ErrorCode.INVALID_CREDENTIALS, 'Current password is incorrect.');
        }

        const isSamePassword = await this._passwordHasher.compare(dto.newPassword, user.passwordHash);
        if (isSamePassword) {
            throw new DomainException(
                ErrorCode.VALIDATION_FAILED,
                'New password cannot be the same as your current password.'
            );
        }

        const newHash = await this._passwordHasher.hash(dto.newPassword);
        user.updatePassword(newHash);

        await this._userRepository.update(user);

        // Secure Immediately revoke all sessions to force re-authentication
        await this._sessionService.revokeAllSessions(userId);
    }
}