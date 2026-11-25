import { UserResponseDto } from "../dtos/user-response.dto";

export const RESET_KYC_FOR_RESUBMISSION_USE_CASE = Symbol("RESET_KYC_FOR_RESUBMISSION_USE_CASE");

export interface IResetKycForResubmissionUseCase {
    execute(userId: string): Promise<UserResponseDto>;
}
