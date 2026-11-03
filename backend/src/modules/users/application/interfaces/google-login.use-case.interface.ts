import { UserAggregate } from "../../domain/entities/user.entity";
import { GoogleLoginDto } from "../dtos/google-login.dto";
import { UserResponseDto } from "../dtos/user-response.dto";

export const GOOGLE_LOGIN_USE_CASE = 'GOOGLE_LOGIN_USE_CASE';

export interface GoogleLoginResult {
    accessToken: string;
    refreshToken: string;
    user: UserResponseDto;
}

export interface IGoogleLoginUseCase {
    execute(dto: GoogleLoginDto, deviceInfo: string, ipAddress: string): Promise<GoogleLoginResult>;
}