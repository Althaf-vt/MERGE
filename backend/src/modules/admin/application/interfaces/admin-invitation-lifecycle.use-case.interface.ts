export const CANCEL_ADMIN_INVITE_USE_CASE = 'CANCEL_ADMIN_INVITE_USE_CASE';
export const REINVITE_ADMIN_USE_CASE = 'REINVITE_ADMIN_USE_CASE';

export interface ICancelAdminInviteUseCase{
    execute(targetAdminId: string): Promise<void>;
}

export interface IReinviteAdminUseCase {
    execute(targetAdminId: string, inviterName: string): Promise<void>;
}