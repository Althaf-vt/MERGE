import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { BlockReason } from "../../domain/enums/user.enums";

export type BlockedRelationshipDocument = BlockedRelationshipSchemaClass & Document;

@Schema({ timestamps: { createdAt: true, updatedAt: false }, collection: 'blocked_relationships' })
export class BlockedRelationshipSchemaClass {
    @Prop({ type: Types.ObjectId, required: true, ref: 'User', index: true })
    blockerId: Types.ObjectId | string;

    @Prop({ type: Types.ObjectId, required: true, ref: 'User', index: true })
    blockedId: Types.ObjectId | string;

    @Prop({ type: String, enum: BlockReason, default: BlockReason.PERSONAL_PREFERENCE })
    reason: BlockReason;

    createdAt: Date;
}

export const BlockedRelationshipSchema = SchemaFactory.createForClass(BlockedRelationshipSchemaClass);

// Compound index to ensure unique blocker-blocked pairs
BlockedRelationshipSchema.index({ blockerId: 1, blockedId: 1 }, { unique: true });