import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from "class-validator";
import { Type } from "class-transformer";
import { ClaimStatus } from "../../domain/enums/claim-status.enum";
import { KycTaskStatus } from "../../domain/enums/kyc-task-status.enum";

export class GetKycTasksQueryDto {
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
    @IsEnum(KycTaskStatus)
    status?: KycTaskStatus;

    @IsOptional()
    @IsEnum(ClaimStatus)
    claimStatus?: ClaimStatus;

    @IsOptional()
    @IsString()
    claimedBy?: string;
}

export class RejectKycTaskDto {
    @IsString()
    @IsNotEmpty({ message: 'A rejection reason is required for KYC escalations.' })
    reason!: string;
}

export interface KycEscalationTaskResponseDto {
    id: string;
    targetUserId: string;
    documentType: string;
    issuingCountry: string;
    kycSelfieUrl: string;
    uploadedDocumentUrl: string;
    livenessScore: number;
    faceMatchScore: number;
    taskStatus: KycTaskStatus;
    claimStatus: ClaimStatus;
    claimedBy: string | null;
    rejectionReason?: string;
    resolvedAt: Date | null;
    createdAt: Date;
}