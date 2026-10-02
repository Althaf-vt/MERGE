import { Inject, Injectable } from "@nestjs/common";
import { IUserRepository, USER_REPOSITORY } from "../../domain/interfaces/user-repository.interface";
import { IOtpService, OTP_SERVICE } from "../../domain/interfaces/otp-service.interface";
import { EMAIL_SERVICE, IEmailService } from "../../../../shared/domain/interfaces/email-service.interface";
import { IInitiateEmailChangeUseCase } from "../interfaces/security-management.use-case.interface";
import { InitiateEmailChangeDto } from "../dtos/security-management.dto";
import { ErrorCode } from "../../../../shared/domain/enums/error-code.enum";
import { DomainException } from "../../../../shared/domain/exceptions/domain.exception";
import { AuthProvider } from "../../domain/enums/user.enums";

@Injectable()
export class InitiateEmailChangeUseCase implements IInitiateEmailChangeUseCase{
    constructor(
        @Inject(USER_REPOSITORY) private readonly _userRepository: IUserRepository,
        @Inject(OTP_SERVICE) private readonly _otpService: IOtpService,
        @Inject(EMAIL_SERVICE) private readonly _emailService: IEmailService,
    ) { }

    async execute(userId: string, dto: InitiateEmailChangeDto): Promise<void> {
        const user = await this._userRepository.findById(userId);
        if (!user) throw new DomainException(ErrorCode.USER_NOT_FOUND, 'User not found.');

        if(user.authProvider === AuthProvider.GOOGLE){
            throw new DomainException(ErrorCode.FORBIDDEN, 'Google-authenticated accounts cannot change their email address.');
        }

        const currentEmail = user.email.getValue();
        const standardizedNewEmail = dto.newEmail.toLowerCase().trim();

        if(currentEmail === standardizedNewEmail){
            throw new DomainException(ErrorCode.VALIDATION_FAILED, 'New email address must be different from the current one.');
        }

        // 1. verify the current otp (proving ownershotp of the existing accoutn)
        const isCurrentOtpValid = await this._otpService.verifySecurityAuthOtp(currentEmail, dto.currentOtp);
        if (!isCurrentOtpValid) {
            throw new DomainException(ErrorCode.OTP_INVALID, 'Invalid or expired verification code for current email.');
        }

        // 2. Prevent dupliction : check if the requested new email alreay belongs to someone else
        const existingUser = await this._userRepository.findByEmail(standardizedNewEmail);

        if (existingUser) {
            throw new DomainException(ErrorCode.USER_ALREADY_EXISTS, 'An account with this email address already exists.');
        }

        // 3. Generate new Otp and store the draft in redis
        const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
        await this._otpService.storeEmailChangeDraft(userId, standardizedNewEmail, newOtp, 600);

        // 4. Send the new OTP to the new email address
        await this._emailService.sendOtpEmail(standardizedNewEmail, newOtp);

        // 5. cleanup the old Otp to prevent reuse
        await this._otpService.deleteSecurityAuthOtp(currentEmail);
    }
}