import { Injectable, Inject, BadRequestException, NotFoundException } from "@nestjs/common";
import { USER_REPOSITORY } from "../../domain/interfaces/user-repository.interface";
import type { IUserRepository } from "../../domain/interfaces/user-repository.interface";
import { VerifyOtpDto } from "../dtos/verify-otp.dto";
import { UserAggregate } from "../../domain/entities/user.entity";
import { OTP_SERVICE } from "../../domain/interfaces/otp-service.interface";
import type { IOtpService } from "../../domain/interfaces/otp-service.interface";

// Handles the OTP verification process and marks the user's email as verified
@Injectable()
export class VerifyOtpUseCase{

    // Injects the user repo for user lookup/update and the OTP service for OTP verification
    constructor(
        @Inject(USER_REPOSITORY)
        private readonly userRepository: IUserRepository,
        @Inject(OTP_SERVICE) private readonly otpService: IOtpService,
    ){}

    async execute(dto: VerifyOtpDto): Promise<UserAggregate>{
        const user = await this.userRepository.findByEmail(dto.email);

        if(!user){
            throw new NotFoundException('User not found');
        }

        if(user.isEmailVerified){
            throw new BadRequestException('Email is already verified');
        }

        // Verify the OTP stored for the user's email
        const isValid = await this.otpService.verifyOtp(dto.email, dto.otp);
        if(!isValid){
            throw new BadRequestException('Invalid or expired OTP');
        }

        // Mark the email as verified and save the updated user
        user.markEmailVerified();
        return await this.userRepository.update(user);
    }
}