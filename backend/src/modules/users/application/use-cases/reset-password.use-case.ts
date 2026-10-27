import { Inject, Injectable } from "@nestjs/common";
import { DomainException } from "../../../../shared/domain/exceptions/domain.exception";
import { ErrorCode } from "../../../../shared/domain/enums/error-code.enum";
import { IResetPasswordUseCase } from "../interfaces/forgot-password.use-case.interface";
import { ResetPasswordDto } from "../dtos/forgot-password.dto";
import { IUserRepository, USER_REPOSITORY } from "../../domain/interfaces/user-repository.interface";
import { IOtpService, OTP_SERVICE } from "../../domain/interfaces/otp-service.interface";
import { EmailVO } from "../../../../shared/domain/value-objects/email.vo";
import { IPasswordHasher, PASSWORD_HASHER } from "../../../../shared/domain/interfaces/password-hasher.interface";

@Injectable()
export class ResetPasswordUseCase implements IResetPasswordUseCase {
    constructor(
        @Inject(USER_REPOSITORY) private readonly _userRepository: IUserRepository,
        @Inject(OTP_SERVICE) private readonly _otpService: IOtpService,
        @Inject(PASSWORD_HASHER) private readonly _passwordHasher: IPasswordHasher
    ) {}

    async execute(dto: ResetPasswordDto): Promise<void> {
        const emailVo = new EmailVO(dto.email);
        const isValid = await this._otpService.verifyPasswordResetOtp(emailVo.getValue(), dto.otp);

        if (!isValid) {
            throw new DomainException(ErrorCode.OTP_INVALID, 'Invalid or expired reset code.');
        }

        const user = await this._userRepository.findByEmail(emailVo.getValue());
        if (!user) {
            throw new DomainException(ErrorCode.USER_NOT_FOUND, 'User not found.');
        }

        const hashedPassword = await this._passwordHasher.hash(dto.newPassword);

        // Assuming UserAggregate has an updatePassword method
        user.updatePassword(hashedPassword);
        
        await this._userRepository.update(user);
        await this._otpService.deletePasswordResetOtp(emailVo.getValue());
    }
}