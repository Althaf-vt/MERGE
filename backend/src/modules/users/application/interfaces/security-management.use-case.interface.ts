import { ConfirmEmailChangeDto, InitiateEmailChangeDto, RevokeSessionDto, UpdateSecurityEmailDto, UpdateSecurityPasswordDto } from "../dtos/security-management.dto";
import { UserSessionData } from "../../../../shared/domain/interfaces/user-session.interface";

export const REQUEST_SECURITY_OTP_USE_CASE = 'REQUEST_SECURITY_OTP_USE_CASE';
export const UPDATE_SECURITY_PASSWORD_USE_CASE = 'UPDATE_SECURITY_PASSWORD_USE_CASE';
export const DEACTIVATE_ACCOUNT_USE_CASE = 'DEACTIVATE_ACCOUNT_USE_CASE';
export const DELETE_ACCOUNT_USE_CASE = 'DELETE_ACCOUNT_USE_CASE';
export const GET_ACTIVE_SESSIONS_USE_CASE = 'GET_ACTIVE_SESSIONS_USE_CASE';
export const REVOKE_SESSION_USE_CASE = 'REVOKE_SESSION_USE_CASE';
export const REVOKE_OTHER_SESSIONS_USE_CASE = 'REVOKE_OTHER_SESSIONS_USE_CASE';
export const INITIATE_EMAIL_CHANGE_USE_CASE = 'INITIATE_EMAIL_CHANGE_USE_CASE';
export const CONFIRM_EMAIL_CHANGE_USE_CASE = 'CONFIRM_EMAIL_CHANGE_USE_CASE';


export interface IRequestSecurityOtpUseCase {
    execute(userId: string): Promise<void>;
}

export interface IUpdateSecurityPasswordUseCase {
    execute(userId: string, dto: UpdateSecurityPasswordDto): Promise<void>;
}

export interface IDeactivateAccountUseCase {
    execute(userId: string): Promise<void>;
}

export interface IDeleteAccountUseCase {
    execute(userId: string): Promise<void>;
}

export interface IGetActiveSessionsUseCase {
    execute(userId: string): Promise<UserSessionData[]>;
}

export interface IRevokeSessionUseCase {
    execute(userId: string, dto: RevokeSessionDto): Promise<void>;
}

export interface IRevokeOtherSessionsUseCase {
    execute(userId: string, currentSessionId: string): Promise<void>;
}

export interface IInitiateEmailChangeUseCase {
    execute(userId: string, dto: InitiateEmailChangeDto): Promise<void>;
}

export interface IConfirmEmailChangeUseCase {
    execute(userId: string, dto: ConfirmEmailChangeDto): Promise<void>;
}