import { Inject, Injectable } from "@nestjs/common";
import { UpdateSecurityPasswordDto } from "../dtos/security-management.dto";
import { IUserRepository, USER_REPOSITORY } from "../../domain/interfaces/user-repository.interface";
import { IPasswordHasher, PASSWORD_HASHER } from "../../../../shared/domain/interfaces/password-hasher.interface";
import { IUserSessionService, USER_SESSION_SERVICE } from "../../../../shared/domain/interfaces/user-session.interface";
import { DomainException } from "../../../../shared/domain/exceptions/domain.exception";
import { ErrorCode } from "../../../../shared/domain/enums/error-code.enum";
import { IUpdateSecurityPasswordUseCase } from "../interfaces/security-management.use-case.interface";
import { USER_ERROR_MESSAGES } from "../../domain/constants/user-error-messages.constant";

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
            throw new DomainException(ErrorCode.USER_NOT_FOUND, USER_ERROR_MESSAGES.USER_NOT_FOUND);
        }

        if (!user.passwordHash) {
            throw new DomainException(
                ErrorCode.INVALID_CREDENTIALS,
                USER_ERROR_MESSAGES.SOCIAL_LOGIN_NO_PASSWORD
            );
        }

        const isCurrentValid = await this._passwordHasher.compare(dto.currentPassword, user.passwordHash);
        if (!isCurrentValid) {
            throw new DomainException(ErrorCode.INVALID_CREDENTIALS, USER_ERROR_MESSAGES.CURRENT_PASSWORD_INCORRECT);
        }

        const isSamePassword = await this._passwordHasher.compare(dto.newPassword, user.passwordHash);
        if (isSamePassword) {
            throw new DomainException(
                ErrorCode.VALIDATION_FAILED,
                USER_ERROR_MESSAGES.NEW_PASSWORD_SAME_AS_CURRENT
            );
        }

        const newHash = await this._passwordHasher.hash(dto.newPassword);
        user.updatePassword(newHash);

        await this._userRepository.update(user);

        // Secure Immediately revoke all sessions to force re-authentication
        await this._sessionService.revokeAllSessions(userId);
    }
}