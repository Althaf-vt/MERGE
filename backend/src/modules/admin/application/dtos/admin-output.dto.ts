import { AdminRole, AdminStatus } from "../../domain/enums/admin.enums";

export interface AdminDetailsDto {
    id: string;
    email: string;
    fullName: string;
    role: AdminRole;
    status: AdminStatus;
    permissions: string[];
    profilePhotoUrl: string | null;
    inviteExpiresAt: Date | null;
    lastLoginAt: Date | null;
    createdAt: Date;
}

export interface PaginatedAdminsResponseDto {
    data: AdminDetailsDto[];
    total: number;
    page: number;
    limit: number;
}