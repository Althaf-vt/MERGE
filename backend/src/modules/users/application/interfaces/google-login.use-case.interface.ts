import { GoogleLoginDto } from "../dtos/google-login.dto";

export const GOOGLE_LOGIN_USE_CASE = 'GOOGLE_LOGIN_USE_CASE';

export interface IGoogleLoginResult {
    accessToken: string;
    refreshToken: string;
    user: any;
}

export interface IGoogleLoginUseCase {
    execute(dto: GoogleLoginDto, deviceInfo: string, ipAddress: string): Promise<IGoogleLoginResult>;
}