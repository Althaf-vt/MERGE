import { ResendOtpDto } from "../dtos/resend-otp.dto";

export const RESEND_OTP_USE_CASE = Symbol('RESEND_OTP_USE_CASE');

export interface ResendOtpResult{
    success: boolean;
    message: string;
}

export interface IResendOtpUseCase{
    execute(dto: ResendOtpDto): Promise<void>;
}