import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { IResetPasswordUseCase } from "../interfaces/forgot-password.use-case.interface";
import { ResetPasswordDto } from "../dtos/forgot-password.dto";
import { IUserRepository, USER_REPOSITORY } from "../../domain/interfaces/user-repository.interface";
import { IOtpService, OTP_SERVICE } from "../../domain/interfaces/otp-service.interface";
import { EmailVO } from "../../domain/value-objects/email.vo";
import * as bcrypt from 'bcrypt';

@Injectable()
export class ResetPasswordUseCase implements IResetPasswordUseCase {
    constructor(
        @Inject(USER_REPOSITORY) private readonly _userRepository: IUserRepository,
        @Inject(OTP_SERVICE) private readonly _otpService: IOtpService
    ) {}

    async execute(dto: ResetPasswordDto): Promise<void> {
        const emailVo = new EmailVO(dto.email);
        const isValid = await this._otpService.verifyPasswordResetOtp(emailVo.getValue(), dto.otp);

        if (!isValid) {
            throw new BadRequestException('Invalid or expired reset code.');
        }

        const user = await this._userRepository.findByEmail(emailVo.getValue());
        if (!user) {
            throw new BadRequestException('User not found.');
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(dto.newPassword, salt);

        // Assuming UserAggregate has an updatePassword method
        user.updatePassword(hashedPassword);
        
        await this._userRepository.update(user);
        await this._otpService.deletePasswordResetOtp(emailVo.getValue());
    }
}