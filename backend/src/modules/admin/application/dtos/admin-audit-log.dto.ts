import { Type } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, IsString, Max, Min, IsDateString } from 'class-validator';
import { AdminAuditAction, AdminAuditResourceType } from '../../domain/enums/admin-audit.enums';

export class RecordAdminAuditLogDto {
    adminId: string;
    adminEmail?: string;
    adminName?: string;
    action: AdminAuditAction;
    resourceType: AdminAuditResourceType;
    resourceId: string;
    details?: Record<string, unknown>;
    ipAddress?: string;
    userAgent?: string;
}

export class AdminAuditLogResponseDto {
    id: string;
    adminId: string;
    adminEmail: string | null;
    adminName: string | null;
    action: AdminAuditAction;
    resourceType: AdminAuditResourceType;
    resourceId: string;
    details: Record<string, unknown> | null;
    ipAddress: string | null;
    userAgent: string | null;
    createdAt: Date;
}

export class GetAdminAuditLogsQueryDto {
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    page?: number;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    @Max(100)
    limit?: number;

    @IsOptional()
    @IsEnum(AdminAuditResourceType)
    resourceType?: AdminAuditResourceType;

    @IsOptional()
    @IsString()
    resourceId?: string;

    @IsOptional()
    @IsEnum(AdminAuditAction)
    action?: AdminAuditAction;

    @IsOptional()
    @IsString()
    adminId?: string;

    @IsOptional()
    @IsDateString()
    startDate?: string;

    @IsOptional()
    @IsDateString()
    endDate?: string;
}

export class GetScenarioActivityHistoryQueryDto {
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    page?: number;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    @Max(100)
    limit?: number;
}

export class PaginatedAdminAuditLogsResponseDto {
    data: AdminAuditLogResponseDto[];
    total: number;
    page: number;
    limit: number;
}
