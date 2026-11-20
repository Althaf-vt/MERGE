import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { EnvConfig } from "../../../../shared/infrastructure/config/env.config";
import { DISCOVERY_PERSISTENCE_COLLECTIONS } from "../constants/discovery-persistence.constants";

export type DiscoveryPassDocument = DiscoveryPassSchemaClass & Document;

@Schema({ timestamps: { createdAt: true, updatedAt: false }, collection: DISCOVERY_PERSISTENCE_COLLECTIONS.DISCOVERY_PASSES })
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
    { expireAfterSeconds: EnvConfig.discovery.passTtlSeconds }
);