import { AdminAggregate } from "../../domain/entities/admin.entity";

export const ADMIN_REFRESH_TOKEN_USE_CASE = 'ADMIN_REFRESH_TOKEN_USE_CASE';

export interface IAdminRefreshTokenUseCase {
    execute(token: string): Promise<{
        accessToken: string;
        refreshToken: string;
        admin: AdminAggregate;
    }>;
}