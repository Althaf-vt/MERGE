import { UserAggregate } from "../../domain/entities/user.entity";
import { LoginUserDto } from "../dtos/login-user.dto";
import { UserResponseDto } from "../dtos/user-response.dto";

export const LOGIN_USER_USE_CASE = Symbol('LOGIN_USER_USE_CASE');

export interface LoginUserResponse {
    accessToken: string;
    refreshToken: string;
    user: UserResponseDto
}

export interface ILoginUserUseCase {
    execute(dto: LoginUserDto, deviceInfo: string, ipAddress: string): Promise<LoginUserResponse>;
}