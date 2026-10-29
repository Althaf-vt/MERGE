import { ArrayNotEmpty, IsArray, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength, Min } from "class-validator";
import { Type } from "class-transformer";
import { ClaimStatus } from "../../domain/enums/claim-status.enum";
import { KycResubmissionReason } from "../../domain/enums/kyc-resubmission-reason.enum";
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

export class RequestKycResubmissionDto {
    @IsArray({ message: 'Reasons must be an array of resubmission issues.' })
    @ArrayNotEmpty({ message: 'At least one resubmission issue must be selected.' })
    @IsEnum(KycResubmissionReason, { each: true, message: 'Invalid resubmission reason provided.' })
    reasons!: KycResubmissionReason[];

    @IsOptional()
    @IsString({ message: 'Message must be a string.' })
    @MaxLength(500, { message: 'Message cannot exceed 500 characters.' })
    message?: string;
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
    resubmissionReasons?: KycResubmissionReason[];
    resubmissionMessage?: string | null;
    resolvedAt: Date | null;
    createdAt: Date;
}