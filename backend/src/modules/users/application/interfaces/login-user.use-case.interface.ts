import { UserAggregate } from "../../domain/entities/user.entity";
import { LoginUserDto } from "../dtos/login-user.dto";

export const LOGIN_USER_USE_CASE = Symbol('LOGIN_USER_USE_CASE');

export interface ILoginUserUseCase {
    execute(dto: LoginUserDto): Promise<{
        accessToken: string;
        refreshToken: string;
        user: UserAggregate;
    }>;
}