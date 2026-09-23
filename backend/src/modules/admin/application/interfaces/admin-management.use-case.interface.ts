import { AcceptAdminInviteDto, InviteAdminDto, UpdateAdminDto } from "../dtos/admin-management.dto";

export const INVITE_ADMIN_USE_CASE = 'INVITE_ADMIN_USE_CASE';
export const ACCEPT_ADMIN_INVITE_USE_CASE = 'ACCEPT_ADMIN_INVITE_USE_CASE';
export const UPDATE_ADMIN_USE_CASE = 'UPDATE_ADMIN_USE_CASE';

export interface IInviteAdminUseCase {
    execute(dto: InviteAdminDto, inviterName: string, inviterId: string): Promise<void>;
}

export interface IAcceptAdminInviteUseCase {
    execute(dto: AcceptAdminInviteDto): Promise<void>;
}

export interface IUpdateAdminUseCase {
    execute(targetAdminId: string, dto: UpdateAdminDto): Promise<void>;
}