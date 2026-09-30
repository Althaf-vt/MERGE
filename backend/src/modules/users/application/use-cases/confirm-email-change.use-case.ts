import { Inject, Injectable } from "@nestjs/common";
import { IConfirmEmailChangeUseCase } from "../interfaces/security-management.use-case.interface";
import { IUserRepository, USER_REPOSITORY } from "../../domain/interfaces/user-repository.interface";
import { IOtpService, OTP_SERVICE } from "../../domain/interfaces/otp-service.interface";
import { IUserSessionService, USER_SESSION_SERVICE } from "../../domain/interfaces/user-session.interface";
import { ConfirmEmailChangeDto } from "../dtos/security-management.dto";
import { DomainException } from "../../../../shared/domain/exceptions/domain.exception";
import { ErrorCode } from "../../../../shared/domain/enums/error-code.enum";
import { EmailVO } from "../../../../shared/domain/value-objects/email.vo";

@Injectable()
export class ConfirmEmailChangeUseCase implements IConfirmEmailChangeUseCase {
    constructor(
        @Inject(USER_REPOSITORY) private readonly _userRepository: IUserRepository,
        @Inject(OTP_SERVICE) private readonly _otpService: IOtpService,
        @Inject(USER_SESSION_SERVICE) private readonly _sessionService: IUserSessionService,
    ) { }

    async execute(userId: string, dto: ConfirmEmailChangeDto): Promise<void> {
        const user = await this._userRepository.findById(userId);
        if (!user) throw new DomainException(ErrorCode.USER_NOT_FOUND, 'User not found.');

        // 1. Retrive the draft from Redis using the submitted otp
        const newEmailString = await this._otpService.verifyAndRetrieveEmailChangeDraft(userId, dto.newEmailOtp);
        if (!newEmailString) {
            throw new DomainException(ErrorCode.OTP_INVALID, 'Invalid or expired verification code for the new email.');
        }

        // 2. perform the domain entity update
        user.updateEmail(new EmailVO(newEmailString));
        await this._userRepository.update(user);

        // 3. clean up redis draft
        await this._otpService.deleteEmailChangeDraft(userId);

        await this._sessionService.revokeAllSessions(userId);
    }
}