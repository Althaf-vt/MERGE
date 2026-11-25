import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { KycTaskStatus } from "../../domain/enums/kyc-task-status.enum";
import { ClaimStatus } from "../../domain/enums/claim-status.enum";
import { KycResubmissionReason } from "../../domain/enums/kyc-resubmission-reason.enum";

export type KycEscalationTaskDocument = KycEscalationTaskSchemaClass & Document;

@Schema({ _id: false })
export class KycClaimDetailsSchemaClass {
    @Prop({ type: String, enum: ClaimStatus, default: ClaimStatus.UNCLAIMED })
    status: string;

    @Prop({ type: String, default: null })
    claimedBy: string | null;

    @Prop({ type: Date, default: null })
    claimedAt: Date | null;
}

const KycClaimDetailsSchema = SchemaFactory.createForClass(KycClaimDetailsSchemaClass);

@Schema({ timestamps: true, collection: 'kyc_escalation_tasks' })
export class KycEscalationTaskSchemaClass {
    @Prop({ required: true, index: true })
    targetUserId: string;

    @Prop({ required: true })
    documentType: string;

    @Prop({ required: true })
    issuingCountry: string;

    @Prop({ required: true })
    kycSelfieUrl: string;

    @Prop({ required: true })
    uploadedDocumentUrl: string;

    @Prop({ required: true })
    livenessScore: number;

    @Prop({ required: true })
    faceMatchScore: number;

    @Prop({ type: String, default: null })
    legalName?: string | null;

    @Prop({ type: String, enum: KycTaskStatus, default: KycTaskStatus.PENDING, index: true })
    taskStatus: string;

    @Prop({ type: KycClaimDetailsSchema, default: () => ({ status: ClaimStatus.UNCLAIMED, claimedBy: null, claimedAt: null }) })
    claimDetails: KycClaimDetailsSchemaClass;

    @Prop({ type: String, default: null })
    rejectionReason?: string | null;

    @Prop({ type: [String], enum: KycResubmissionReason, default: [] })
    resubmissionReasons?: KycResubmissionReason[];

    @Prop({ type: String, default: null })
    resubmissionMessage?: string | null;

    @Prop({ type: Date, default: null })
    resolvedAt?: Date | null;

    createdAt: Date;
    updatedAt: Date;
}

export const KycEscalationTaskSchema = SchemaFactory.createForClass(KycEscalationTaskSchemaClass);
