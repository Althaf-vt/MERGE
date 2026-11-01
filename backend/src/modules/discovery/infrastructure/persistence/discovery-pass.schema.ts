import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { DISCOVERY_CONSTANTS } from "../../domain/constants/discovery.constants";

export type DiscoveryPassDocument = DiscoveryPassSchemaClass & Document;

@Schema({ timestamps: { createdAt: true, updatedAt: false }, collection: 'discovery_passes' })
export class DiscoveryPassSchemaClass {
    @Prop({ required: true, index: true })
    userId: string;

    @Prop({ required: true, index: true })
    targetUserId: string;

    createdAt: Date;
}

export const DiscoveryPassSchema = SchemaFactory.createForClass(DiscoveryPassSchemaClass);

// Compound unique index ensuring idempotent pass records per user-candidate pair
DiscoveryPassSchema.index({ userId: 1, targetUserId: 1 }, { unique: true });

// Automatic MongoDB TTL index for pass expiration
DiscoveryPassSchema.index(
    { createdAt: 1 },
    { expireAfterSeconds: DISCOVERY_CONSTANTS.PASS_TTL_SECONDS }
);