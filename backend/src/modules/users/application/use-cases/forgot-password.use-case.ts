import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { IForgotPasswordUseCase } from "../interfaces/forgot-password.use-case.interface";
import { ForgotPasswordDto } from "../dtos/forgot-password.dto";
import { IUserRepository, USER_REPOSITORY } from "../../domain/interfaces/user-repository.interface";
import { EMAIL_SERVICE, IEmailService } from "../../domain/interfaces/email-service.interface";
import { EmailVO } from "../../domain/value-objects/email.vo";
import { IOtpService, OTP_SERVICE } from "../../domain/interfaces/otp-service.interface";

@Injectable()
export class ForgotPasswordUseCase implements IForgotPasswordUseCase {
    constructor(
        @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
        @Inject(OTP_SERVICE) private readonly otpService: IOtpService,
        @Inject(EMAIL_SERVICE) private readonly emailService: IEmailService
    ) {}

    async execute(dto: ForgotPasswordDto): Promise<void> {
        const emailVo = new EmailVO(dto.email);
        const user = await this.userRepository.findByEmail(emailVo.getValue());

        // Fail silently to prevent email enumeration attacks
        if (!user) return; 

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        
        await this.otpService.storePasswordResetOtp(emailVo.getValue(), otp, 600); // 10 mins TTL
        await this.emailService.sendOtpEmail(emailVo.getValue(), otp);
    }
}