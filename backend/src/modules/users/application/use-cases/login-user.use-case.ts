import { ForbiddenException, Inject, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { USER_REPOSITORY } from "../../domain/interfaces/user-repository.interface";
import type { IUserRepository } from "../../domain/interfaces/user-repository.interface";
import { PASSWORD_HASHER } from "../../../../shared/interfaces/password-hasher.interface";
import type { IPasswordHasher } from "../../../../shared/interfaces/password-hasher.interface";
import { LoginUserDto } from "../dtos/login-user.dto";
import { UserAggregate } from "../../domain/entities/user.entity";
import { TOKEN_SERVICE } from "../../domain/interfaces/token-service.interface";
import type { ITokenservice } from "../../domain/interfaces/token-service.interface";
import { ILoginUserUseCase } from "../interfaces/login-user.use-case.interface";

@Injectable()
export class LoginUserUseCase implements ILoginUserUseCase {
    constructor(
        @Inject(USER_REPOSITORY) private readonly _userRepository: IUserRepository,
        @Inject(PASSWORD_HASHER) private readonly _passwordHasher: IPasswordHasher,
        @Inject(TOKEN_SERVICE) private readonly _tokenService: ITokenservice,
    ) { }

    async execute(dto: LoginUserDto): Promise<{ accessToken: string; refreshToken: string; user: UserAggregate; }> {
        const user = await this._userRepository.findByEmail(dto.email);

        if (!user) {
            throw new NotFoundException("User with this email is not exists. Please register first");
        }

        const isPasswordValid = await this._passwordHasher.compare(dto.password, user.passwordHash!);

        if (!isPasswordValid) {
            throw new UnauthorizedException("Invalid Email or Password");
        }

        if (!user.isEmailVerified) {
            throw new ForbiddenException("Please verify your email before logging in");
        }

        user.recordLogin();
        await this._userRepository.update(user);

        const payload = {
            userId: user.id!,
            email: user.email.getValue(),
            role: 'USER',
        }

        return {
            accessToken: this._tokenService.generateAccessToken(payload),
            refreshToken: this._tokenService.generateRefreshToken(payload),
            user: user,
        };
    }
}