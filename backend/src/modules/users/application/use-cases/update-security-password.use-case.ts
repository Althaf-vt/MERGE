import { Inject, Injectable } from "@nestjs/common";
import { UpdateSecurityPasswordDto } from "../dtos/security-management.dto";
import { IUserRepository, USER_REPOSITORY } from "../../domain/interfaces/user-repository.interface";
import { IOtpService, OTP_SERVICE } from "../../domain/interfaces/otp-service.interface";
import { IPasswordHasher, PASSWORD_HASHER } from "../../../../shared/domain/interfaces/password-hasher.interface";
import { IUserSessionService, USER_SESSION_SERVICE } from "../../domain/interfaces/user-session.interface";
import { DomainException } from "../../../../shared/domain/exceptions/domain.exception";
import { ErrorCode } from "../../../../shared/domain/enums/error-code.enum";
import { IUpdateSecurityPasswordUseCase } from "../interfaces/security-management.use-case.interface";

@Injectable()
export class UpdateSecurityPasswordUseCase implements IUpdateSecurityPasswordUseCase {
    constructor(
        @Inject(USER_REPOSITORY) private readonly _userRepository: IUserRepository,
        @Inject(OTP_SERVICE) private readonly _otpService: IOtpService,
        @Inject(PASSWORD_HASHER) private readonly _passwordHasher: IPasswordHasher,
        @Inject(USER_SESSION_SERVICE) private readonly _sessionService: IUserSessionService,
    ) { }

    async execute(userId: string, dto: UpdateSecurityPasswordDto): Promise<void> {
        const user = await this._userRepository.findById(userId);
        if (!user) throw new DomainException(ErrorCode.USER_NOT_FOUND, 'User not found.');

        const email = user.email.getValue();

        // Use the existing password reset OTP verification mechanism
        const isValid = await this._otpService.verifyPasswordResetOtp(email, dto.otp);
        if (!isValid) throw new DomainException(ErrorCode.OTP_INVALID, 'Invalid or expired OTP.');

        const newHash = await this._passwordHasher.hash(dto.newPassword);
        user.updatePassword(newHash);

        await this._userRepository.update(user);
        await this._otpService.deletePasswordResetOtp(email);

        // Secure Immediately revoke all sessions to force re-authentication
        await this._sessionService.revokeAllSessions(userId);
    }
}