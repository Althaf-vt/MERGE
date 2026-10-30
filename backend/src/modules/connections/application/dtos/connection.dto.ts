import { IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";
import { Type } from "class-transformer";
import { IsNumber, Min } from "class-validator";
import { ConnectionStatus } from "../../domain/enums/connection.enums";

export class PaginationQueryDto {
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
}

export class TargetUserDto {
    @IsString()
    @IsNotEmpty()
    targetUserId!: string;
}

export class SendPriorityIntroDto extends TargetUserDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(500)
    icebreakerMessage!: string;
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