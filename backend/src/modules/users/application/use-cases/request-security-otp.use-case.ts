import { Inject, Injectable } from "@nestjs/common";
import { IRequestSecurityOtpUseCase } from "../interfaces/security-management.use-case.interface";
import { IUserRepository, USER_REPOSITORY } from "../../domain/interfaces/user-repository.interface";
import { IOtpService, OTP_SERVICE } from "../../domain/interfaces/otp-service.interface";
import { EMAIL_SERVICE, IEmailService } from "../../../../shared/domain/interfaces/email-service.interface";
import { DomainException } from "../../../../shared/domain/exceptions/domain.exception";
import { ErrorCode } from "../../../../shared/domain/enums/error-code.enum";

@Injectable()
export class RequestSecurityOtpUseCase implements IRequestSecurityOtpUseCase {
    constructor(
        @Inject(USER_REPOSITORY) private readonly _userRepository: IUserRepository,
        @Inject(OTP_SERVICE) private readonly _otpService: IOtpService,
        @Inject(EMAIL_SERVICE) private readonly _emailService: IEmailService,
    ) {}

    async execute(userId: string): Promise<void> {
        const user = await this._userRepository.findById(userId);
        if (!user) throw new DomainException(ErrorCode.USER_NOT_FOUND, 'User not found.');

        const email = user.email.getValue();
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        await this._otpService.storeSecurityAuthOtp(email, otp, 600);

        await this._emailService.sendOtpEmail(email, otp);
    }
}