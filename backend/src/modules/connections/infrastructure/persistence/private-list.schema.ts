import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { PrivateListType } from "../../domain/enums/private-list.enums";


export type PrivateListDocument = PrivateListSchemaClass & Document;

@Schema({ timestamps: { createdAt: true, updatedAt: false }, collection: 'private_lists' })
export class PrivateListSchemaClass {
    @Prop({ required: true, index: true })
    userId: string;

    @Prop({ required: true, index: true })
    targetUserId: string;

    @Prop({ type: String, enum: PrivateListType, required: true, index: true })
    listType: string;

    createdAt: Date;
}

export const PrivateListSchema = SchemaFactory.createForClass(PrivateListSchemaClass);

// Compound index to ensure fast queries and enforce a unique constraint per user-target pair
PrivateListSchema.index({ userId: 1, targetUserId: 1 }, { unique: true });