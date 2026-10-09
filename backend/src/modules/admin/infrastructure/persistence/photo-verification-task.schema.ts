import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { PhotoTaskStatus } from "../../domain/enums/photo-task-status.enum";
import { ClaimStatus } from "../../domain/enums/claim-status.enum";

export type PhotoVerificationTaskDocument = PhotoVerificationTaskSchemaClass & Document;

// Sub-schema for the Value Object
@Schema({ _id: false })
export class ClaimDetailsSchemaClass {
    @Prop({ type: String, enum: ClaimStatus, default: ClaimStatus.UNCLAIMED })
    status: string;

    @Prop({ type: String, default: null })
    claimedBy: string | null;

    @Prop({ type: Date, default: null })
    claimedAt: Date | null;
}

const ClaimDetailsSchema = SchemaFactory.createForClass(ClaimDetailsSchemaClass);

@Schema({ timestamps: true, collection: 'photo_verification_tasks' })
export class PhotoVerificationTaskSchemaClass {
    @Prop({ required: true, index: true })
    targetUserId: string;

    @Prop({ required: true, unique: true })
    photoId: string;

    @Prop({ required: true })
    kycSelfieUrl: string;

    @Prop({ required: true })
    uploadedPhotoUrl: string;

    @Prop({ required: true })
    faceMatchScore: number;

    @Prop({ type: String, enum: PhotoTaskStatus, default: PhotoTaskStatus.PENDING, index: true })
    taskStatus: string;

    @Prop({ type: ClaimDetailsSchema, default: () => ({ status: ClaimStatus.UNCLAIMED, claimedBy: null, claimedAt: null }) })
    claimDetails: ClaimDetailsSchemaClass;

    @Prop({ default: null })
    rejectionReason?: string;

    @Prop({ type: Date, default: null })
    resolvedAt?: Date | null;

    createdAt: Date;
    updatedAt: Date;
}

export const PhotoVerificationTaskSchema = SchemaFactory.createForClass(PhotoVerificationTaskSchemaClass);