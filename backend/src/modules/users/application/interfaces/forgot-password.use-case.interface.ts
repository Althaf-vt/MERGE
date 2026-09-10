import { ForgotPasswordDto } from "../dtos/forgot-password.dto";
import { ResetPasswordDto } from "../dtos/forgot-password.dto";

export const FORGOT_PASSWORD_USE_CASE = 'FORGOT_PASSWORD_USE_CASE';

export interface IForgotPasswordUseCase {
    execute(dto: ForgotPasswordDto): Promise<void>;
}

export const RESET_PASSWORD_USE_CASE = 'RESET_PASSWORD_USE_CASE';

export interface IResetPasswordUseCase {
    execute(dto: ResetPasswordDto): Promise<void>;
}