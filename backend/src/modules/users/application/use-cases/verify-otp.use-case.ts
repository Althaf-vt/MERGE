import { Injectable, Inject } from "@nestjs/common";
import { DomainException } from "../../domain/exceptions/domain.exception";
import { ErrorCode } from "../../domain/enums/error-code.enum";
import { USER_REPOSITORY } from "../../domain/interfaces/user-repository.interface";
import type { IUserRepository } from "../../domain/interfaces/user-repository.interface";
import { VerifyOtpDto } from "../dtos/verify-otp.dto";
import { UserAggregate } from "../../domain/entities/user.entity";
import { OTP_SERVICE } from "../../domain/interfaces/otp-service.interface";
import type { IOtpService } from "../../domain/interfaces/otp-service.interface";
import { EmailVO } from "../../domain/value-objects/email.vo";
import { AuthProvider, UserStatus } from "../../domain/enums/user.enums";
import { IVerifyOtpUseCase } from "../interfaces/verify-otp.use-case.interface";

// Handles the OTP verification process and marks the user's email as verified
@Injectable()
export class VerifyOtpUseCase implements IVerifyOtpUseCase {

    // Injects the user repo for user lookup/update and the OTP service for OTP verification
    constructor(
        @Inject(USER_REPOSITORY) private readonly _userRepository: IUserRepository,
        @Inject(OTP_SERVICE) private readonly _otpService: IOtpService,
    ) { };

    async execute(dto: VerifyOtpDto): Promise<UserAggregate> {

        // Verify OTP and retrieve temporary data from Redis
        const draftData = await this._otpService.verifyAndRetrieveDraft(dto.email, dto.otp);

        if (!draftData) {
            throw new DomainException(ErrorCode.OTP_INVALID, 'Invalid or expired OTP');
        }

        const existingUser = await this._userRepository.findByEmail(dto.email);

        if (existingUser) {
            throw new DomainException(ErrorCode.USER_ALREADY_EXISTS, "User already verified");
        }

        // Create the Domain Entity 
        const newUser = new UserAggregate({
            email: new EmailVO(dto.email),
            passwordHash: draftData.passwordHash,
            authProvider: AuthProvider.EMAIL,
            isEmailVerified: true,
            accountStatus: UserStatus.ACTIVE,
            kycCompleted: false,
            onboardingStep: 1,
            onboardingCompleted: false,
            profileCompleted: false,
            castingDirectorCompleted: false,
            lumenEnabled: true,
            dailyMatchHours: [],
            lumenRecommendationGeneratedToday: 0,
            lastLumenReset: new Date(),
        })

        // Save Permanently to DB
        const savedUser = await this._userRepository.create(newUser);

        await this._otpService.deleteDraft(dto.email);

        return savedUser;
    }
}