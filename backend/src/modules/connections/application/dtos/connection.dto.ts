import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Max, MaxLength, Min } from "class-validator";
import { Transform, Type } from "class-transformer";
import { ConnectionStatus, PrivateListType } from "../../domain/enums/connection.enums";
import { CONNECTION_CONSTANTS } from "../../domain/constants/connection.constants";

export class PaginationQueryDto {
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
}

export class TargetUserDto {
    @IsString()
    @IsNotEmpty()
    @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
    targetUserId!: string;
}

export class SendPriorityIntroDto extends TargetUserDto {
    @IsString()
    @IsNotEmpty()
    @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
    @MaxLength(CONNECTION_CONSTANTS.ICEBREAKER.MAX_LENGTH)
    icebreakerMessage!: string;
}

export class AddToPrivateListDto extends TargetUserDto {
    @IsEnum(PrivateListType)
    @IsNotEmpty()
    listType!: PrivateListType;
}

export interface ConnectionResponseDto {
    id: string;
    partnerId: string;
    partnerName: string;
    partnerPhotoUrl: string | null;
    status: ConnectionStatus;
    isPriority: boolean;
    icebreakerMessage?: string;
    createdAt: Date;
    isRequester: boolean;
}