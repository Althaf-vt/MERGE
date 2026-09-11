import { UserAggregate } from "../../domain/entities/user.entity";
import { RefreshTokenDto } from "../dtos/refresh-token.dto";

export const REFRESH_TOKEN_USE_CASE = Symbol('REFRESH_TOKEN_USE_CASE');

export interface IRefreshTokenUseCase {
    execute(paylod: RefreshTokenDto): Promise<{
        accessToken: string;
        refreshToken: string;
        user: UserAggregate;
    }>;
}