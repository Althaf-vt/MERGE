import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { ModerationAction } from "../../domain/enums/moderation.enums";

export type ModerationLogDocument = ModerationLogSchemaClass & Document;

@Schema({ timestamps: { createdAt: true, updatedAt: false }, collection: 'moderation_logs' })
export class ModerationLogSchemaClass {
    @Prop({ required: true, index: true })
    targetUserId: string;

    @Prop({ required: true })
    adminId: string;

    @Prop({ type: String, enum: ModerationAction, required: true })
    action: string;

    @Prop({ required: true })
    reason: string;

    @Prop({ default: null })
    durationContext?: string;

    createdAt: Date;
}

export const ModerationLogSchema = SchemaFactory.createForClass(ModerationLogSchemaClass);