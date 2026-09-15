import { AdminAggregate } from "../../domain/entities/admin.entity";
import { AdminLoginDto } from "../dtos/admin-login.dto";

export const ADMIN_LOGIN_USE_CASE = "ADMIN_LOGIN_USE_CASE";

export interface IAdminLoginUseCase {
    execute(dto: AdminLoginDto): Promise<{
        accessToken: string;
        refreshToken: string;
        admin: AdminAggregate;
    }>;
}