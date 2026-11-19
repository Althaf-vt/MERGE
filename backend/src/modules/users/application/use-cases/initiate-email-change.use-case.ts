import { Inject, Injectable } from "@nestjs/common";
import { IUserRepository, USER_REPOSITORY } from "../../domain/interfaces/user-repository.interface";
import { IOtpService, OTP_SERVICE } from "../../domain/interfaces/otp-service.interface";
import { EMAIL_SERVICE, IEmailService } from "../../../../shared/domain/interfaces/email-service.interface";
import { IInitiateEmailChangeUseCase } from "../interfaces/security-management.use-case.interface";
import { InitiateEmailChangeDto } from "../dtos/security-management.dto";
import { ErrorCode } from "../../../../shared/domain/enums/error-code.enum";
import { DomainException } from "../../../../shared/domain/exceptions/domain.exception";
import { AuthProvider } from "../../domain/enums/user.enums";
import { USER_ERROR_MESSAGES } from "../../domain/constants/user-error-messages.constant";
import { USER_POLICY } from "../../domain/constants/user.constants";

@Injectable()
export class InitiateEmailChangeUseCase implements IInitiateEmailChangeUseCase{
    constructor(
        @Inject(USER_REPOSITORY) private readonly _userRepository: IUserRepository,
        @Inject(OTP_SERVICE) private readonly _otpService: IOtpService,
        @Inject(EMAIL_SERVICE) private readonly _emailService: IEmailService,
    ) { }

    async execute(userId: string, dto: InitiateEmailChangeDto): Promise<void> {
        const user = await this._userRepository.findById(userId);
        if (!user) throw new DomainException(ErrorCode.USER_NOT_FOUND, USER_ERROR_MESSAGES.USER_NOT_FOUND);

        if(user.authProvider === AuthProvider.GOOGLE){
            throw new DomainException(ErrorCode.FORBIDDEN, USER_ERROR_MESSAGES.GOOGLE_AUTH_CANNOT_CHANGE_EMAIL);
        }

        const currentEmail = user.email.getValue();
        const standardizedNewEmail = dto.newEmail.toLowerCase().trim();

        if(currentEmail === standardizedNewEmail){
            throw new DomainException(ErrorCode.VALIDATION_FAILED, USER_ERROR_MESSAGES.EMAIL_MUST_BE_DIFFERENT);
        }

        // 1. verify the current otp (proving ownershotp of the existing accoutn)
        const isCurrentOtpValid = await this._otpService.verifySecurityAuthOtp(currentEmail, dto.currentOtp);
        if (!isCurrentOtpValid) {
            throw new DomainException(ErrorCode.OTP_INVALID, USER_ERROR_MESSAGES.INVALID_CURRENT_EMAIL_CODE);
        }

        // 2. Prevent dupliction : check if the requested new email alreay belongs to someone else
        const existingUser = await this._userRepository.findByEmail(standardizedNewEmail);

        if (existingUser) {
            throw new DomainException(ErrorCode.USER_ALREADY_EXISTS, USER_ERROR_MESSAGES.USER_ALREADY_EXISTS);
        }

        // 3. Generate new Otp and store the draft in redis
        const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
        await this._otpService.storeEmailChangeDraft(userId, standardizedNewEmail, newOtp, USER_POLICY.EMAIL_CHANGE_OTP_TTL_SECONDS);

        // 4. Send the new OTP to the new email address
        await this._emailService.sendOtpEmail(standardizedNewEmail, newOtp);

        // 5. cleanup the old Otp to prevent reuse
        await this._otpService.deleteSecurityAuthOtp(currentEmail);
    }
}