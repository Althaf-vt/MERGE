import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { ConnectionStatus } from "../../../domain/enums/connection.enums";

export type ConnectionDocument = ConnectionSchemaClass & Document;

@Schema({ timestamps: true, collection: 'connections' })
export class ConnectionSchemaClass {
    @Prop({ required: true, index: true })
    requesterId: string;

    @Prop({ required: true, index: true })
    recipientId: string;

    @Prop({ type: String, enum: ConnectionStatus, required: true, index: true })
    status: string;

    @Prop({ default: false })
    isPriority: boolean;

    @Prop({ type: String, default: null })
    icebreakerMessage?: string;

    @Prop({ type: Date, default: null })
    respondedAt?: Date | null;

    createdAt: Date;
    updatedAt: Date;
}

export const ConnectionSchema = SchemaFactory.createForClass(ConnectionSchemaClass);

// Compound index to ensure fast queries when checking for existing mutual interactions
ConnectionSchema.index({ requesterId: 1, recipientId: 1 });