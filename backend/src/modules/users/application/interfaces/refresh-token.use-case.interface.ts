import { UserAggregate } from "../../domain/entities/user.entity";
import { RefreshTokenDto } from "../dtos/refresh-token.dto";
import { UserResponseDto } from "../dtos/user-response.dto";

export const REFRESH_TOKEN_USE_CASE = Symbol('REFRESH_TOKEN_USE_CASE');

export interface RefreshTokenResponse {
    accessToken: string,
    refreshToken: string,
    user: UserResponseDto,
}

export interface IRefreshTokenUseCase {
    execute(paylod: RefreshTokenDto): Promise<RefreshTokenResponse>;
}