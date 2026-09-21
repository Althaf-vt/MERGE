import { IsEnum, IsNumber, IsOptional, IsString, Min, MinLength } from "class-validator";
import { Type } from 'class-transformer'

// Local enums for validation, mapped to Facade types in the UseCase
export enum AdminSuspensionUnitDto{
    HOURS = 'HOURS',
    DAYS = 'DAYS'
}

export enum AdminUserStatusFilterDto{
    ACTIVE = 'ACTIVE',
    SUSPENDED = 'SUSPENDED',
    BANNED = 'BANNED',
    DELETED = 'DELETED'
}

export class GetUsersQueryDto {
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    page?: number = 1;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    limit?: number = 20;

    @IsOptional()
    @IsString()
    search?: string;

    @IsOptional()
    @IsEnum(AdminUserStatusFilterDto)
    status?: AdminUserStatusFilterDto;

    @IsOptional()
    @IsString()
    kycStatus?: string;
}

export class SuspendUserDto {
    @IsNumber()
    @Min(1)
    duration: number;

    @IsEnum(AdminSuspensionUnitDto)
    unit: AdminSuspensionUnitDto;

    @IsString()
    @MinLength(5)
    reason: string;
}

export class UnSuspendUserDto {
    @IsString()
    @MinLength(5)
    reason: string;
}

export class BanUserDto {
    @IsString()
    @MinLength(5)
    reason: string;
}

export class UnbanUserDto {
    @IsString()
    @MinLength(5)
    reason: string;
}