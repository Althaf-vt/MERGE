import { ForbiddenException, Inject, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { USER_REPOSITORY } from "../../domain/interfaces/user-repository.interface";
import type { IUserRepository } from "../../domain/interfaces/user-repository.interface";
import { PASSWORD_HASHER } from "../../../../shared/interfaces/password-hasher.interface";
import type { IPasswordHasher } from "../../../../shared/interfaces/password-hasher.interface";
import { LoginUserDto } from "../dtos/login-user.dto";
import { UserAggregate } from "../../domain/entities/user.entity";
import { access } from "fs";
import { TOKEN_SERVICE } from "../../domain/interfaces/token-service.interface";
import type { ITokenservice } from "../../domain/interfaces/token-service.interface";

@Injectable()
export class LoginUserUseCase{
    constructor(
        @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
        @Inject(PASSWORD_HASHER) private readonly passwordHasher: IPasswordHasher,
        @Inject(TOKEN_SERVICE) private readonly tokenService: ITokenservice
    ){}

    async execute(dto: LoginUserDto){
        const user = await this.userRepository.findByEmail(dto.email);

        if(!user){
            throw new NotFoundException("User with this email is not exists. Please register first");
        }

        const isPasswordValid = await this.passwordHasher.compare(dto.password, user.passwordHash!);

        if(!isPasswordValid){
            throw new UnauthorizedException("Invalid Email or Password");
        }

        if(!user.isEmailVerified){
            throw new ForbiddenException("Please verify your email before logging in");
        }

        user.recordLogin();
        await this.userRepository.update(user);

        const payload = {
            userId: user.id!,
            email: user.email.getValue(),
            role: 'USER',
        }

        return {
            accessToken: this.tokenService.generateAccessToken(payload),
            refreshToken: this.tokenService.generateRefreshToken(payload),
            user: user
        }
        
    }
}