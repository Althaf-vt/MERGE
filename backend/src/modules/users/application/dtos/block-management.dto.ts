import { IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { BlockReason } from "../../domain/enums/user.enums";

export class BlockUserDto {
    @IsString()
    @IsNotEmpty({ message: 'Target user ID is required.' })
    blockedId!: string;

    @IsOptional()
    @IsEnum(BlockReason, { message: 'Invalid block reason provided.' })
    reason?: BlockReason;
}

export interface BlockedUserResponseDto {
    blockedId: string;
    displayName: string;
    genderIdentity?: string;
    customLabel?: string;
    location?: string;
    avatarUrl: string | null;
    reason: BlockReason;
    blockedAt: Date;
    isDeleted: boolean;
}