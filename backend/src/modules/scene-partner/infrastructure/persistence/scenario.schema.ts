import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { ScenarioCategory } from "../../domain/enums/scene-partner.enums";

export type ScenarioDocument = ScenarioSchemaClass & Document;

@Schema({ timestamps: true, collection: "scenarios" })
export class ScenarioSchemaClass {
    @Prop({ type: String, required: true })
    _id: string;

    @Prop({ required: true, trim: true })
    title: string;

    @Prop({ required: true, trim: true })
    description: string;

    @Prop({ type: String, enum: ScenarioCategory, required: true, index: true })
    category: ScenarioCategory;

    @Prop({ required: true, trim: true })
    promptContext: string;

    @Prop({ type: Boolean, default: false })
    isCustom: boolean;

    @Prop({ type: Boolean, default: true, index: true })
    isActive: boolean;

    @Prop({ type: String, default: null })
    creatorUserId?: string | null;

    createdAt: Date;
    updatedAt: Date;
}

export const ScenarioSchema = SchemaFactory.createForClass(ScenarioSchemaClass);

// Compound indexes for catalog queries and administrative sorting
ScenarioSchema.index({ isActive: 1, category: 1 });
ScenarioSchema.index({ createdAt: -1 });
