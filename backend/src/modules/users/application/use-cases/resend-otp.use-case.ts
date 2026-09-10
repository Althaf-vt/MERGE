import { BadRequestException, ConflictException, Inject, Injectable } from "@nestjs/common";
import { IResendOtpUseCase, ResendOtpResult } from "../interfaces/resend-otp.use-case.interface";
import { IUserRepository, USER_REPOSITORY } from "../../domain/interfaces/user-repository.interface";
import { IOtpService, OTP_SERVICE } from "../../domain/interfaces/otp-service.interface";
import { EMAIL_SERVICE, IEmailService } from "../../domain/interfaces/email-service.interface";
import { ResendOtpDto } from "../dtos/resend-otp.dto";
import { EmailVO } from "../../domain/value-objects/email.vo";

@Injectable()
export class ResendOtpUseCase implements IResendOtpUseCase{
    constructor(
        @Inject(USER_REPOSITORY)
        private readonly userRepository: IUserRepository,
        @Inject(OTP_SERVICE)
        private readonly otpService: IOtpService,
        @Inject(EMAIL_SERVICE)
        private readonly emailService: IEmailService
    ){}

    async execute(dto: ResendOtpDto): Promise<void> {
        try {

            const existingUser = await this.userRepository.findByEmail(dto.email);
            if(existingUser){
                throw new ConflictException("User with this email already exists");
            }

            const emailVo = new EmailVO(dto.email);
            const standardizedEmail = emailVo.getValue();

            const newOtp = Math.floor(100000 + Math.random() * 900000).toString();

            await this.otpService.refreshRegistrationDraft(standardizedEmail, newOtp, 600);

            await this.emailService.sendOtpEmail(standardizedEmail, newOtp)


        } catch (error: any) {
            if (error.message.includes('expired')) {
                throw new BadRequestException('Session expired. Please restart registration.');
            }
            throw new BadRequestException(error.message || 'Failed to resend OTP.');
        }
    }
}