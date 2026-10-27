import { AdminSuspensionUnitDto } from "../dtos/user-management.dto";

export const MANAGE_USER_STATUS_USE_CASE = 'MANAGE_USER_STATUS_USE_CASE';

export interface IManageUserStatusUseCase {
    suspendUser(adminId: string, targetUserId: string, duration: number, unit: AdminSuspensionUnitDto, reason: string): Promise<void>;
    unsuspendUser(adminId: string, targetUserId: string, reason: string): Promise<void>;
    banUser(adminId: string, targetUserId: string, reason: string): Promise<void>;
    unbanUser(adminId: string, targetUserId: string, reason: string): Promise<void>;
}