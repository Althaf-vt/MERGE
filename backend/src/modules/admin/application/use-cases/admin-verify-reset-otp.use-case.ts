import { Inject, Injectable } from "@nestjs/common";
import { IAdminVerifyResetOtpUseCase } from "../interfaces/admin-forgot-password.use-case.interface";
import { ADMIN_OTP_SERVICE, IAdminOtpService } from "../../domain/interfaces/admin-otp.interface";
import { AdminVerifyResetOtpDto } from "../dtos/admin-forgot-password.dto";
import { EmailVO } from "../../../../shared/domain/value-objects/email.vo";
import { DomainException } from "../../../../shared/domain/exceptions/domain.exception";
import { ErrorCode } from "../../../../shared/domain/enums/error-code.enum";
import { ADMIN_ERROR_MESSAGES } from "../../domain/constants/admin-error-messages.constant";

@Injectable()
export class AdminVerifyResetOtpUseCase implements IAdminVerifyResetOtpUseCase {
    constructor(
        @Inject(ADMIN_OTP_SERVICE) private readonly _adminOtpService: IAdminOtpService,
    ) { }

    async execute(dto: AdminVerifyResetOtpDto): Promise<void> {
        const emailVo = new EmailVO(dto.email);
        const isValid = await this._adminOtpService.verifyPasswordResetOtp(emailVo.getValue(), dto.otp)

        if (!isValid) {
            throw new DomainException(ErrorCode.OTP_INVALID, ADMIN_ERROR_MESSAGES.INVALID_VERIFY_CODE);
        }
    }
}