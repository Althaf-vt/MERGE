import { Injectable, Inject, ConflictException } from "@nestjs/common";
import { USER_REPOSITORY } from "../../domain/interfaces/user-repository.interface";
import type { IUserRepository } from "../../domain/interfaces/user-repository.interface";
import { RegisterUserDto } from "../dtos/register-user.dto";
import { OTP_SERVICE } from "../../domain/interfaces/otp-service.interface";
import type { IOtpService } from "../../domain/interfaces/otp-service.interface";
import { EMAIL_SERVICE } from "../../domain/interfaces/email-service.interface";
import type { IEmailService } from "../../domain/interfaces/email-service.interface";
import { PASSWORD_HASHER } from "../../../../shared/interfaces/password-hasher.interface";
import type { IPasswordHasher } from "../../../../shared/interfaces/password-hasher.interface";
import { IRegisterUserUseCase } from "../interfaces/register-user.use-case.interface";

// Handles the user registration process, including validation,
// password hashing, OTP generation, and user creation.
@Injectable()
export class RegisterUserUseCase implements IRegisterUserUseCase {

  // Injects the user repository for data and Bcrypt service for password hashing.
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
    @Inject(OTP_SERVICE) private readonly otpService: IOtpService,
    @Inject(EMAIL_SERVICE) private readonly emailService: IEmailService,
    @Inject(PASSWORD_HASHER) private readonly passwordHasher: IPasswordHasher,
  ) { };

  // Registers a new user and returns the creted UserEntity.
  async execute(dto: RegisterUserDto): Promise<void> {
    const existingUser = await this.userRepository.findByEmail(dto.email);
    if (existingUser) {
      throw new ConflictException("User with this email already exists");
    }

    const passwordHash = await this.passwordHasher.hash(dto.password);

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await this.otpService.storeRegistrationDraft(dto.email, otp, passwordHash, 600);

    await this.emailService.sendOtpEmail(dto.email, otp);
  }
}