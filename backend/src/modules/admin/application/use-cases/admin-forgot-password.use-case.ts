import { Inject, Injectable } from "@nestjs/common";
import { IAdminForgotPasswordUseCase } from "../interfaces/admin-forgot-password.use-case.interface";
import { ADMIN_REPOSITORY, IAdminRepository } from "../../domain/interfaces/admin-repository.interface";
import { ADMIN_OTP_SERVICE, IAdminOtpService } from "../../domain/interfaces/admin-otp.interface";
import { EMAIL_SERVICE, IEmailService } from "../../../users/domain/interfaces/email-service.interface";
import { EmailVO } from "../../../../shared/domain/value-objects/email.vo";
import { AdminForgotPasswordDto } from "../dtos/admin-forgot-password.dto";

@Injectable()
export class AdminForgotPasswordUseCase implements IAdminForgotPasswordUseCase{
    constructor(
        @Inject(ADMIN_REPOSITORY) private readonly _adminRepository: IAdminRepository,
        @Inject(ADMIN_OTP_SERVICE) private readonly _adminOtpService: IAdminOtpService,
        @Inject(EMAIL_SERVICE) private readonly _emailService: IEmailService,
    ){}

    async execute(dto: AdminForgotPasswordDto): Promise<void> {
        const emailVo = new EmailVO(dto.email);
        const admin = await this._adminRepository.findByEmail(emailVo.getValue());

        // We do not throw an error if the admin is not found to prevent email enumeration attacks.
        // We simply return silently.
        if(!admin) return;

        const otp = Math.floor(10000 + Math.random() * 900000).toString();

        await this._adminOtpService.storePasswordResetOtp(emailVo.getValue(), otp, 600);

        await this._emailService.sendAdminResetOtpEmail(emailVo.getValue(), otp);
    }
}