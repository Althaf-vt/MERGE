import { AdminResponseDto } from "../dtos/admin-login.dto";

export const ADMIN_REFRESH_TOKEN_USE_CASE = 'ADMIN_REFRESH_TOKEN_USE_CASE';


export interface AdminRefreshTokenResponse{
    accessToken: string;
    refreshToken: string;
    admin: AdminResponseDto;
}

export interface IAdminRefreshTokenUseCase {
    execute(token: string): Promise<AdminRefreshTokenResponse>;
}