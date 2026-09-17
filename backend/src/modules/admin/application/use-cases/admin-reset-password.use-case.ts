import { Inject, Injectable } from "@nestjs/common";
import { ADMIN_REPOSITORY, IAdminRepository } from "../../domain/interfaces/admin-repository.interface";
import { ADMIN_OTP_SERVICE, IAdminOtpService } from "../../domain/interfaces/admin-otp.interface";
import { EmailVO } from "../../../../shared/domain/value-objects/email.vo";
import { DomainException } from "../../../../shared/domain/exceptions/domain.exception";
import { ErrorCode } from "../../../../shared/domain/enums/error-code.enum";
import { IPasswordHasher, PASSWORD_HASHER } from "../../../../shared/domain/interfaces/password-hasher.interface";
import { AdminResetPasswordDto } from "../dtos/admin-forgot-password.dto";
import { IAdminResetPasswordUseCase } from "../interfaces/admin-forgot-password.use-case.interface";

@Injectable()
export class AdminResetPasswordUseCase implements IAdminResetPasswordUseCase {
    constructor(
        @Inject(ADMIN_REPOSITORY) private readonly _adminRepository: IAdminRepository,
        @Inject(ADMIN_OTP_SERVICE) private readonly _otpService: IAdminOtpService,
        @Inject(PASSWORD_HASHER) private readonly _passwordHaser: IPasswordHasher,
    ) {}

    async execute(dto: AdminResetPasswordDto): Promise<void> {
        const emailVo = new EmailVO(dto.email);
        
        const isValid = await this._otpService.verifyPasswordResetOtp(emailVo.getValue(), dto.otp);
        if (!isValid) {
            throw new DomainException(ErrorCode.OTP_INVALID, 'Invalid or expired reset code.');
        }

        const admin = await this._adminRepository.findByEmail(emailVo.getValue());
        if (!admin) {
            throw new DomainException(ErrorCode.USER_NOT_FOUND, 'Admin account not found.');
        }

        const hashedPassword = await this._passwordHaser.hash(dto.newPassword);

        admin.updatePassword(hashedPassword); 
        
        await this._adminRepository.update(admin);
        await this._otpService.deletePasswordResetOtp(emailVo.getValue());
    }
}