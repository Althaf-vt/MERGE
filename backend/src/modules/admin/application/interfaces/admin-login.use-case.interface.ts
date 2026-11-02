import { AdminLoginDto, AdminResponseDto } from "../dtos/admin-login.dto";

export const ADMIN_LOGIN_USE_CASE = "ADMIN_LOGIN_USE_CASE";

export interface AdminLoginResponse{
    accessToken: string;
    refreshToken: string;
    admin: AdminResponseDto;
}

export interface IAdminLoginUseCase {
    execute(dto: AdminLoginDto): Promise<AdminLoginResponse>;
}