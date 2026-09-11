import { Inject, UnauthorizedException } from "@nestjs/common";
import { type IUserRepository, USER_REPOSITORY } from "../../domain/interfaces/user-repository.interface";
import { type ITokenservice, TOKEN_SERVICE } from "../../domain/interfaces/token-service.interface";
import { RefreshTokenDto } from "../dtos/refresh-token.dto";
import { UserStatus } from "../../domain/enums/user.enums";
import { IRefreshTokenUseCase } from "../interfaces/refresh-token.use-case.interface";
import { UserAggregate } from "../../domain/entities/user.entity";


export class RefreshTokenUseCase implements IRefreshTokenUseCase {
    constructor(
        @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
        @Inject(TOKEN_SERVICE) private readonly tokenService: ITokenservice,
    ) { };

    async execute(paylod: RefreshTokenDto): Promise<{ accessToken: string; refreshToken: string; user: UserAggregate; }> {
        // 1. Validate signature and expiration using the infrastructure service
        // If the token is invalid or expired, this throws an UnauthorizedException
        const payload = this.tokenService.verifyRefreshToken(paylod.refreshToken);

        // 2. Verify the user still existis in the db
        const user = await this.userRepository.findById(payload.userId);

        // 3. Security check: Ensure the account wasn't suspended after the token was issued
        if (!user || user.accountStatus !== UserStatus.ACTIVE) {
            throw new UnauthorizedException('User account is inactive or deleted');
        }

        // 4. Issue a refresh token pair
        const newPayload = {
            userId: user.id!,
            email: user.email.getValue(),
            role: "USER",
        }

        return {
            accessToken: this.tokenService.generateAccessToken(newPayload),
            refreshToken: this.tokenService.generateRefreshToken(newPayload),
            user: user,
        };
    }
}