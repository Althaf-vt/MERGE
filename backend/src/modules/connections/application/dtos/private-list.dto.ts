import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from "class-validator";
import { Transform, Type } from "class-transformer";
import { PrivateListType } from "../../domain/enums/private-list.enums";
import { CONNECTION_CONSTANTS } from "../../domain/constants/connection.constants";

export class GetPrivateListQueryDto {
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(CONNECTION_CONSTANTS.PAGINATION.DEFAULT_PAGE)
    page?: number = CONNECTION_CONSTANTS.PAGINATION.DEFAULT_PAGE;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    @Max(CONNECTION_CONSTANTS.PAGINATION.MAX_LIMIT)
    limit?: number = CONNECTION_CONSTANTS.PAGINATION.DEFAULT_LIMIT;

    @IsEnum(PrivateListType, { message: 'Invalid list type.' })
    @IsNotEmpty()
    listType!: PrivateListType;
}

export class AddToPrivateListDto {
    @IsString()
    @IsNotEmpty()
    @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
    targetUserId!: string;

    @IsEnum(PrivateListType)
    @IsNotEmpty()
    listType!: PrivateListType;
}

export interface PrivateListResponseDto {
    id: string;
    targetUserId: string;
    targetName: string;
    targetPhotoUrl: string | null;
    listType: PrivateListType;
    createdAt: Date;
}

export interface PaginatedPrivateListResponseDto {
    data: PrivateListResponseDto[];
    total: number;
    page: number;
    limit: number;
}