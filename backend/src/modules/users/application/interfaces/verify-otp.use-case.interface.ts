import { UserAggregate } from "../../domain/entities/user.entity";
import { VerifyOtpDto } from "../dtos/verify-otp.dto";

export const VERIFY_OTP_USE_CASE = Symbol('VERIFY_OTP_USE_CASE');

export interface IVerifyOtpUseCase {
    execute(dto: VerifyOtpDto): Promise<UserAggregate>;
}