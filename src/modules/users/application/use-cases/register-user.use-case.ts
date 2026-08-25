import { Injectable, Inject, ConflictException } from "@nestjs/common";
import { USER_REPOSITORY } from "../../domain/interfaces/user-repository.interface";
import type { IUserRepository } from "../../domain/interfaces/user-repository.interface";
import { UserAggregate, UserRole, KycStatus } from "../../domain/entities/user.entity";
import { EmailVO } from "../../domain/value-objects/email.vo";
import { RegisterUserDto } from "../dtos/register-user.dto";
import { BcryptService } from "../../../../shared/infrastructure/security/bcrypt.service";
import { AuthProvider, UserStatus } from "../../domain/enums/user.enums";
import { OTP_SERVICE } from "../../domain/interfaces/otp-service.interface";
import type { IOtpService } from "../../domain/interfaces/otp-service.interface";
import { EMAIL_SERVICE } from "../../domain/interfaces/email-service.interface";
import type { IEmailService } from "../../domain/interfaces/email-service.interface";
import { PASSWORD_HASHER } from "../../../../shared/interfaces/password-hasher.interface";
import type { IPasswordHasher } from "../../../../shared/interfaces/password-hasher.interface";

// Handles the user registration process, including validation,
// password hashing, OTP generation, and user creation.
@Injectable()
export class RegisterUserUseCase{

    // Injects the user repository for data and Bcrypt service for password hashing.
    constructor(
        @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
        @Inject(OTP_SERVICE) private readonly otpService: IOtpService,
        @Inject(EMAIL_SERVICE) private readonly emailService: IEmailService,
        @Inject(PASSWORD_HASHER) private readonly passwordHasher: IPasswordHasher,
    ){}

    // Registers a new user and returns the creted UserEntity.
    async execute(dto: RegisterUserDto): Promise<UserAggregate>{
        const existingUser = await this.userRepository.findByEmail(dto.email);
        if(existingUser){
            throw new ConflictException("User with this email already exists");
        }

        const passwordHash = await this.passwordHasher.hash(dto.password);
        
        // Validate and normalize the email using the Email value object.
        const emailVO = new EmailVO(dto.email);

        // Create the UserEntity with the initial registration state.
        const newUser = new UserAggregate({
            email: emailVO,
            passwordHash,
            authProvider: AuthProvider.EMAIL,
            isEmailVerified: false,
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
        });

        // Save the new user through the repository.
        const savedUser = await this.userRepository.create(newUser)

        // Save the new user through the repository.
        // return await this.userRepository.create(newUser);

        // 1. Generate OTP and Store in Redis
        // Generate 6-digit code and store in Redis with 10-min TTL (600 seconds)
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        await this.otpService.storeOtp(dto.email, otp, 600);

        // 2. Dispatch the Email via Infrastructure Adapter
        await this.emailService.sendOtpEmail(dto.email, otp);

        return savedUser;

    }
}