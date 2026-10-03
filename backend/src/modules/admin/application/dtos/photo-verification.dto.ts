import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from "class-validator";
import { Type } from "class-transformer";
import { PhotoTaskStatus } from "../../domain/enums/photo-task-status.enum";
import { ClaimStatus } from "../../domain/enums/claim-status.enum";

export class GetPhotoTasksQueryDto {
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
    @IsEnum(PhotoTaskStatus)
    status?: PhotoTaskStatus;

    @IsOptional()
    @IsEnum(ClaimStatus)
    claimStatus?: ClaimStatus;

    @IsOptional()
    @IsString()
    claimedBy?: string;
}

export class RejectPhotoTaskDto {
    @IsString()
    @IsNotEmpty({ message: 'A reason must be provided when rejecting a photo.' })
    reason!: string;
}

// Output DTO for the presentation layer
export interface PhotoVerificationTaskResponseDto {
    id: string;
    targetUserId: string;
    photoId: string;
    kycSelfieUrl: string;
    uploadedPhotoUrl: string;
    faceMatchScore: number;
    taskStatus: PhotoTaskStatus;
    claimStatus: ClaimStatus;
    claimedBy: string | null;
    claimedAt: Date | null;
    rejectionReason?: string;
    resolvedAt: Date | null;
    createdAt: Date;
}

export interface PaginatedPhotoTasksResponseDto {
    data: PhotoVerificationTaskResponseDto[];
    total: number;
    page: number;
    limit: number;
}