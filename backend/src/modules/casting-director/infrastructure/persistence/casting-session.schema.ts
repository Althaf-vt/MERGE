import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { CastingSessionStatus, TranscriptRole } from "../../domain/enums/casting.enums";

export type CastingSessionDocument = CastingSessionSchemaClass & Document;

// Sub-schema for the conversational transcript
@Schema({_id: false})
export class TranscriptEntrySchemaClass {
    @Prop({ type: String, required: true })
    role: TranscriptRole;

    @Prop({ required: true })
    content: string;

    @Prop({ required: true })
    timestamp: Date;
}

const TranscriptEntrySchema = SchemaFactory.createForClass(TranscriptEntrySchemaClass);

@Schema({ timestamps: true, collection: 'casting_sessions' })
export class CastingSessionSchemaClass {
    @Prop({ required: true, index: true })
    userId: string;

    @Prop({ type: String, required: true })
    status: CastingSessionStatus;

    @Prop({ type: [TranscriptEntrySchema], default: [] })
    transcript: TranscriptEntrySchemaClass[];

    @Prop({ default: 0 })
    turnCount: number;

    @Prop({ required: true })
    maxTurns: number;

    @Prop({ type: [Number], default: [] })
    personalityVector: number[];

    @Prop()
    aiSummary?: string;

    createdAt: Date;
    updatedAt: Date;
}

export const CastingSessionSchema = SchemaFactory.createForClass(CastingSessionSchemaClass);