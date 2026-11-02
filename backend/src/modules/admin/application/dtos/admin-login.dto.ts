import { IsEmail, IsNotEmpty, IsString } from "class-validator";
import { AdminRole, AdminStatus } from "../../domain/enums/admin.enums";
import { AdminPermission } from "../../domain/enums/admin-permission.enums";

export class AdminLoginDto {
    @IsEmail({}, {message: 'Provide a valid email address.'})
    @IsNotEmpty()
    email!: string;

    @IsString()
    @IsNotEmpty({message: 'Password is required'})
    password!: string;
}

export interface AdminStatusHistoryItemDto {
    status: AdminStatus;
    reason: string;
    actionBy: string;
    timestamp: Date;
}
export interface AdminResponseDto {
    id: string;
    email: string;
    fullName: string;
    role: AdminRole;
    status: AdminStatus;
    suspendedUntil: Date | null;
    statusHistory: AdminStatusHistoryItemDto[];
    permissions: AdminPermission[];
    profilePhotoUrl: string | null;
    lastLoginAt: Date | null;
    createdAt: Date;
}