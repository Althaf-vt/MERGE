import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import {
    ScenarioCategory,
    SceneSessionStatus,
    SceneSpeakerRole,
    SimulationType,
} from "../../domain/enums/scene-partner.enums";
import { SCENE_PARTNER_POLICY } from "../../domain/constants/scene-partner.constants";

// Subdocument Schema: Coach Note
@Schema({ _id: false })
export class CoachNoteSchemaClass {
    @Prop({ required: true })
    observation: string;

    @Prop({ required: true })
    tone: string;

    @Prop({ required: true })
    pacing: string;

    @Prop({ required: true })
    nextTip: string;
}

export const CoachNoteSchema = SchemaFactory.createForClass(CoachNoteSchemaClass);

// Subdocument Schema: Scene Turn
@Schema({ _id: false })
export class SceneTurnSchemaClass {
    @Prop({ type: String, enum: SceneSpeakerRole, required: true })
    role: SceneSpeakerRole;

    @Prop({ required: true })
    content: string;

    @Prop({ type: CoachNoteSchema, default: null })
    coachNote?: CoachNoteSchemaClass | null;

    @Prop({ required: true, default: () => new Date() })
    timestamp: Date;
}

export const SceneTurnSchema = SchemaFactory.createForClass(SceneTurnSchemaClass);

// Subdocument Schema: Scene Session Summary
@Schema({ _id: false })
export class SceneSessionSummarySchemaClass {
    @Prop({ required: true })
    summary: string;

    @Prop({ type: [String], default: [] })
    thingsToNote: string[];

    @Prop({ type: [String], default: [] })
    takeaways: string[];

    @Prop({ type: [String], default: [] })
    coachingNotes: string[];

    @Prop({ required: true })
    communicationScore: number;
}

export const SceneSessionSummarySchema = SchemaFactory.createForClass(SceneSessionSummarySchemaClass);

// Root Document Schema: Scene Session
export type SceneSessionDocument = SceneSessionSchemaClass & Document;

@Schema({ timestamps: true, collection: "scene_sessions" })
export class SceneSessionSchemaClass {
    @Prop({ required: true, index: true })
    userId: string;

    @Prop({ type: String, enum: SimulationType, required: true })
    simulationType: SimulationType;

    @Prop({ required: true })
    scenarioId: string;

    @Prop({ required: true })
    scenarioTitle: string;

    @Prop({ type: String, enum: ScenarioCategory, required: true })
    scenarioCategory: ScenarioCategory;

    @Prop({ type: String, default: null })
    targetUserId?: string | null;

    @Prop({ type: String, enum: SceneSessionStatus, required: true, index: true })
    status: SceneSessionStatus;

    @Prop({ type: [SceneTurnSchema], default: [] })
    transcript: SceneTurnSchemaClass[];

    @Prop({ default: 0 })
    turnCount: number;

    @Prop({ type: SceneSessionSummarySchema, default: null })
    summary?: SceneSessionSummarySchemaClass | null;

    @Prop({ required: true, default: SCENE_PARTNER_POLICY.DEFAULT_MAX_DURATION_MINUTES })
    maxDurationMinutes: number;

    @Prop({ type: Date, default: null })
    pausedAt?: Date | null;

    @Prop({ default: 0 })
    totalPausedMs: number;

    @Prop({ type: Date, default: null })
    completedAt?: Date | null;

    createdAt: Date;
    updatedAt: Date;
}

export const SceneSessionSchema = SchemaFactory.createForClass(SceneSessionSchemaClass);

// Compound indexes for active session query and chronological history retrieval
SceneSessionSchema.index({ userId: 1, status: 1 });
SceneSessionSchema.index({ userId: 1, createdAt: -1 });
