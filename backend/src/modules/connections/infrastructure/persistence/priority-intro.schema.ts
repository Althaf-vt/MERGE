import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type PriorityIntroDocument = PriorityIntroSchemaClass & Document;

@Schema({ timestamps: { createdAt: true, updatedAt: false }, collection: 'priority_intros' })
export class PriorityIntroSchemaClass {
    @Prop({ required: true, index: true })
    senderId: string;

    @Prop({ required: true, index: true })
    recipientId: string;

    @Prop({ required: true })
    icebreakerMessage: string;

    createdAt: Date;
}

export const PriorityIntroSchema = SchemaFactory.createForClass(PriorityIntroSchemaClass);

PriorityIntroSchema.index({ senderId: 1, createdAt: -1 });
PriorityIntroSchema.index({ recipientId: 1, createdAt: -1 });

